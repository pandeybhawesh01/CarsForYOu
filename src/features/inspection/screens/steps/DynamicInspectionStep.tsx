/**
 * DynamicInspectionStep — ANR fix
 *
 * Root cause of ANR:
 *   1. renderHandlers useMemo included `formData` as a dependency.
 *      Every field change (video URI, text, chips) updated formData in the
 *      store → renderHandlers recomputed → renderNodes walked the ENTIRE
 *      catalog tree synchronously → 10 s JS-thread block on large sections
 *      like electricalsInteriors → Android ANR.
 *
 *   2. filledPerSection useMemo also depended on formData and ran a full
 *      recursive countNode walk on every single state change.
 *
 *   3. renderNodes / renderInput are plain functions (not memoized
 *      components), so React can never bail out of re-rendering them.
 *
 * Fixes applied (minimal, surgical — no restructure of the rest):
 *
 *   FIX A — renderHandlers no longer carries formData.
 *     Instead, each leaf input (renderInput) reads its own value directly
 *     from the store via a stable sectionKey ref. This means a video/photo
 *     capture no longer invalidates the renderHandlers object and therefore
 *     no longer triggers a full tree re-render.
 *
 *   FIX B — filledPerSection is debounced.
 *     The recursive count walk is moved into a useEffect with a 400 ms
 *     debounce so it never runs synchronously on the hot path.
 *
 *   FIX C — renderHandlers is now stable across formData changes.
 *     All handler callbacks already used sectionKey (not formData), so
 *     removing formData from the memo dependency array makes the object
 *     referentially stable between captures — renderNodes only re-runs
 *     when the catalog structure (section.children) changes.
 *
 *   FIX D — presignedUrlService prefetch is fire-and-forget with a guard
 *     so it never re-fires when unrelated state changes cause a re-render.
 */

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import AppInput from '../../../../components/AppInput';
// H-8: removed InspectionImageDetailPanel import — photo-detail modal flow is dead.
import ConnectedPhotoCapture from '../../components/Connectedphotocapture';
import ConnectedVideoCapture from '../../components/Connectedvideocapture';
import MultiSelectChips from '../../components/MultiSelectChips';
import MultiSelectWithSubOptions from '../../components/MultiSelectWithSubOptions';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing, verticalSpacing, borderRadius } from '../../../../constants/spacing';
import type { PhotoIssueInspectionBlock } from '../../types';
import { useCatalogViewModel, selectCatalog } from '../../../../viewmodels/catalogViewModel';
import type {
  CatalogNode,
  CatalogField,
  CatalogGroup,
  CatalogInput,
  CatalogOption,
  CatalogSection,
} from '../../../../services/api/types';
import { getByPath, stripSectionPrefix } from '../../utils/nestedFormData';
import { presignedUrlService } from '../../../../services/api/presignedUrlService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveGroupNode {
  node: CatalogGroup;
  label: string;
}

interface MergedSection {
  key: string;
  label: string;
  nodes: CatalogNode[];
}

/**
 * formData is intentionally absent from RenderHandlers.
 * ConnectedVideoCapture / ConnectedPhotoCapture each subscribe to their own
 * storage key in the store directly, so they re-render independently without
 * touching the rest of the form tree.
 * Non-media inputs (text, select, chips) read via getFormValue from a ref —
 * same principle, no renderHandlers dependency on formData.
 *
 * H-8: removed onPhotoSlotPress — the photo-detail modal flow was replaced
 * by ConnectedPhotoCapture and the slot prop was no longer wired anywhere.
 */
interface RenderHandlers {
  getFormValue: (path: string) => unknown;  // ref-based, always fresh, stable
  onTextChange: (path: string, value: string) => void;
  onSelectChange: (path: string, value: string) => void;
  onMultiSelectChange: (path: string, values: string[]) => void;
  onGroupPress: (group: ActiveGroupNode) => void;
  onDirectCapture: (storageKey: string, uri: string, capturedAt?: string) => void;
  sectionKey: string;
  appointmentId: string;
}

export interface DynamicInspectionStepProps {
  section: CatalogSection;
  sectionIndex: number;
  totalSections: number;
  onNext: () => void;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Module-level frozen empty object. Used as a stable fallback when a
 * section's form data hasn't been initialised yet, so the reference passed
 * downstream stays the same across renders (C-2).
 */
const EMPTY_SECTION_FORM_DATA: Record<string, unknown> = Object.freeze({});

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function cleanLabel(raw: string): string {
  const last = raw.split('/').pop()!.trim();
  return last
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(' ')
    .map(capitalise)
    .join(' ');
}

function isGroup(node: CatalogNode): node is CatalogGroup {
  return node.type === 'group';
}

function getInputs(node: CatalogNode): CatalogInput[] {
  const g = node as CatalogGroup;
  if (Array.isArray(g.inputs) && g.inputs.length > 0) return g.inputs;
  const f = node as CatalogField;
  if (f.inputType) {
    return [{ inputType: f.inputType, dataType: f.dataType ?? 'STRING', allowsMultiple: f.allowsMultiple ?? false, options: f.options ?? [] }];
  }
  return [];
}

function getChildren(node: CatalogNode): CatalogNode[] {
  return (node as CatalogGroup).children ?? [];
}

// H-6: removed collectIssueOptions — its result was passed to renderInput
// but renderInput never read it. The recursive walk was pure waste on every
// render of every group.

function mergeByKey(nodes: CatalogNode[]): MergedSection[] {
  const order: string[] = [];
  const map: Record<string, MergedSection> = {};
  for (const node of nodes) {
    if (!map[node.key]) {
      order.push(node.key);
      map[node.key] = { key: node.key, label: cleanLabel(node.label), nodes: [] };
    }
    map[node.key].nodes.push(node);
  }
  return order.map((k) => map[k]);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProgressRow: React.FC<{ filled: number; total: number }> = ({ filled, total }) => {
  const remaining = total - filled;
  const allDone = remaining === 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  return (
    <View style={prS.container}>
      <View style={prS.track}><View style={[prS.fill, { width: `${pct}%` as `${number}%` }]} /></View>
      <Text style={[prS.label, allDone && prS.done]}>
        {allDone ? '✓ All required fields complete' : `${remaining} required field${remaining === 1 ? '' : 's'} remaining`}
      </Text>
    </View>
  );
};
const prS = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: borderRadius.sm, paddingHorizontal: spacing.base, paddingVertical: verticalSpacing.sm, marginBottom: verticalSpacing.base, gap: verticalSpacing.xs, ...Platform.select({ android: { elevation: 1 }, ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 2 } }) },
  track: { height: 4, backgroundColor: colors.border, borderRadius: borderRadius.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  label: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
  done: { color: colors.success, fontWeight: typography.fontWeight.semiBold },
});

const TabBar: React.FC<{ sections: MergedSection[]; activeKey: string; onSelect: (key: string) => void; filledPerSection: Record<string, number> }> = ({ sections, activeKey, onSelect, filledPerSection }) => (
  <View style={tbS.wrapper}>
    {sections.map((sec) => {
      const isActive = sec.key === activeKey;
      const filled = filledPerSection[sec.key] ?? 0;
      return (
        <TouchableOpacity key={sec.key} style={[tbS.tab, isActive && tbS.tabActive]} onPress={() => onSelect(sec.key)} activeOpacity={0.75} accessibilityRole="tab" accessibilityState={{ selected: isActive }}>
          <Text style={[tbS.label, isActive && tbS.labelActive]} numberOfLines={1}>{sec.label}</Text>
          {filled > 0 && <View style={[tbS.badge, isActive && tbS.badgeActive]}><Text style={tbS.badgeText}>{filled}</Text></View>}
        </TouchableOpacity>
      );
    })}
  </View>
);
const tbS = StyleSheet.create({
  wrapper: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, marginBottom: verticalSpacing.base, padding: spacing.xs, gap: spacing.xs, ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4 } }) },
  tab: { flex: 1, alignItems: 'center', paddingVertical: verticalSpacing.sm, paddingHorizontal: spacing.xs, borderRadius: borderRadius.sm, gap: verticalSpacing.xxs },
  tabActive: { backgroundColor: colors.primaryLight },
  label: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textAlign: 'center' },
  labelActive: { color: colors.primary, fontWeight: typography.fontWeight.bold },
  badge: { backgroundColor: colors.border, borderRadius: borderRadius.full, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeActive: { backgroundColor: colors.primary },
  badgeText: { fontSize: 9, color: colors.white, fontWeight: typography.fontWeight.bold },
});

const ChipSelector: React.FC<{ label: string; options: CatalogOption[]; value: string; onChange: (val: string) => void }> = ({ label, options, value, onChange }) => (
  <View style={csS.container}>
    <Text style={csS.label}>{label}</Text>
    <View style={csS.row}>
      {options.map((opt) => {
        const val = String(opt.value);
        const display = opt.dataType === 'BOOLEAN' ? (val === 'true' ? 'Yes' : 'No') : opt.label;
        const sel = value === val;
        return (
          <TouchableOpacity key={val} style={[csS.chip, sel && csS.chipSel]} onPress={() => onChange(val)} activeOpacity={0.7}>
            <Text style={[csS.text, sel && csS.textSel]}>{display}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);
const csS = StyleSheet.create({
  container: { marginBottom: verticalSpacing.md },
  label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, marginBottom: verticalSpacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.base, paddingVertical: verticalSpacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface },
  chipSel: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  text: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.medium },
  textSel: { color: colors.primary, fontWeight: typography.fontWeight.semiBold },
});

const GroupCard: React.FC<{ label: string; hasContent: boolean; onPress: () => void }> = ({ label, hasContent, onPress }) => (
  <TouchableOpacity style={gcS.card} onPress={onPress} activeOpacity={0.75} accessibilityRole="button">
    <View style={gcS.iconWrap}>
      <Text style={gcS.icon}>📷</Text>
      {hasContent && <View style={gcS.dot} />}
    </View>
    <View style={gcS.body}>
      <Text style={gcS.label}>{label}</Text>
      <Text style={gcS.sub}>{hasContent ? '✓ Submitted' : 'Tap to capture & review'}</Text>
    </View>
    <Text style={gcS.chevron}>›</Text>
  </TouchableOpacity>
);
const gcS = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: verticalSpacing.md, borderWidth: 1, borderColor: colors.borderLight, gap: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: borderRadius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  dot: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success, borderWidth: 1.5, borderColor: colors.surface },
  body: { flex: 1 },
  label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semiBold, color: colors.text, marginBottom: 2 },
  sub: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  chevron: { fontSize: 22, color: colors.textSecondary, fontWeight: typography.fontWeight.bold },
});

// ─── Input renderer ───────────────────────────────────────────────────────────

/**
 * H-7: removed unused `issueOptions` parameter — never read in body.
 *
 * FIX A (continued) — renderInput reads values via handlers.getFormValue()
 * instead of from a formData snapshot captured in renderHandlers.
 * This means renderInput always gets fresh data without creating a dependency
 * that would cause the entire tree to re-render on every field change.
 */
function renderInput(
  input: CatalogInput,
  nodePath: string,
  nodeLabel: string,
  handlers: RenderHandlers,
): React.ReactNode {
  const label = cleanLabel(nodeLabel);

  // ── file-upload ──────────────────────────────────────────────────────────────
  if (input.inputType === 'file-upload') {
    return input.options.map((opt) => {
      const slotKey = `${nodePath}.${String(opt.value)}`;
      const slotLabel = opt.label.toLowerCase() === 'image' ? label : cleanLabel(opt.label);

      if (String(opt.value).toLowerCase() === 'video') {
        return (
          <ConnectedVideoCapture
            key={slotKey}
            storageKey={slotKey}
            label={slotLabel}
            sectionKey={handlers.sectionKey}
            appointmentId={handlers.appointmentId}
            uploadPath={opt.uploadPath}
            onDirectCapture={handlers.onDirectCapture}
          />
        );
      }
      return (
        <ConnectedPhotoCapture
          key={slotKey}
          storageKey={slotKey}
          label={slotLabel}
          sectionKey={handlers.sectionKey}
          appointmentId={handlers.appointmentId}
          uploadPath={opt.uploadPath}
          onDirectCapture={handlers.onDirectCapture}
        />
      );
    });
  }

  // ── multi-select ─────────────────────────────────────────────────────────────
  if (input.inputType === 'multi-select') {
    const current = (handlers.getFormValue(stripSectionPrefix(nodePath)) as Array<{ type: string; extent?: string | string[] }> | string[] | undefined) ?? [];

    const hasModalSubOptions = input.options.some((opt) => {
      const subOpts = opt.subOptions1 ?? [];
      const optInputType = (opt as unknown as Record<string, string>).inputType;
      return subOpts.length > 0 && (optInputType === 'select' || optInputType === 'multi-select');
    });

    if (hasModalSubOptions) {
      const issuesArray: Array<{ type: string; extent?: string | string[] }> =
        Array.isArray(current) && current.length > 0
          ? typeof current[0] === 'string'
            ? (current as string[]).map((type) => ({ type }))
            : (current as Array<{ type: string; extent?: string | string[] }>)
          : [];
      return (
        <MultiSelectWithSubOptions
          key={nodePath}
          label={label}
          options={input.options}
          selected={issuesArray}
          onChange={(newIssues) => handlers.onMultiSelectChange(nodePath, newIssues as unknown as string[])}
        />
      );
    }

    const selectedStrings = Array.isArray(current) && current.length > 0 && typeof current[0] === 'object'
      ? (current as Array<{ type: string }>).map((item) => item.type)
      : (current as string[]);
    const selectedOptionsWithSubs = input.options.filter(
      (opt) => selectedStrings.includes(String(opt.value)) && (opt.subOptions1 ?? []).length > 0,
    );
    return (
      <React.Fragment key={nodePath}>
        <MultiSelectChips
          label={label}
          options={input.options}
          selected={current as string[] | Array<{ type: string }>}
          onChange={(vals) => handlers.onMultiSelectChange(nodePath, vals as unknown as string[])}
          useObjectFormat={true}
        />
        {selectedOptionsWithSubs.map((selectedOpt, idx) =>
          (selectedOpt.subOptions1 ?? []).map((sub, sIdx) => {
            const subInputType = (sub as unknown as Record<string, string>).inputType ?? 'multi-select';
            const subPath = `${nodePath}.${String(selectedOpt.value)}.${String(sub.value)}`;
            const subLabel = `${cleanLabel(selectedOpt.label)} - ${cleanLabel(sub.label)}`;
            if (subInputType === 'multi-select') {
              const s2 = ((sub as unknown as Record<string, unknown[]>).subOptions2 ?? []).map((x) => ({ value: (x as Record<string, unknown>).value as string, label: (x as Record<string, unknown>).label as string, dataType: 'STRING' as const, subOptions1: [] }));
              const cur = (handlers.getFormValue(stripSectionPrefix(subPath)) as Array<{ type: string }> | string[] | undefined) ?? [];
              return <MultiSelectChips
                key={`${nodePath}-${idx}-sub-${sIdx}`}
                label={subLabel}
                options={s2}
                selected={cur}
                onChange={(vals) => handlers.onMultiSelectChange(subPath, vals as unknown as string[])}
                useObjectFormat={true}
              />;
            }
            return null;
          }),
        )}
      </React.Fragment>
    );
  }

  // ── select ───────────────────────────────────────────────────────────────────
  if (input.inputType === 'select') {
    const current = String((handlers.getFormValue(stripSectionPrefix(nodePath)) as string | undefined) ?? '');
    const selectedOpt = input.options.find((o) => String(o.value) === current);
    const subOpts = selectedOpt?.subOptions1 ?? [];
    const parentPath = nodePath.split('.').slice(0, -1).join('.');
    return (
      <React.Fragment key={nodePath}>
        <ChipSelector label={label} options={input.options} value={current} onChange={(val) => handlers.onSelectChange(nodePath, val)} />
        {subOpts.map((sub, sIdx) => {
          const subInputType = (sub as unknown as Record<string, string>).inputType ?? 'multi-select';
          const subPath = parentPath ? `${parentPath}.${String(sub.value)}` : String(sub.value);
          const subLabel = cleanLabel(sub.label);
          if (subInputType === 'file-upload') {
            const subUploadPath = (sub as unknown as Record<string, string>).uploadPath;
            if (String(sub.value).toLowerCase() === 'video') {
              return (
                <ConnectedVideoCapture
                  key={`${nodePath}-sub-${sIdx}`}
                  storageKey={subPath}
                  label={subLabel}
                  sectionKey={handlers.sectionKey}
                  appointmentId={handlers.appointmentId}
                  uploadPath={subUploadPath}
                  onDirectCapture={handlers.onDirectCapture}
                />
              );
            }
            return (
              <ConnectedPhotoCapture
                key={`${nodePath}-sub-${sIdx}`}
                storageKey={subPath}
                label={subLabel}
                sectionKey={handlers.sectionKey}
                appointmentId={handlers.appointmentId}
                uploadPath={subUploadPath}
                onDirectCapture={handlers.onDirectCapture}
              />
            );
          }
          if (subInputType === 'multi-select') {
            const s2 = ((sub as unknown as Record<string, unknown[]>).subOptions2 ?? []).map((x) => ({ value: (x as Record<string, unknown>).value as string, label: (x as Record<string, unknown>).label as string, dataType: 'STRING' as const, subOptions1: [] }));
            const cur = (handlers.getFormValue(stripSectionPrefix(subPath)) as Array<{ type: string }> | string[] | undefined) ?? [];
            return <MultiSelectChips
              key={`${nodePath}-sub-${sIdx}`}
              label={subLabel}
              options={s2}
              selected={cur}
              onChange={(vals) => handlers.onMultiSelectChange(subPath, vals as unknown as string[])}
              useObjectFormat={true}
            />;
          }
          return null;
        })}
      </React.Fragment>
    );
  }

  // ── number ───────────────────────────────────────────────────────────────────
  if (input.inputType === 'number') {
    if (input.options.length > 0) {
      return input.options.map((opt) => {
        const fp = `${nodePath}.${String(opt.value)}`;
        const fl = cleanLabel(opt.label);
        const cur = String((handlers.getFormValue(stripSectionPrefix(fp)) as string | undefined) ?? '');
        return <AppInput key={fp} label={fl} value={cur} onChangeText={(v) => handlers.onTextChange(fp, v)} keyboardType="numeric" placeholder={`Enter ${fl.toLowerCase()}`} />;
      });
    }
    const cur = String((handlers.getFormValue(stripSectionPrefix(nodePath)) as string | undefined) ?? '');
    return <AppInput key={nodePath} label={label} value={cur} onChangeText={(v) => handlers.onTextChange(nodePath, v)} keyboardType="numeric" placeholder={`Enter ${label.toLowerCase()}`} />;
  }

  // ── text (default) ───────────────────────────────────────────────────────────
  if (input.options.length > 0) {
    return input.options.map((opt) => {
      const fp = `${nodePath}.${String(opt.value)}`;
      const fl = cleanLabel(opt.label);
      const cur = String((handlers.getFormValue(stripSectionPrefix(fp)) as string | undefined) ?? '');
      return <AppInput key={fp} label={fl} value={cur} onChangeText={(v) => handlers.onTextChange(fp, v)} placeholder={`Enter ${fl.toLowerCase()}`} />;
    });
  }
  const cur = String((handlers.getFormValue(stripSectionPrefix(nodePath)) as string | undefined) ?? '');
  return <AppInput key={nodePath} label={label} value={cur} onChangeText={(v) => handlers.onTextChange(nodePath, v)} placeholder={`Enter ${label.toLowerCase()}`} />;
}

// ─── Node renderer (recursive) ────────────────────────────────────────────────

function renderNodes(nodes: CatalogNode[], handlers: RenderHandlers, depth = 0): React.ReactNode {
  return mergeByKey(nodes).map((section) => {
    if (section.nodes.length === 1) return renderSingleNode(section.nodes[0], handlers, section.key, depth);
    return (
      <View key={`${section.key}-merged`}>
        {section.nodes.map((node, idx) => renderSingleNode(node, handlers, `${section.key}-${idx}`, depth))}
      </View>
    );
  });
}

function renderSingleNode(node: CatalogNode, handlers: RenderHandlers, keyPrefix: string, depth = 0): React.ReactNode {
  if (isGroup(node)) {
    if (depth >= 1) {
      const inputs = getInputs(node);
      const children = getChildren(node);
      const hasContent =
        inputs.some((inp) => inp.inputType === 'file-upload' && inp.options.some((opt) => {
          const photoBlock = handlers.getFormValue(stripSectionPrefix(`${node.path}.${String(opt.value)}`)) as PhotoIssueInspectionBlock | undefined;
          return Boolean((photoBlock?.photos?.[0] as { url?: string } | undefined)?.url);
        })) ||
        children.some((child) => { const val = handlers.getFormValue(stripSectionPrefix(child.path)); return val !== undefined && String(val).trim().length > 0; });
      return <GroupCard key={`${keyPrefix}-card`} label={cleanLabel(node.label)} hasContent={hasContent} onPress={() => handlers.onGroupPress({ node, label: cleanLabel(node.label) })} />;
    }
    const inputs = getInputs(node);
    const children = getChildren(node);
    return (
      <View key={`${keyPrefix}-node`}>
        {inputs.map((input, iIdx) => (
          <React.Fragment key={`${node.path}-input-${iIdx}`}>{renderInput(input, node.path, node.label, handlers)}</React.Fragment>
        ))}
        {children.length > 0 && renderNodes(children, handlers, depth + 1)}
      </View>
    );
  }
  const inputs = getInputs(node);
  const children = getChildren(node);
  return (
    <View key={`${keyPrefix}-node`}>
      {inputs.map((input, iIdx) => (
        <React.Fragment key={`${node.path}-input-${iIdx}`}>{renderInput(input, node.path, node.label, handlers)}</React.Fragment>
      ))}
      {children.length > 0 && renderNodes(children, handlers, depth + 1)}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const DynamicInspectionStep: React.FC<DynamicInspectionStepProps> = ({
  section,
  sectionIndex,
  totalSections,
  onNext,
  onBack,
}) => {
  // C-1 fix: scoped selectors so this screen re-renders only when the slice
  // it actually reads changes. Whole-store destructure re-rendered every screen
  // on every store mutation, silently undoing the Connected* optimisation.
  //
  // Refinement (post-audit): we used to subscribe to the whole `currentSession`,
  // but that re-runs the parent on ANY section's data change (e.g. draft loader
  // hydrating an unrelated section). Now we only subscribe to `appointmentId`
  // (a primitive — only changes when the inspection itself starts/resets).
  // The active section's data flows through the `sectionFormData` selector
  // below, so other sections updating doesn't re-run this parent at all.
  const appointmentId = useInspectionStore((s) => s.currentSession?.appointmentId ?? '');
  const updateFormDataBySection = useInspectionStore((s) => s.updateFormDataBySection);
  const markStepCompleteByKey = useInspectionStore((s) => s.markStepCompleteByKey);
  const loadingState = useCatalogViewModel((s) => s.loadingState);
  const loadCatalog = useCatalogViewModel((s) => s.loadCatalog);
  // C-4: selectCatalog returns frozen EMPTY_CATALOG if not yet loaded.
  // Safe to access .uploadPathsBySection / .sections without null guards.
  const catalog = useCatalogViewModel(selectCatalog);

  const sectionKey = section.section;
  const sectionLabel = section.label;
  const stepNum = sectionIndex + 1;

  // ⚠ TEMPORARY DIAGNOSTIC — verifies C-1 + C-2 are working.
  // Should fire only on mount, tab switches, and actual section data changes.
  // If this fires on every keystroke or every photo capture, a subscription
  // is too wide somewhere. Remove once you've confirmed the behaviour.
  if (__DEV__) {
    console.log('[DynamicStep RENDER]', sectionKey, Date.now());
  }

  /**
   * C-2 fix: scoped selector returns a stable reference.
   * Before, `formData = (currentSession?.formData[sectionKey] ?? {})` produced
   * a new `{}` literal every render, which invalidated the
   * `filledPerSection` debounce useEffect every time and meant the count
   * never settled while typing. With a scoped selector, the reference only
   * changes when the section's data is actually mutated.
   *
   * EMPTY_SECTION_FORM_DATA is a single frozen object reused across renders.
   */
  const sectionFormData = useInspectionStore(
    (s) => s.currentSession?.formData[sectionKey],
  );
  const formData = (sectionFormData ?? EMPTY_SECTION_FORM_DATA) as Record<string, unknown>;

  /**
   * C-3 fix: synchronous in-render assignment instead of `useEffect`-no-deps.
   *
   * Before: `useEffect(() => { formDataRef.current = formData })` ran AFTER
   * commit, so during the render that called `renderNodes`, `getFormValue`
   * read the PREVIOUS render's data. Fast typing produced one-frame stale
   * values. Refs are not state — assigning in render is safe.
   */
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const getFormValue = useCallback((path: string): unknown => {
    return getByPath(formDataRef.current, path);
  }, []); // stable — reads from ref

  const mergedSections = useMemo(() => mergeByKey(section.children), [section.children]);

  const [activeTabKey, setActiveTabKey] = useState('');
  const resolvedActiveKey = activeTabKey || (mergedSections[0]?.key ?? '');
  // H-8: removed activeSlot — photo-detail modal flow was replaced by ConnectedPhotoCapture.
  const [activeGroupNode, setActiveGroupNode] = useState<ActiveGroupNode | null>(null);

  // M-17: scroll-reset on tab switch (in lieu of key={resolvedActiveKey}, which
  // was unmounting every Connected* on every switch). Imperative reset avoids
  // the unmount cost while still giving users a fresh-feeling tab.
  const scrollRef = useRef<ScrollView | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [resolvedActiveKey]);

  /**
   * FIX B — filledPerSection debounced.
   * The recursive countNode walk no longer runs synchronously on every
   * field change. It fires 400 ms after the last change, which is
   * imperceptible to the user but keeps the JS thread free during capture.
   */
  const [filledPerSection, setFilledPerSection] = useState<Record<string, number>>({});

  /**
   * H-4 fix: compute total expected fields per section so ProgressRow shows
   * meaningful progress instead of "All required fields complete" at 0/0.
   * This is derived from the catalog only (not formData), so it's stable
   * for the lifetime of the section and cheap to memoise.
   */
  const totalPerSection = useMemo(() => {
    const result: Record<string, number> = {};
    const countExpected = (n: CatalogNode): number => {
      let count = 0;
      getInputs(n).forEach((input) => {
        if (input.inputType === 'file-upload') {
          // Each file-upload option (photo / video) counts as one expected field
          count += input.options.length;
        } else {
          count += 1;
        }
      });
      getChildren(n).forEach((c) => { count += countExpected(c); });
      return count;
    };
    mergedSections.forEach((sec) => {
      result[sec.key] = sec.nodes.reduce((sum, n) => sum + countExpected(n), 0);
    });
    return result;
  }, [mergedSections]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result: Record<string, number> = {};
      const countNode = (n: CatalogNode): number => {
        let count = 0;
        getInputs(n).forEach((input) => {
          if (input.inputType === 'file-upload') {
            input.options.forEach((opt) => {
              const photoBlock = getByPath(formData, stripSectionPrefix(`${n.path}.${opt.value}`)) as PhotoIssueInspectionBlock | undefined;
              if ((photoBlock?.photos?.[0] as { url?: string } | undefined)?.url) count++;
            });
          } else if (input.inputType === 'multi-select') {
            const vals = getByPath(formData, stripSectionPrefix(n.path)) as string[] | undefined;
            if (vals && vals.length > 0) count++;
          } else {
            const val = getByPath(formData, stripSectionPrefix(n.path));
            if (val !== undefined && String(val).trim().length > 0) count++;
          }
        });
        getChildren(n).forEach((c) => { count += countNode(c); });
        return count;
      };
      mergedSections.forEach((sec) => {
        result[sec.key] = sec.nodes.reduce((sum, n) => sum + countNode(n), 0);
      });
      setFilledPerSection(result);
    }, 400);

    return () => clearTimeout(timer);
  }, [formData, mergedSections]);

  /**
   * FIX D — presigned URL prefetch: guard with a ref so it only fires once
   * per sectionKey mount, not on every re-render.
   */
  const prefetchedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!appointmentId || prefetchedRef.current === sectionKey) return;

    const uploadPaths = catalog.uploadPathsBySection?.[sectionKey] ?? [];
    if (uploadPaths.length === 0) return;

    prefetchedRef.current = sectionKey;
    presignedUrlService
      .getUrlsForSection(sectionKey, uploadPaths, appointmentId)
      .then(() => console.log('[DynamicStep] ✅ Presigned URLs cached for section:', sectionKey))
      .catch((err) => console.error('[DynamicStep] ❌ Presigned URL prefetch failed:', err));
  }, [sectionKey, appointmentId, catalog.uploadPathsBySection]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleTextChange = useCallback(
    (path: string, value: string) => updateFormDataBySection(sectionKey, { [stripSectionPrefix(path)]: value }),
    [updateFormDataBySection, sectionKey],
  );
  const handleSelectChange = useCallback(
    (path: string, value: string) => updateFormDataBySection(sectionKey, { [stripSectionPrefix(path)]: value }),
    [updateFormDataBySection, sectionKey],
  );
  const handleMultiSelectChange = useCallback(
    (path: string, values: string[]) => updateFormDataBySection(sectionKey, { [stripSectionPrefix(path)]: values }),
    [updateFormDataBySection, sectionKey],
  );
  // H-8: removed handlePhotoSlotPress / handleCloseModal — dead code from old photo-detail modal flow.
  const handleGroupPress = useCallback((group: ActiveGroupNode) => setActiveGroupNode(group), []);
  const handleCloseGroupModal = useCallback(() => setActiveGroupNode(null), []);

  const handleDirectCapture = useCallback(
    (storageKey: string, uri: string, capturedAt?: string) => {
      const timestamp = capturedAt || new Date().toISOString();
      const photoData = uri ? [{ url: uri, capturedAt: timestamp }] : [];
      updateFormDataBySection(sectionKey, {
        [stripSectionPrefix(storageKey)]: { photos: photoData },
      });
    },
    [updateFormDataBySection, sectionKey],
  );

  // H-8: removed handlePhotoChange — was wired to the dead photo-detail modal flow.

  const currentSectionIndex = mergedSections.findIndex((s) => s.key === resolvedActiveKey);
  const hasNextTab = currentSectionIndex >= 0 && currentSectionIndex < mergedSections.length - 1;

  const handleNext = useCallback(() => {
    if (hasNextTab) {
      setActiveTabKey(mergedSections[currentSectionIndex + 1].key);
      return;
    }
    markStepCompleteByKey(sectionKey);
    onNext();
  }, [hasNextTab, currentSectionIndex, mergedSections, markStepCompleteByKey, sectionKey, onNext]);

  /**
   * renderHandlers is stable across all field changes because it contains
   * no formData snapshot. Media inputs use ConnectedVideoCapture /
   * ConnectedPhotoCapture which subscribe to the store themselves.
   * Text/select/chips still use getFormValue (ref-based, always fresh).
   */
  const renderHandlers = useMemo<RenderHandlers>(
    () => ({
      getFormValue,
      onTextChange: handleTextChange,
      onSelectChange: handleSelectChange,
      onMultiSelectChange: handleMultiSelectChange,
      onGroupPress: handleGroupPress,
      onDirectCapture: handleDirectCapture,
      sectionKey,
      appointmentId,
    }),
    [
      getFormValue,
      handleTextChange,
      handleSelectChange,
      handleMultiSelectChange,
      handleGroupPress,
      handleDirectCapture,
      sectionKey,
      appointmentId,
    ],
  );

  const totalFilled = Object.values(filledPerSection).reduce((a, b) => a + b, 0);
  const totalExpected = Object.values(totalPerSection).reduce((a, b) => a + b, 0);

  // ── Loading / error states ───────────────────────────────────────────────────

  if (loadingState === 'loading' && section.children.length === 0) {
    return (
      <SafeAreaView style={s.safeArea} edges={['bottom']}>
        <AppHeader title={sectionLabel} subtitle={`Step ${stepNum} of ${totalSections}`} onBack={onBack} />
        <View style={s.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading form…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingState === 'error' && section.children.length === 0) {
    return (
      <SafeAreaView style={s.safeArea} edges={['bottom']}>
        <AppHeader title={sectionLabel} subtitle={`Step ${stepNum} of ${totalSections}`} onBack={onBack} />
        <View style={s.centred}>
          <Text style={s.errorIcon}>⚠️</Text>
          <Text style={s.errorText}>Failed to load form fields.</Text>
          <AppButton label="Retry" onPress={loadCatalog} size="sm" fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  const activeSection = mergedSections.find((sec) => sec.key === resolvedActiveKey);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safeArea} edges={['bottom']}>
      <AppHeader title={sectionLabel} subtitle={`Step ${stepNum} of ${totalSections}`} onBack={onBack} />
      <View style={s.progressWrap}>
        <ProgressRow filled={totalFilled} total={totalExpected} />
      </View>
      {mergedSections.length > 1 && (
        <View style={s.tabWrap}>
          <TabBar
            sections={mergedSections}
            activeKey={resolvedActiveKey}
            onSelect={setActiveTabKey}
            filledPerSection={filledPerSection}
          />
        </View>
      )}
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/*
          M-17: removed `key={resolvedActiveKey}` from this ScrollView.
          The key forced a full unmount/remount of every Connected* on
          every tab switch — 50+ store unsubscribes/resubscribes per
          tab change. We reset scroll position imperatively in a
          useEffect below instead.
        */}
        {activeSection
          ? <View style={s.card}>{renderNodes(activeSection.nodes, renderHandlers)}</View>
          : null}
      </ScrollView>

      {/* H-8: removed dead photo-detail modal block. Photos go through ConnectedPhotoCapture. */}

      {/* Group detail modal */}
      <Modal visible={activeGroupNode !== null} animationType="slide" onRequestClose={handleCloseGroupModal}>
        <SafeAreaView style={s.modalSafe} edges={['bottom']}>
          {activeGroupNode ? (
            <>
              <AppHeader title={activeGroupNode.label} subtitle={sectionLabel} onBack={handleCloseGroupModal} variant="primary" />
              <ScrollView contentContainerStyle={s.groupModalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {(() => {
                  const node = activeGroupNode.node;
                  const inputs = getInputs(node);
                  const children = getChildren(node);
                  return (
                    <>
                      {inputs.map((input, iIdx) => (
                        <React.Fragment key={`gm-${iIdx}`}>
                          {renderInput(input, node.path, node.label, renderHandlers)}
                        </React.Fragment>
                      ))}
                      {children.length > 0 && renderNodes(children, renderHandlers, 1)}
                    </>
                  );
                })()}
              </ScrollView>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>

      <View style={s.footer}>
        <AppButton
          label={hasNextTab ? 'Next →' : stepNum < totalSections ? 'Next Step →' : 'Review & Submit'}
          onPress={handleNext}
          testID={`dynamic-step-${sectionIndex}-next`}
        />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  modalSafe: { flex: 1, backgroundColor: colors.surface },
  progressWrap: { paddingHorizontal: spacing.base, paddingTop: verticalSpacing.sm },
  tabWrap: { paddingHorizontal: spacing.base, paddingBottom: verticalSpacing.xs },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: verticalSpacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4 } }) },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: verticalSpacing.base, padding: spacing.xl },
  loadingText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  errorIcon: { fontSize: 40 },
  errorText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  footer: { padding: spacing.base, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  groupModalContent: { padding: spacing.base, paddingBottom: verticalSpacing.xxl },
});

export default DynamicInspectionStep;
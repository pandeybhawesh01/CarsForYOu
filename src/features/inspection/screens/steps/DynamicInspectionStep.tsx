/**
 * DynamicInspectionStep
 *
 * Single catalog-driven step component. Receives one CatalogSection from the
 * API response and renders all its fields. No hardcoded section names — adding
 * or removing sections on the backend automatically reflects here.
 *
 * Replaces Step1_BasicVerification through Step6_Media.
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import InspectionPhotoSummaryRow from '../../components/InspectionPhotoSummaryRow';
import InspectionImageDetailPanel from '../../components/InspectionImageDetailPanel';
import PhotoCapture from '../../components/PhotoCapture';
import VideoCapture from '../../components/VideoCapture';
import MultiSelectChips from '../../components/MultiSelectChips';
import MultiSelectWithSubOptions from '../../components/MultiSelectWithSubOptions';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing, verticalSpacing, borderRadius } from '../../../../constants/spacing';
import type { PhotoIssueInspectionBlock } from '../../types';
import { useCatalogViewModel } from '../../../../viewmodels/catalogViewModel';
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

interface ActivePhotoSlot {
  storageKey: string;
  label: string;
  issueOptions: readonly string[];
}

interface ActiveGroupNode {
  node: CatalogGroup;
  label: string;
}

interface MergedSection {
  key: string;
  label: string;
  nodes: CatalogNode[];
}

interface RenderHandlers {
  formData: Record<string, unknown>;
  photoDetails: Record<string, PhotoIssueInspectionBlock>;
  onTextChange: (path: string, value: string) => void;
  onSelectChange: (path: string, value: string) => void;
  onMultiSelectChange: (path: string, values: string[]) => void;
  onPhotoSlotPress: (slot: ActivePhotoSlot) => void;
  onGroupPress: (group: ActiveGroupNode) => void;
  onDirectCapture: (storageKey: string, uri: string, capturedAt?: string) => void;
  sectionKey: string;
  appointmentId: string;
}

export interface DynamicInspectionStepProps {
  /** The catalog section to render (comes from catalog.data[sectionIndex]) */
  section: CatalogSection;
  /** 0-based index of this section among all sections */
  sectionIndex: number;
  /** Total number of sections */
  totalSections: number;
  onNext: () => void;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function collectIssueOptions(children: CatalogNode[]): string[] {
  const issues: string[] = [];
  for (const child of children) {
    getInputs(child).forEach((inp) => {
      if (inp.inputType === 'multi-select') issues.push(...inp.options.map((o) => String(o.label)));
    });
    issues.push(...collectIssueOptions(getChildren(child)));
  }
  return issues;
}

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

const GroupCard: React.FC<{ label: string; hasContent: boolean; onPress: () => void }> = ({ label, hasContent, onPress }) => {
  return (
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
};
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

function renderInput(
  input: CatalogInput,
  nodePath: string,
  nodeLabel: string,
  issueOptions: string[],
  handlers: RenderHandlers,
): React.ReactNode {
  const label = cleanLabel(nodeLabel);

  // ── file-upload ──────────────────────────────────────────────────────────────
  if (input.inputType === 'file-upload') {
    return input.options.map((opt) => {
      const slotKey = `${nodePath}.${String(opt.value)}`;
      const slotLabel = opt.label.toLowerCase() === 'image' ? label : cleanLabel(opt.label);
      // Use getByPath to access nested photo data
      const block = getByPath(handlers.formData, stripSectionPrefix(slotKey)) as PhotoIssueInspectionBlock | undefined;
      // Extract URL and capturedAt from photo object: photos is always array of { url, capturedAt }
      // @ts-ignore - TypeScript cache issue with updated PhotoIssueInspectionBlock type
      const photoUrl = block?.photos?.[0]?.url;
      // @ts-ignore
      const capturedAt = block?.photos?.[0]?.capturedAt;
      
      if (String(opt.value).toLowerCase() === 'video') {
        return (
          <VideoCapture 
            key={slotKey} 
            label={slotLabel} 
            videoUri={photoUrl} 
            onCapture={(uri, timestamp) => handlers.onDirectCapture(slotKey, uri, timestamp)}
            uploadPath={opt.uploadPath}
            sectionKey={handlers.sectionKey}
            appointmentId={handlers.appointmentId}
            capturedAt={capturedAt}
          />
        );
      }
      return (
        <PhotoCapture 
          key={slotKey} 
          label={slotLabel} 
          imageUri={photoUrl} 
          onCapture={(uri, timestamp) => handlers.onDirectCapture(slotKey, uri, timestamp)}
          uploadPath={opt.uploadPath}
          sectionKey={handlers.sectionKey}
          appointmentId={handlers.appointmentId}
          capturedAt={capturedAt}
        />
      );
    });
  }

  // ── multi-select ─────────────────────────────────────────────────────────────
  if (input.inputType === 'multi-select') {
    const current = (getByPath(handlers.formData, stripSectionPrefix(nodePath)) as Array<{ type: string; extent?: string | string[] }> | string[] | undefined) ?? [];

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

    // Plain multi-select — use object format for issues fields
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
          useObjectFormat={true}  // Always use [{type}] format for backend compatibility
        />
        {selectedOptionsWithSubs.map((selectedOpt, idx) =>
          (selectedOpt.subOptions1 ?? []).map((sub, sIdx) => {
            const subInputType = (sub as unknown as Record<string, string>).inputType ?? 'multi-select';
            const subPath = `${nodePath}.${String(selectedOpt.value)}.${String(sub.value)}`;
            const subLabel = `${cleanLabel(selectedOpt.label)} - ${cleanLabel(sub.label)}`;
            if (subInputType === 'multi-select') {
              const s2 = ((sub as unknown as Record<string, unknown[]>).subOptions2 ?? []).map((x) => ({ value: (x as Record<string, unknown>).value as string, label: (x as Record<string, unknown>).label as string, dataType: 'STRING' as const, subOptions1: [] }));
              const cur = (getByPath(handlers.formData, stripSectionPrefix(subPath)) as Array<{ type: string }> | string[] | undefined) ?? [];
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
    const current = String((getByPath(handlers.formData, stripSectionPrefix(nodePath)) as string | undefined) ?? '');
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
            // Use getByPath to access nested photo data
            const block = getByPath(handlers.formData, stripSectionPrefix(subPath)) as PhotoIssueInspectionBlock | undefined;
            // Extract URL and capturedAt from photo object: photos is always array of { url, capturedAt }
            // @ts-ignore - TypeScript cache issue with updated PhotoIssueInspectionBlock type
            const photoUrl = block?.photos?.[0]?.url;
            // @ts-ignore
            const capturedAt = block?.photos?.[0]?.capturedAt;
            // Get uploadPath from sub-option
            const subUploadPath = (sub as unknown as Record<string, string>).uploadPath;
            if (String(sub.value).toLowerCase() === 'video') {
              return (
                <VideoCapture 
                  key={`${nodePath}-sub-${sIdx}`} 
                  label={subLabel} 
                  videoUri={photoUrl} 
                  onCapture={(uri, timestamp) => handlers.onDirectCapture(subPath, uri, timestamp)}
                  uploadPath={subUploadPath}
                  sectionKey={handlers.sectionKey}
                  appointmentId={handlers.appointmentId}
                  capturedAt={capturedAt}
                />
              );
            }
            return (
              <PhotoCapture 
                key={`${nodePath}-sub-${sIdx}`} 
                label={subLabel} 
                imageUri={photoUrl} 
                onCapture={(uri, timestamp) => handlers.onDirectCapture(subPath, uri, timestamp)}
                uploadPath={subUploadPath}
                sectionKey={handlers.sectionKey}
                appointmentId={handlers.appointmentId}
                capturedAt={capturedAt}
              />
            );
          }
          if (subInputType === 'multi-select') {
            const s2 = ((sub as unknown as Record<string, unknown[]>).subOptions2 ?? []).map((x) => ({ value: (x as Record<string, unknown>).value as string, label: (x as Record<string, unknown>).label as string, dataType: 'STRING' as const, subOptions1: [] }));
            const cur = (getByPath(handlers.formData, stripSectionPrefix(subPath)) as Array<{ type: string }> | string[] | undefined) ?? [];
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
        const cur = String((getByPath(handlers.formData, stripSectionPrefix(fp)) as string | undefined) ?? '');
        return <AppInput key={fp} label={fl} value={cur} onChangeText={(v) => handlers.onTextChange(fp, v)} keyboardType="numeric" placeholder={`Enter ${fl.toLowerCase()}`} />;
      });
    }
    const cur = String((getByPath(handlers.formData, stripSectionPrefix(nodePath)) as string | undefined) ?? '');
    return <AppInput key={nodePath} label={label} value={cur} onChangeText={(v) => handlers.onTextChange(nodePath, v)} keyboardType="numeric" placeholder={`Enter ${label.toLowerCase()}`} />;
  }

  // ── text (default) ───────────────────────────────────────────────────────────
  if (input.options.length > 0) {
    return input.options.map((opt) => {
      const fp = `${nodePath}.${String(opt.value)}`;
      const fl = cleanLabel(opt.label);
      const cur = String((getByPath(handlers.formData, stripSectionPrefix(fp)) as string | undefined) ?? '');
      return <AppInput key={fp} label={fl} value={cur} onChangeText={(v) => handlers.onTextChange(fp, v)} placeholder={`Enter ${fl.toLowerCase()}`} />;
    });
  }
  const cur = String((getByPath(handlers.formData, stripSectionPrefix(nodePath)) as string | undefined) ?? '');
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
      // Nested group → tappable card
      const inputs = getInputs(node);
      const children = getChildren(node);
      const hasContent =
        inputs.some((inp) => inp.inputType === 'file-upload' && inp.options.some((opt) => {
          const photoBlock = getByPath(handlers.formData, stripSectionPrefix(`${node.path}.${String(opt.value)}`)) as PhotoIssueInspectionBlock | undefined;
          // Check for photo URL: photos is always array of { url, capturedAt }
          // @ts-ignore - TypeScript cache issue with updated PhotoIssueInspectionBlock type
          return photoBlock?.photos?.[0]?.url;
        })) ||
        children.some((child) => { const val = getByPath(handlers.formData, stripSectionPrefix(child.path)); return val !== undefined && String(val).trim().length > 0; });
      return <GroupCard key={`${keyPrefix}-card`} label={cleanLabel(node.label)} hasContent={hasContent} onPress={() => handlers.onGroupPress({ node, label: cleanLabel(node.label) })} />;
    }
    // depth 0 → render inline
    const inputs = getInputs(node);
    const children = getChildren(node);
    const issueOptions = collectIssueOptions(children);
    return (
      <View key={`${keyPrefix}-node`}>
        {inputs.map((input, iIdx) => (
          <React.Fragment key={`${node.path}-input-${iIdx}`}>{renderInput(input, node.path, node.label, issueOptions, handlers)}</React.Fragment>
        ))}
        {children.length > 0 && renderNodes(children, handlers, depth + 1)}
      </View>
    );
  }
  // Field node
  const inputs = getInputs(node);
  const children = getChildren(node);
  const issueOptions = collectIssueOptions(children);
  return (
    <View key={`${keyPrefix}-node`}>
      {inputs.map((input, iIdx) => (
        <React.Fragment key={`${node.path}-input-${iIdx}`}>{renderInput(input, node.path, node.label, issueOptions, handlers)}</React.Fragment>
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
  const { currentSession, updateFormDataBySection, markStepCompleteByKey } = useInspectionStore();
  const loadingState = useCatalogViewModel((s) => s.loadingState);
  const loadCatalog = useCatalogViewModel((s) => s.loadCatalog);
  const catalog = useCatalogViewModel((s) => s.catalog);

  const sectionKey = section.section; // e.g. "airConditioning", "vehicle"
  const sectionLabel = section.label; // e.g. "Air Conditioning"
  const stepNum = sectionIndex + 1;

  // Read this section's form data directly by section key
  const formData = (currentSession?.formData[sectionKey] ?? {}) as Record<string, unknown>;
  const photoDetails = formData as Record<string, PhotoIssueInspectionBlock>;

  const mergedSections = useMemo(() => mergeByKey(section.children), [section.children]);

  const [activeTabKey, setActiveTabKey] = useState('');
  const resolvedActiveKey = activeTabKey || (mergedSections[0]?.key ?? '');
  const [activeSlot, setActiveSlot] = useState<ActivePhotoSlot | null>(null);
  const [activeGroupNode, setActiveGroupNode] = useState<ActiveGroupNode | null>(null);

  // Prefetch presigned URLs for this section on mount
  useEffect(() => {
    const appointmentId = currentSession?.appointmentId;
    if (!appointmentId) {
      return;
    }

    // Get upload paths from catalog metadata (no recursion needed!)
    const uploadPaths = catalog.uploadPathsBySection?.[sectionKey] ?? [];
    
    if (uploadPaths.length === 0) {
      console.log('[DynamicStep] ℹ️ No upload paths found for section:', sectionKey);
      return;
    }

    console.log('[DynamicStep] 🔄 Prefetching presigned URLs for section:', sectionKey);
    console.log('[DynamicStep] 📋 Upload paths from metadata:', uploadPaths.length, 'paths');

    // Prefetch in background (don't block UI)
    presignedUrlService
      .getUrlsForSection(sectionKey, uploadPaths, appointmentId)
      .then(() => {
        console.log('[DynamicStep] ✅ Presigned URLs cached for section:', sectionKey);
      })
      .catch((error) => {
        console.error('[DynamicStep] ❌ Failed to prefetch presigned URLs:', error);
        // Don't block UI - will fetch on-demand when user captures
      });
  }, [sectionKey, currentSession?.appointmentId, catalog.uploadPathsBySection]);

  // All writes go to this section's key — no mapping needed
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
  const handlePhotoSlotPress = useCallback((slot: ActivePhotoSlot) => setActiveSlot(slot), []);
  const handleCloseModal = useCallback(() => setActiveSlot(null), []);
  const handleGroupPress = useCallback((group: ActiveGroupNode) => {
    setActiveGroupNode(group);
  }, []);
  const handleCloseGroupModal = useCallback(() => setActiveGroupNode(null), []);

  const handleDirectCapture = useCallback(
    (storageKey: string, uri: string, capturedAt?: string) => {
      // Format photo data to match backend structure: { url, capturedAt }
      // Use provided capturedAt timestamp or generate new one
      const timestamp = capturedAt || new Date().toISOString();
      const photoData = uri ? [{ url: uri, capturedAt: timestamp }] : [];
      const dataToSave = { 
        [stripSectionPrefix(storageKey)]: { 
          photos: photoData
        } 
      };
      
      updateFormDataBySection(sectionKey, dataToSave);
    },
    [updateFormDataBySection, sectionKey],
  );
  const handlePhotoChange = useCallback(
    (block: PhotoIssueInspectionBlock) => {
      if (!activeSlot) return;
      updateFormDataBySection(sectionKey, { [stripSectionPrefix(activeSlot.storageKey)]: block });
    },
    [activeSlot, updateFormDataBySection, sectionKey],
  );

  const filledPerSection = useMemo(() => {
    const result: Record<string, number> = {};
    const countNode = (n: CatalogNode): number => {
      let count = 0;
      getInputs(n).forEach((input) => {
        if (input.inputType === 'file-upload') {
          input.options.forEach((opt) => { 
            const photoBlock = getByPath(formData, stripSectionPrefix(`${n.path}.${opt.value}`)) as PhotoIssueInspectionBlock | undefined;
            // Check for photo URL: photos is always array of { url, capturedAt }
            // @ts-ignore - TypeScript cache issue with updated PhotoIssueInspectionBlock type
            if (photoBlock?.photos?.[0]?.url) count++; 
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
    mergedSections.forEach((sec) => { result[sec.key] = sec.nodes.reduce((sum, n) => sum + countNode(n), 0); });
    return result;
  }, [mergedSections, formData]);

  const currentSectionIndex = mergedSections.findIndex((s) => s.key === resolvedActiveKey);
  const hasNextTab = currentSectionIndex >= 0 && currentSectionIndex < mergedSections.length - 1;

  const handleNext = useCallback(() => {
    if (hasNextTab) {
      setActiveTabKey(mergedSections[currentSectionIndex + 1].key);
      return;
    }
    markStepCompleteByKey(sectionKey);
    onNext();
  }, [hasNextTab, currentSectionIndex, mergedSections, markStepCompleteByKey, sectionKey, sectionLabel, onNext]);

  const renderHandlers = useMemo<RenderHandlers>(
    () => ({ 
      formData, 
      photoDetails, 
      onTextChange: handleTextChange, 
      onSelectChange: handleSelectChange, 
      onMultiSelectChange: handleMultiSelectChange, 
      onPhotoSlotPress: handlePhotoSlotPress, 
      onGroupPress: handleGroupPress, 
      onDirectCapture: handleDirectCapture,
      sectionKey,
      appointmentId: currentSession?.appointmentId ?? '',
    }),
    [formData, photoDetails, handleTextChange, handleSelectChange, handleMultiSelectChange, handlePhotoSlotPress, handleGroupPress, handleDirectCapture, sectionKey, currentSession?.appointmentId],
  );

  const totalFilled = Object.values(filledPerSection).reduce((a, b) => a + b, 0);

  if (loadingState === 'loading' && section.children.length === 0) {
    return (
      <SafeAreaView style={s.safeArea} edges={['bottom']}>
        <AppHeader title={sectionLabel} subtitle={`Step ${stepNum} of ${totalSections}`} onBack={onBack} />
        <View style={s.centred}><ActivityIndicator size="large" color={colors.primary} /><Text style={s.loadingText}>Loading form…</Text></View>
      </SafeAreaView>
    );
  }

  if (loadingState === 'error' && section.children.length === 0) {
    return (
      <SafeAreaView style={s.safeArea} edges={['bottom']}>
        <AppHeader title={sectionLabel} subtitle={`Step ${stepNum} of ${totalSections}`} onBack={onBack} />
        <View style={s.centred}><Text style={s.errorIcon}>⚠️</Text><Text style={s.errorText}>Failed to load form fields.</Text><AppButton label="Retry" onPress={loadCatalog} size="sm" fullWidth={false} /></View>
      </SafeAreaView>
    );
  }

  const activeSection = mergedSections.find((sec) => sec.key === resolvedActiveKey);

  return (
    <SafeAreaView style={s.safeArea} edges={['bottom']}>
      <AppHeader title={sectionLabel} subtitle={`Step ${stepNum} of ${totalSections}`} onBack={onBack} />
      <View style={s.progressWrap}><ProgressRow filled={totalFilled} total={0} /></View>
      {mergedSections.length > 1 && (
        <View style={s.tabWrap}><TabBar sections={mergedSections} activeKey={resolvedActiveKey} onSelect={setActiveTabKey} filledPerSection={filledPerSection} /></View>
      )}
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" key={resolvedActiveKey}>
        {activeSection ? <View style={s.card}>{renderNodes(activeSection.nodes, renderHandlers)}</View> : null}
      </ScrollView>

      {/* Photo detail modal */}
      <Modal visible={activeSlot !== null} animationType="slide" onRequestClose={handleCloseModal}>
        <SafeAreaView style={s.modalSafe} edges={['bottom']}>
          {activeSlot ? (
            <InspectionImageDetailPanel title={activeSlot.label} issueOptions={activeSlot.issueOptions} value={photoDetails[activeSlot.storageKey]} onChange={handlePhotoChange} onBack={handleCloseModal} layout="photoFirstSubmit" listBackTitle={sectionLabel} photoLabel="Photo" />
          ) : null}
        </SafeAreaView>
      </Modal>

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
                  const issueOptions = collectIssueOptions(children);
                  return (
                    <>
                      {inputs.map((input, iIdx) => <React.Fragment key={`gm-${iIdx}`}>{renderInput(input, node.path, node.label, issueOptions, renderHandlers)}</React.Fragment>)}
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
        <AppButton label={hasNextTab ? 'Next →' : stepNum < totalSections ? 'Next Step →' : 'Review & Submit'} onPress={handleNext} testID={`dynamic-step-${sectionIndex}-next`} />
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

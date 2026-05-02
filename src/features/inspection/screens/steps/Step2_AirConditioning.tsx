/**
 * Step 2 — Air Conditioning
 * Catalog-driven. 2 top-level groups = 2 tabs.
 * Same rules as Step 1 and Step 4.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Modal, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/inspectionStore';
import { InspectionStepId } from '../../types';
import AppInput from '../../../../components/AppInput';
import InspectionImageDetailPanel from '../../components/InspectionImageDetailPanel';
import PhotoCapture from '../../components/PhotoCapture';
import MultiSelectChips from '../../components/MultiSelectChips';
import AppButton from '../../../../components/AppButton';
import AppHeader from '../../../../components/AppHeader';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { spacing, verticalSpacing, borderRadius } from '../../../../constants/spacing';
import type { PhotoIssueInspectionBlock } from '../../types';
import { useCatalogViewModel, selectCatalog } from '../../../../viewmodels/catalogViewModel';
import type { CatalogNode, CatalogField, CatalogGroup, CatalogInput, CatalogOption } from '../../../../services/api/types';

interface ActivePhotoSlot { storageKey: string; label: string; issueOptions: readonly string[]; }
interface ActiveGroupNode { node: CatalogGroup; label: string; }
interface MergedSection { key: string; label: string; nodes: CatalogNode[]; }

function capitalise(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
function cleanLabel(raw: string): string {
  const last = raw.split('/').pop()!.trim();
  return last.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').split(' ').map(capitalise).join(' ');
}
function isGroup(node: CatalogNode): node is CatalogGroup { return node.type === 'group'; }
function getInputs(node: CatalogNode): CatalogInput[] {
  const g = node as CatalogGroup;
  if (Array.isArray(g.inputs) && g.inputs.length > 0) return g.inputs;
  const f = node as CatalogField;
  if (f.inputType) return [{ inputType: f.inputType, dataType: f.dataType ?? 'STRING', allowsMultiple: f.allowsMultiple ?? false, options: f.options ?? [] }];
  return [];
}
function getChildren(node: CatalogNode): CatalogNode[] { return (node as CatalogGroup).children ?? []; }
function collectIssueOptions(children: CatalogNode[]): string[] {
  const issues: string[] = [];
  for (const child of children) {
    getInputs(child).forEach((inp) => { if (inp.inputType === 'multi-select') issues.push(...inp.options.map((o) => String(o.label))); });
    issues.push(...collectIssueOptions(getChildren(child)));
  }
  return issues;
}
function mergeByKey(nodes: CatalogNode[]): MergedSection[] {
  const order: string[] = []; const map: Record<string, MergedSection> = {};
  for (const node of nodes) {
    if (!map[node.key]) { order.push(node.key); map[node.key] = { key: node.key, label: cleanLabel(node.label), nodes: [] }; }
    map[node.key].nodes.push(node);
  }
  return order.map((k) => map[k]);
}

interface RenderHandlers {
  formData: Record<string, unknown>; photoDetails: Record<string, PhotoIssueInspectionBlock>;
  onTextChange: (path: string, value: string) => void; onSelectChange: (path: string, value: string) => void;
  onMultiSelectChange: (path: string, values: string[]) => void; onPhotoSlotPress: (slot: ActivePhotoSlot) => void;
  onGroupPress: (group: ActiveGroupNode) => void; onDirectCapture: (storageKey: string, uri: string) => void;
}

const ChipSelector: React.FC<{ label: string; options: CatalogOption[]; value: string; onChange: (val: string) => void }> = ({ label, options, value, onChange }) => (
  <View style={chipS.container}>
    <Text style={chipS.label}>{label}</Text>
    <View style={chipS.row}>
      {options.map((opt) => { const val = String(opt.value); const display = opt.dataType === 'BOOLEAN' ? (val === 'true' ? 'Yes' : 'No') : opt.label; const sel = value === val;
        return <TouchableOpacity key={val} style={[chipS.chip, sel && chipS.chipSel]} onPress={() => onChange(val)} activeOpacity={0.7}><Text style={[chipS.text, sel && chipS.textSel]}>{display}</Text></TouchableOpacity>; })}
    </View>
  </View>
);
const chipS = StyleSheet.create({
  container: { marginBottom: verticalSpacing.md }, label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, marginBottom: verticalSpacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, chip: { borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.base, paddingVertical: verticalSpacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.surface },
  chipSel: { borderColor: colors.primary, backgroundColor: colors.primaryLight }, text: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.medium }, textSel: { color: colors.primary, fontWeight: typography.fontWeight.semiBold },
});

const GroupCard: React.FC<{ label: string; hasContent: boolean; onPress: () => void }> = ({ label, hasContent, onPress }) => (
  <TouchableOpacity style={gcS.card} onPress={onPress} activeOpacity={0.75} accessibilityRole="button">
    <View style={gcS.iconWrap}><Text style={gcS.icon}>📷</Text>{hasContent && <View style={gcS.dot} />}</View>
    <View style={gcS.body}><Text style={gcS.label}>{label}</Text><Text style={gcS.sub}>{hasContent ? '✓ Submitted' : 'Tap to capture & review'}</Text></View>
    <Text style={gcS.chevron}>›</Text>
  </TouchableOpacity>
);
const gcS = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.base, marginBottom: verticalSpacing.md, borderWidth: 1, borderColor: colors.borderLight, gap: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: borderRadius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }, icon: { fontSize: 22 },
  dot: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success, borderWidth: 1.5, borderColor: colors.surface },
  body: { flex: 1 }, label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semiBold, color: colors.text, marginBottom: 2 }, sub: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
  chevron: { fontSize: 22, color: colors.textSecondary, fontWeight: typography.fontWeight.bold },
});

function renderInput(input: CatalogInput, nodePath: string, nodeLabel: string, issueOptions: string[], handlers: RenderHandlers): React.ReactNode {
  const label = cleanLabel(nodeLabel);
  if (input.inputType === 'file-upload') {
    return input.options.map((opt) => { const slotKey = `${nodePath}.${String(opt.value)}`; const slotLabel = opt.label.toLowerCase() === 'image' ? label : cleanLabel(opt.label); const block = handlers.photoDetails[slotKey];
      return <PhotoCapture key={slotKey} label={slotLabel} imageUri={block?.photos?.[0]} onCapture={(uri) => handlers.onDirectCapture(slotKey, uri)} />; });
  }
  if (input.inputType === 'multi-select') {
    const current = (handlers.formData[nodePath] as string[] | undefined) ?? [];
    return <MultiSelectChips key={nodePath} label={label} options={input.options} selected={current} onChange={(vals) => handlers.onMultiSelectChange(nodePath, vals)} />;
  }
  if (input.inputType === 'select') {
    const current = String((handlers.formData[nodePath] as string | undefined) ?? '');
    const selectedOpt = input.options.find((o) => String(o.value) === current);
    const subOpts = selectedOpt?.subOptions1 ?? [];
    return (
      <React.Fragment key={nodePath}>
        <ChipSelector label={label} options={input.options} value={current} onChange={(val) => handlers.onSelectChange(nodePath, val)} />
        {subOpts.map((sub, sIdx) => {
          const subInputType = (sub as unknown as Record<string, string>).inputType ?? 'multi-select';
          const subPath = `${nodePath}.${String(sub.value)}`; const subLabel = cleanLabel(sub.label);
          if (subInputType === 'multi-select') {
            const s2 = ((sub as unknown as Record<string, unknown[]>).subOptions2 ?? []).map((x) => ({ value: (x as Record<string, unknown>).value as string, label: (x as Record<string, unknown>).label as string, dataType: 'STRING' as const, subOptions1: [] }));
            const cur = (handlers.formData[subPath] as string[] | undefined) ?? [];
            return <MultiSelectChips key={`${nodePath}-sub-${sIdx}`} label={subLabel} options={s2} selected={cur} onChange={(vals) => handlers.onMultiSelectChange(subPath, vals)} />;
          }
          return null;
        })}
      </React.Fragment>
    );
  }
  if (input.inputType === 'number') {
    if (input.options.length > 0) return input.options.map((opt) => { const fp = `${nodePath}.${String(opt.value)}`; const fl = cleanLabel(opt.label); const cur = String((handlers.formData[fp] as string | undefined) ?? ''); return <AppInput key={fp} label={fl} value={cur} onChangeText={(v) => handlers.onTextChange(fp, v)} keyboardType="numeric" placeholder={`Enter ${fl.toLowerCase()}`} />; });
    const cur = String((handlers.formData[nodePath] as string | undefined) ?? '');
    return <AppInput key={nodePath} label={label} value={cur} onChangeText={(v) => handlers.onTextChange(nodePath, v)} keyboardType="numeric" placeholder={`Enter ${label.toLowerCase()}`} />;
  }
  if (input.options.length > 0) return input.options.map((opt) => { const fp = `${nodePath}.${String(opt.value)}`; const fl = cleanLabel(opt.label); const cur = String((handlers.formData[fp] as string | undefined) ?? ''); return <AppInput key={fp} label={fl} value={cur} onChangeText={(v) => handlers.onTextChange(fp, v)} placeholder={`Enter ${fl.toLowerCase()}`} />; });
  const cur = String((handlers.formData[nodePath] as string | undefined) ?? '');
  return <AppInput key={nodePath} label={label} value={cur} onChangeText={(v) => handlers.onTextChange(nodePath, v)} placeholder={`Enter ${label.toLowerCase()}`} />;
}

function renderNodes(nodes: CatalogNode[], handlers: RenderHandlers, depth = 0): React.ReactNode {
  return mergeByKey(nodes).map((section) => {
    if (section.nodes.length === 1) return renderSingleNode(section.nodes[0], handlers, section.key, depth);
    return <View key={`${section.key}-merged`}>{section.nodes.map((node, idx) => renderSingleNode(node, handlers, `${section.key}-${idx}`, depth))}</View>;
  });
}

function renderSingleNode(node: CatalogNode, handlers: RenderHandlers, keyPrefix: string, depth = 0): React.ReactNode {
  if (isGroup(node)) {
    if (depth >= 1) {
      const inputs = getInputs(node); const children = getChildren(node);
      const hasContent = inputs.some((inp) => inp.inputType === 'file-upload' && inp.options.some((opt) => handlers.photoDetails[`${node.path}.${String(opt.value)}`]?.photos?.[0])) || children.some((child) => { const val = handlers.formData[child.path]; return val !== undefined && String(val).trim().length > 0; });
      return <GroupCard key={`${keyPrefix}-card`} label={cleanLabel(node.label)} hasContent={hasContent} onPress={() => handlers.onGroupPress({ node, label: cleanLabel(node.label) })} />;
    }
    const inputs = getInputs(node); const children = getChildren(node); const issueOptions = collectIssueOptions(children);
    return (
      <View key={`${keyPrefix}-node`}>
        {inputs.map((input, iIdx) => <React.Fragment key={`${node.path}-input-${iIdx}`}>{renderInput(input, node.path, node.label, issueOptions, handlers)}</React.Fragment>)}
        {children.length > 0 && renderNodes(children, handlers, depth + 1)}
      </View>
    );
  }
  const inputs = getInputs(node); const children = getChildren(node); const issueOptions = collectIssueOptions(children);
  return (
    <View key={`${keyPrefix}-node`}>
      {inputs.map((input, iIdx) => <React.Fragment key={`${node.path}-input-${iIdx}`}>{renderInput(input, node.path, node.label, issueOptions, handlers)}</React.Fragment>)}
      {children.length > 0 && renderNodes(children, handlers, depth + 1)}
    </View>
  );
}

const ProgressRow: React.FC<{ filled: number; total: number }> = ({ filled, total }) => {
  const remaining = total - filled; const allDone = remaining === 0; const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  return (
    <View style={prS.container}>
      <View style={prS.track}><View style={[prS.fill, { width: `${pct}%` as `${number}%` }]} /></View>
      <Text style={[prS.label, allDone && prS.done]}>{allDone ? '✓ All required fields complete' : `${remaining} required field${remaining === 1 ? '' : 's'} remaining`}</Text>
    </View>
  );
};
const prS = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: borderRadius.sm, paddingHorizontal: spacing.base, paddingVertical: verticalSpacing.sm, marginBottom: verticalSpacing.base, gap: verticalSpacing.xs, ...Platform.select({ android: { elevation: 1 }, ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 2 } }) },
  track: { height: 4, backgroundColor: colors.border, borderRadius: borderRadius.full, overflow: 'hidden' }, fill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  label: { fontSize: typography.fontSize.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.medium }, done: { color: colors.success, fontWeight: typography.fontWeight.semiBold },
});

const TabBar: React.FC<{ sections: MergedSection[]; activeKey: string; onSelect: (key: string) => void; filledPerSection: Record<string, number> }> = ({ sections, activeKey, onSelect, filledPerSection }) => (
  <View style={tbS.wrapper}>
    {sections.map((section) => { const isActive = section.key === activeKey; const filled = filledPerSection[section.key] ?? 0;
      return (
        <TouchableOpacity key={section.key} style={[tbS.tab, isActive && tbS.tabActive]} onPress={() => onSelect(section.key)} activeOpacity={0.75} accessibilityRole="tab" accessibilityState={{ selected: isActive }}>
          <Text style={[tbS.label, isActive && tbS.labelActive]} numberOfLines={1}>{section.label}</Text>
          {filled > 0 && <View style={[tbS.badge, isActive && tbS.badgeActive]}><Text style={tbS.badgeText}>{filled}</Text></View>}
        </TouchableOpacity>
      );
    })}
  </View>
);
const tbS = StyleSheet.create({
  wrapper: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, marginBottom: verticalSpacing.base, padding: spacing.xs, gap: spacing.xs, ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4 } }) },
  tab: { flex: 1, alignItems: 'center', paddingVertical: verticalSpacing.sm, paddingHorizontal: spacing.xs, borderRadius: borderRadius.sm, gap: verticalSpacing.xxs }, tabActive: { backgroundColor: colors.primaryLight },
  label: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textAlign: 'center' }, labelActive: { color: colors.primary, fontWeight: typography.fontWeight.bold },
  badge: { backgroundColor: colors.border, borderRadius: borderRadius.full, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }, badgeActive: { backgroundColor: colors.primary },
  badgeText: { fontSize: 9, color: colors.white, fontWeight: typography.fontWeight.bold },
});

interface Props { onNext: () => void; onBack: () => void; }

const Step2AirConditioning: React.FC<Props> = ({ onNext, onBack }) => {
  const { currentSession, updateFormData, markStepComplete } = useInspectionStore();
  const catalog = useCatalogViewModel(selectCatalog);
  const loadingState = useCatalogViewModel((s) => s.loadingState);
  const loadCatalog = useCatalogViewModel((s) => s.loadCatalog);

  const formData = (currentSession?.formData.ac ?? {}) as Record<string, unknown>;
  const photoDetails = (currentSession?.formData.media?.documentPhotoDetails ?? {}) as Record<string, PhotoIssueInspectionBlock>;
  const sectionNodes = catalog.airConditioningSectionChildren;
  const mergedSections = useMemo(() => mergeByKey(sectionNodes), [sectionNodes]);

  const [activeTabKey, setActiveTabKey] = useState('');
  const resolvedActiveKey = activeTabKey || (mergedSections[0]?.key ?? '');
  const [activeSlot, setActiveSlot] = useState<ActivePhotoSlot | null>(null);
  const [activeGroupNode, setActiveGroupNode] = useState<ActiveGroupNode | null>(null);

  const handleTextChange = useCallback((path: string, value: string) => updateFormData(InspectionStepId.Exterior, { [path]: value }), [updateFormData]);
  const handleSelectChange = useCallback((path: string, value: string) => updateFormData(InspectionStepId.Exterior, { [path]: value }), [updateFormData]);
  const handleMultiSelectChange = useCallback((path: string, values: string[]) => updateFormData(InspectionStepId.Exterior, { [path]: values }), [updateFormData]);
  const handlePhotoSlotPress = useCallback((slot: ActivePhotoSlot) => setActiveSlot(slot), []);
  const handleCloseModal = useCallback(() => setActiveSlot(null), []);
  const handleGroupPress = useCallback((group: ActiveGroupNode) => setActiveGroupNode(group), []);
  const handleCloseGroupModal = useCallback(() => setActiveGroupNode(null), []);
  const handleDirectCapture = useCallback((storageKey: string, uri: string) => {
    const prev = currentSession?.formData.media?.documentPhotoDetails ?? {};
    updateFormData(InspectionStepId.Media, { documentPhotoDetails: { ...prev, [storageKey]: { ...(prev[storageKey] ?? {}), photos: uri ? [uri] : [], status: uri ? 'good' : undefined } } });
  }, [currentSession?.formData.media?.documentPhotoDetails, updateFormData]);
  const handlePhotoChange = useCallback((block: PhotoIssueInspectionBlock) => {
    if (!activeSlot) return;
    const prev = currentSession?.formData.media?.documentPhotoDetails ?? {};
    updateFormData(InspectionStepId.Media, { documentPhotoDetails: { ...prev, [activeSlot.storageKey]: block } });
  }, [activeSlot, currentSession?.formData.media?.documentPhotoDetails, updateFormData]);

  const { requiredFields, filledCount } = useMemo(() => {
    const required: string[] = []; const filled: string[] = [];
    const checkNode = (node: CatalogNode) => {
      getInputs(node).forEach((input) => {
        if (input.inputType === 'select') { required.push(node.path); if (formData[node.path] !== undefined && formData[node.path] !== '') filled.push(node.path); }
        else if (input.inputType === 'file-upload' && input.options.length > 0) { const slot = `${node.path}.${input.options[0].value}`; required.push(slot); if (photoDetails[slot]?.photos?.[0]) filled.push(slot); }
      });
      getChildren(node).forEach(checkNode);
    };
    sectionNodes.forEach(checkNode);
    return { requiredFields: required, filledCount: filled.length };
  }, [sectionNodes, formData, photoDetails]);

  const filledPerSection = useMemo(() => {
    const result: Record<string, number> = {};
    const countNode = (n: CatalogNode): number => {
      let count = 0;
      getInputs(n).forEach((input) => {
        if (input.inputType === 'file-upload') input.options.forEach((opt) => { if (photoDetails[`${n.path}.${opt.value}`]?.photos?.[0]) count++; });
        else if (input.inputType === 'multi-select') { const vals = formData[n.path] as string[] | undefined; if (vals && vals.length > 0) count++; }
        else { const val = formData[n.path]; if (val !== undefined && String(val).trim().length > 0) count++; }
      });
      getChildren(n).forEach((c) => { count += countNode(c); });
      return count;
    };
    mergedSections.forEach((section) => { result[section.key] = section.nodes.reduce((sum, n) => sum + countNode(n), 0); });
    return result;
  }, [mergedSections, formData, photoDetails]);

  const isComplete = filledCount === requiredFields.length && requiredFields.length > 0;
  const handleNext = useCallback(() => { if (isComplete) { markStepComplete(InspectionStepId.Exterior); onNext(); } }, [isComplete, markStepComplete, onNext]);

  const renderHandlers = useMemo<RenderHandlers>(() => ({
    formData, photoDetails, onTextChange: handleTextChange, onSelectChange: handleSelectChange,
    onMultiSelectChange: handleMultiSelectChange, onPhotoSlotPress: handlePhotoSlotPress,
    onGroupPress: handleGroupPress, onDirectCapture: handleDirectCapture,
  }), [formData, photoDetails, handleTextChange, handleSelectChange, handleMultiSelectChange, handlePhotoSlotPress, handleGroupPress, handleDirectCapture]);

  if (loadingState === 'loading' && sectionNodes.length === 0) {
    return <SafeAreaView style={s.safeArea} edges={['bottom']}><AppHeader title="Air Conditioning" subtitle="Step 2 of 6" onBack={onBack} /><View style={s.centred}><ActivityIndicator size="large" color={colors.primary} /><Text style={s.loadingText}>Loading form…</Text></View></SafeAreaView>;
  }
  if (loadingState === 'error' && sectionNodes.length === 0) {
    return <SafeAreaView style={s.safeArea} edges={['bottom']}><AppHeader title="Air Conditioning" subtitle="Step 2 of 6" onBack={onBack} /><View style={s.centred}><Text style={s.errorIcon}>⚠️</Text><Text style={s.errorText}>Failed to load form fields.</Text><AppButton label="Retry" onPress={loadCatalog} size="sm" fullWidth={false} /></View></SafeAreaView>;
  }

  const activeSection = mergedSections.find((sec) => sec.key === resolvedActiveKey);

  return (
    <SafeAreaView style={s.safeArea} edges={['bottom']}>
      <AppHeader title="Air Conditioning" subtitle="Step 2 of 6" onBack={onBack} />
      <View style={s.progressWrap}><ProgressRow filled={filledCount} total={requiredFields.length} /></View>
      <View style={s.tabWrap}><TabBar sections={mergedSections} activeKey={resolvedActiveKey} onSelect={setActiveTabKey} filledPerSection={filledPerSection} /></View>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" key={resolvedActiveKey}>
        {activeSection ? <View style={s.card}>{renderNodes(activeSection.nodes, renderHandlers)}</View> : null}
      </ScrollView>

      <Modal visible={activeSlot !== null} animationType="slide" onRequestClose={handleCloseModal}>
        <SafeAreaView style={s.modalSafe} edges={['bottom']}>
          {activeSlot ? <InspectionImageDetailPanel title={activeSlot.label} issueOptions={activeSlot.issueOptions} value={photoDetails[activeSlot.storageKey]} onChange={handlePhotoChange} onBack={handleCloseModal} layout="photoFirstSubmit" listBackTitle="Air Conditioning" photoLabel="Photo" /> : null}
        </SafeAreaView>
      </Modal>

      <Modal visible={activeGroupNode !== null} animationType="slide" onRequestClose={handleCloseGroupModal}>
        <SafeAreaView style={s.modalSafe} edges={['bottom']}>
          {activeGroupNode ? (
            <>
              <AppHeader title={activeGroupNode.label} subtitle="Air Conditioning" onBack={handleCloseGroupModal} variant="primary" />
              <ScrollView contentContainerStyle={s.groupModalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {(() => { const node = activeGroupNode.node; const inputs = getInputs(node); const children = getChildren(node); const issueOptions = collectIssueOptions(children);
                  return <>{inputs.map((input, iIdx) => <React.Fragment key={`gm-${iIdx}`}>{renderInput(input, node.path, node.label, issueOptions, renderHandlers)}</React.Fragment>)}{children.length > 0 && renderNodes(children, renderHandlers, 1)}</>; })()}
              </ScrollView>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>

      <View style={s.footer}>
        {!isComplete && <Text style={s.hint}>⚠ Complete all required fields to proceed</Text>}
        <AppButton label="Next →" onPress={handleNext} isDisabled={!isComplete} testID="step2-next-btn" />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, modalSafe: { flex: 1, backgroundColor: colors.surface },
  progressWrap: { paddingHorizontal: spacing.base, paddingTop: verticalSpacing.sm }, tabWrap: { paddingHorizontal: spacing.base, paddingBottom: verticalSpacing.xs },
  scroll: { flex: 1 }, content: { padding: spacing.base, paddingBottom: verticalSpacing.xxl },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4 } }) },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: verticalSpacing.base, padding: spacing.xl },
  loadingText: { fontSize: typography.fontSize.sm, color: colors.textSecondary }, errorIcon: { fontSize: 40 }, errorText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  footer: { padding: spacing.base, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  hint: { fontSize: typography.fontSize.xs, color: colors.warning, textAlign: 'center', marginBottom: verticalSpacing.sm, fontWeight: typography.fontWeight.medium },
  groupModalContent: { padding: spacing.base, paddingBottom: verticalSpacing.xxl },
});

export default Step2AirConditioning;

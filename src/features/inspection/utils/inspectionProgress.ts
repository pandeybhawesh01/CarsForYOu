/**
 * inspectionProgress — shared field-counting logic for the inspection flow.
 *
 * Single source of truth for "how many fields are filled vs expected" so the
 * group cards (ConnectedGroupCard) and the section cards (InspectionHomeScreen)
 * count identically and never drift.
 *
 * IMPORTANT — these are DATA walks, not renders. They read values out of a
 * plain formData object; they never create React elements. The counts are
 * dynamic: a `select` whose chosen option reveals sub-fields grows its own
 * total, mirroring exactly what renderInput() shows in DynamicInspectionStep.
 *
 * Path construction + "active sub-field" rules are kept in lock-step with
 * renderInput(). If that rendering logic changes, update this too.
 */

import type {
  CatalogField,
  CatalogGroup,
  CatalogInput,
  CatalogNode,
  CatalogOption,
  CatalogSection,
} from '../../../services/api/types';
import { getByPath, stripSectionPrefix } from './nestedFormData';

// ── Structural helpers (depend only on the catalog node, never on formData) ──

export function getInputs(node: CatalogNode): CatalogInput[] {
  const g = node as CatalogGroup;
  if (Array.isArray(g.inputs) && g.inputs.length > 0) return g.inputs;
  const f = node as CatalogField;
  if (f.inputType) {
    return [{
      inputType: f.inputType,
      dataType: f.dataType ?? 'STRING',
      allowsMultiple: f.allowsMultiple ?? false,
      options: f.options ?? [],
    }];
  }
  return [];
}

export function getChildren(node: CatalogNode): CatalogNode[] {
  return (node as CatalogGroup).children ?? [];
}

// ── Internal value helpers ───────────────────────────────────────────────────

interface PhotoBlock {
  photos?: Array<{ url?: string; capturedAt?: string }>;
}

export interface ProgressAcc {
  filled: number;
  total: number;
}

function readOptInputType(opt: unknown): string | undefined {
  if (opt === null || opt === undefined) return undefined;
  return (opt as { inputType?: string }).inputType;
}

function readSubOptions(opt: unknown): CatalogOption[] {
  if (opt === null || opt === undefined) return [];
  return ((opt as { subOptions1?: CatalogOption[] }).subOptions1) ?? [];
}

function isFilledValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim().length > 0;
}

function hasPhotoAt(sectionData: Record<string, unknown>, path: string): boolean {
  const block = getByPath(sectionData, stripSectionPrefix(path)) as PhotoBlock | undefined;
  return Boolean(block?.photos?.[0]?.url);
}

/**
 * Walk a node (and descendants), accumulating filled/total across every
 * ACTIVE field — including sub-fields revealed by the current selection.
 */
export function countNodeProgress(
  node: CatalogNode,
  sectionData: Record<string, unknown>,
  acc: ProgressAcc,
): void {
  const nodePath = node.path;

  for (const input of getInputs(node)) {
    const inputType = input.inputType;
    // Some nodes (legacy/draft shapes) may omit options entirely — normalise.
    const options = Array.isArray(input.options) ? input.options : [];

    // ── file-upload: each option (photo / video) is one field ──
    if (inputType === 'file-upload') {
      for (const opt of options) {
        acc.total++;
        if (hasPhotoAt(sectionData, `${nodePath}.${String(opt.value)}`)) acc.filled++;
      }
      continue;
    }

    // ── multi-select: itself = 1 field; active non-modal sub-fields add more ──
    if (inputType === 'multi-select') {
      const current = getByPath(sectionData, stripSectionPrefix(nodePath));
      const arr = (Array.isArray(current) ? current : []) as Array<{ type?: string } | string>;
      acc.total++;
      if (arr.length > 0) acc.filled++;

      // Modal sub-options live inside the same control (extent embedded in the
      // issue objects), so they are NOT separate fields — skip them here.
      const hasModalSub = options.some((opt) => {
        const it = readOptInputType(opt);
        return readSubOptions(opt).length > 0 && (it === 'select' || it === 'multi-select');
      });
      if (!hasModalSub) {
        const selectedStrings =
          arr.length > 0 && typeof arr[0] === 'object'
            ? (arr as Array<{ type?: string }>).map((i) => String(i.type))
            : (arr as string[]);
        for (const opt of options) {
          if (!selectedStrings.includes(String(opt.value))) continue;
          for (const sub of readSubOptions(opt)) {
            // Only multi-select subs are rendered in this branch.
            if ((readOptInputType(sub) ?? 'multi-select') !== 'multi-select') continue;
            acc.total++;
            const subPath = `${nodePath}.${String(opt.value)}.${String(sub.value)}`;
            if (isFilledValue(getByPath(sectionData, stripSectionPrefix(subPath)))) acc.filled++;
          }
        }
      }
      continue;
    }

    // ── select: itself = 1 field; the chosen option's active subs add more ──
    if (inputType === 'select') {
      const current = String((getByPath(sectionData, stripSectionPrefix(nodePath)) as string | undefined) ?? '');
      acc.total++;
      if (current.trim().length > 0) acc.filled++;

      const selectedOpt = options.find((o) => String(o.value) === current);
      const parentPath = nodePath.split('.').slice(0, -1).join('.');
      for (const sub of readSubOptions(selectedOpt)) {
        const subInputType = readOptInputType(sub) ?? 'multi-select';
        const subPath = parentPath ? `${parentPath}.${String(sub.value)}` : String(sub.value);
        if (subInputType === 'file-upload') {
          acc.total++;
          if (hasPhotoAt(sectionData, subPath)) acc.filled++;
        } else if (subInputType === 'multi-select') {
          acc.total++;
          if (isFilledValue(getByPath(sectionData, stripSectionPrefix(subPath)))) acc.filled++;
        }
        // Other sub types render nothing → not counted.
      }
      continue;
    }

    // ── number: option-list variant = one field per option ──
    if (inputType === 'number' && options.length > 0) {
      for (const opt of options) {
        acc.total++;
        if (isFilledValue(getByPath(sectionData, stripSectionPrefix(`${nodePath}.${String(opt.value)}`)))) acc.filled++;
      }
      continue;
    }

    // ── text / number / single-value: one field, filled when non-empty ──
    acc.total++;
    if (isFilledValue(getByPath(sectionData, stripSectionPrefix(nodePath)))) acc.filled++;
  }

  for (const child of getChildren(node)) {
    countNodeProgress(child, sectionData, acc);
  }
}

// ── Section-level (heading) progress ─────────────────────────────────────────

interface MergedHeading {
  key: string;
  nodes: CatalogNode[];
}

/**
 * Group a section's top-level children by key — these merged groups are the
 * "headings" the user sees as tabs inside the section (e.g. doors, accessories).
 */
function mergeHeadingsByKey(nodes: CatalogNode[]): MergedHeading[] {
  const order: string[] = [];
  const map: Record<string, MergedHeading> = {};
  for (const node of nodes) {
    if (!map[node.key]) {
      order.push(node.key);
      map[node.key] = { key: node.key, nodes: [] };
    }
    map[node.key].nodes.push(node);
  }
  return order.map((k) => map[k]);
}

export interface SectionProgress {
  /** Number of headings whose fields are all filled. */
  completed: number;
  /** Total number of headings in the section. */
  total: number;
}

/**
 * Computes heading-level progress for a section: a heading counts as complete
 * when every active field under it is filled. Returns completed/total headings.
 *
 * A heading with no countable fields is treated as not-complete (total stays
 * counted, but it can never satisfy filled === total > 0) — so empty headings
 * don't silently inflate the "complete" count.
 */
export function computeSectionProgress(
  section: CatalogSection,
  sectionData: Record<string, unknown>,
): SectionProgress {
  const headings = mergeHeadingsByKey(section.children ?? []);
  let completed = 0;
  for (const heading of headings) {
    const acc: ProgressAcc = { filled: 0, total: 0 };
    for (const node of heading.nodes) {
      countNodeProgress(node, sectionData, acc);
    }
    if (acc.total > 0 && acc.filled === acc.total) completed++;
  }
  return { completed, total: headings.length };
}

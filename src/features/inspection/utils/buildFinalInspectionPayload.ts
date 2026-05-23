import type { InspectionSession, PhotoIssueInspectionBlock } from '../types';
import type { NormalisedCatalog } from '../../../services/api/types';
import type { CatalogGroup, CatalogNode } from '../../../services/api/types';

type AnyRecord = Record<string, unknown>;

function isObject(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function setByPath(target: AnyRecord, path: string, value: unknown): void {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return;

  let cursor: AnyRecord = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const existing = cursor[key];
    if (!isObject(existing)) {
      cursor[key] = {};
    }
    cursor = cursor[key] as AnyRecord;
  }

  const last = parts[parts.length - 1];
  cursor[last] = value;
}

function mergeObjects(into: AnyRecord, from: AnyRecord): AnyRecord {
  for (const [key, value] of Object.entries(from)) {
    if (isObject(value) && isObject(into[key])) {
      mergeObjects(into[key] as AnyRecord, value);
    } else {
      into[key] = value;
    }
  }
  return into;
}

function collectPathTypeMap(nodes: CatalogNode[], map: Map<string, CatalogNode['type']>): void {
  for (const node of nodes) {
    map.set(node.path, node.type);
    const children = (node as CatalogGroup).children ?? [];
    if (children.length > 0) collectPathTypeMap(children, map);
  }
}

function buildNodeTypeMap(catalog: NormalisedCatalog): Map<string, CatalogNode['type']> {
  const map = new Map<string, CatalogNode['type']>();
  collectPathTypeMap(catalog.vehicleSectionChildren, map);
  collectPathTypeMap(catalog.engineTransmissionSectionChildren, map);
  collectPathTypeMap(catalog.airConditioningSectionChildren, map);
  collectPathTypeMap(catalog.steeringBrakesSectionChildren, map);
  collectPathTypeMap(catalog.electricalsInteriorsSectionChildren, map);
  collectPathTypeMap(catalog.exteriorSectionChildren, map);
  return map;
}

function findFieldMeta(catalog: NormalisedCatalog, path: string) {
  // fieldsByPath keys can be `path` or `path__${inputType}`
  return (
    catalog.fieldsByPath[path] ??
    catalog.fieldsByPath[`${path}__file-upload`] ??
    catalog.fieldsByPath[`${path}__select`] ??
    catalog.fieldsByPath[`${path}__multi-select`] ??
    catalog.fieldsByPath[`${path}__text`] ??
    catalog.fieldsByPath[`${path}__number`]
  );
}

function coerceValue(value: unknown, meta?: { dataType?: string; inputType?: string; key?: string }): unknown {
  if (!meta) return value;

  // Boolean select chips store strings: 'true' | 'false'
  if (meta.dataType === 'BOOLEAN') {
    if (value === true || value === false) return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return value;
  }

  if (meta.inputType === 'number' || meta.dataType === 'NUMBER') {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) return value;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : value;
    }
  }

  return value;
}

function sessionToFlatFields(session: InspectionSession): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  const blocks = session.formData;

  const sources: Array<Record<string, unknown> | undefined> = [
    blocks.basicVerification as Record<string, unknown> | undefined,
    blocks.exterior as Record<string, unknown> | undefined,
    blocks.interior as Record<string, unknown> | undefined,
    blocks.engine as Record<string, unknown> | undefined,
    blocks.documents as Record<string, unknown> | undefined,
    blocks.media as Record<string, unknown> | undefined,
    (blocks as unknown as { ac?: Record<string, unknown> }).ac,
  ];

  for (const src of sources) {
    if (!src) continue;
    for (const [k, v] of Object.entries(src)) {
      // Ignore nested objects here (photo blocks handled separately)
      if (isObject(v)) continue;
      flat[k] = v;
    }
  }

  return flat;
}

function buildPhotoFlatMap(session: InspectionSession, catalog: NormalisedCatalog): Record<string, unknown> {
  const nodeTypes = buildNodeTypeMap(catalog);

  const photoDetails =
    (session.formData.media?.documentPhotoDetails ?? {}) as Record<string, PhotoIssueInspectionBlock>;

  const out: Record<string, unknown> = {};
  const capturedAt = new Date();

  for (const [path, block] of Object.entries(photoDetails)) {
    const type = nodeTypes.get(path);
    const meta = findFieldMeta(catalog, path);

    const photos = (block?.photos ?? []).filter(Boolean);

    // Group nodes: schema expects { status, issues: [{type, extent?}], photos: [{url,capturedAt}] }
    if (type === 'group') {
      const groupValue: AnyRecord = {};
      if (block.status) groupValue.status = block.status;
      if (Array.isArray(block.issues) && block.issues.length > 0) {
        groupValue.issues = block.issues.map((issueType) => ({ type: issueType }));
      }
      if (photos.length > 0) {
        groupValue.photos = photos.map((url) => ({ url, capturedAt }));
      }

      out[path] = groupValue;
      continue;
    }

    // Field nodes: schema expects PhotoCapture (or array when allowsMultiple)
    if (photos.length === 0) continue;

    const photoObjects = photos.map((url) => ({ url, capturedAt }));
    const allowsMultiple = meta?.allowsMultiple === true;

    out[path] = allowsMultiple ? photoObjects : photoObjects[0];
  }

  return out;
}

/**
 * Post-processes flat typed fields to merge multi-select issues arrays with
 * their subOption extent values.
 *
 * Storage format (flat keys):
 *   "some.path.issues"          → ["Repaired", "RPM fluctuating"]
 *   "some.path.issues.Repaired" → "Major"   (extent subOption)
 *
 * API format:
 *   "some.path.issues" → [{ type: "Repaired", extent: "Major" }, { type: "RPM fluctuating" }]
 *
 * This function:
 * 1. Finds all keys ending in ".issues" that hold an array
 * 2. For each item in the array, checks if there's a sibling key "issues.<item>"
 * 3. Builds the merged object array and removes the now-redundant extent keys
 */
function mergeIssuesWithExtents(flat: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...flat };

  for (const key of Object.keys(result)) {
    const value = result[key];
    if (!Array.isArray(value)) continue;

    // Only process keys that look like issues fields (end with ".issues" or equal "issues")
    const isIssuesKey = key === 'issues' || key.endsWith('.issues');
    if (!isIssuesKey) continue;

    // Build merged array: each string item becomes { type, extent? }
    const merged = (value as unknown[]).map((item) => {
      if (typeof item !== 'string') return item;
      const extentKey = `${key}.${item}`;
      const extent = result[extentKey];
      if (extent && typeof extent === 'string' && extent.length > 0) {
        return { type: item, extent };
      }
      return { type: item };
    });

    result[key] = merged;

    // Remove the now-redundant extent sibling keys
    for (const item of value as string[]) {
      const extentKey = `${key}.${item}`;
      delete result[extentKey];
    }
  }

  return result;
}

export function buildFinalInspectionPayload(
  session: InspectionSession,
  catalog: NormalisedCatalog,
): Record<string, unknown> {
  console.log('[PayloadBuilder] 🔧 Building final inspection payload...');
  
  const flatFields = sessionToFlatFields(session);
  console.log('[PayloadBuilder] 📊 Flat fields extracted:', Object.keys(flatFields).length, 'fields');

  const typedFlat: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flatFields)) {
    const meta = findFieldMeta(catalog, path);
    typedFlat[path] = coerceValue(value, meta ? { ...meta, key: path } : undefined);
  }

  // Merge issues arrays with their extent subOption siblings before building nested payload
  const mergedFlat = mergeIssuesWithExtents(typedFlat);
  console.log('[PayloadBuilder] 🔧 Issues merged with extents');

  const typedPhotos = buildPhotoFlatMap(session, catalog);
  console.log('[PayloadBuilder] 📸 Photo blocks processed:', Object.keys(typedPhotos).length, 'blocks');

  const formData: AnyRecord = {};

  for (const [path, value] of Object.entries(mergedFlat)) {
    if (value === undefined || value === null || value === '') continue;
    setByPath(formData, path, value);
  }

  // Photos + group photo blocks may overlap with form values; merge so we don't wipe.
  const photoRoot: AnyRecord = {};
  for (const [path, value] of Object.entries(typedPhotos)) {
    setByPath(photoRoot, path, value);
  }
  mergeObjects(formData, photoRoot);

  console.log('[PayloadBuilder] ✅ Final payload built successfully');
  console.log('[PayloadBuilder] 📦 Payload structure:', JSON.stringify(formData, null, 2));

  return {
    appointmentId: session.appointmentId,
    finalSubmit: true,
    formData,
  };
}

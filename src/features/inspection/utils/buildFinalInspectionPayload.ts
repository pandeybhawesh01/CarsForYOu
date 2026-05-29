import type { InspectionSession } from '../types';
import type { NormalisedCatalog } from '../../../services/api/types';

type AnyRecord = Record<string, unknown>;

function isObject(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Recursively process nested objects to apply type coercion
 * Data is already in nested format, we just need to apply type coercion
 */
function processNestedData(
  obj: AnyRecord,
  catalog: NormalisedCatalog,
  pathPrefix: string = ''
): AnyRecord {
  const result: AnyRecord = {};

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;

    // Skip null/undefined
    if (value === null || value === undefined) continue;

    // Handle issues array - already in nested format [{type, extent}]
    if (key === 'issues' && Array.isArray(value)) {
      result[key] = value; // Pass through as-is
      continue;
    }

    // Handle arrays - pass through as-is
    if (Array.isArray(value)) {
      result[key] = value;
      continue;
    }

    // Handle nested objects (recurse)
    if (isObject(value)) {
      result[key] = processNestedData(value as AnyRecord, catalog, currentPath);
      continue;
    }

    // Handle primitives with type coercion
    const meta = findFieldMeta(catalog, currentPath);
    result[key] = coerceValue(value, meta);
  }

  return result;
}

function findFieldMeta(catalog: NormalisedCatalog, path: string) {
  return (
    catalog.fieldsByPath[path] ??
    catalog.fieldsByPath[`${path}__file-upload`] ??
    catalog.fieldsByPath[`${path}__select`] ??
    catalog.fieldsByPath[`${path}__multi-select`] ??
    catalog.fieldsByPath[`${path}__text`] ??
    catalog.fieldsByPath[`${path}__number`]
  );
}

function coerceValue(value: unknown, meta?: { dataType?: string; inputType?: string }): unknown {
  if (!meta) return value;

  // Boolean: convert string "true"/"false" to actual boolean
  if (meta.dataType === 'BOOLEAN') {
    if (value === true || value === false) return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return value;
  }

  // Number: convert string to number
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

export function buildFinalInspectionPayload(
  session: InspectionSession,
  catalog: NormalisedCatalog,
): Record<string, unknown> {
  const formData: AnyRecord = {};

  // C-6: iterate sections from the catalog (fully dynamic) instead of a
  // hardcoded list. Adding/removing a section in the backend now flows to
  // submit + auto-save automatically.
  const sectionKeys = catalog.sections.map((s) => s.section);

  for (const sectionKey of sectionKeys) {
    const section = (session.formData as AnyRecord)[sectionKey];
    if (!section || typeof section !== 'object' || Array.isArray(section)) continue;
    if (Object.keys(section).length === 0) continue;

    formData[sectionKey] = processNestedData(
      section as AnyRecord,
      catalog,
      sectionKey,
    );
  }

  if (session.formData.additionalImages && session.formData.additionalImages.length > 0) {
    formData.additionalImages = session.formData.additionalImages;
  }

  return {
    appointmentId: session.appointmentId,
    finalSubmit: true,
    formData,
  };
}

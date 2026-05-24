/**
 * Utilities for reading and writing nested form data using dot-notation paths.
 *
 * The catalog gives every field a full path like:
 *   "steeringBrakes.engineTransmission.engine.engineCondition.issues"
 *
 * Each step component holds only the section-level slice of formData, e.g.:
 *   formData = session.formData.steeringBrakes   →  { engineTransmission: { ... } }
 *
 * So before reading/writing we strip the leading section segment and work with
 * the relative path:
 *   "engineTransmission.engine.engineCondition.issues"
 */

type AnyRecord = Record<string, unknown>;

/**
 * Strip the first segment of a dot-notation path.
 * "steeringBrakes.engine.issues" → "engine.issues"
 * "issues"                       → "issues"   (no-op, already relative)
 */
export function stripSectionPrefix(path: string): string {
  const dot = path.indexOf('.');
  return dot === -1 ? path : path.slice(dot + 1);
}

/**
 * Read a value from a nested object using a dot-notation path.
 * getByPath({ a: { b: { c: 42 } } }, "a.b.c")  →  42
 * Returns undefined if any segment is missing.
 */
export function getByPath(obj: AnyRecord, path: string): unknown {
  const parts = path.split('.');
  let cursor: unknown = obj;
  for (const part of parts) {
    if (cursor === null || cursor === undefined || typeof cursor !== 'object' || Array.isArray(cursor)) {
      return undefined;
    }
    cursor = (cursor as AnyRecord)[part];
  }
  return cursor;
}

/**
 * Return a new object with `value` set at the nested path.
 * Existing sibling keys are preserved at every level.
 * setByPath({ a: { b: 1 } }, "a.c", 2)  →  { a: { b: 1, c: 2 } }
 */
export function setByPath(obj: AnyRecord, path: string, value: unknown): AnyRecord {
  const parts = path.split('.');
  if (parts.length === 1) {
    return { ...obj, [path]: value };
  }

  const [head, ...rest] = parts;
  const existing = (obj[head] !== null && typeof obj[head] === 'object' && !Array.isArray(obj[head]))
    ? (obj[head] as AnyRecord)
    : {};

  return {
    ...obj,
    [head]: setByPath(existing, rest.join('.'), value),
  };
}

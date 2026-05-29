/**
 * API response types for the inspection catalog endpoint.
 * Derived from: GET /forms/inspection-report/catalog?view=tree
 *
 * New schema (v2): nodes carry an `inputs` array instead of flat
 * inputType/dataType/options fields. Groups can have both `inputs`
 * (direct inputs rendered at this level) and `children` (nested nodes).
 */

// ─── Primitive option item ────────────────────────────────────────────────────

export interface CatalogOption {
  value: string | boolean | number;
  label: string;
  dataType: 'STRING' | 'BOOLEAN' | 'NUMBER';
  subOptions1: CatalogOption[];
  subOptions2?: CatalogOption[];
  uploadPath?: string; // S3 upload path for file-upload options
}

// ─── Input descriptor (inside the `inputs` array on each node) ───────────────

export type FieldInputType =
  | 'select'
  | 'multi-select'
  | 'file-upload'
  | 'text'
  | 'number'
  | string;

export interface CatalogInput {
  inputType: FieldInputType;
  dataType: 'STRING' | 'BOOLEAN' | 'NUMBER';
  allowsMultiple: boolean;
  options: CatalogOption[];
  // uploadPath removed - now in CatalogOption
}

// ─── Field node (leaf — type: "field") ───────────────────────────────────────

export interface CatalogField {
  type: 'field';
  key: string;
  label: string;
  path: string;
  section: string;
  /** New schema: input descriptors live here */
  inputs: CatalogInput[];
  /** Children (usually empty for leaf fields) */
  children: CatalogNode[];
  // Legacy flat fields (old schema, kept for backward compat)
  dataType?: 'STRING' | 'BOOLEAN' | 'NUMBER';
  inputType?: FieldInputType;
  allowsMultiple?: boolean;
  options?: CatalogOption[];
}

// ─── Group node (type: "group") ───────────────────────────────────────────────

export interface CatalogGroup {
  type: 'group';
  key: string;
  label: string;
  path: string;
  section: string;
  /** Direct inputs rendered at this group level (e.g. file-upload for chassisEmbossing) */
  inputs: CatalogInput[];
  /** Nested child nodes */
  children: CatalogNode[];
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type CatalogNode = CatalogField | CatalogGroup;

// ─── Section (top-level) ─────────────────────────────────────────────────────

export interface CatalogSection {
  section: string;
  label: string;
  children: CatalogNode[];
}

// ─── API response envelope ────────────────────────────────────────────────────

export interface CatalogApiResponse {
  success: boolean;
  message: string;
  view: string;
  sections: number;
  version?: string; // ← Catalog version for cache invalidation (admin-controlled)
  data: CatalogSection[];
  metadata?: {
    uploadPathsBySection?: {
      [sectionKey: string]: string[];
    };
    presignedUrlTTL?: number; // 55 minutes in milliseconds
  };
}

// ─── Normalised catalog (what the ViewModel exposes to the UI) ───────────────

export type CatalogOptionsMap = Record<string, string[]>;

export type RenderAs =
  | 'boolean'
  | 'multi-select'
  | 'single-select'
  | 'file-upload'
  | 'text'
  | 'number';

export interface NormalisedField {
  path: string;
  key: string;
  label: string;
  inputType: FieldInputType;
  dataType: 'STRING' | 'BOOLEAN' | 'NUMBER';
  allowsMultiple: boolean;
  options: CatalogOption[];
  renderAs: RenderAs;
}

export interface NormalisedCatalog {
  /** Raw catalog sections from the API — used by DynamicInspectionStep */
  sections: CatalogSection[];
  /** Upload paths by section from metadata */
  uploadPathsBySection?: {
    [sectionKey: string]: string[];
  };
  /** Path → option-list lookup, used by selects/multi-selects when needed */
  optionsByPath: CatalogOptionsMap;
  /** Path → field metadata, used by buildFinalInspectionPayload for type coercion */
  fieldsByPath: Record<string, NormalisedField>;
}

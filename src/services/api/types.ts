/**
 * API response types for the inspection catalog endpoint.
 * Derived from: GET /forms/inspection-report/catalog?view=tree
 */

// ─── Primitive option item ────────────────────────────────────────────────────

export interface CatalogOption {
  value: string | boolean | number;
  label: string;
  dataType: 'STRING' | 'BOOLEAN' | 'NUMBER';
  subOptions1: CatalogOption[];
}

// ─── Field node (leaf) ────────────────────────────────────────────────────────

export type FieldInputType =
  | 'select'
  | 'multi-select'
  | 'file-upload'
  | 'text'
  | 'number'
  | string;

export interface CatalogField {
  type: 'field';
  key: string;
  label: string;
  path: string;
  dataType: 'STRING' | 'BOOLEAN' | 'NUMBER';
  inputType: FieldInputType;
  allowsMultiple: boolean;
  options: CatalogOption[];
}

// ─── Group node (contains fields) ────────────────────────────────────────────

export interface CatalogGroup {
  type: 'group' | 'field';
  key: string;
  label: string;
  path: string;
  children: CatalogField[];
}

// ─── Section (top-level) ─────────────────────────────────────────────────────

export interface CatalogSection {
  section: string;
  label: string;
  children: CatalogGroup[];
}

// ─── API response envelope ────────────────────────────────────────────────────

export interface CatalogApiResponse {
  success: boolean;
  message: string;
  view: string;
  sections: number;
  data: CatalogSection[];
}

// ─── Normalised catalog (what the ViewModel exposes to the UI) ───────────────

/**
 * A flat map of field path → string[] options, ready for direct use in
 * dropdowns and multi-selects.
 *
 * Example:
 *   catalog['airConditioning.acCompressor.issues'] = ['AC Compressor not working', 'Compressor noise']
 */
export type CatalogOptionsMap = Record<string, string[]>;

/**
 * Full normalised catalog broken down by section for easy lookup.
 */
export interface NormalisedCatalog {
  /** Flat path → options map for every field in the catalog. */
  optionsByPath: CatalogOptionsMap;

  // ── Convenience accessors per section ──────────────────────────────────────

  airConditioning: {
    acCompressorIssues: string[];
    acControlPanelIssues: string[];
    acCoolingIssues: string[];
    blowerMotorIssues: string[];
    ventilationSystemIssues: string[];
  };

  engineTransmission: {
    batteryAlternatorIssues: string[];
    blowBy2000rpmIssues: string[];
    blowByIdleIssues: string[];
    clutchIssues: string[];
    coolantIssues: string[];
    engineConditionIssues: string[];
    engineMountingIssues: string[];
    engineOilIssues: string[];
    exhaustSmokeIssues: string[];
    fuelInjectorIssues: string[];
    radiatorIssues: string[];
    runningConditionIssues: string[];
    sumpIssues: string[];
    transmissionGearShiftingIssues: string[];
    turbochargerAvailable: string[];
  };

  steeringBrakes: {
    brakesIssues: string[];
    steeringIssues: string[];
    suspensionIssues: string[];
  };

  vehicle: {
    leadTypes: string[];
    rcAvailabilityOptions: string[];
    rcConditionOptions: string[];
    fuelTypeOptions: string[];
    duplicateKeyOptions: string[];
  };

  electricalInteriors: {
    powerWindowsCountOptions: string[];
  };
}

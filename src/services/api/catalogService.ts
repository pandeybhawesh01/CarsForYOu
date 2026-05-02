/**
 * Catalog Service — fetches and normalises the inspection catalog.
 *
 * New API schema (v2): each node carries an `inputs` array instead of flat
 * inputType/dataType/options. Groups can have both `inputs` (rendered at
 * group level) and `children` (nested nodes).
 */

import { ENDPOINTS } from './endpoints';
import { httpGet } from './httpClient';
import type {
  CatalogApiResponse,
  CatalogField,
  CatalogGroup,
  CatalogInput,
  CatalogNode,
  CatalogSection,
  NormalisedCatalog,
  NormalisedField,
  CatalogOptionsMap,
  RenderAs,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveRenderAs(input: CatalogInput): RenderAs {
  if (input.dataType === 'BOOLEAN') return 'boolean';
  if (input.inputType === 'multi-select') return 'multi-select';
  if (input.inputType === 'select') return 'single-select';
  if (input.inputType === 'file-upload') return 'file-upload';
  if (input.inputType === 'number') return 'number';
  return 'text';
}

function extractLabels(options: CatalogInput['options']): string[] {
  return options.map((o) => String(o.label)).filter((l) => l.trim().length > 0);
}

function extractValues(options: CatalogInput['options']): string[] {
  return options.map((o) => String(o.value)).filter((v) => v.trim().length > 0);
}

/**
 * Recursively collect all (path, input) pairs from the tree.
 * Each node can have multiple inputs — we emit one NormalisedField per input.
 */
function collectFields(
  nodes: CatalogNode[],
  accumulator: Array<{ path: string; key: string; label: string; input: CatalogInput }>,
): void {
  for (const node of nodes) {
    const inputs: CatalogInput[] = (node as CatalogGroup).inputs ?? [];

    for (const input of inputs) {
      accumulator.push({
        path: node.path,
        key: node.key,
        label: node.label,
        input,
      });
    }

    // Also handle legacy flat fields (old schema)
    const legacyField = node as CatalogField;
    if (legacyField.inputType && !inputs.length) {
      accumulator.push({
        path: node.path,
        key: node.key,
        label: node.label,
        input: {
          inputType: legacyField.inputType,
          dataType: legacyField.dataType ?? 'STRING',
          allowsMultiple: legacyField.allowsMultiple ?? false,
          options: legacyField.options ?? [],
        },
      });
    }

    const children = (node as CatalogGroup).children ?? [];
    if (children.length > 0) {
      collectFields(children, accumulator);
    }
  }
}

function buildFieldsMap(sections: CatalogSection[]): Record<string, NormalisedField> {
  const map: Record<string, NormalisedField> = {};

  for (const section of sections) {
    const collected: Array<{ path: string; key: string; label: string; input: CatalogInput }> = [];
    collectFields(section.children, collected);

    for (const { path, key, label, input } of collected) {
      const normalised: NormalisedField = {
        path,
        key,
        label,
        inputType: input.inputType,
        dataType: input.dataType,
        allowsMultiple: input.allowsMultiple,
        options: input.options,
        renderAs: deriveRenderAs(input),
      };

      const mapKey = map[path] ? `${path}__${input.inputType}` : path;
      map[mapKey] = normalised;
    }
  }

  return map;
}

function buildOptionsMap(fieldsMap: Record<string, NormalisedField>): CatalogOptionsMap {
  const map: CatalogOptionsMap = {};
  for (const [key, field] of Object.entries(fieldsMap)) {
    if (field.options?.length) {
      map[key] = extractLabels(field.options);
    }
  }
  return map;
}

function optionsForPath(
  fieldsMap: Record<string, NormalisedField>,
  pathFragment: string,
): string[] {
  const exactKey = Object.keys(fieldsMap).find(
    (k) => k === pathFragment || (k.includes(pathFragment) && k.endsWith(pathFragment.split('.').pop()!)),
  );
  if (exactKey) return extractValues(fieldsMap[exactKey].options);
  const fallback = Object.keys(fieldsMap).find((k) => k.endsWith(pathFragment));
  return fallback ? extractValues(fieldsMap[fallback].options) : [];
}

function normalise(raw: CatalogApiResponse): NormalisedCatalog {
  const fieldsMap = buildFieldsMap(raw.data);
  const optionsMap = buildOptionsMap(fieldsMap);

  const vehicleSection = raw.data.find((s) => s.section === 'vehicle');
  const vehicleSectionChildren = vehicleSection?.children ?? [];

  const engineSection = raw.data.find((s) => s.section === 'engineTransmission');
  const engineTransmissionSectionChildren = engineSection?.children ?? [];

  const acSection = raw.data.find((s) => s.section === 'airConditioning');
  const airConditioningSectionChildren = acSection?.children ?? [];

  return {
    optionsByPath: optionsMap,
    fieldsByPath: fieldsMap,
    vehicleSectionChildren,
    engineTransmissionSectionChildren,
    airConditioningSectionChildren,

    airConditioning: {
      acCompressorIssues: optionsForPath(fieldsMap, 'acCompressor.issues'),
      acControlPanelIssues: optionsForPath(fieldsMap, 'acControlPanel.issues'),
      acCoolingIssues: optionsForPath(fieldsMap, 'acCooling.issues'),
      blowerMotorIssues: optionsForPath(fieldsMap, 'blowerMotor.issues'),
      ventilationSystemIssues: optionsForPath(fieldsMap, 'ventilationSystem.issues'),
    },

    engineTransmission: {
      batteryAlternatorIssues: optionsForPath(fieldsMap, 'batteryAlternator.issues'),
      blowBy2000rpmIssues: optionsForPath(fieldsMap, 'blowBy2000rpm.issues'),
      blowByIdleIssues: optionsForPath(fieldsMap, 'blowByIdle.issues'),
      clutchIssues: optionsForPath(fieldsMap, 'clutch.issues'),
      coolantIssues: optionsForPath(fieldsMap, 'coolant.issues'),
      engineConditionIssues: optionsForPath(fieldsMap, 'engineCondition.issues'),
      engineMountingIssues: optionsForPath(fieldsMap, 'engineMounting.issues'),
      engineOilIssues: optionsForPath(fieldsMap, 'engineOil.issues'),
      exhaustSmokeIssues: optionsForPath(fieldsMap, 'exhaustSmoke.issues'),
      fuelInjectorIssues: optionsForPath(fieldsMap, 'fuelInjector.issues'),
      radiatorIssues: optionsForPath(fieldsMap, 'radiator.issues'),
      runningConditionIssues: optionsForPath(fieldsMap, 'runningCondition.issues'),
      sumpIssues: optionsForPath(fieldsMap, 'sump.issues'),
      transmissionGearShiftingIssues: optionsForPath(fieldsMap, 'transmissionGearShifting.issues'),
      turbochargerAvailable: optionsForPath(fieldsMap, 'turbocharger.isAvailable'),
    },

    steeringBrakes: {
      brakesIssues: optionsForPath(fieldsMap, 'brakes.issues'),
      steeringIssues: optionsForPath(fieldsMap, 'steering.issues'),
      suspensionIssues: optionsForPath(fieldsMap, 'suspension.issues'),
    },

    vehicle: {
      leadTypes: optionsForPath(fieldsMap, 'appointmentDetails.leadType'),
      rcAvailabilityOptions: optionsForPath(fieldsMap, 'vehicleDetails.rcAvailability'),
      rcConditionOptions: optionsForPath(fieldsMap, 'vehicleDetails.rcCondition'),
      fuelTypeOptions: optionsForPath(fieldsMap, 'vehicleDetails.fuelType'),
      duplicateKeyOptions: optionsForPath(fieldsMap, 'vehicleDetails.duplicateKeyPresent'),
    },

    electricalInteriors: {
      powerWindowsCountOptions: optionsForPath(fieldsMap, 'electricalsInteriors.powerWindowsCount'),
    },
  };
}

export const catalogService = {
  async fetchCatalog(): Promise<NormalisedCatalog> {
    const raw = await httpGet<CatalogApiResponse>(
      `${ENDPOINTS.INSPECTION_CATALOG}?view=tree`,
    );
    if (!raw.success) {
      throw new Error(raw.message ?? 'Catalog fetch failed');
    }
    return normalise(raw);
  },
};

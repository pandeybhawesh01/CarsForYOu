/**
 * Catalog Service — fetches and normalises the inspection catalog.
 *
 * Responsibilities:
 *  1. Fetch raw data from the API.
 *  2. Normalise the tree response into a flat, UI-friendly structure.
 *  3. Expose a single `fetchCatalog()` function consumed by the ViewModel.
 */

import { ENDPOINTS } from './endpoints';
import { httpGet } from './httpClient';
import type {
  CatalogApiResponse,
  CatalogField,
  CatalogGroup,
  CatalogSection,
  NormalisedCatalog,
  CatalogOptionsMap,
} from './types';

// ─── Normalisation helpers ────────────────────────────────────────────────────

/** Extract string labels from an option array, filtering out empty values. */
function extractLabels(options: CatalogField['options']): string[] {
  return options
    .map((o) => String(o.label))
    .filter((l) => l.trim().length > 0);
}

/** Extract string values from an option array. */
function extractValues(options: CatalogField['options']): string[] {
  return options
    .map((o) => String(o.value))
    .filter((v) => v.trim().length > 0);
}

/**
 * Walk the tree and build a flat path → labels map for every field
 * that has options.
 */
function buildOptionsMap(sections: CatalogSection[]): CatalogOptionsMap {
  const map: CatalogOptionsMap = {};

  for (const section of sections) {
    for (const group of section.children) {
      for (const field of group.children) {
        if (field.options?.length) {
          map[field.path] = extractLabels(field.options);
        }
      }
    }
  }

  return map;
}

/**
 * Find the first field matching a path fragment and return its option labels.
 * Falls back to an empty array if not found.
 */
function optionsFor(map: CatalogOptionsMap, pathFragment: string): string[] {
  const key = Object.keys(map).find((k) => k.endsWith(pathFragment));
  return key ? map[key] : [];
}

/**
 * Find the first field matching a path fragment and return its option values.
 */
function valuesFor(sections: CatalogSection[], pathFragment: string): string[] {
  for (const section of sections) {
    for (const group of section.children) {
      for (const field of group.children) {
        if (field.path?.endsWith(pathFragment) && field.options?.length) {
          return extractValues(field.options);
        }
      }
    }
  }
  return [];
}

/** Build the strongly-typed NormalisedCatalog from raw API data. */
function normalise(raw: CatalogApiResponse): NormalisedCatalog {
  const map = buildOptionsMap(raw.data);

  return {
    optionsByPath: map,

    airConditioning: {
      acCompressorIssues: optionsFor(map, 'acCompressor.issues'),
      acControlPanelIssues: optionsFor(map, 'acControlPanel.issues'),
      acCoolingIssues: optionsFor(map, 'acCooling.issues'),
      blowerMotorIssues: optionsFor(map, 'blowerMotor.issues'),
      ventilationSystemIssues: optionsFor(map, 'ventilationSystem.issues'),
    },

    engineTransmission: {
      batteryAlternatorIssues: optionsFor(map, 'batteryAlternator.issues'),
      blowBy2000rpmIssues: optionsFor(map, 'blowBy2000rpm.issues'),
      blowByIdleIssues: optionsFor(map, 'blowByIdle.issues'),
      clutchIssues: optionsFor(map, 'clutch.issues'),
      coolantIssues: optionsFor(map, 'coolant.issues'),
      engineConditionIssues: optionsFor(map, 'engineCondition.issues'),
      engineMountingIssues: optionsFor(map, 'engineMounting.issues'),
      engineOilIssues: optionsFor(map, 'engineOil.issues'),
      exhaustSmokeIssues: optionsFor(map, 'exhaustSmoke.issues'),
      fuelInjectorIssues: optionsFor(map, 'fuelInjector.issues'),
      radiatorIssues: optionsFor(map, 'radiator.issues'),
      runningConditionIssues: optionsFor(map, 'runningCondition.issues'),
      sumpIssues: optionsFor(map, 'sump.issues'),
      transmissionGearShiftingIssues: optionsFor(map, 'transmissionGearShifting.issues'),
      turbochargerAvailable: valuesFor(raw.data, 'turbocharger.isAvailable'),
    },

    steeringBrakes: {
      brakesIssues: optionsFor(map, 'brakes.issues'),
      steeringIssues: optionsFor(map, 'steering.issues'),
      suspensionIssues: optionsFor(map, 'suspension.issues'),
    },

    vehicle: {
      leadTypes: valuesFor(raw.data, 'appointmentDetails.leadType'),
      rcAvailabilityOptions: valuesFor(raw.data, 'vehicleDetails.rcAvailability'),
      rcConditionOptions: valuesFor(raw.data, 'vehicleDetails.rcCondition'),
      fuelTypeOptions: valuesFor(raw.data, 'vehicleDetails.fuelType'),
      duplicateKeyOptions: valuesFor(raw.data, 'vehicleDetails.duplicateKeyPresent'),
    },

    electricalInteriors: {
      powerWindowsCountOptions: valuesFor(raw.data, 'electricalsInteriors.powerWindowsCount'),
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

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

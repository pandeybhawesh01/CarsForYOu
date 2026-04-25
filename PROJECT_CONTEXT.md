# Cars24 App Context (Agent/IDE Handoff)

This file is a fast onboarding guide for any IDE, coding agent, or new engineer.

## 1) What This App Is

- App name: Cars24
- Platform: React Native (Android + iOS)
- Language: TypeScript
- Purpose: Dealer-side vehicle inspection workflow from login to review/submit.

Primary user journey:
1. Login with phone + OTP (simulated).
2. Open Dashboard with assigned inspections.
3. Pick a lead and enter inspection flow.
4. Complete step-wise inspection sections.
5. Review and submit inspection.

## 2) Tech Stack

- React Native: `0.84.1`
- React: `19.2.3`
- Navigation: `@react-navigation/native`, native stack + bottom tabs
- State: `zustand`
- Forms/validation libs available: `react-hook-form`, `zod` (partially used)
- Media capture dependency: `react-native-image-picker`
- Testing: Jest + react-test-renderer

Package source of truth:
- App package: `Cars24/package.json`
- Workspace-level package (lightweight): `package.json`

## 3) Run Commands

From `Cars24/`:

- `npm install`
- `npm start` (Metro)
- `npm run android`
- `npm run ios`
- `npm test`
- `npm run lint`

Node engine declared: `>= 22.11.0`.

## 4) High-Level Architecture

Entry and app shell:
- `App.tsx` wraps app with `SafeAreaProvider` and renders root navigation.

Navigation layers:
- `src/navigation/RootNavigator.tsx`
  - Stack: `Login` -> `MainTabs` -> `InspectionNavigator`
- `src/navigation/MainTabNavigator.tsx`
  - Tabs: `Dashboard`, `Profile` (placeholder)
- `src/navigation/InspectionNavigator.tsx`
  - Stack: `LeadDetails` -> `InspectionHome` -> `InspectionStep` -> `ReviewSubmit` -> `InspectionSuccess`

Feature modules:
- `src/features/auth/` for login flow
- `src/features/dashboard/` for lead list and filters
- `src/features/inspection/` for the full inspection domain

Shared UI and styling:
- Reusable components in `src/components/`
- Design tokens in `src/constants/` (`colors`, `typography`, `spacing`)
- Theme object in `src/theme/index.ts`
- Screen scaling helpers in `src/utils/scaling.ts`

## 5) Inspection Domain Model

Domain types and enums:
- `src/features/inspection/types/index.ts`
- Core enums: `InspectionStatus`, `InspectionStepId`, `Condition`, `YesNoNA`, `UserRole`
- Session object: `InspectionSession`
- Form payload object: `InspectionFormData`

State management:
- Store: `src/features/inspection/store/inspectionStore.ts`
- Key actions:
  - `startInspection(lead)`
  - `updateFormData(stepId, data)`
  - `markStepComplete(stepId)`
  - `markStepIncomplete(stepId)`
  - `submitInspection()`
  - `resetInspection()`

Current data source:
- `src/services/mockData.ts`
- Includes mock user, mock inspections, and `createEmptySession()`.
- No production backend wiring yet in the current flow.

## 6) Inspection Step Mapping (Important)

`InspectionStepScreen` selects step components by `stepIndex` (not by enum key at runtime).

Current mapping in `src/features/inspection/screens/InspectionStepScreen.tsx`:
- `0` -> `Step1_BasicVerification`
- `1` -> `Step4_Engine` (import alias name is misleading)
- `2` -> `Step2_Exterior` (used as Air Conditioning screen in naming)
- `3` -> `Step3_Interior`
- `4` -> `Step5_ElectricalsInteriors`
- `5` -> `Step6_Media`

Notes:
- Some file names and variable aliases are legacy/misaligned with actual section labels.
- Keep this mapping in sync if you reorder or rename steps.

## 7) Reusable Inspection Components

Under `src/features/inspection/components/`:
- `PhotoCapture.tsx`
- `ConditionSelector.tsx`
- `YesNoSelector.tsx`
- `CoolantInspectionPanel.tsx`
- `InspectionImageDetailPanel.tsx`
- `InspectionPhotoSummaryRow.tsx`

Inspection schema/constants:
- `src/constants/inspectionSchema.ts`
- Defines issue option lists and part definitions for exterior, engine components, AC, and documents.

## 8) Known Caveats For New Agents/IDEs

1. There is a generated TypeScript error snapshot file at workspace root:
   - `tsc_errors.txt`
2. The snapshot includes many path/import errors from older file layout and implicit `any` warnings.
3. Step naming currently reflects domain evolution; labels and file names are not perfectly aligned.
4. Dashboard navigation to nested stack uses a `@ts-ignore` at one call site for cross-navigator params.

If you are modernizing or fixing types, start from navigation types and relative imports in:
- `src/navigation/types.ts`
- `src/features/inspection/screens/steps/`
- `src/features/inspection/components/`

## 9) Where To Make Common Changes

- Change theme/colors/spacing: `src/constants/*`, `src/theme/index.ts`
- Add inspection form fields: `src/features/inspection/types/index.ts` + relevant step screen + store update
- Modify lead cards/list filters: `src/features/dashboard/screens/DashboardScreen.tsx`
- Modify login behavior/auth strategy: `src/features/auth/screens/LoginScreen.tsx`
- Add backend/API integration: replace usage of `src/services/mockData.ts` and introduce service layer under `src/services/api/`

## 10) Quick Onboarding Checklist For Any Agent

1. Read this file fully.
2. Read navigation files in `src/navigation/`.
3. Read store and types in `src/features/inspection/store/` and `src/features/inspection/types/`.
4. Confirm step mapping in `InspectionStepScreen.tsx` before making step-related edits.
5. Run `npm run lint` and `npm test` before finalizing changes.

---

Maintainer note: Keep this file updated when navigation flow, step mapping, or store contracts change.
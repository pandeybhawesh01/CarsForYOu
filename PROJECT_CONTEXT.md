# Cars24 Inspection App — Project Context & Rules

## Catalog-Driven UI Rules

All inspection step screens are dynamically rendered from the catalog API:
`GET /api/v1/forms/inspection-report/catalog?view=tree`

### API Schema (v2)

Each node in the tree has:
- `type`: `"group"` or `"field"`
- `key`: identifier (may repeat across siblings — merge by key)
- `label`: display name (may contain `/` path separators — use last segment)
- `path`: dot-notation storage path (e.g. `vehicleDetails.chassisEmbossing`)
- `inputs[]`: array of `{ inputType, dataType, allowsMultiple, options[] }`
- `children[]`: nested child nodes

### Rendering Rules

#### Depth-based group rendering
- **depth 0** (top-level section nodes) → render content **inline** — these are the tab sections themselves
- **depth ≥ 1** (nested groups) → render as a tappable **GroupPhotoCard** (📷 icon + label + › chevron)
  - Tapping opens a detail modal showing the group's inputs + children
  - Rule: check `type === "group"` only — do NOT additionally check for `file-upload`

#### Field rendering by `inputType`
| inputType | Rendering |
|-----------|-----------|
| `file-upload` (field node) | `PhotoCapture` directly — no modal, direct camera |
| `file-upload` (group node, depth ≥ 1) | `GroupPhotoCard` → opens `InspectionImageDetailPanel` |
| `select` + `BOOLEAN` dataType | `ChipSelector` with Yes/No labels |
| `select` + `STRING` dataType | `ChipSelector` with option labels |
| `multi-select` | `MultiSelectChips` |
| `text` with options | One `AppInput` per option (options = named sub-fields) |
| `number` with options | One numeric `AppInput` per option |
| `text`/`number` without options | Single `AppInput` |

#### File-upload label rule
- If `opt.label.toLowerCase() === 'image'` → use the **node label** as the `PhotoCapture` label
- Otherwise → use the option label (e.g. "RC Front", "Front Main")

#### subOptions1 conditional rendering
- When a `select` field has `subOptions1` on an option and that option is selected:
  - Render sub-options below the chip selector
  - `subOptions1` items carry an `inputType` property (non-standard extension on the option object)
  - For `multi-select` sub-options: render `MultiSelectChips` using `subOptions2` as choices
  - Storage path: `${nodePath}.${sub.value}`

#### Same-key merging
- Multiple nodes with the same `key` at the same level are merged into one section
- At depth 0: merged nodes render all their content inline under one tab
- At depth ≥ 1: merged nodes render as one `GroupPhotoCard`

#### Tab bar
- Top-level groups become horizontal tabs (same as Step 1)
- Tab bar is shown only when there are ≥ 2 top-level sections
- Each tab shows a filled-field badge counter

### Section → Step mapping

| Step | File | Section key | `InspectionStepId` |
|------|------|-------------|-------------------|
| 1 | `Step1_BasicVerification.tsx` | `vehicle` | `BasicVerification` |
| 2 | `Step4_Engine.tsx` | `engineTransmission` | `Engine` |
| 3 | `Step2_AirConditioning.tsx` | `airConditioning` | `Exterior` |
| 4 | `Step3_Interior.tsx` | `steeringBrakes` | `Interior` |
| 5 | `Step5_ElectricalsInteriors.tsx` | `electricalInteriors` | `Documents` |
| 6 | `Step6_Media.tsx` | `exterior` | `Media` |

### Adding a new section

1. Add `{sectionKey}SectionChildren: CatalogNode[]` to `NormalisedCatalog` in `types.ts`
2. Extract it in `catalogService.ts` `normalise()` function
3. Add `{sectionKey}SectionChildren: []` to `FALLBACK_CATALOG` in `catalogViewModel.ts`
4. Use `catalog.{sectionKey}SectionChildren` as `sectionNodes` in the step screen

### Catalog service location
`Cars24/src/services/api/catalogService.ts`

### ViewModel location
`Cars24/src/viewmodels/catalogViewModel.ts`

### Shared rendering helpers
The following pure functions are duplicated across step screens (Step1, Step2, Step3, Step4).
They are intentionally kept local to each screen to avoid cross-screen coupling:
- `renderNodes(nodes, handlers, depth)` — recursive node renderer
- `renderSingleNode(node, handlers, keyPrefix, depth)` — single node dispatcher
- `renderInput(input, nodePath, nodeLabel, issueOptions, handlers)` — input type dispatcher
- `mergeByKey(nodes)` — merges same-key siblings
- `collectIssueOptions(children)` — extracts multi-select options from children for photo panels
- `getInputs(node)` — extracts inputs array (handles both new and legacy schema)
- `getChildren(node)` — extracts children array

### Navigation
- Login screen is bypassed for debugging — `RootNavigator` starts at `MainTabs`
- To re-enable login: add `<Stack.Screen name="Login" component={LoginScreen} />` and set `initialRouteName="Login"`

### Data storage
- Form data stored in `InspectionStore` via `updateFormData(stepId, { [path]: value })`
- Photo details stored in `media.documentPhotoDetails` keyed by slot path (e.g. `carImages.frontMain`)
- Direct captures (field file-upload) stored as `{ photos: [uri], status: 'good' }`

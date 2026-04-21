/** Values aligned with `engineTransmission.coolant.issues` on the car inspection model */

export const COOLANT_ISSUE_OPTIONS = [
  'Leaking',
  'Dirty',
  'Level low',
  'Coolant mixed with engine oil',
] as const;

export type CoolantIssueOption = (typeof COOLANT_ISSUE_OPTIONS)[number];

/** Generic body / panel / tyre issues (aligned with common inspection checklists). */
export const EXTERIOR_PART_ISSUE_OPTIONS = [
  'Scratch / scuff',
  'Dent',
  'Paint fade / mismatch',
  'Rust',
  'Crack / broken',
  'Misalignment / gap',
  'Tyre wear uneven',
  'Tyre sidewall damage',
] as const;

export type ExteriorPartIssueOption = (typeof EXTERIOR_PART_ISSUE_OPTIONS)[number];

export const ENGINE_COMPONENT_ISSUE_OPTIONS = [
  'Leak / seepage',
  'Corrosion',
  'Loose / damaged mount',
  'Illegible / not visible',
] as const;

export const DOCUMENT_PHOTO_ISSUE_OPTIONS = [
  'Glare / blur',
  'Cropped / incomplete',
  'Illegible text',
  'Mismatch with vehicle',
] as const;

  export const AC_PANEL_ISSUE_OPTIONS = ['Not cooling', 'Controls faulty', 'Display issue', 'Odour'] as const;

  export const AC_COOLING_ISSUE_OPTIONS = ['Inactive - 12°C to 18°C', 'Not working 18°C and above', 'Not available'] as const;

  export const HEATER_SYSTEM_ISSUE_OPTIONS = ['Not working'] as const;

  export const AC_CONTROL_PANEL_ISSUE_OPTIONS = ['AC Panel broken / Crack', 'AC Panel display not working'] as const;

  export const BLOWER_MOTOR_ISSUE_OPTIONS = ['Blower Motor noisy', 'Blower Motor not working'] as const;

  export const AC_COMPRESSOR_ISSUE_OPTIONS = ['AC Compressor not working', 'Compressor noise'] as const;

  export const VENTILATION_SYSTEM_ISSUE_OPTIONS = ['Air flow weak', 'Not working', 'Odour present'] as const;

export type ExteriorTyreTabId = 'front' | 'left' | 'rear' | 'right';

export interface ExteriorTyrePartDef {
  id: string;
  label: string;
  required: boolean;
}

/** Walkaround structure (extend when `pdf_images` or backend adds more fields). */
export const EXTERIOR_TYRE_TAB_PARTS: Record<ExteriorTyreTabId, ExteriorTyrePartDef[]> = {
  front: [
    { id: 'f_bumper', label: 'Front bumper', required: true },
    { id: 'f_grille', label: 'Front grille', required: false },
    { id: 'bonnet', label: 'Bonnet', required: true },
    { id: 'f_windshield', label: 'Front windshield', required: false },
    { id: 'f_lhs_headlamp', label: 'LHS headlamp', required: false },
    { id: 'f_rhs_headlamp', label: 'RHS headlamp', required: false },
    { id: 'f_number_plate', label: 'Front number plate', required: false },
  ],
  left: [
    { id: 'lhs_front_fender', label: 'LHS front fender', required: false },
    { id: 'lhs_front_door', label: 'LHS front door', required: true },
    { id: 'lhs_rear_door', label: 'LHS rear door', required: false },
    { id: 'lhs_c_pillar', label: 'LHS C pillar', required: false },
    { id: 'lhs_quarter', label: 'LHS quarter panel', required: true },
    { id: 'lhs_running_border', label: 'LHS running border', required: false },
    { id: 'lhs_fr_tyre', label: 'LHS front wheel & tyre', required: true },
    { id: 'lhs_rr_tyre', label: 'LHS rear wheel & tyre', required: true },
  ],
  rear: [
    { id: 'r_bumper', label: 'Rear bumper', required: true },
    { id: 'boot_lid', label: 'Boot / tailgate', required: false },
    { id: 'r_windshield', label: 'Rear windshield', required: false },
    { id: 'r_lhs_taillamp', label: 'LHS tail lamp', required: false },
    { id: 'r_rhs_taillamp', label: 'RHS tail lamp', required: false },
    { id: 'r_number_plate', label: 'Rear number plate', required: false },
    { id: 'spare_wheel_well', label: 'Spare wheel well', required: false },
  ],
  right: [
    { id: 'rhs_front_fender', label: 'RHS front fender', required: false },
    { id: 'rhs_front_door', label: 'RHS front door', required: true },
    { id: 'rhs_rear_door', label: 'RHS rear door', required: false },
    { id: 'rhs_c_pillar', label: 'RHS C pillar', required: false },
    { id: 'rhs_quarter', label: 'RHS quarter panel', required: true },
    { id: 'rhs_running_border', label: 'RHS running border', required: false },
    { id: 'rhs_rr_tyre', label: 'RHS rear wheel & tyre', required: true },
  ],
};

export const EXTERIOR_TYRE_TAB_LABELS: Record<ExteriorTyreTabId, string> = {
  front: 'Front',
  left: 'Left',
  rear: 'Rear',
  right: 'Right',
};

export type DocumentPhotoDetailKey =
  | 'rcFront'
  | 'rcBack'
  | 'frontMain'
  | 'rearMain'
  | 'vinPlate'
  | 'cngPlate'
  | 'cngTestCertificate'
  | 'roadTaxDocument'
  | 'ownerManual'
  | 'hypothecationProof'
  | 'addressProof';

export const DOCUMENT_PHOTO_LABELS: Record<DocumentPhotoDetailKey, string> = {
  rcFront: 'RC Front',
  rcBack: 'RC Back',
  frontMain: 'Front Main Image',
  rearMain: 'Rear Main Image',
  vinPlate: 'VIN Plate',
  cngPlate: 'CNG Plate',
  cngTestCertificate: 'CNG Test Certificate',
  roadTaxDocument: 'Road Tax Document',
  ownerManual: 'Owner Manual',
  hypothecationProof: 'Hypothecation Proof',
  addressProof: 'Address Proof',
};

/** Maps detail block keys to legacy `MediaData` URI fields for APIs that still expect strings. */
export const DOCUMENT_PHOTO_URI_KEYS: Partial<Record<DocumentPhotoDetailKey, string>> = {
  rcFront: 'rcFrontImage',
  rcBack: 'rcBackImage',
  frontMain: 'frontImage',
  rearMain: 'rearImage',
  vinPlate: 'vinPlateImage',
  cngPlate: 'cngPlateImage',
  cngTestCertificate: 'cngTestCertificateImage',
  roadTaxDocument: 'roadTaxDocumentImage',
  ownerManual: 'ownerManualImage',
  hypothecationProof: 'hypothecationProofImage',
  addressProof: 'addressProofImage',
};

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum InspectionStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export enum InspectionStepId {
  BasicVerification = 'basic_verification',
  Exterior = 'exterior',
  Interior = 'interior',
  Engine = 'engine',
  Documents = 'documents',
  Media = 'media',
}

export enum FuelType {
  Petrol = 'PETROL',
  Diesel = 'DIESEL',
  Electric = 'ELECTRIC',
  CNG = 'CNG',
  Hybrid = 'HYBRID',
}

export enum TransmissionType {
  Manual = 'MANUAL',
  Automatic = 'AUTOMATIC',
  AMT = 'AMT',
  CVT = 'CVT',
}

export enum Condition {
  Excellent = 'EXCELLENT',
  Good = 'GOOD',
  Fair = 'FAIR',
  Poor = 'POOR',
  NA = 'N/A',
}

export enum YesNoNA {
  Yes = 'YES',
  No = 'NO',
  NA = 'N/A',
}

// ─── Car / Lead Types ────────────────────────────────────────────────────────

export interface CarDetails {
  make: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  kmDriven: number;
  registrationNumber: string;
  registrationState: string;
  ownerCount: number;
  insuranceValidity: string;
}

export interface LeadOwner {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface InspectionLead {
  id: string;
  appointmentId: string;
  scheduledAt: string;
  status: InspectionStatus;
  car: CarDetails;
  owner: LeadOwner;
  assignedCJId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// ─── Inspection Step Form Data ────────────────────────────────────────────────

export interface BasicVerificationData {
  [key: string]: string | YesNoNA | undefined;
  kmReadingMatches: YesNoNA;
  registrationStateMatches: YesNoNA;
  chassisNumberVerified: YesNoNA;
  engineNumberVerified: YesNoNA;
  ownerCountMatches: YesNoNA;
  insuranceValid: YesNoNA;
  notes?: string;
}

export interface ExteriorData {
  [key: string]: Condition | YesNoNA | string | undefined;
  frontBumper: Condition;
  rearBumper: Condition;
  bonnet: Condition;
  bootLid: Condition;
  frontLeftDoor: Condition;
  frontRightDoor: Condition;
  rearLeftDoor: Condition;
  rearRightDoor: Condition;
  roofCondition: Condition;
  windshieldCondition: Condition;
  frontTyreLeft: Condition;
  frontTyreRight: Condition;
  rearTyreLeft: Condition;
  rearTyreRight: Condition;
  spareTyre: YesNoNA;
  paintCondition: Condition;
  rust: YesNoNA;
  accidentHistory: YesNoNA;
  notes?: string;
}

export interface InteriorData {
  [key: string]: Condition | YesNoNA | string | undefined;
  dashboard: Condition;
  steering: Condition;
  seats: Condition;
  upholstery: Condition;
  floorMats: YesNoNA;
  powerWindows: YesNoNA;
  centralLocking: YesNoNA;
  sunroof: YesNoNA;
  airBags: YesNoNA;
  musicSystem: YesNoNA;
  acFunctionality: YesNoNA;
  heater: YesNoNA;
  odometer: Condition;
  notes?: string;
}

  export interface ACData {
    [key: string]: YesNoNA | Condition | string | PhotoIssueInspectionBlock | undefined;
    climateControlAvailable?: YesNoNA;
    climateControlInspection?: PhotoIssueInspectionBlock;
    acCoolingStatus?: string;
    acCoolingInspection?: PhotoIssueInspectionBlock;
    heaterSystemStatus?: PhotoIssueInspectionBlock;
    acPanelInspection?: PhotoIssueInspectionBlock;
    blowerMotorInspection?: PhotoIssueInspectionBlock;
    acCompressorInspection?: PhotoIssueInspectionBlock;
    ventilationSystemInspection?: PhotoIssueInspectionBlock;
    acCoolingAtIdle?: YesNoNA;
    acCoolingAt2000Rpm?: YesNoNA;
    acCompressor?: Condition;
    acCondenser?: Condition;
    acBlower?: Condition;
    acFoulSmell?: YesNoNA;
  }

/**
 * Shared shape for coolant, exterior + tyres parts, engine component photos, and document captures.
 * Photos are stored as array of objects with url and capturedAt timestamp.
 */
export interface PhotoIssueInspectionBlock {
  status?: string;
  issues?: string[];
  photos?: Array<{ url: string; capturedAt: string }>;
}

/** Alias for engine form coolant field (same payload as other photo+issue flows). */
export type CoolantInspectionBlock = PhotoIssueInspectionBlock;

export interface EngineData {
  [key: string]: Condition | YesNoNA | string | PhotoIssueInspectionBlock | string[] | undefined;
  engineSound: Condition;
  engineOilLevel: Condition;
  engineOilColor: Condition;
  coolantLevel: Condition;
  coolant?: CoolantInspectionBlock;
  batteryCondition: Condition;
  transmissionCondition: Condition;
  gearShifting: Condition;
  clutch: Condition;
  leaks: YesNoNA;
  notes?: string;
}

export interface DocumentsData {
  [key: string]: YesNoNA | Condition | string | undefined;
  rcAvailable: YesNoNA;
  registrationTransferredState: YesNoNA;
  duplicateKeyAvailable: YesNoNA;
  insuranceAvailable: YesNoNA;
  pollutionCertificate: YesNoNA;
  serviceHistory: YesNoNA;
  hypothecation: YesNoNA;
  challanPending: YesNoNA;
  notes?: string;
}

export interface MediaData {
  [key: string]: string | string[] | PhotoIssueInspectionBlock | undefined;
  // No separate photo storage - photos are inline with each field in their respective sections
}

// ─── Inspection Form Overall ──────────────────────────────────────────────────

/**
 * InspectionFormData - matches backend schema exactly
 * Each section stores its own data with photos inline.
 * Index signature allows dynamic section keys from the catalog API.
 */
export interface InspectionFormData {
  [sectionKey: string]: Record<string, unknown> | string[] | undefined;
  vehicle: Record<string, unknown>;
  engineTransmission: Record<string, unknown>;
  airConditioning: Record<string, unknown>;
  steeringBrakes: Record<string, unknown>;
  electricalsInteriors: Record<string, unknown>;
  exterior: Record<string, unknown>;
  additionalImages?: string[];
}

export interface InspectionStep {
  id: InspectionStepId;
  title: string;
  icon: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface InspectionSession {
  leadId: string;
  appointmentId: string;
  startedAt: string;
  steps: InspectionStep[];
  formData: InspectionFormData;
  status: InspectionStatus;
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export enum UserRole {
  CJ = 'CJ',
  Lead = 'LEAD',
  Admin = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  employeeId?: string;
  zone?: string;
  profileImage?: string;
}

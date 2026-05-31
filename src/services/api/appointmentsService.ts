/**
 * Appointments Service — fetches the leads (assigned appointments) shown on
 * the dashboard home screen.
 *
 * Endpoint:
 *   GET /appointments/cj/{cjId}/assigned
 *     ?isConfirmed=true
 *     &status=inspection_pending
 *     &appointmentId=20000000000001
 *     &dateFrom=2026-06-01
 *     &dateTo=2026-06-30
 *
 * The Authorization bearer token is attached automatically by httpClient
 * (see App.tsx → setAuthTokenProvider). `cjId` is currently static ('1');
 * swap it for the real id once it's available from auth/profile.
 */

import { ENDPOINTS } from './endpoints';
import { httpGet } from './httpClient';
import {
  InspectionStatus,
  FuelType,
  TransmissionType,
  type InspectionLead,
  type CarDetails,
  type LeadOwner,
} from '../../features/inspection/types';

// ─── Tabs ──────────────────────────────────────────────────────────────────

export type AppointmentTab = 'ALL' | 'PENDING' | 'QC_PENDING' | 'COMPLETED';

/** Backend `status` value for each tab (ALL sends no status filter). */
const STATUS_BY_TAB: Record<Exclude<AppointmentTab, 'ALL'>, string> = {
  PENDING: 'inspection_pending',
  QC_PENDING: 'qc_pending',
  COMPLETED: 'completed',
};

/** Static CJ id for now — replace with the real id once available. */
export const STATIC_CJ_ID = 1;

// ─── Raw API response shapes ─────────────────────────────────────────────────

export interface ApiLead {
  leadId: string;
  userId: number;
  vehicleNumber: string;
  brand: string;
  model: string;
  manufacturingMonth: number;
  manufacturingYear: number;
  variant: string;
  fuelType: string;
  transmission: string;
  state: string;
  rtoCode: string;
  odometerReading: string;
  minQuotedPrice: number;
  maxQuotedPrice: number;
  leadStatus: string;
  source: string;
}

export interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  pincode: string;
  landmark: string;
  district: string;
  state: string;
  mobile: string;
  email: string;
  role: string;
}

export interface ApiPincode {
  id: number;
  pincode: string;
  areaName: string;
  district: string;
  state: string;
  isServiceable: boolean;
}

export interface ApiAppointment {
  appointmentId: string;
  leadId: string;
  userId: number;
  date: string;
  slot: string;
  pincodeId: number;
  fullAddress: string;
  landmark: string | null;
  status: string;
  isConfirmed: boolean;
  rescheduleCount: number;
  rescheduleReason: string | null;
  lead?: ApiLead;
  user?: ApiUser;
  pincode?: ApiPincode;
}

export interface ApiAssignedAppointment {
  id: number;
  appointmentId: string;
  employeeId: number;
  assignedAt: string;
  isActive: boolean;
  appointment: ApiAppointment;
}

export interface AssignedAppointmentsResponse {
  success: boolean;
  message: string;
  data: ApiAssignedAppointment[];
  count: number;
}

// ─── Query params ────────────────────────────────────────────────────────────

export interface FetchAppointmentsParams {
  tab: AppointmentTab;
  /** When set (search), only `appointmentId` + `isConfirmed=true` are sent. */
  appointmentId?: string;
  /** Override the static CJ id if needed. */
  cjId?: string | number;
  signal?: AbortSignal;
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Builds the query params for each tab / search per the product rules:
 *  - Search   → appointmentId + isConfirmed=true (nothing else)
 *  - ALL      → isConfirmed=true
 *  - Pending  → isConfirmed=true, status=inspection_pending, date -7d..+7d
 *  - QC Pending → isConfirmed=true, status=qc_pending, dateFrom -7d
 *  - Completed  → isConfirmed=true, status=completed, dateFrom -7d
 */
export function buildAppointmentQuery(params: FetchAppointmentsParams): string {
  const { tab, appointmentId } = params;

  // Search mode: only appointmentId + isConfirmed.
  if (appointmentId && appointmentId.trim().length > 0) {
    return buildQuery({ isConfirmed: true, appointmentId: appointmentId.trim() });
  }

  const today = new Date();
  const sevenBefore = toISODate(addDays(today, -7));
  const sevenAfter = toISODate(addDays(today, 7));

  switch (tab) {
    case 'PENDING':
      return buildQuery({
        isConfirmed: true,
        status: STATUS_BY_TAB.PENDING,
        dateFrom: sevenBefore,
        dateTo: sevenAfter,
      });
    case 'QC_PENDING':
      return buildQuery({
        isConfirmed: true,
        status: STATUS_BY_TAB.QC_PENDING,
        dateFrom: sevenBefore,
      });
    case 'COMPLETED':
      return buildQuery({
        isConfirmed: true,
        status: STATUS_BY_TAB.COMPLETED,
        dateFrom: sevenBefore,
      });
    case 'ALL':
    default:
      return buildQuery({ isConfirmed: true });
  }
}

// ─── Mapping helpers ─────────────────────────────────────────────────────────

function mapFuelType(value?: string): FuelType {
  switch ((value ?? '').toLowerCase()) {
    case 'petrol':
      return FuelType.Petrol;
    case 'diesel':
      return FuelType.Diesel;
    case 'electric':
      return FuelType.Electric;
    case 'cng':
      return FuelType.CNG;
    case 'hybrid':
      return FuelType.Hybrid;
    default:
      return FuelType.Petrol;
  }
}

function mapTransmission(value?: string): TransmissionType {
  switch ((value ?? '').toLowerCase()) {
    case 'automatic':
      return TransmissionType.Automatic;
    case 'amt':
      return TransmissionType.AMT;
    case 'cvt':
      return TransmissionType.CVT;
    case 'manual':
    default:
      return TransmissionType.Manual;
  }
}

/** Maps the backend appointment status into the local badge enum. */
function mapStatus(value?: string): InspectionStatus {
  switch ((value ?? '').toLowerCase()) {
    case 'inspection_pending':
      return InspectionStatus.Pending;
    case 'qc_pending':
    case 'inspection_in_progress':
    case 'in_progress':
      return InspectionStatus.InProgress;
    case 'completed':
    case 'qc_completed':
      return InspectionStatus.Completed;
    case 'cancelled':
      return InspectionStatus.Cancelled;
    default:
      return InspectionStatus.Pending;
  }
}

/**
 * Maps a single assigned-appointment API item into the app's InspectionLead.
 * Fields not present in the API (color, ownerCount, insurance, geo coords)
 * fall back to safe defaults so existing screens keep working.
 */
export function mapAssignedAppointmentToLead(item: ApiAssignedAppointment): InspectionLead {
  const appt = item.appointment ?? ({} as ApiAppointment);
  const lead = appt.lead;
  const user = appt.user;

  const car: CarDetails = {
    make: lead?.brand ?? '',
    model: lead?.model ?? '',
    variant: lead?.variant ?? '',
    year: lead?.manufacturingYear ?? 0,
    color: '',
    fuelType: mapFuelType(lead?.fuelType),
    transmission: mapTransmission(lead?.transmission),
    kmDriven: lead?.odometerReading ? Number(lead.odometerReading) || 0 : 0,
    registrationNumber: lead?.vehicleNumber ?? '',
    registrationState: lead?.state ?? '',
    ownerCount: 1,
    insuranceValidity: '',
  };

  const ownerName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : '';

  const owner: LeadOwner = {
    id: user ? String(user.id) : '',
    name: ownerName,
    phone: user?.mobile ?? '',
    address: user?.address ?? appt.fullAddress ?? '',
    city: user?.district ?? appt.pincode?.district ?? '',
    state: user?.state ?? appt.pincode?.state ?? '',
    pincode: user?.pincode ?? appt.pincode?.pincode ?? '',
  };

  return {
    id: appt.appointmentId ?? String(item.id),
    appointmentId: appt.appointmentId ?? item.appointmentId,
    scheduledAt: appt.date ?? item.assignedAt,
    slot: appt.slot ?? undefined,
    status: mapStatus(appt.status),
    car,
    owner,
    assignedCJId: String(item.employeeId ?? ''),
    location: {
      latitude: 0,
      longitude: 0,
      address: appt.fullAddress ?? owner.address,
    },
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const appointmentsService = {
  /**
   * Fetches the assigned appointments for the given tab / search and maps
   * them into InspectionLead objects ready for the dashboard list.
   */
  async fetchAssigned(params: FetchAppointmentsParams): Promise<InspectionLead[]> {
    const cjId = params.cjId ?? STATIC_CJ_ID;
    const query = buildAppointmentQuery(params);
    const url = `${ENDPOINTS.ASSIGNED_APPOINTMENTS(cjId)}${query}`;

    console.log('[AppointmentsService] 📥 Fetching assigned appointments:', url);

    const res = await httpGet<AssignedAppointmentsResponse>(url, { signal: params.signal });
    if (!res?.success) {
      throw new Error(res?.message ?? 'Failed to fetch appointments');
    }

    return (res.data ?? []).map(mapAssignedAppointmentToLead);
  },
};

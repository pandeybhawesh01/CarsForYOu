import { ENDPOINTS } from './endpoints';
import { httpPost } from './httpClient';

export interface InspectionReportSubmitPayload {
  appointmentId: string;
  finalSubmit: boolean;
  formData: Record<string, unknown>;
}

export interface InspectionReportSubmitResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export const inspectionReportService = {
  async submit(payload: InspectionReportSubmitPayload): Promise<InspectionReportSubmitResponse> {
    return httpPost<InspectionReportSubmitResponse>(ENDPOINTS.INSPECTION_SUBMIT, payload);
  },
};

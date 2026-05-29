import { ENDPOINTS } from './endpoints';
import { httpPost } from './httpClient';
import { offlineQueue } from '../offline/offlineQueue';

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
  /**
   * Submit final inspection report.
   *
   * H-22: on network failure the payload is queued for retry, and we still
   * throw so the caller can show "Submission queued — will retry" UX.
   */
  async submit(payload: InspectionReportSubmitPayload): Promise<InspectionReportSubmitResponse> {
    try {
      const res = await httpPost<InspectionReportSubmitResponse>(ENDPOINTS.INSPECTION_SUBMIT, payload);
      if (res?.success === false) {
        // Server-side declined — queue for retry but report failure to caller.
        await offlineQueue.enqueue({ kind: 'finalSubmit', payload: payload as unknown as Record<string, unknown> });
      }
      return res;
    } catch (err) {
      console.warn('[inspectionReportService] submit failed, enqueuing for retry:', err);
      await offlineQueue.enqueue({ kind: 'finalSubmit', payload: payload as unknown as Record<string, unknown> });
      throw err;
    }
  },
};

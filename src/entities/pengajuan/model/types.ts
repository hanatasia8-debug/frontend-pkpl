import type { RegisterUmkmDTO } from "@/entities/umkm/model/register-umkm.schema";
import type { RegisterNewsDTO } from "@/entities/berita/model/register-news.schema";

/**
 * A rejected submission looked up by its revision token
 * (`/submit/revision/[token]`). The token is the value sent to the warga
 * (e.g. via WhatsApp) when an admin rejects their pengajuan — see
 * `AdminSubmissionsService.updateNewsStatus` / `updateUmkmStatus` with
 * `reason`. Not the same as the submission's own `id`: a token is
 * single-purpose and (on a real backend) should stop working after the
 * revision is resubmitted.
 */
export interface RevisionUmkmLookup {
  type: "UMKM";
  submissionId: string;
  rejectionReason: string;
  rejectedAt: string;
  data: Partial<RegisterUmkmDTO>;
}

export interface RevisionNewsLookup {
  type: "NEWS";
  submissionId: string;
  rejectionReason: string;
  rejectedAt: string;
  data: Partial<RegisterNewsDTO>;
}

export type RevisionLookup = RevisionUmkmLookup | RevisionNewsLookup;

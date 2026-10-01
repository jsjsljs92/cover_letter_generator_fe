export type JobInputMode = 'url' | 'description';

export type ToneOption = 'professional' | 'friendly' | 'concise' | 'technical';

export interface ToneDefinition {
  id: ToneOption;
  label: string;
  description: string;
}

export interface CoverLetterFormData {
  inputMode: JobInputMode;
  jobUrl: string;
  jobDescription: string;
  resumeFile: File | null;
  tone: ToneOption;
}

export interface FormValidationErrors {
  jobUrl?: string;
  jobDescription?: string;
  resumeFile?: string;
}

export type GenerationState = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';

export type BackendStatus = 'created' | 'processing' | 'completed' | 'failed';

export interface CreateCoverLetterResponse {
  id: number | string;
  status: BackendStatus;
  message?: string;
}

export interface ValidationVerdict {
  valid: boolean;
  unsupported_claims?: string[];
  issues?: string[];
}

export interface GetCoverLetterResponse {
  id: number | string;
  status: BackendStatus;
  /** Present only once status is 'completed'. */
  cover_letter?: string;
  /** Server-computed PDF path, present once generation completed. */
  pdf_url?: string;
  candidate_name?: string;
  created_at?: string;
  /** Client-safe failure explanation, present only when status is 'failed'. */
  error?: string;
  validation?: ValidationVerdict;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending';
}

export interface GeneratedCoverLetter {
  id: string | number;
  content: string;
  tone: ToneOption;
  createdAt: string;
  /** Name the model attributed the letter to, when it inferred one. */
  candidateName?: string;
  /** Server-reported path to the generated PDF, when available. */
  pdfUrl?: string;
  sourceType: JobInputMode;
  sourceValue: string;
  resumeFileName: string;
}

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

export interface GetCoverLetterResponse {
  id: number | string;
  status: BackendStatus;
  cover_letter?: string;
  content?: string;
  text?: string;
  letter?: string;
  job_title?: string;
  company_name?: string;
  created_at?: string;
  error?: string;
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
  jobTitle?: string;
  companyName?: string;
  sourceType: JobInputMode;
  sourceValue: string;
  resumeFileName: string;
}

import {
  CreateCoverLetterResponse,
  GetCoverLetterResponse,
  JobInputMode,
  ToneOption,
} from '../types/coverLetter';

/**
 * Resolves the API Base URL from environment variables or defaults to http://localhost:8080
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const storedOverride = typeof window !== 'undefined' ? localStorage.getItem('api_base_url_override') : null;
  const baseUrl = storedOverride || envUrl || 'http://localhost:8080';
  return baseUrl.replace(/\/+$/, '');
}

/**
 * Sets an optional runtime override for the API base URL (saved in localStorage).
 */
export function setApiBaseUrlOverride(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (!url) {
    localStorage.removeItem('api_base_url_override');
  } else {
    localStorage.setItem('api_base_url_override', url.trim().replace(/\/+$/, ''));
  }
}

export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export interface CreateCoverLetterParams {
  inputMode: JobInputMode;
  jobUrl?: string;
  jobDescription?: string;
  resumeFile: File;
  tone: ToneOption;
}

/**
 * Creates a cover letter generation request via POST /api/v1/cover-letters
 * uses multipart/form-data
 */
export async function createCoverLetter(params: CreateCoverLetterParams): Promise<CreateCoverLetterResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/cover-letters`;

  const formData = new FormData();
  if (params.inputMode === 'url' && params.jobUrl) {
    formData.append('job_url', params.jobUrl.trim());
  } else if (params.inputMode === 'description' && params.jobDescription) {
    formData.append('job_description', params.jobDescription.trim());
  }

  formData.append('resume', params.resumeFile);
  formData.append('tone', params.tone);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `Server responded with status ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          errorMsg = errJson.message || errJson.error;
        }
      } catch {
        // Fall back to status text
        if (response.statusText) {
          errorMsg = response.statusText;
        }
      }
      throw new ApiError(errorMsg, response.status, false);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status || 'processing',
      message: data.message,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const isNetwork = err instanceof TypeError;
    const msg = isNetwork
      ? `Unable to connect to Go backend at ${baseUrl}. Ensure the server is running.`
      : (err as Error).message || 'An unexpected network error occurred.';
    throw new ApiError(msg, undefined, isNetwork);
  }
}

/**
 * Polls the cover letter generation status via GET /api/v1/cover-letters/{id}
 */
export async function getCoverLetter(id: number | string): Promise<GetCoverLetterResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/v1/cover-letters/${id}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorMsg = `Server responded with status ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          errorMsg = errJson.message || errJson.error;
        }
      } catch {
        if (response.statusText) {
          errorMsg = response.statusText;
        }
      }
      throw new ApiError(errorMsg, response.status, false);
    }

    const data = await response.json();
    return {
      id: data.id ?? id,
      status: data.status,
      cover_letter: data.cover_letter || data.content || data.text || data.letter || '',
      job_title: data.job_title,
      company_name: data.company_name,
      created_at: data.created_at,
      error: data.error,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const isNetwork = err instanceof TypeError;
    const msg = isNetwork
      ? `Unable to connect to Go backend at ${baseUrl}.`
      : (err as Error).message || 'Failed to check cover letter status.';
    throw new ApiError(msg, undefined, isNetwork);
  }
}

/**
 * Returns the PDF download URL for a generated cover letter
 */
export function getCoverLetterPdfUrl(id: number | string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/v1/cover-letters/${id}/pdf`;
}

/**
 * Initiates PDF download via GET /api/v1/cover-letters/{id}/pdf
 * Handles browser blob download cleanly with appropriate fallback naming
 */
export async function downloadCoverLetterPdf(
  id: number | string,
  suggestedFilename = 'cover-letter.pdf'
): Promise<void> {
  const url = getCoverLetterPdfUrl(id);

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new ApiError(
        `Failed to download PDF (${response.status} ${response.statusText})`,
        response.status,
        false
      );
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = suggestedFilename.endsWith('.pdf') ? suggestedFilename : `${suggestedFilename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      (err as Error).message || 'Failed to download PDF from server.',
      undefined,
      err instanceof TypeError
    );
  }
}

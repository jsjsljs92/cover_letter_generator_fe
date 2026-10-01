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
  /** Machine-readable code from the backend envelope, e.g. INVALID_JOB_INPUT. */
  code?: string;
  /** Correlation id, which an operator can use to find the full server-side error. */
  requestId?: string;

  constructor(
    message: string,
    status?: number,
    isNetworkError: boolean = false,
    code?: string,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
    this.code = code;
    this.requestId = requestId;
  }
}

/**
 * The backend's error envelope: {"error":{"code","message","request_id"}}.
 *
 * The message is nested one level down, so reading a top-level `message` (or
 * passing the `error` object to `new Error`) yields "[object Object]". This
 * unwraps the shape and falls back to the status line when the body is not the
 * expected envelope — a proxy or gateway may answer with HTML.
 */
async function extractError(response: Response): Promise<ApiError> {
  const fallback = `Server responded with status ${response.status}${
    response.statusText ? ` ${response.statusText}` : ''
  }`;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return new ApiError(fallback, response.status);
  }

  const detail = (payload as { error?: { message?: string; code?: string; request_id?: string } })
    ?.error;

  if (detail && typeof detail === 'object' && typeof detail.message === 'string') {
    return new ApiError(
      detail.message,
      response.status,
      false,
      detail.code,
      detail.request_id
    );
  }

  return new ApiError(fallback, response.status);
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
      throw await extractError(response);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status || 'processing',
      // The API returns 202 with the record; there is no human-readable message
      // field, so derive one from the status the backend assigned.
      message: `Request accepted (${data.status || 'processing'})`,
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
      throw await extractError(response);
    }

    const data = await response.json();
    return {
      id: data.id ?? id,
      status: data.status,
      cover_letter: data.cover_letter || '',
      // The backend exposes the candidate name it attributed the letter to; it
      // has no notion of a job title or company, so those are not sent.
      candidate_name: data.candidate_name,
      pdf_url: data.pdf_url,
      created_at: data.created_at,
      // A failed record carries a client-safe explanation in `error_message`.
      error: data.error_message,
      validation: data.validation,
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
      // Reuse the envelope reader so a failed download reports the server's
      // message rather than a bare status line.
      const err = await extractError(response);
      throw new ApiError(
        `Failed to download PDF: ${err.message}`,
        err.status,
        false,
        err.code,
        err.requestId
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

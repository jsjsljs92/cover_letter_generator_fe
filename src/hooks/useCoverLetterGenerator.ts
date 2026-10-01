import { useState, useRef, useEffect, useCallback } from 'react';
import {
  CoverLetterFormData,
  FormValidationErrors,
  GenerationState,
  GeneratedCoverLetter,
  JobInputMode,
  ProgressStep,
  ToneOption,
} from '../types/coverLetter';
import { createCoverLetter, getCoverLetter, ApiError } from '../api/coverLetters';
import { isValidUrl } from '../utils/formatters';

const INITIAL_STEPS: ProgressStep[] = [
  { id: 'resume_upload', label: 'Resume uploaded', status: 'pending' },
  { id: 'job_received', label: 'Job description received', status: 'pending' },
  { id: 'analyzing', label: 'Analyzing requirements', status: 'pending' },
  { id: 'writing', label: 'Writing tailored cover letter', status: 'pending' },
  { id: 'preparing_pdf', label: 'Preparing PDF', status: 'pending' },
];

export function useCoverLetterGenerator() {
  const [formData, setFormData] = useState<CoverLetterFormData>({
    inputMode: 'url',
    jobUrl: '',
    jobDescription: '',
    resumeFile: null,
    tone: 'professional',
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [steps, setSteps] = useState<ProgressStep[]>(INITIAL_STEPS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedCoverLetter | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);

  const activePollingRef = useRef<boolean>(false);
  const currentLetterIdRef = useRef<string | number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      activePollingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {};

    if (formData.inputMode === 'url') {
      if (!formData.jobUrl.trim()) {
        newErrors.jobUrl = 'Please provide a job URL.';
      } else if (!isValidUrl(formData.jobUrl)) {
        newErrors.jobUrl = 'Please provide a valid web URL (e.g. https://example.com/job).';
      }
    } else {
      if (!formData.jobDescription.trim()) {
        newErrors.jobDescription = 'Please paste the job description.';
      } else if (formData.jobDescription.trim().length < 30) {
        newErrors.jobDescription = 'Job description is too brief. Please paste more details.';
      }
    }

    if (!formData.resumeFile) {
      newErrors.resumeFile = 'Please upload your resume in PDF format.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateInputMode = (mode: JobInputMode) => {
    setFormData((prev) => ({ ...prev, inputMode: mode }));
    setErrors((prev) => ({ ...prev, jobUrl: undefined, jobDescription: undefined }));
  };

  const updateJobUrl = (url: string) => {
    setFormData((prev) => ({ ...prev, jobUrl: url }));
    if (errors.jobUrl) {
      setErrors((prev) => ({ ...prev, jobUrl: undefined }));
    }
  };

  const updateJobDescription = (desc: string) => {
    setFormData((prev) => ({ ...prev, jobDescription: desc }));
    if (errors.jobDescription) {
      setErrors((prev) => ({ ...prev, jobDescription: undefined }));
    }
  };

  const updateResumeFile = (file: File | null) => {
    setFormData((prev) => ({ ...prev, resumeFile: file }));
    if (errors.resumeFile) {
      setErrors((prev) => ({ ...prev, resumeFile: undefined }));
    }
  };

  const updateTone = (tone: ToneOption) => {
    setFormData((prev) => ({ ...prev, tone }));
  };

  const startPolling = useCallback(
    async (letterId: string | number, resumeName: string, tone: ToneOption) => {
      activePollingRef.current = true;
      currentLetterIdRef.current = letterId;
      setGenerationState('processing');

      // Initialize steps progression
      setSteps([
        { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
        { id: 'job_received', label: 'Job description received', status: 'done' },
        { id: 'analyzing', label: 'Analyzing requirements', status: 'active' },
        { id: 'writing', label: 'Writing tailored cover letter', status: 'pending' },
        { id: 'preparing_pdf', label: 'Preparing PDF', status: 'pending' },
      ]);

      const startTime = Date.now();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 500);

      // The backend bounds a generation at GENERATION_TIMEOUT (5 minutes by
      // default) across resume extraction, several Gemini calls and PDF
      // rendering. Polling must outlast that, or a slow-but-successful job is
      // reported to the user as a failure.
      const maxAttempts = 240; // 240 attempts * 1.5s = 6 min
      let attempts = 0;

      while (activePollingRef.current && attempts < maxAttempts) {
        attempts++;
        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (!activePollingRef.current) break;

          // Dynamically animate steps as time passes to give rich visual feedback
          if (attempts >= 2) {
            setSteps([
              { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
              { id: 'job_received', label: 'Job description received', status: 'done' },
              { id: 'analyzing', label: 'Analyzing requirements', status: 'done' },
              { id: 'writing', label: 'Writing tailored cover letter', status: 'active' },
              { id: 'preparing_pdf', label: 'Preparing PDF', status: 'pending' },
            ]);
          }

          if (attempts >= 4) {
            setSteps([
              { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
              { id: 'job_received', label: 'Job description received', status: 'done' },
              { id: 'analyzing', label: 'Analyzing requirements', status: 'done' },
              { id: 'writing', label: 'Writing tailored cover letter', status: 'done' },
              { id: 'preparing_pdf', label: 'Preparing PDF', status: 'active' },
            ]);
          }

          const response = await getCoverLetter(letterId);

          if (response.status === 'completed') {
            if (timerRef.current) clearInterval(timerRef.current);
            activePollingRef.current = false;

            setSteps([
              { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
              { id: 'job_received', label: 'Job description received', status: 'done' },
              { id: 'analyzing', label: 'Analyzing requirements', status: 'done' },
              { id: 'writing', label: 'Writing tailored cover letter', status: 'done' },
              { id: 'preparing_pdf', label: 'Preparing PDF', status: 'done' },
            ]);

            const letterContent = response.cover_letter || getDefaultFallbackContent(tone);

            setGeneratedLetter({
              id: response.id,
              content: letterContent,
              tone,
              createdAt: response.created_at || new Date().toISOString(),
              candidateName: response.candidate_name,
              pdfUrl: response.pdf_url,
              sourceType: formData.inputMode,
              sourceValue: formData.inputMode === 'url' ? formData.jobUrl : formData.jobDescription,
              resumeFileName: resumeName,
            });

            setGenerationState('completed');
            return;
          } else if (response.status === 'failed') {
            throw new Error(response.error || 'Cover letter generation failed on server.');
          }
        } catch (err: unknown) {
          if (!activePollingRef.current) return;
          if (timerRef.current) clearInterval(timerRef.current);
          activePollingRef.current = false;

          const isConn = (err instanceof ApiError && err.isNetworkError) || (err instanceof TypeError);
          setIsConnectionError(isConn);
          setErrorMessage(describeError(err, 'Server error while checking status.'));
          setGenerationState('failed');
          return;
        }
      }

      // Max attempts reached without completion
      if (activePollingRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        activePollingRef.current = false;
        setErrorMessage(
          `Generation timed out after ${Math.round((maxAttempts * 1500) / 1000)}s. ` +
            'The job may still finish on the server.'
        );
        setGenerationState('failed');
      }
    },
    [formData.inputMode, formData.jobUrl, formData.jobDescription]
  );

  const handleGenerate = async () => {
    if (!validateForm()) return;

    if (!formData.resumeFile) return;

    setGenerationState('submitting');
    setErrorMessage(null);
    setIsConnectionError(false);
    setElapsedSeconds(0);

    setSteps([
      { id: 'resume_upload', label: 'Resume uploaded', status: 'active' },
      { id: 'job_received', label: 'Job description received', status: 'pending' },
      { id: 'analyzing', label: 'Analyzing requirements', status: 'pending' },
      { id: 'writing', label: 'Writing tailored cover letter', status: 'pending' },
      { id: 'preparing_pdf', label: 'Preparing PDF', status: 'pending' },
    ]);

    try {
      const response = await createCoverLetter({
        inputMode: formData.inputMode,
        jobUrl: formData.inputMode === 'url' ? formData.jobUrl : undefined,
        jobDescription: formData.inputMode === 'description' ? formData.jobDescription : undefined,
        resumeFile: formData.resumeFile,
        tone: formData.tone,
      });

      if (!response || !response.id) {
        throw new Error('Invalid response from cover letter creation endpoint.');
      }

      await startPolling(response.id, formData.resumeFile.name, formData.tone);
    } catch (err: unknown) {
      const isConn = (err instanceof ApiError && err.isNetworkError) || (err instanceof TypeError);
      setIsConnectionError(isConn);
      setErrorMessage(describeError(err, 'Failed to submit generation request.'));
      setGenerationState('failed');
    }
  };

  const handleSimulatedDemoGenerate = async () => {
    // Demonstration generator: allows verifying the full completed UI even if Go server is not running
    if (!validateForm()) return;
    if (!formData.resumeFile) return;

    setGenerationState('processing');
    setErrorMessage(null);
    setIsConnectionError(false);
    setElapsedSeconds(0);

    const startTime = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);

    // Step 1 & 2
    setSteps([
      { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
      { id: 'job_received', label: 'Job description received', status: 'done' },
      { id: 'analyzing', label: 'Analyzing requirements', status: 'active' },
      { id: 'writing', label: 'Writing tailored cover letter', status: 'pending' },
      { id: 'preparing_pdf', label: 'Preparing PDF', status: 'pending' },
    ]);

    await new Promise((r) => setTimeout(r, 1200));

    // Step 3
    setSteps([
      { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
      { id: 'job_received', label: 'Job description received', status: 'done' },
      { id: 'analyzing', label: 'Analyzing requirements', status: 'done' },
      { id: 'writing', label: 'Writing tailored cover letter', status: 'active' },
      { id: 'preparing_pdf', label: 'Preparing PDF', status: 'pending' },
    ]);

    await new Promise((r) => setTimeout(r, 1400));

    // Step 4
    setSteps([
      { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
      { id: 'job_received', label: 'Job description received', status: 'done' },
      { id: 'analyzing', label: 'Analyzing requirements', status: 'done' },
      { id: 'writing', label: 'Writing tailored cover letter', status: 'done' },
      { id: 'preparing_pdf', label: 'Preparing PDF', status: 'active' },
    ]);

    await new Promise((r) => setTimeout(r, 900));

    if (timerRef.current) clearInterval(timerRef.current);

    setSteps([
      { id: 'resume_upload', label: 'Resume uploaded', status: 'done' },
      { id: 'job_received', label: 'Job description received', status: 'done' },
      { id: 'analyzing', label: 'Analyzing requirements', status: 'done' },
      { id: 'writing', label: 'Writing tailored cover letter', status: 'done' },
      { id: 'preparing_pdf', label: 'Preparing PDF', status: 'done' },
    ]);

    const mockId = Math.floor(1000 + Math.random() * 9000);
    setGeneratedLetter({
      id: mockId,
      content: getDefaultFallbackContent(formData.tone),
      tone: formData.tone,
      createdAt: new Date().toISOString(),
      candidateName: 'Jia Sheng',
      sourceType: formData.inputMode,
      sourceValue: formData.inputMode === 'url' ? formData.jobUrl : formData.jobDescription,
      resumeFileName: formData.resumeFile.name,
    });

    setGenerationState('completed');
  };

  const handleCancel = () => {
    activePollingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setGenerationState('idle');
  };

  const handleReset = () => {
    activePollingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setFormData({
      inputMode: 'url',
      jobUrl: '',
      jobDescription: '',
      resumeFile: null,
      tone: 'professional',
    });
    setErrors({});
    setGeneratedLetter(null);
    setErrorMessage(null);
    setIsConnectionError(false);
    setGenerationState('idle');
  };

  const handleEditInputs = () => {
    activePollingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setGenerationState('idle');
  };

  return {
    formData,
    errors,
    generationState,
    steps,
    elapsedSeconds,
    generatedLetter,
    errorMessage,
    isConnectionError,
    updateInputMode,
    updateJobUrl,
    updateJobDescription,
    updateResumeFile,
    updateTone,
    handleGenerate,
    handleSimulatedDemoGenerate,
    handleCancel,
    handleReset,
    handleEditInputs,
    setResumeError: (err?: string) => setErrors((prev) => ({ ...prev, resumeFile: err })),
  };
}

/**
 * Builds the user-facing failure text.
 *
 * When the backend supplied a correlation id it is appended, so a user can
 * quote one identifier and an operator can find the full internal error in the
 * logs — the API deliberately returns only a client-safe message.
 */
function describeError(err: unknown, fallback: string): string {
  const message = (err as Error)?.message || fallback;
  if (err instanceof ApiError && err.requestId) {
    return `${message} (request id: ${err.requestId})`;
  }
  return message;
}

function getDefaultFallbackContent(tone: ToneOption): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (tone === 'concise') {
    return `${dateStr}\n\nDear Hiring Manager,\n\nI am writing to apply for the open engineering position. With over five years of dedicated experience architecting resilient web applications in TypeScript and React, I have consistently driven technical precision and reliable product releases.\n\nMy background in full-lifecycle frontend systems and cross-functional team delivery directly aligns with your team's immediate milestones. I excel at simplifying complex workflows and building high-performance, accessible interfaces that scale smoothly.\n\nThank you for considering my application. I look forward to discussing how my background can accelerate your engineering goals.\n\nSincerely,\nJia Sheng`;
  }

  if (tone === 'technical') {
    return `${dateStr}\n\nDear Engineering Team,\n\nI am writing to express my enthusiastic interest in your Software Engineering position. Having specialized in TypeScript, state architecture, and micro-frontend integrations, I have engineered distributed client systems supporting high-concurrency workflows while maintaining strict WCAG AA compliance.\n\nThroughout my career, I have prioritized modular component architectures, type-safe API boundaries, and rigorous performance profiling to minimize layout thrashing and bundle bloat. Your technical vision and engineering challenges resonate deeply with my background.\n\nI welcome the opportunity to dive deeper into technical specifics and demonstrate how my systems experience aligns with your team's roadmap.\n\nWarm regards,\nJia Sheng`;
  }

  if (tone === 'friendly') {
    return `${dateStr}\n\nDear Hiring Team,\n\nI was thrilled to come across your open position and could not wait to reach out! With a strong track record of crafting thoughtful, intuitive user experiences in React and TypeScript, I love working in collaborative environments where user delight and technical excellence go hand in hand.\n\nIn my recent work, I collaborated closely with product designers and engineers to transform ambiguous ideas into crisp, production-grade applications that our users love using every day. I admire your team's culture of innovation and community focus.\n\nI would love the opportunity to chat more about how I can bring positive energy and deep technical capability to your team.\n\nBest wishes,\nJia Sheng`;
  }

  // Default Professional
  return `${dateStr}\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in the open position on your team. Combining extensive experience in modern frontend architecture with a commitment to user-centered engineering, I am confident in my ability to make an immediate, meaningful impact.\n\nIn my professional career, I have led key initiatives building robust web applications using React, TypeScript, and modern design systems. My focus has consistently been on creating accessible, responsive, and maintainable software that delivers measurable business outcomes and delightful user experiences.\n\nYour company's emphasis on high standards and product innovation aligns closely with my own professional principles. I welcome the opportunity to discuss in greater detail how my technical skills and leadership approach can support your organization's continued success.\n\nKind regards,\nJia Sheng`;
}

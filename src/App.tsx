import React, { useState } from 'react';
import { Header } from './components/Header';
import { JobInput } from './components/JobInput';
import { ResumeUploader } from './components/ResumeUploader';
import { ToneSelector } from './components/ToneSelector';
import { GenerateButton } from './components/GenerateButton';
import { GenerationProgress } from './components/GenerationProgress';
import { CoverLetterPreview } from './components/CoverLetterPreview';
import { ErrorState } from './components/ErrorState';
import { ApiConfigModal } from './components/ApiConfigModal';
import { useCoverLetterGenerator } from './hooks/useCoverLetterGenerator';
import { CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [, setRefreshKey] = useState(0);

  const {
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
    setResumeError,
  } = useCoverLetterGenerator();

  // Determine if form is ready to submit
  const hasJob =
    formData.inputMode === 'url'
      ? formData.jobUrl.trim().length > 0
      : formData.jobDescription.trim().length > 0;
  const hasResume = formData.resumeFile !== null;
  const isFormIncomplete = !hasJob || !hasResume;

  const disabledReason = !hasJob
    ? formData.inputMode === 'url'
      ? 'Please provide a job listing URL.'
      : 'Please paste a job description.'
    : !hasResume
    ? 'Please upload your resume in PDF format.'
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/70 text-neutral-900">
      {/* Top Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* State: IDLE */}
        {generationState === 'idle' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Page Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
                AI Cover Letter
              </h1>
              <p className="text-base text-neutral-600 font-normal">
                Create a tailored cover letter from your resume and a job description.
              </p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Step 1: Job Input */}
              <section aria-labelledby="job-input-heading">
                <h2 id="job-input-heading" className="sr-only">
                  Job Information
                </h2>
                <JobInput
                  mode={formData.inputMode}
                  onModeChange={updateInputMode}
                  jobUrl={formData.jobUrl}
                  onJobUrlChange={updateJobUrl}
                  jobDescription={formData.jobDescription}
                  onJobDescriptionChange={updateJobDescription}
                  urlError={errors.jobUrl}
                  descError={errors.jobDescription}
                />
              </section>

              <hr className="border-neutral-100" />

              {/* Step 2: Resume Upload */}
              <section aria-labelledby="resume-upload-heading">
                <h2 id="resume-upload-heading" className="sr-only">
                  Resume Upload
                </h2>
                <ResumeUploader
                  file={formData.resumeFile}
                  onFileSelect={updateResumeFile}
                  error={errors.resumeFile}
                  onErrorChange={setResumeError}
                />
              </section>

              <hr className="border-neutral-100" />

              {/* Step 3: Tone Selector */}
              <section aria-labelledby="tone-selector-heading">
                <h2 id="tone-selector-heading" className="sr-only">
                  Tone Selection
                </h2>
                <ToneSelector
                  value={formData.tone}
                  onChange={updateTone}
                />
              </section>

              {/* Step 4: Primary Generate Action */}
              <div className="pt-2">
                <GenerateButton
                  onClick={handleGenerate}
                  disabled={isFormIncomplete}
                  disabledReason={disabledReason}
                />
              </div>

              {/* Quick simulation helper for local sandbox evaluation */}
              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleSimulatedDemoGenerate}
                  disabled={isFormIncomplete}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-40"
                  title="Test end-to-end progress and preview without requiring the local Go server"
                >
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Instant preview test mode (simulated)</span>
                </button>
              </div>
            </div>

            {/* Value Proposition Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl border border-neutral-200/60 bg-white/70 space-y-1">
                <div className="flex items-center gap-2 text-neutral-900 font-medium text-sm">
                  <Zap className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span>Targeted Matching</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Synthesizes direct correlations between your verified experience and company requirements.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/60 bg-white/70 space-y-1">
                <div className="flex items-center gap-2 text-neutral-900 font-medium text-sm">
                  <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span>PDF Ready</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Generates publication-grade PDF documents formatted for recruitment applicant tracking systems.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/60 bg-white/70 space-y-1">
                <div className="flex items-center gap-2 text-neutral-900 font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span>Four Tones</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Calibrate your application voice from executive formal to collaborative or technical.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State: SUBMITTING / PROCESSING */}
        {(generationState === 'submitting' || generationState === 'processing') && (
          <div className="py-6 sm:py-12 animate-in fade-in duration-200">
            <GenerationProgress
              steps={steps}
              elapsedSeconds={elapsedSeconds}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* State: COMPLETED */}
        {generationState === 'completed' && generatedLetter && (
          <div className="py-4 animate-in fade-in duration-200">
            <CoverLetterPreview
              coverLetter={generatedLetter}
              onReset={handleReset}
              onEditInputs={handleEditInputs}
            />
          </div>
        )}

        {/* State: FAILED */}
        {generationState === 'failed' && (
          <div className="py-8 animate-in fade-in duration-200">
            <ErrorState
              onRetry={handleGenerate}
              onBackToForm={handleEditInputs}
              onOpenSettings={() => setIsSettingsOpen(true)}
              message={errorMessage || undefined}
              isConnectionError={isConnectionError}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/70 bg-white py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} AI Cover Letter. Production-grade career tooling.</p>
          <div className="flex items-center gap-4">
            <a
              href="#privacy"
              className="hover:text-neutral-900 transition-colors"
            >
              Privacy &amp; Security
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="#terms"
              className="hover:text-neutral-900 transition-colors"
            >
              Terms of Service
            </a>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-neutral-900 transition-colors"
            >
              Backend Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Backend API Configuration Dialog */}
      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

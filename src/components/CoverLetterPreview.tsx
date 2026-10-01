import React, { useState } from 'react';
import { Download, Copy, Check, ArrowLeft, RefreshCw, Printer, AlertCircle } from 'lucide-react';
import { GeneratedCoverLetter } from '../types/coverLetter';
import { copyToClipboard } from '../utils/formatters';
import { downloadCoverLetterPdf, getCoverLetterPdfUrl } from '../api/coverLetters';

interface CoverLetterPreviewProps {
  coverLetter: GeneratedCoverLetter;
  onReset: () => void;
  onEditInputs: () => void;
}

export const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({
  coverLetter,
  onReset,
  onEditInputs,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleCopy = async () => {
    const success = await copyToClipboard(coverLetter.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const filename = `Cover_Letter_${coverLetter.tone}_${coverLetter.id}.pdf`;
      await downloadCoverLetterPdf(coverLetter.id, filename);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Failed to download PDF from server.';
      setDownloadError(
        `${msg} Direct PDF link: ${getCoverLetterPdfUrl(coverLetter.id)}`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Split content by double newlines into natural paragraphs
  const paragraphs = coverLetter.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
            Generation Complete
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Your cover letter is ready
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span className="capitalize">Tone: {coverLetter.tone}</span>
            <span aria-hidden="true">·</span>
            <span>Resume: {coverLetter.resumeFileName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900"
            title="Copy text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900"
            title="Print cover letter"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-500" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:opacity-75"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {downloadError && (
        <div
          role="alert"
          className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium">Notice regarding PDF download:</p>
            <p className="text-amber-700 break-all">{downloadError}</p>
          </div>
        </div>
      )}

      {/* Document Sheet Preview */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-8 sm:p-12 md:p-16 transition-all print:shadow-none print:border-none print:p-0">
        <div className="font-editorial text-neutral-900 text-base sm:text-[17px] leading-[1.8] space-y-5 selection:bg-neutral-100">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line text-neutral-800">
                {para}
              </p>
            ))
          ) : (
            <p className="whitespace-pre-line text-neutral-800">
              {coverLetter.content}
            </p>
          )}
        </div>
      </div>

      {/* Secondary Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-sm text-neutral-600">
        <button
          type="button"
          onClick={onEditInputs}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition-colors py-1.5 focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit job details or resume</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate another cover letter</span>
        </button>
      </div>
    </div>
  );
};

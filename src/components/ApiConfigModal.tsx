import React, { useState, useEffect } from 'react';
import { X, Server, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrlOverride } from '../api/coverLetters';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getApiBaseUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = url.trim();
    if (clean) {
      setApiBaseUrlOverride(clean);
    } else {
      setApiBaseUrlOverride(null);
    }
    onSaved();
    onClose();
  };

  const handleResetDefault = () => {
    setApiBaseUrlOverride(null);
    setUrl(getApiBaseUrl());
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const targetUrl = url.trim().replace(/\/+$/, '');

    try {
      // Attempt a ping/check or head request against the base URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${targetUrl}/api/v1/cover-letters`, {
        method: 'OPTIONS',
        signal: controller.signal,
      }).catch(async () => {
        // Try simple GET to base or check if reachable
        return fetch(`${targetUrl}/`, { method: 'GET', signal: controller.signal });
      });

      clearTimeout(timeoutId);

      if (res) {
        setTestResult({
          success: true,
          message: `Backend is reachable at ${targetUrl}`,
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: `Could not reach ${targetUrl}. Ensure the Go server is running and CORS is configured.`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-neutral-900">
            <Server className="w-4 h-4 text-neutral-600" />
            <h3 id="api-settings-title" className="text-base font-semibold">
              Backend API Configuration
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close settings modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="backend-url-input"
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Base URL
            </label>
            <input
              id="backend-url-input"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8080"
              className="w-full px-3 py-2 text-sm font-mono bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 outline-none transition-all"
            />
            <p className="text-xs text-neutral-500">
              Default is configured via <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">VITE_API_BASE_URL</code> (default: <span className="font-mono">http://localhost:8080</span>).
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !url.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-2 transition-colors"
            >
              Reset to Default
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

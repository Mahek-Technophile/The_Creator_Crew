import React, { useState } from 'react';
import { aiProvider } from '../services/aiGenerator';
import { Key, CheckCircle, AlertCircle, Sparkles, X, ExternalLink } from 'lucide-react';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKeyInput, setApiKeyInput] = useState(aiProvider.getApiKey());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    aiProvider.setApiKey(apiKeyInput.trim());
    if (onKeyUpdated) onKeyUpdated();
    onClose();
  };

  const handleTest = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await aiProvider.testApiKey(apiKeyInput.trim());
    setIsTesting(false);
    setTestResult(result);
  };

  const handleClear = () => {
    setApiKeyInput('');
    aiProvider.setApiKey('');
    setTestResult(null);
    if (onKeyUpdated) onKeyUpdated();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--panel)] border-2 border-[var(--ink)] rounded-[var(--r-md)] max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b-2 border-[var(--ink)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--ink)]" />
            <h2 className="text-xl font-bold tracking-tight">Gemini API Connection</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--steel)] hover:text-[var(--ink)] p-1 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-[var(--steel)] mb-4 leading-relaxed">
          Connect your Google Gemini API key to enable live generation using{' '}
          <strong className="text-[var(--ink)]">Gemini 3.8 Flash</strong>. If no key is set, the
          Creator Crew operates in deterministic studio simulation mode.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy..."
              className="w-full font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--steel)]">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--ink)] font-semibold underline hover:text-[var(--tape)]"
            >
              <span>Get a Gemini API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {apiKeyInput && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[var(--rec)] hover:underline font-semibold"
              >
                Clear Key
              </button>
            )}
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-[var(--r-sm)] border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              id="close-api-dialog-btn"
              onClick={onClose}
              className="btn ghost small"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !apiKeyInput.trim()}
              className="btn ghost small"
            >
              {isTesting ? 'Testing connection…' : 'Test API Key'}
            </button>
            <button
              type="button"
              id="save-key-btn"
              onClick={handleSave}
              className="btn small"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

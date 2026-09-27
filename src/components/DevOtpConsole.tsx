import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { OtpLog } from '../types';
import { ShieldCheck, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface DevOtpConsoleProps {
  onAutoFillOtp?: (otp: string) => void;
}

export const DevOtpConsole: React.FC<DevOtpConsoleProps> = ({ onAutoFillOtp }) => {
  const [logs, setLogs] = useState<OtpLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshLogs = () => {
    setLogs(storage.getOtpLogs());
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (id: string, otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onAutoFillOtp) {
      onAutoFillOtp(otp);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white border border-slate-300 rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 transition text-xs font-mono text-slate-700"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-slate-800">Auth Dev Console (OTP)</span>
            {logs.length > 0 && (
              <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded text-[10px] font-bold">
                {logs.length}
              </span>
            )}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </button>

        {isOpen && (
          <div className="p-3 bg-white text-xs font-mono max-h-60 overflow-y-auto space-y-2 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 pb-1 border-b border-slate-100">
              Mock OTP verification stream (FR-1)
            </div>

            {logs.length === 0 ? (
              <div className="text-slate-400 italic py-2 text-center text-[11px]">
                No OTPs generated yet. Register a new account to observe dispatch logs.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] text-slate-800 font-semibold">{log.email}</div>
                    <div className="text-[10px] text-slate-500">
                      {log.mobile} · {log.timestamp}
                    </div>
                    <div className="text-slate-900 text-xs font-bold tracking-wider mt-0.5 font-mono">
                      Code: {log.otp}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(log.id, log.otp)}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] transition shrink-0"
                    title="Copy and Auto-fill"
                  >
                    {copiedId === log.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

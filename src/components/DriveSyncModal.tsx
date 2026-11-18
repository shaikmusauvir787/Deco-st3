import React, { useState, useRef } from 'react';
import { X, Upload, Link2, Sparkles, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { COURSE_METADATA } from '../data/decoCourseData';
import { LectureEntry, QuizQuestion, SyllabusUnit } from '../types/course';

export interface SyncResultPayload {
  summary: string;
  units: Partial<SyllabusUnit>[];
  lectures: Partial<LectureEntry>[];
  questions: Partial<QuizQuestion>[];
}

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySync: (payload: SyncResultPayload) => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  onApplySync,
}) => {
  const [driveUrl, setDriveUrl] = useState(COURSE_METADATA.driveUrl);
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSummary, setSuccessSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read selected file.'));
      reader.readAsDataURL(file);
    });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessSummary(null);

    if (!driveUrl.trim() && !pastedText.trim() && !selectedFile) {
      setErrorMsg('Provide a Google Drive link, upload a course file, or paste syllabus text.');
      return;
    }

    setLoading(true);
    try {
      let fileBase64: string | undefined;
      let fileName: string | undefined;
      let mimeType: string | undefined;

      if (selectedFile) {
        fileName = selectedFile.name;
        mimeType = selectedFile.type;
        fileBase64 = await readFileAsBase64(selectedFile);
      }

      const resp = await fetch('/api/analyze-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveUrl: driveUrl.trim(),
          pastedText: pastedText.trim(),
          fileName,
          fileBase64,
          mimeType,
        }),
      });

      const body = await resp.json();
      if (!resp.ok || !body.ok) {
        throw new Error(body.error || 'Unable to parse syllabus data from Gemini API.');
      }

      const parsed: SyncResultPayload = body.data;
      onApplySync(parsed);
      setSuccessSummary(
        parsed.summary ||
          `Synced ${parsed.units?.length ?? 0} units, ${parsed.lectures?.length ?? 0} lectures, and ${parsed.questions?.length ?? 0} practice questions.`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error analyzing Drive content.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-sync-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#111c33] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 id="drive-sync-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Drive Repository Sync &amp; AI File Parser
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ingest Google Drive links or local .docx, .pdf, .pptx, and .csv files into U24EC304.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Drive sync modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleAnalyze} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div>
            <label
              htmlFor="drive-url-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Google Drive Folder / File Link
            </label>
            <div className="relative">
              <Link2 className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="drive-url-input"
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 pl-9 pr-3 py-2.5 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Course Document (.docx, .pdf, .pptx, .csv)
            </span>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40'
              }`}
            >
              <Upload className="h-6 w-6 mx-auto text-indigo-500 mb-2" />
              <div className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                {selectedFile ? (
                  <span className="inline-flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name} ({Math.max(1, Math.round(selectedFile.size / 1024))} KB)
                  </span>
                ) : (
                  'Drag & drop a syllabus, slide deck, or question bank file here'
                )}
              </div>
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Browse File
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-slate-500 hover:text-rose-500"
                  >
                    Clear file
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.pptx,.csv,.txt,.md"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="pasted-syllabus-text"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Optional: Paste Syllabus Excerpt, Lecture Notes, or Question Set
            </label>
            <textarea
              id="pasted-syllabus-text"
              rows={3}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw syllabus topics, lecture dates, or exam questions to parse..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successSummary && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>{successSummary}</div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Analyzing with Gemini...' : 'Analyze & Sync Drive Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useMemo, useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Presentation,
  FileSpreadsheet,
  Search,
  Eye,
  X,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { COURSE_METADATA } from '../data/decoCourseData';
import { DriveFileItem, DriveFileType, DriveFolderName } from '../types/course';

interface DriveRepositoryProps {
  files: DriveFileItem[];
  initialFolderFilter?: string | null;
  initialSearch?: string | null;
  onClearExternalFilter?: () => void;
}

const FOLDERS: Array<DriveFolderName | 'ALL'> = [
  'ALL',
  'Root',
  'CSM',
  'CSM_AIML_2026',
  'DECO_U1',
  'DECO_U2',
  'DECO_U3',
  'DECO_U4',
  'DECO_U5',
];

const FILE_TYPES: Array<DriveFileType | 'ALL'> = ['ALL', 'PPTX', 'DOCX', 'PDF', 'Sheet'];

export const DriveRepository: React.FC<DriveRepositoryProps> = ({
  files,
  initialFolderFilter,
  initialSearch,
  onClearExternalFilter,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<DriveFolderName | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<DriveFileType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<DriveFileItem | null>(null);

  useEffect(() => {
    if (initialFolderFilter && FOLDERS.includes(initialFolderFilter as DriveFolderName)) {
      setSelectedFolder(initialFolderFilter as DriveFolderName);
      setSelectedType('ALL');
      setSearch('');
      onClearExternalFilter?.();
    }
  }, [initialFolderFilter, onClearExternalFilter]);

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
      setSelectedFolder('ALL');
      setSelectedType('ALL');
      onClearExternalFilter?.();
    }
  }, [initialSearch, onClearExternalFilter]);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return files.filter((file) => {
      if (selectedFolder !== 'ALL' && file.folder !== selectedFolder) return false;
      if (selectedType !== 'ALL' && file.type !== selectedType) return false;
      if (q) {
        const hay = `${file.name} ${file.folder} ${file.summary} ${file.keyTopics.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [files, selectedFolder, selectedType, search]);

  const getTypeIcon = (type: DriveFileType) => {
    switch (type) {
      case 'PPTX':
        return <Presentation className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'Sheet':
        return <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'PDF':
        return <FileText className="h-4 w-4 text-rose-500 shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <section aria-labelledby="repository-heading" className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            Synchronized Study Repository · {files.length} Indexed Files
          </div>
          <h1
            id="repository-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1"
          >
            Drive File Repository &amp; Study Material Explorer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Browse lecture decks, solved assignments, CIE keys, and question banks mirrored from the LIET DECO Drive folder.
          </p>
        </div>

        <a
          href={COURSE_METADATA.driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          Open Google Drive Folder
          <ExternalLink className="h-3.5 w-3.5 text-indigo-500" />
        </a>
      </div>

      {/* Folder Filter Strip */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by Drive folder">
          {FOLDERS.map((folder) => {
            const active = selectedFolder === folder;
            return (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Folder className="h-3.5 w-3.5 shrink-0" />
                {folder === 'ALL' ? 'All Folders' : folder}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search repository files"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search slides, CIE solutions, Hamming, Booth..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 self-start">
            {FILE_TYPES.map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setSelectedType(ft)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap ${
                  selectedType === ft
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File Grid */}
      {filteredFiles.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No files match your folder or search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedFolder('ALL');
              setSelectedType('ALL');
              setSearch('');
            }}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Show All Repository Files
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <article
              key={file.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:border-indigo-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                  <span className="truncate">
                    {file.folder} · {file.type}
                  </span>
                  <span className="shrink-0 tabular-nums">{file.updatedAt}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="mt-1">{getTypeIcon(file.type)}</div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white break-words leading-snug">
                    {file.name}
                  </h2>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {file.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {file.category}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Quick-View
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Quick-View Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111c33] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="min-w-0">
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {previewFile.folder} / {previewFile.type} · {previewFile.category}
                </div>
                <h3
                  id="quick-view-title"
                  className="text-base font-bold text-slate-900 dark:text-white mt-0.5 break-all"
                >
                  {previewFile.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                aria-label="Close Quick-View"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Repository Abstract
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {previewFile.summary}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  Indexed Topics &amp; Problem Coverage
                </div>
                <ul className="space-y-2">
                  {previewFile.keyTopics.map((topic, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>
                  {previewFile.unit ? `${previewFile.unit} · ` : ''}
                  {previewFile.co ?? 'CO1–CO5'}
                </span>
                <span>Updated {previewFile.updatedAt}</span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <a
                href={COURSE_METADATA.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Open in Google Drive
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

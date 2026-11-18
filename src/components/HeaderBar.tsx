import React from 'react';
import { Menu, Moon, Sun, FolderSync } from 'lucide-react';
import { COURSE_METADATA } from '../data/decoCourseData';

interface HeaderBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenDriveSync: () => void;
  onOpenMobileMenu: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  theme,
  onToggleTheme,
  onOpenDriveSync,
  onOpenMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile trigger + Institution & Course Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
              <span className="truncate">{COURSE_METADATA.accreditation}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {COURSE_METADATA.courseCode}
              </span>
              <span aria-hidden="true">·</span>
              <span>{COURSE_METADATA.credits} Credits</span>
              <span aria-hidden="true">·</span>
              <span>CIE: {COURSE_METADATA.cieMarks}</span>
              <span aria-hidden="true">·</span>
              <span>SEE: {COURSE_METADATA.seeMarks}</span>
            </div>
          </div>
        </div>

        {/* Right: Theme toggle + Primary Drive Sync action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenDriveSync}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <FolderSync className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Drive Folder Sync &amp; Uploader</span>
            <span className="sm:hidden">Drive Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  BookOpen,
  CalendarCheck2,
  FolderKanban,
  Cpu,
  Award,
  X,
  GraduationCap,
} from 'lucide-react';
import { NavSection } from '../types/course';

interface SidebarNavProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  completedCount: number;
  totalLectures: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'syllabus',
    label: 'Syllabus Explorer',
    subtitle: 'Track A & B Crosswalk',
    icon: BookOpen,
  },
  {
    id: 'lectures',
    label: '60-Lecture Plan',
    subtitle: '12-Week Schedule',
    icon: CalendarCheck2,
  },
  {
    id: 'repository',
    label: 'Drive Repository',
    subtitle: 'Slides & Exam Keys',
    icon: FolderKanban,
  },
  {
    id: 'calculators',
    label: 'Hardware Logic Lab',
    subtitle: '4 Interactive Simulators',
    icon: Cpu,
  },
  {
    id: 'nba-quiz',
    label: 'NBA Matrix & Quiz',
    subtitle: 'CO-PO-PSO & BTL Arena',
    icon: Award,
  },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  onSelectSection,
  completedCount,
  totalLectures,
  mobileOpen,
  onCloseMobile,
}) => {
  const pct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-[#0b1222] border-r border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100">
      <div>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-400">
                U24EC304
              </div>
              <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                DECO Course Hub
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
            Dr. Abdul Mateen Ahmed
          </div>
          <div className="truncate">B.E. III Sem · CSE-AIML / CSM</div>
        </div>

        <nav aria-label="Primary course navigation" className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-tight whitespace-nowrap truncate">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Syllabus Progress
            </span>
            <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
              {completedCount}/{totalLectures} ({pct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <div>03-Aug-2026 to 06-Nov-2026</div>
          <div>LIET Autonomous · LR24</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};

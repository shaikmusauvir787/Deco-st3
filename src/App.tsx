import { useState, useEffect } from 'react';
import { SidebarNav } from './components/SidebarNav';
import { HeaderBar } from './components/HeaderBar';
import { DriveSyncModal, SyncResultPayload } from './components/DriveSyncModal';
import { SyllabusExplorer } from './components/SyllabusExplorer';
import { LectureTracker } from './components/LectureTracker';
import { DriveRepository } from './components/DriveRepository';
import { CalculatorTab, HardwareCalculators } from './components/HardwareCalculators';
import { NbaQuizArena } from './components/NbaQuizArena';
import {
  DRIVE_FILES,
  INITIAL_LECTURES,
  INITIAL_QUIZ_QUESTIONS,
  TRACK_A_UNITS,
  TRACK_B_UNITS,
} from './data/decoCourseData';
import {
  BloomLevel,
  CourseOutcomeId,
  LectureEntry,
  NavSection,
  QuizQuestion,
  SyllabusUnit,
} from './types/course';

const STORAGE_COMPLETED_KEY = 'deco_completed_lectures_v1';
const STORAGE_THEME_KEY = 'deco_theme_v1';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [activeSection, setActiveSection] = useState<NavSection>('syllabus');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  // Course data states (pre-populated with authentic Drive repository data)
  const [trackBUnits, setTrackBUnits] = useState<SyllabusUnit[]>(TRACK_B_UNITS);
  const [trackAUnits] = useState<SyllabusUnit[]>(TRACK_A_UNITS);
  const [lectures, setLectures] = useState<LectureEntry[]>(INITIAL_LECTURES);
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);

  // Cross-module deep-link states
  const [labTab, setLabTab] = useState<CalculatorTab>('converter');
  const [repoFolderFilter, setRepoFolderFilter] = useState<string | null>(null);
  const [repoSearchFilter, setRepoSearchFilter] = useState<string | null>(null);

  // Completed lectures persisted in localStorage
  const [completedLectures, setCompletedLectures] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPLETED_KEY);
      return saved ? JSON.parse(saved) : ['L1', 'L2', 'L3'];
    } catch {
      return ['L1', 'L2', 'L3'];
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // ignore storage failure
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(completedLectures));
    } catch {
      // ignore storage failure
    }
  }, [completedLectures]);

  const handleToggleLecture = (id: string) => {
    setCompletedLectures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleMarkManyLectures = (ids: string[], markComplete: boolean) => {
    setCompletedLectures((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (markComplete) next.add(id);
        else next.delete(id);
      }
      return Array.from(next);
    });
  };

  const handleApplyDriveSync = (payload: SyncResultPayload) => {
    if (Array.isArray(payload.units) && payload.units.length > 0) {
      const syncedUnits: SyllabusUnit[] = payload.units.map((u, idx) => ({
        id: `synced-u-${Date.now()}-${idx}`,
        unitNumber: u.unitNumber || `Synced Unit ${idx + 1}`,
        title: u.title || 'Parsed Drive Unit',
        track: 'trackB',
        coMapping: (u.coMapping as CourseOutcomeId[]) || ['CO1'],
        btlRange: u.btlRange || 'BTL2 – BTL4',
        topics: Array.isArray(u.topics) ? u.topics : [],
        keyOutcomes: Array.isArray(u.keyOutcomes) ? u.keyOutcomes : [],
      }));
      setTrackBUnits((prev) => [...syncedUnits, ...prev]);
    }

    if (Array.isArray(payload.lectures) && payload.lectures.length > 0) {
      const startNo = lectures.length + 1;
      const syncedLectures: LectureEntry[] = payload.lectures.map((lec, idx) => ({
        id: `L${startNo + idx}`,
        lectureNo: startNo + idx,
        week: 12,
        date: '06-Nov-2026',
        unit: lec.unit || 'Unit I',
        co: (lec.co as CourseOutcomeId) || 'CO1',
        btl: (lec.btl as BloomLevel) || 'BTL3',
        topic: lec.topic || 'Synced Drive Lecture Topic',
        trackRef: 'Synced Drive Import',
        resourceFile: lec.resourceFile,
      }));
      setLectures((prev) => [...prev, ...syncedLectures]);
    }

    if (Array.isArray(payload.questions) && payload.questions.length > 0) {
      const syncedQuestions: QuizQuestion[] = payload.questions.map((q, idx) => ({
        id: `synced-q-${Date.now()}-${idx}`,
        source: 'Drive AI Sync',
        unit: q.unit || 'Unit I',
        co: (q.co as CourseOutcomeId) || 'CO1',
        btl: (q.btl as BloomLevel) || 'BTL3',
        marks: q.marks || 5,
        question: q.question || 'Synced Exam Question',
        options: Array.isArray(q.options) ? q.options : undefined,
        correctOptionIndex:
          typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        solutionSteps: Array.isArray(q.solutionSteps) ? q.solutionSteps : [],
        finalAnswer: q.finalAnswer || '',
        isAiGenerated: true,
      }));
      setQuestions((prev) => [...syncedQuestions, ...prev]);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-[#0f172a] dark:text-slate-100">
      <SidebarNav
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        completedCount={completedLectures.length}
        totalLectures={lectures.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <HeaderBar
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          onOpenDriveSync={() => setSyncModalOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {activeSection === 'syllabus' && (
            <SyllabusExplorer
              trackBUnits={trackBUnits}
              trackAUnits={trackAUnits}
              onOpenLab={(tab) => {
                setLabTab(tab);
                setActiveSection('calculators');
              }}
              onOpenFolder={(folder) => {
                setRepoFolderFilter(folder);
                setActiveSection('repository');
              }}
            />
          )}

          {activeSection === 'lectures' && (
            <LectureTracker
              lectures={lectures}
              completedIds={completedLectures}
              onToggleLecture={handleToggleLecture}
              onMarkMany={handleMarkManyLectures}
              onOpenResourceFile={(fileName) => {
                setRepoSearchFilter(fileName);
                setActiveSection('repository');
              }}
            />
          )}

          {activeSection === 'repository' && (
            <DriveRepository
              files={DRIVE_FILES}
              initialFolderFilter={repoFolderFilter}
              initialSearch={repoSearchFilter}
              onClearExternalFilter={() => {
                setRepoFolderFilter(null);
                setRepoSearchFilter(null);
              }}
            />
          )}

          {activeSection === 'calculators' && <HardwareCalculators initialTab={labTab} />}

          {activeSection === 'nba-quiz' && (
            <NbaQuizArena
              questions={questions}
              onAddQuestion={(newQ) => setQuestions((prev) => [newQ, ...prev])}
            />
          )}
        </main>
      </div>

      <DriveSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        onApplySync={handleApplyDriveSync}
      />
    </div>
  );
}

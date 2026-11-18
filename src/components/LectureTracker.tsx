import React, { useMemo, useState } from 'react';
import { Search, CheckSquare, Square, RotateCcw, FileText } from 'lucide-react';
import { CourseOutcomeId, LectureEntry } from '../types/course';

interface LectureTrackerProps {
  lectures: LectureEntry[];
  completedIds: string[];
  onToggleLecture: (id: string) => void;
  onMarkMany: (ids: string[], completed: boolean) => void;
  onOpenResourceFile: (fileName: string) => void;
}

export const LectureTracker: React.FC<LectureTrackerProps> = ({
  lectures,
  completedIds,
  onToggleLecture,
  onMarkMany,
  onOpenResourceFile,
}) => {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [coFilter, setCoFilter] = useState<CourseOutcomeId | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  const filteredLectures = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lectures.filter((lec) => {
      if (unitFilter !== 'ALL' && lec.unit !== unitFilter) return false;
      if (coFilter !== 'ALL' && lec.co !== coFilter) return false;
      const isDone = completedSet.has(lec.id);
      if (statusFilter === 'COMPLETED' && !isDone) return false;
      if (statusFilter === 'PENDING' && isDone) return false;
      if (q) {
        const hay = `${lec.id} ${lec.topic} ${lec.date} ${lec.unit} ${lec.resourceFile ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [lectures, unitFilter, coFilter, statusFilter, search, completedSet]);

  const completedCount = completedIds.length;
  const pct = lectures.length > 0 ? Math.round((completedCount / lectures.length) * 100) : 0;

  return (
    <section aria-labelledby="lecture-tracker-heading" className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            12-Week Academic Delivery Plan · 03-Aug-2026 to 06-Nov-2026
          </div>
          <h1
            id="lecture-tracker-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1"
          >
            60-Lecture Interactive Tracker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track completed classes across Weeks 1–12 with CO/BTL mapping and automatic local persistence.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-4 py-3 shrink-0">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Completion</div>
            <div className="text-lg font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount} / {lectures.length} ({pct}%)
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMarkMany(filteredLectures.map((l) => l.id), true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
              Mark Visible
            </button>
            <button
              type="button"
              onClick={() => onMarkMany(lectures.map((l) => l.id), false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            aria-label="Search lectures"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search L1–L60, topic, or slide..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          aria-label="Filter by Unit"
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Units (Unit I – V)</option>
          <option value="Unit I">Unit I (L1–L15)</option>
          <option value="Unit II">Unit II (L16–L30)</option>
          <option value="Unit III">Unit III (L31–L40)</option>
          <option value="Unit IV">Unit IV (L41–L50)</option>
          <option value="Unit V">Unit V (L51–L60)</option>
        </select>

        <select
          aria-label="Filter by Course Outcome"
          value={coFilter}
          onChange={(e) => setCoFilter(e.target.value as CourseOutcomeId | 'ALL')}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Course Outcomes (CO1–CO5)</option>
          <option value="CO1">CO1 — Number Systems &amp; Codes</option>
          <option value="CO2">CO2 — Combinational Logic</option>
          <option value="CO3">CO3 — Sequential &amp; Arithmetic</option>
          <option value="CO4">CO4 — RTL, ISA &amp; I/O DMA</option>
          <option value="CO5">CO5 — Memory &amp; Pipelining</option>
        </select>

        <select
          aria-label="Filter by completion status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'COMPLETED' | 'PENDING')}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed Only</option>
          <option value="PENDING">Pending Only</option>
        </select>
      </div>

      {/* Dense Lecture Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
        {filteredLectures.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              No lectures match the active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setUnitFilter('ALL');
                setCoFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 w-12">Done</th>
                  <th className="py-3 px-3 whitespace-nowrap">Lec</th>
                  <th className="py-3 px-3 whitespace-nowrap">Week / Date</th>
                  <th className="py-3 px-3 whitespace-nowrap">Unit</th>
                  <th className="py-3 px-3">Topic Covered</th>
                  <th className="py-3 px-3 whitespace-nowrap">CO / BTL</th>
                  <th className="py-3 px-4 whitespace-nowrap">Material</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {filteredLectures.map((lec) => {
                  const isDone = completedSet.has(lec.id);
                  return (
                    <tr
                      key={lec.id}
                      className={`transition-colors ${
                        isDone
                          ? 'bg-emerald-500/5 dark:bg-emerald-500/5'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isDone}
                          aria-label={`Mark ${lec.id} as completed`}
                          onClick={() => onToggleLecture(lec.id)}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            isDone
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          {isDone ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {lec.id}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div>Wk {String(lec.week).padStart(2, '0')}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lec.date}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {lec.unit}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-sm leading-snug ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {lec.topic}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {lec.co}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{lec.btl}</span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {lec.resourceFile ? (
                          <button
                            type="button"
                            onClick={() => onOpenResourceFile(lec.resourceFile!)}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 underline-offset-2 hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="max-w-[170px] truncate">{lec.resourceFile}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

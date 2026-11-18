import React, { useMemo, useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { NBA_CO_PO_MATRIX } from '../data/decoCourseData';
import { BloomLevel, CourseOutcomeId, QuizQuestion } from '../types/course';

interface NbaQuizArenaProps {
  questions: QuizQuestion[];
  onAddQuestion: (q: QuizQuestion) => void;
}

const PO_HEADERS = [
  'PO1',
  'PO2',
  'PO3',
  'PO4',
  'PO5',
  'PO6',
  'PO7',
  'PO8',
  'PO9',
  'PO10',
  'PO11',
  'PO12',
];

export const NbaQuizArena: React.FC<NbaQuizArenaProps> = ({ questions, onAddQuestion }) => {
  const [unitFilter, setUnitFilter] = useState<string>('ALL');
  const [coFilter, setCoFilter] = useState<CourseOutcomeId | 'ALL'>('ALL');
  const [btlFilter, setBtlFilter] = useState<BloomLevel | 'ALL'>('ALL');

  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (unitFilter !== 'ALL' && q.unit !== unitFilter) return false;
      if (coFilter !== 'ALL' && q.co !== coFilter) return false;
      if (btlFilter !== 'ALL' && q.btl !== btlFilter) return false;
      return true;
    });
  }, [questions, unitFilter, coFilter, btlFilter]);

  const handleGenerateQuestion = async () => {
    setGenError(null);
    setGenerating(true);
    try {
      const targetUnit = unitFilter === 'ALL' ? 'Unit III' : unitFilter;
      const targetCo = coFilter === 'ALL' ? 'CO3' : coFilter;
      const targetBtl = btlFilter === 'ALL' ? 'BTL4' : btlFilter;

      const resp = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit: targetUnit,
          co: targetCo,
          btl: targetBtl,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Failed to generate question from Gemini API.');
      }

      const raw = data.question;
      const newQuestion: QuizQuestion = {
        id: `ai-q-${Date.now()}`,
        source: 'AI Practice Generator',
        unit: raw.unit || targetUnit,
        co: (raw.co || targetCo) as CourseOutcomeId,
        btl: (raw.btl || targetBtl) as BloomLevel,
        marks: raw.marks || 5,
        question: raw.question,
        options: Array.isArray(raw.options) ? raw.options : undefined,
        correctOptionIndex:
          typeof raw.correctOptionIndex === 'number' ? raw.correctOptionIndex : 0,
        solutionSteps: Array.isArray(raw.solutionSteps) ? raw.solutionSteps : [],
        finalAnswer: raw.finalAnswer || '',
        isAiGenerated: true,
      };
      onAddQuestion(newQuestion);
      setExpandedSolutions((prev) => ({ ...prev, [newQuestion.id]: false }));
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'Unable to generate question.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section aria-labelledby="nba-quiz-heading" className="space-y-8">
      {/* NBA Tier-1 CO-PO-PSO Matrix */}
      <div className="space-y-4">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            DCO_CO_PO_Mapping_NBA_Tier1.docx · U24EC304
          </div>
          <h1
            id="nba-quiz-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1"
          >
            NBA Tier-1 CO-PO-PSO Matrix &amp; BTL Exam Arena
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Official Course Outcome articulation matrix (3 = High, 2 = Moderate, 1 = Low) paired with CIE/Quiz practice questions.
          </p>
        </div>

        <div className="md:hidden text-[11px] font-mono text-slate-500 dark:text-slate-400">
          Swipe table horizontally to inspect PO1–PO12 &amp; PSO1–PSO2.
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 font-mono text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-3">CO</th>
                  <th className="py-3 px-3 min-w-[180px] sm:min-w-[240px] font-sans">Course Outcome Statement</th>
                  <th className="py-3 px-2.5 text-center">BTL</th>
                  {PO_HEADERS.map((po) => (
                    <th key={po} className="py-3 px-2 text-center">
                      {po}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400">
                    PSO1
                  </th>
                  <th className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400">
                    PSO2
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {NBA_CO_PO_MATRIX.map((row) => (
                  <tr key={row.co} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {row.co}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-200 leading-snug">
                      {row.statement}
                    </td>
                    <td className="py-3 px-2.5 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {row.btl}
                    </td>
                    {row.po.map((val, idx) => (
                      <td
                        key={idx}
                        className={`py-3 px-2 text-center font-mono tabular-nums ${
                          val === 3
                            ? 'font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10'
                            : val === 2
                            ? 'font-semibold text-slate-800 dark:text-slate-200'
                            : val === 1
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      >
                        {val ?? '—'}
                      </td>
                    ))}
                    {row.pso.map((val, idx) => (
                      <td
                        key={idx}
                        className={`py-3 px-2 text-center font-mono tabular-nums ${
                          val === 3
                            ? 'font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10'
                            : 'font-semibold text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {val ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Quiz & Exam Practice Arena */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              CIE-1, CIE-2, Quiz-1 &amp; Surprise Test Practice Arena
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filter authentic assessment problems by Unit, Course Outcome, or Bloom&apos;s Taxonomy Level.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateQuestion}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors whitespace-nowrap self-start lg:self-auto"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            {generating ? 'Generating via Gemini...' : 'AI Generate New Question'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            aria-label="Filter quiz by Unit"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Units (Unit I – V)</option>
            <option value="Unit I">Unit I</option>
            <option value="Unit II">Unit II</option>
            <option value="Unit III">Unit III</option>
            <option value="Unit IV">Unit IV</option>
            <option value="Unit V">Unit V</option>
          </select>

          <select
            aria-label="Filter quiz by Course Outcome"
            value={coFilter}
            onChange={(e) => setCoFilter(e.target.value as CourseOutcomeId | 'ALL')}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Course Outcomes</option>
            <option value="CO1">CO1</option>
            <option value="CO2">CO2</option>
            <option value="CO3">CO3</option>
            <option value="CO4">CO4</option>
            <option value="CO5">CO5</option>
          </select>

          <select
            aria-label="Filter quiz by BTL"
            value={btlFilter}
            onChange={(e) => setBtlFilter(e.target.value as BloomLevel | 'ALL')}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Bloom&apos;s Levels (BTL1–BTL5)</option>
            <option value="BTL1">BTL1 — Remember</option>
            <option value="BTL2">BTL2 — Understand</option>
            <option value="BTL3">BTL3 — Apply</option>
            <option value="BTL4">BTL4 — Analyze</option>
            <option value="BTL5">BTL5 — Evaluate</option>
          </select>
        </div>

        {genError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>{genError}</div>
          </div>
        )}

        {/* Question Cards */}
        {filteredQuestions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              No assessment questions match the selected filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setUnitFilter('ALL');
                setCoFilter('ALL');
                setBtlFilter('ALL');
              }}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const chosen = selectedOptions[q.id];
              const isAnswered = chosen !== undefined;
              const isCorrect = isAnswered && chosen === q.correctOptionIndex;
              const showSol = Boolean(expandedSolutions[q.id]);

              return (
                <article
                  key={q.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        Q{idx + 1}
                      </span>
                      <span className="mx-1.5">·</span>
                      <span>{q.source}</span>
                      <span className="mx-1.5">·</span>
                      <span>{q.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {q.co}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {q.btl}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{q.marks} Marks</span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        const selected = chosen === optIdx;
                        const correct = q.correctOptionIndex === optIdx;
                        let style =
                          'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-200 hover:border-indigo-500';
                        if (isAnswered) {
                          if (correct) {
                            style =
                              'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold';
                          } else if (selected) {
                            style =
                              'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200';
                          }
                        }
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className={`flex items-start gap-2.5 rounded-lg border p-3 text-left text-xs sm:text-sm transition-colors ${style}`}
                          >
                            <span className="font-mono font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isAnswered && correct && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            {isAnswered && selected && !correct && (
                              <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="text-xs font-medium">
                      {isAnswered && (
                        <span
                          className={
                            isCorrect
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {isCorrect
                            ? 'Correct answer verified.'
                            : 'Incorrect selection — inspect worked steps.'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-expanded={showSol}
                      onClick={() =>
                        setExpandedSolutions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {showSol ? 'Hide Step-by-Step Solution' : 'View Step-by-Step Solution'}
                      {showSol ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {showSol && (
                    <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Worked Solution
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                        {q.solutionSteps.map((st, i) => (
                          <li key={i} className="leading-relaxed">
                            {st}
                          </li>
                        ))}
                      </ol>
                      <div className="pt-2 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Final Answer: {q.finalAnswer}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

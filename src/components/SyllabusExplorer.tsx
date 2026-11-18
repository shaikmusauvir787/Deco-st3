import React, { useState } from 'react';
import { ArrowRight, FolderOpen, Cpu, CheckCircle2 } from 'lucide-react';
import { SyllabusUnit, TrackType } from '../types/course';

interface SyllabusExplorerProps {
  trackBUnits: SyllabusUnit[];
  trackAUnits: SyllabusUnit[];
  onOpenLab: (tab: 'converter' | 'hamming' | 'arithmetic' | 'cache') => void;
  onOpenFolder: (folder: string) => void;
}

const CROSSWALK_ROWS = [
  {
    trackA: 'Unit I (L1–L15): Number Systems, Complements, Codes, Boolean Algebra & K-Map Intro',
    trackB: 'Unit I (Data Rep & Structure) + Unit II Part A (Boolean & K-Map Intro)',
    cos: 'CO1',
    assessment: 'CIE-1 / Assignment 1',
  },
  {
    trackA: 'Unit II (L16–L30): 4-Var K-Map, Quine-McCluskey, Adders, MUX, DEMUX, Encoders, Decoders',
    trackB: 'Unit II Part B (Combinational Logic & MSI Design)',
    cos: 'CO2',
    assessment: 'CIE-1 / QB01',
  },
  {
    trackA: 'Unit III (L31–L40): SR Latch, Flip-Flops (SR, JK, MS, D, T), Excitation & Conversions',
    trackB: 'Unit II Part C (Sequential Logic, Shift Registers, Counters)',
    cos: 'CO3',
    assessment: 'Assignment 2 / Surprise Test 2',
  },
  {
    trackA: 'Unit IV (L41–L50): Basic Computer Structure, Bus, Instruction Formats, I/O, Interrupts, DMA',
    trackB: 'Unit III (Arithmetic, RTL, Control Memory) + Unit IV Part A (I/O & DMA)',
    cos: 'CO3, CO4',
    assessment: 'Surprise Test 3 & 4',
  },
  {
    trackA: 'Unit V (L51–L60): Memory Hierarchy, RAM/ROM, Cache Mapping, Virtual & Associative Memory',
    trackB: 'Unit IV Part B (Memory & Cache) + Unit V (RISC/CISC & Pipelining)',
    cos: 'CO4, CO5',
    assessment: 'CIE-2 / SEE Final',
  },
];

export const SyllabusExplorer: React.FC<SyllabusExplorerProps> = ({
  trackBUnits,
  trackAUnits,
  onOpenLab,
  onOpenFolder,
}) => {
  const [activeTrack, setActiveTrack] = useState<TrackType>('trackB');
  const unitsToShow = activeTrack === 'trackA' ? trackAUnits : trackBUnits;

  const labLabels: Record<NonNullable<SyllabusUnit['recommendedLab']>, string> = {
    converter: 'Open Base & IEEE 754 Lab',
    hamming: 'Open Hamming (7,4) Lab',
    arithmetic: "Open Booth & Division Tracer",
    cache: 'Open Cache & EA Calculator',
  };

  return (
    <section aria-labelledby="syllabus-heading" className="space-y-6">
      {/* Header & Track Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            Dual-Track Curriculum Explorer · U24EC304
          </div>
          <h1
            id="syllabus-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 text-balance"
          >
            Digital Electronics &amp; Computer Organization
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Compare the Active Assessment Track (Syllabus_DECO.pdf &amp; DECO_U1–U5) with the LR24 60-Lecture Master Curriculum.
          </p>
        </div>

        {/* Segmented Track Switcher */}
        <div
          role="tablist"
          aria-label="Syllabus track selector"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTrack === 'trackB'}
            onClick={() => setActiveTrack('trackB')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTrack === 'trackB'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Track B: Active Exam
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTrack === 'trackA'}
            onClick={() => setActiveTrack('trackA')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTrack === 'trackA'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Track A: LR24 Master (60L)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTrack === 'unified'}
            onClick={() => setActiveTrack('unified')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTrack === 'unified'
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unified Crosswalk
          </button>
        </div>
      </div>

      {/* Unified Crosswalk View */}
      {activeTrack === 'unified' ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Master Curriculum Alignment (Track A ↔ Track B)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                How the 60-lecture LR24 sequence maps into the 5 CIE/SEE assessment units.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4">Track A (LR24 60-Lecture Plan)</th>
                  <th className="py-3 px-4">Track B (Assessment &amp; Drive Folders)</th>
                  <th className="py-3 px-4 whitespace-nowrap">COs</th>
                  <th className="py-3 px-4 whitespace-nowrap">Key Assessments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {CROSSWALK_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                      {row.trackA}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {row.trackB}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {row.cos}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                      {row.assessment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Unit Cards Grid */
        <div className="grid grid-cols-1 gap-5">
          {unitsToShow.map((unit) => (
            <article
              key={unit.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {unit.unitNumber}
                    </span>
                    {unit.lectureRange && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{unit.lectureRange}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{unit.coMapping.join(', ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {unit.btlRange}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {unit.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {unit.linkedFolder && (
                    <button
                      type="button"
                      onClick={() => onOpenFolder(unit.linkedFolder!)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-indigo-500" />
                      {unit.linkedFolder} Files
                    </button>
                  )}
                  {unit.recommendedLab && (
                    <button
                      type="button"
                      onClick={() => onOpenLab(unit.recommendedLab!)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600/20 transition-colors whitespace-nowrap"
                    >
                      <Cpu className="h-3.5 w-3.5" />
                      {labLabels[unit.recommendedLab]}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <div className="lg:col-span-2">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                    Prescribed Topics
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {unit.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-snug">
                        <span className="font-mono text-xs text-indigo-500 mt-0.5 shrink-0">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:border-l lg:border-slate-200/80 lg:dark:border-slate-800 lg:pl-6">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                    Key Learning Outcomes
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {unit.keyOutcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

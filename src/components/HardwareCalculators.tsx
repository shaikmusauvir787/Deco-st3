import React, { useMemo, useState, useEffect } from 'react';
import { Binary, ShieldCheck, Calculator, HardDrive, RotateCcw } from 'lucide-react';
import {
  AddressingModeName,
  InputBase,
  calculateCacheAndAMAT,
  calculateEffectiveAddress,
  convertNumberBaseAndIEEE754,
  encodeHamming74,
  traceBoothMultiplication,
  traceRestoringDivision,
} from '../utils/digitalLogic';

export type CalculatorTab = 'converter' | 'hamming' | 'arithmetic' | 'cache';

interface HardwareCalculatorsProps {
  initialTab?: CalculatorTab;
}

const ADDRESSING_MODES: AddressingModeName[] = [
  'Immediate',
  'Direct (Absolute)',
  'Indirect',
  'Register',
  'Register Indirect',
  'PC-Relative',
  'Indexed',
  'Base-Register',
];

export const HardwareCalculators: React.FC<HardwareCalculatorsProps> = ({
  initialTab = 'converter',
}) => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Tool 1: Base, 2's Complement & IEEE 754
  const [rawNumber, setRawNumber] = useState('13.625');
  const [inputBase, setInputBase] = useState<InputBase>(10);
  const convResult = useMemo(
    () => convertNumberBaseAndIEEE754(rawNumber, inputBase),
    [rawNumber, inputBase]
  );

  // Tool 2: Hamming (7,4)
  const [hammingInput, setHammingInput] = useState('1011');
  const [flippedBit, setFlippedBit] = useState<number | null>(5);
  const hammingResult = useMemo(
    () => encodeHamming74(hammingInput, flippedBit),
    [hammingInput, flippedBit]
  );

  // Tool 3: Booth's & Restoring Division
  const [arithMode, setArithMode] = useState<'booth' | 'division'>('booth');
  const [boothM, setBoothM] = useState(5);
  const [boothQ, setBoothQ] = useState(-3);
  const boothResult = useMemo(() => traceBoothMultiplication(boothM, boothQ), [boothM, boothQ]);

  const [divDividend, setDivDividend] = useState(11);
  const [divDivisor, setDivDivisor] = useState(3);
  const divResult = useMemo(
    () => traceRestoringDivision(divDividend, divDivisor),
    [divDividend, divDivisor]
  );

  // Tool 4: Cache & Effective Address
  const [hitRatio, setHitRatio] = useState(95);
  const [cacheNs, setCacheNs] = useState(10);
  const [memNs, setMemNs] = useState(100);
  const [simultaneous, setSimultaneous] = useState(false);
  const [addressBits, setAddressBits] = useState(32);
  const [cacheSizeKB, setCacheSizeKB] = useState(64);
  const [blockSizeB, setBlockSizeB] = useState(64);
  const [associativity, setAssociativity] = useState(4);
  const [sampleHex, setSampleHex] = useState('0x12345678');

  const cacheResult = useMemo(
    () =>
      calculateCacheAndAMAT({
        hitRatioPercent: hitRatio,
        cacheAccessNs: cacheNs,
        mainMemoryAccessNs: memNs,
        simultaneousAccess: simultaneous,
        addressBits,
        cacheSizeKB,
        blockSizeBytes: blockSizeB,
        associativity,
        sampleHexAddress: sampleHex,
      }),
    [
      hitRatio,
      cacheNs,
      memNs,
      simultaneous,
      addressBits,
      cacheSizeKB,
      blockSizeB,
      associativity,
      sampleHex,
    ]
  );

  const [eaMode, setEaMode] = useState<AddressingModeName>('Indexed');
  const [eaAddrField, setEaAddrField] = useState(500);
  const [eaPc, setEaPc] = useState(202);
  const [eaReg, setEaReg] = useState(300);
  const [eaIx, setEaIx] = useState(25);
  const [eaBr, setEaBr] = useState(1000);
  const [eaMemAtAddr, setEaMemAtAddr] = useState(750);
  const [eaMemAtReg, setEaMemAtReg] = useState(900);

  const eaResult = useMemo(
    () =>
      calculateEffectiveAddress({
        mode: eaMode,
        addressField: eaAddrField,
        pcValue: eaPc,
        registerValue: eaReg,
        indexRegValue: eaIx,
        baseRegValue: eaBr,
        memoryAtAddressField: eaMemAtAddr,
        memoryAtRegister: eaMemAtReg,
      }),
    [eaMode, eaAddrField, eaPc, eaReg, eaIx, eaBr, eaMemAtAddr, eaMemAtReg]
  );

  const tabs: Array<{
    id: CalculatorTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'converter', label: 'Base & IEEE 754', icon: Binary },
    { id: 'hamming', label: 'Hamming (7,4)', icon: ShieldCheck },
    { id: 'arithmetic', label: "Booth & Division", icon: Calculator },
    { id: 'cache', label: 'Cache & EA Lab', icon: HardDrive },
  ];

  const bitLabels = ['P1', 'P2', 'D3', 'P4', 'D5', 'D6', 'D7'];

  return (
    <section aria-labelledby="calculators-heading" className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="min-w-0">
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            Interactive Hardware Logic Lab · Assignment Verification Suite
          </div>
          <h1
            id="calculators-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1"
          >
            Digital Logic &amp; CO Hardware Calculators
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Verify worked problems from DECO Assignment 1, Surprise Tests 3 &amp; 4, and CIE question banks step by step.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Hardware calculator tools"
          className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 shrink-0 self-start xl:self-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOOL 1: BASE, 2's COMPLEMENT & IEEE 754 */}
      {activeTab === 'converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Input Number &amp; Radix
            </h2>

            <div>
              <label
                htmlFor="base-number-input"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
              >
                Number (supports negatives &amp; fractions like 72.01 or 13.625)
              </label>
              <input
                id="base-number-input"
                type="text"
                value={rawNumber}
                onChange={(e) => setRawNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3.5 py-2.5 font-mono text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Input Base
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    [10, 'Dec (10)'],
                    [2, 'Bin (2)'],
                    [8, 'Oct (8)'],
                    [16, 'Hex (16)'],
                  ] as Array<[InputBase, string]>
                ).map(([b, label]) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setInputBase(b)}
                    className={`rounded-lg py-2 text-xs font-mono font-semibold border transition-colors ${
                      inputBase === b
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Assignment 1 Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { val: '13.625', base: 10 as InputBase },
                  { val: '72.01', base: 10 as InputBase },
                  { val: '-15', base: 10 as InputBase },
                  { val: '1A.8', base: 16 as InputBase },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      setRawNumber(preset.val);
                      setInputBase(preset.base);
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-mono text-slate-700 dark:text-slate-300 hover:border-indigo-500"
                  >
                    {preset.val} (base {preset.base})
                  </button>
                ))}
              </div>
            </div>

            {!convResult.valid && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                {convResult.error}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Converted Representations &amp; IEEE 754 Breakdown
            </h2>

            {convResult.valid ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Decimal (Base 10)', value: String(convResult.decimalValue) },
                    { label: 'Binary (Base 2)', value: convResult.binary },
                    { label: 'Octal (Base 8)', value: convResult.octal },
                    { label: 'Hexadecimal (Base 16)', value: convResult.hex },
                    {
                      label: "8-Bit 2's Complement",
                      value: convResult.twosComplement8Bit,
                      note: convResult.twosComplementNote,
                    },
                    { label: 'Gray Code (Integer Mag)', value: convResult.grayCode },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3"
                    >
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {item.label}
                      </div>
                      <div className="font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white mt-0.5 break-all">
                        {item.value}
                      </div>
                      {item.note && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* IEEE 754 Single Precision */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      32-Bit IEEE 754 Single-Precision Format
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Hex: {convResult.ieee754.hex}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 font-mono text-xs">
                    <div className="sm:col-span-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-center">
                      <div className="text-[10px] text-rose-600 dark:text-rose-300">Sign (1b)</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {convResult.ieee754.signBit}
                      </div>
                    </div>
                    <div className="sm:col-span-4 rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-2.5 text-center">
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-300">
                        Exponent (8b · E={convResult.ieee754.biasedExponent})
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5 tracking-wider">
                        {convResult.ieee754.exponentBits}
                      </div>
                    </div>
                    <div className="sm:col-span-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-center">
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-300">
                        Mantissa / Fraction (23b)
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white mt-1 break-all">
                        {convResult.ieee754.mantissaBits}
                      </div>
                    </div>
                  </div>

                  <ol className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono pt-1">
                    {convResult.ieee754.steps.map((st, idx) => (
                      <li key={idx}>{st}</li>
                    ))}
                  </ol>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter a valid value on the left to inspect base conversions and IEEE 754 encoding.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: HAMMING (7,4) SIMULATOR */}
      {activeTab === 'hamming' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4-Bit Data Input &amp; Error Injection
            </h2>

            <div>
              <label
                htmlFor="hamming-data-input"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
              >
                4-Bit Data Word (D3 D5 D6 D7)
              </label>
              <input
                id="hamming-data-input"
                type="text"
                maxLength={4}
                value={hammingInput}
                onChange={(e) => setHammingInput(e.target.value.replace(/[^01]/g, '').slice(0, 4))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-3.5 py-2.5 font-mono text-lg tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['1011', '1101', '0110', '1001'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHammingInput(preset)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-mono text-slate-700 dark:text-slate-300 hover:border-indigo-500"
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFlippedBit(null)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500"
              >
                <RotateCcw className="h-3 w-3" />
                Clear Bit Flip
              </button>
            </div>

            {hammingResult.valid ? (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                <div>
                  P1 (bits 1,3,5,7) = <strong className="text-indigo-500">{hammingResult.parityDetails.p1Val}</strong>
                </div>
                <div>
                  P2 (bits 2,3,6,7) = <strong className="text-indigo-500">{hammingResult.parityDetails.p2Val}</strong>
                </div>
                <div>
                  P4 (bits 4,5,6,7) = <strong className="text-indigo-500">{hammingResult.parityDetails.p4Val}</strong>
                </div>
                <div className="pt-1 text-slate-500 dark:text-slate-400">
                  Transmitted Codeword: <span className="font-bold text-slate-900 dark:text-white">{hammingResult.encoded7Bits}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                {hammingResult.error}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Click Any Bit to Simulate Channel Noise
              </h2>
              {hammingResult.valid && (
                <span
                  className={`font-mono text-xs font-bold ${
                    hammingResult.errorPosition === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  Syndrome C4C2C1 = {hammingResult.syndromeBits} (
                  {hammingResult.errorPosition === 0
                    ? 'No Error'
                    : `Error Detected at Bit ${hammingResult.errorPosition}`}
                  )
                </span>
              )}
            </div>

            {hammingResult.valid && (
              <>
                <div className="grid grid-cols-7 gap-2">
                  {bitLabels.map((lbl, idx) => {
                    const pos = idx + 1;
                    const bitVal = hammingResult.received7Bits[idx];
                    const isFlipped = flippedBit === pos;
                    const isParity = pos === 1 || pos === 2 || pos === 4;
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setFlippedBit(isFlipped ? null : pos)}
                        aria-label={`Flip bit position ${pos} (${lbl})`}
                        className={`flex flex-col items-center rounded-xl border py-3 px-1 transition-all ${
                          isFlipped
                            ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/30'
                            : isParity
                            ? 'border-indigo-500/40 bg-indigo-500/10 hover:border-indigo-500'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:border-indigo-500'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {lbl} ({pos})
                        </span>
                        <span className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1">
                          {bitVal}
                        </span>
                        <span className="text-[10px] mt-1 font-semibold text-slate-500 dark:text-slate-400">
                          {isFlipped ? 'Flipped' : isParity ? 'Parity' : 'Data'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Received Word
                    </div>
                    <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-0.5 tracking-wider">
                      {hammingResult.received7Bits}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Corrected 7-Bit Code
                    </div>
                    <div className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-wider">
                      {hammingResult.corrected7Bits}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Recovered 4-Bit Data
                    </div>
                    <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-wider">
                      {hammingResult.recoveredDataBits}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: BOOTH'S MULTIPLICATION & RESTORING DIVISION */}
      {activeTab === 'arithmetic' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1">
              <button
                type="button"
                onClick={() => setArithMode('booth')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  arithMode === 'booth'
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Booth&apos;s Signed Multiplication
              </button>
              <button
                type="button"
                onClick={() => setArithMode('division')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  arithMode === 'division'
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Restoring Unsigned Division
              </button>
            </div>

            {arithMode === 'booth' ? (
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>M (Multiplicand):</span>
                  <input
                    type="number"
                    aria-label="Multiplicand M"
                    value={boothM}
                    onChange={(e) => setBoothM(Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Q (Multiplier):</span>
                  <input
                    type="number"
                    aria-label="Multiplier Q"
                    value={boothQ}
                    onChange={(e) => setBoothQ(Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <div className="flex gap-1.5">
                  {[
                    [5, -3],
                    [-7, 6],
                    [11, -5],
                  ].map(([m, q]) => (
                    <button
                      key={`${m}x${q}`}
                      type="button"
                      onClick={() => {
                        setBoothM(m);
                        setBoothQ(q);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:border-indigo-500"
                    >
                      {m} × {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Q (Dividend):</span>
                  <input
                    type="number"
                    min={0}
                    aria-label="Dividend Q"
                    value={divDividend}
                    onChange={(e) => setDivDividend(Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>M (Divisor):</span>
                  <input
                    type="number"
                    min={1}
                    aria-label="Divisor M"
                    value={divDivisor}
                    onChange={(e) => setDivDivisor(Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <div className="flex gap-1.5">
                  {[
                    [11, 3],
                    [14, 5],
                    [29, 6],
                  ].map(([dd, ds]) => (
                    <button
                      key={`${dd}/${ds}`}
                      type="button"
                      onClick={() => {
                        setDivDividend(dd);
                        setDivDivisor(ds);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:border-indigo-500"
                    >
                      {dd} ÷ {ds}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Register Trace Table */}
          {arithMode === 'booth' ? (
            boothResult.valid ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="text-slate-600 dark:text-slate-300">
                    {boothResult.bitWidth}-Bit Registers · M = {boothResult.multiplicandBin} · -M ={' '}
                    {boothResult.negMultiplicandBin} · Q = {boothResult.multiplierBin}
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    Product AQ = {boothResult.productBinary}₂ ({boothResult.productDecimal}₁₀)
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400">
                        <th className="py-2.5 px-4">Cycle</th>
                        <th className="py-2.5 px-3">SC</th>
                        <th className="py-2.5 px-3">A</th>
                        <th className="py-2.5 px-3">Q</th>
                        <th className="py-2.5 px-3">Q₋₁</th>
                        <th className="py-2.5 px-3">Q₀Q₋₁</th>
                        <th className="py-2.5 px-4 font-sans">Micro-Operation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {boothResult.steps.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                            {st.cycle}
                          </td>
                          <td className="py-2 px-3">{st.sc}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {st.a}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {st.q}
                          </td>
                          <td className="py-2 px-3">{st.qMinus1}</td>
                          <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">
                            {st.pair}
                          </td>
                          <td className="py-2 px-4 font-sans text-slate-700 dark:text-slate-300">
                            {st.operation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
                {boothResult.error}
              </div>
            )
          ) : divResult.valid ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="text-slate-600 dark:text-slate-300">
                  {divResult.bitWidth}-Bit Dividend = {divResult.dividendBin} · Divisor M ={' '}
                  {divResult.divisorBin}
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  Quotient Q = {divResult.quotient} ({divResult.quotientBin}₂) · Remainder A ={' '}
                  {divResult.remainder} ({divResult.remainderBin}₂)
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 px-4">Cycle</th>
                      <th className="py-2.5 px-3">SC</th>
                      <th className="py-2.5 px-3">A (Partial Remainder)</th>
                      <th className="py-2.5 px-3">Q (Quotient)</th>
                      <th className="py-2.5 px-4 font-sans">Micro-Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                    {divResult.steps.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                          {st.cycle}
                        </td>
                        <td className="py-2 px-3">{st.sc}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          {st.a}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                          {st.q}
                        </td>
                        <td className="py-2 px-4 font-sans text-slate-700 dark:text-slate-300">
                          {st.operation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
              {divResult.error}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: CACHE MEMORY & EFFECTIVE ADDRESS (EA) CALCULATOR */}
      {activeTab === 'cache' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Cache AMAT & Bit-Field Analyzer */}
          <div className="xl:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Cache AMAT &amp; Set-Associative Address Splitter
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Computes Average Memory Access Time and decomposes physical address into Tag, Set, and Word Offset bits.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Hit Ratio (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hitRatio}
                  onChange={(e) => setHitRatio(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Cache Time (ns)</span>
                <input
                  type="number"
                  min={1}
                  value={cacheNs}
                  onChange={(e) => setCacheNs(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Main Mem (ns)</span>
                <input
                  type="number"
                  min={1}
                  value={memNs}
                  onChange={(e) => setMemNs(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Addr Width (bits)</span>
                <select
                  value={addressBits}
                  onChange={(e) => setAddressBits(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                >
                  <option value={16}>16-bit</option>
                  <option value={24}>24-bit</option>
                  <option value={32}>32-bit</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Cache Size (KB)</span>
                <select
                  value={cacheSizeKB}
                  onChange={(e) => setCacheSizeKB(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                >
                  <option value={4}>4 KB</option>
                  <option value={16}>16 KB</option>
                  <option value={32}>32 KB</option>
                  <option value={64}>64 KB</option>
                  <option value={128}>128 KB</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Block Size (B)</span>
                <select
                  value={blockSizeB}
                  onChange={(e) => setBlockSizeB(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                >
                  <option value={16}>16 B</option>
                  <option value={32}>32 B</option>
                  <option value={64}>64 B</option>
                  <option value={128}>128 B</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Mapping</span>
                <select
                  value={associativity}
                  onChange={(e) => setAssociativity(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                >
                  <option value={1}>Direct (1-way)</option>
                  <option value={2}>2-Way Set Assoc</option>
                  <option value={4}>4-Way Set Assoc</option>
                  <option value={8}>8-Way Set Assoc</option>
                  <option value={0}>Fully Associative</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Sample Address</span>
                <input
                  type="text"
                  value={sampleHex}
                  onChange={(e) => setSampleHex(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm"
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={simultaneous}
                onChange={(e) => setSimultaneous(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              Simultaneous lookup formula: AMAT = h·t_c + (1-h)·t_m (unchecked = Hierarchical: t_c + (1-h)·t_m)
            </label>

            {cacheResult.valid ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                    <div className="text-[11px] font-sans text-slate-500">AMAT</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {cacheResult.amatNs.toFixed(2)} ns
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                    <div className="text-[11px] font-sans text-slate-500">Speedup</div>
                    <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                      {cacheResult.speedup.toFixed(2)}×
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                    <div className="text-[11px] font-sans text-slate-500">Cache Blocks</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {cacheResult.totalBlocks}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3">
                    <div className="text-[11px] font-sans text-slate-500">Total Sets</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {cacheResult.totalSets}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                  <div className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-3">
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-300">
                      Tag ({cacheResult.tagBits} bits)
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white mt-1 break-all">
                      {cacheResult.sampleBreakdown?.tagBitsStr ?? '—'}
                    </div>
                    {cacheResult.sampleBreakdown && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {cacheResult.sampleBreakdown.tagHex}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-300">
                      Set / Line ({cacheResult.setIndexBits} bits)
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white mt-1 break-all">
                      {cacheResult.sampleBreakdown?.setBitsStr ?? '—'}
                    </div>
                    {cacheResult.sampleBreakdown && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Set #{cacheResult.sampleBreakdown.setIndexDec}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                    <div className="text-[11px] text-amber-600 dark:text-amber-300">
                      Word Offset ({cacheResult.wordOffsetBits} bits)
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white mt-1 break-all">
                      {cacheResult.sampleBreakdown?.wordBitsStr ?? '—'}
                    </div>
                    {cacheResult.sampleBreakdown && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Byte +{cacheResult.sampleBreakdown.wordOffsetDec}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                {cacheResult.error}
              </div>
            )}
          </div>

          {/* Effective Address (8 Addressing Modes) */}
          <div className="xl:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                8 Addressing Modes &amp; EA Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Unit III Surprise Test interactive Effective Address verifier.
              </p>
            </div>

            <label className="block space-y-1 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Addressing Mode
              </span>
              <select
                value={eaMode}
                onChange={(e) => setEaMode(e.target.value as AddressingModeName)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white"
              >
                {ADDRESSING_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Addr Field (A)</span>
                <input
                  type="number"
                  value={eaAddrField}
                  onChange={(e) => setEaAddrField(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">PC</span>
                <input
                  type="number"
                  value={eaPc}
                  onChange={(e) => setEaPc(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Register (R)</span>
                <input
                  type="number"
                  value={eaReg}
                  onChange={(e) => setEaReg(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Index (IX)</span>
                <input
                  type="number"
                  value={eaIx}
                  onChange={(e) => setEaIx(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Base (BR)</span>
                <input
                  type="number"
                  value={eaBr}
                  onChange={(e) => setEaBr(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">M[A] / M[R]</span>
                <div className="flex gap-1">
                  <input
                    type="number"
                    aria-label="Memory at Address Field"
                    value={eaMemAtAddr}
                    onChange={(e) => setEaMemAtAddr(Number(e.target.value))}
                    className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-1.5 py-1.5 font-mono"
                  />
                  <input
                    type="number"
                    aria-label="Memory at Register"
                    value={eaMemAtReg}
                    onChange={(e) => setEaMemAtReg(Number(e.target.value))}
                    className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-1.5 py-1.5 font-mono"
                  />
                </div>
              </label>
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                  {eaResult.mode}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  Data Mem Reads: {eaResult.memoryReferencesForOperand}
                </span>
              </div>
              <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                {eaResult.formula}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {eaResult.operandFetchNote}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

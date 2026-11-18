export type InputBase = 2 | 8 | 10 | 16;

export interface BaseConversionResult {
  valid: boolean;
  error?: string;
  decimalValue: number;
  isNegative: boolean;
  binary: string;
  octal: string;
  hex: string;
  twosComplement8Bit: string;
  twosComplementNote: string;
  grayCode: string;
  ieee754: {
    signBit: string;
    exponentBits: string;
    mantissaBits: string;
    full32Bits: string;
    hex: string;
    biasedExponent: number;
    unbiasedExponent: number;
    steps: string[];
  };
}

export interface Hamming74Result {
  valid: boolean;
  error?: string;
  dataBits: string; // 4 bits: D3 D5 D6 D7
  encoded7Bits: string; // P1 P2 D3 P4 D5 D6 D7
  received7Bits: string;
  flippedPosition: number | null; // 1-7 or null
  syndromeBits: string; // C4 C2 C1
  errorPosition: number; // 0 = no error, 1..7 = bit position
  corrected7Bits: string;
  recoveredDataBits: string;
  parityDetails: {
    p1Indices: number[];
    p2Indices: number[];
    p4Indices: number[];
    p1Val: number;
    p2Val: number;
    p4Val: number;
    c1: number;
    c2: number;
    c4: number;
  };
}

export interface BoothStep {
  cycle: number;
  sc: number;
  a: string;
  q: string;
  qMinus1: string;
  pair: string;
  operation: string;
}

export interface BoothResult {
  valid: boolean;
  error?: string;
  bitWidth: number;
  multiplicand: number;
  multiplier: number;
  multiplicandBin: string;
  negMultiplicandBin: string;
  multiplierBin: string;
  steps: BoothStep[];
  productBinary: string;
  productDecimal: number;
  expectedDecimal: number;
}

export interface RestoringDivStep {
  cycle: number;
  sc: number;
  a: string;
  q: string;
  operation: string;
}

export interface RestoringDivResult {
  valid: boolean;
  error?: string;
  bitWidth: number;
  dividend: number;
  divisor: number;
  dividendBin: string;
  divisorBin: string;
  steps: RestoringDivStep[];
  quotient: number;
  remainder: number;
  quotientBin: string;
  remainderBin: string;
}

export interface CacheCalcInput {
  hitRatioPercent: number; // 0..100
  cacheAccessNs: number;
  mainMemoryAccessNs: number;
  simultaneousAccess: boolean; // true: AMAT = h*tc + (1-h)*tm; false (hierarchical): tc + (1-h)*tm
  addressBits: number;
  cacheSizeKB: number;
  blockSizeBytes: number;
  associativity: number; // 1 = direct, N = N-way, 0 = fully associative
  sampleHexAddress?: string;
}

export interface CacheCalcResult {
  valid: boolean;
  error?: string;
  hitRatio: number;
  missRate: number;
  amatNs: number;
  speedup: number;
  totalBlocks: number;
  totalSets: number;
  wordOffsetBits: number;
  setIndexBits: number;
  tagBits: number;
  sampleBreakdown?: {
    binaryAddress: string;
    tagBitsStr: string;
    setBitsStr: string;
    wordBitsStr: string;
    tagHex: string;
    setIndexDec: number;
    wordOffsetDec: number;
  };
}

export type AddressingModeName =
  | 'Immediate'
  | 'Direct (Absolute)'
  | 'Indirect'
  | 'Register'
  | 'Register Indirect'
  | 'PC-Relative'
  | 'Indexed'
  | 'Base-Register';

export interface EffectiveAddressInput {
  mode: AddressingModeName;
  addressField: number;
  pcValue: number;
  registerValue: number;
  indexRegValue: number;
  baseRegValue: number;
  memoryAtAddressField: number;
  memoryAtRegister: number;
}

export interface EffectiveAddressResult {
  mode: AddressingModeName;
  effectiveAddressLabel: string;
  effectiveAddressValue: number | null;
  formula: string;
  operandFetchNote: string;
  memoryReferencesForOperand: number;
}

function toSignedBits(val: number, width: number): string {
  const mask = (1 << width) - 1;
  return ((val & mask) >>> 0).toString(2).padStart(width, '0');
}

function fromSignedBits(bits: string): number {
  const width = bits.length;
  const unsigned = parseInt(bits, 2);
  const signBit = 1 << (width - 1);
  return (unsigned & signBit) !== 0 ? unsigned - (1 << width) : unsigned;
}

function parseFractionalBase(raw: string, base: InputBase): { valid: boolean; value: number; error?: string } {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, value: 0, error: 'Enter a number to convert.' };
  }

  const isNeg = trimmed.startsWith('-');
  const unsignedStr = isNeg || trimmed.startsWith('+') ? trimmed.slice(1) : trimmed;
  if (!unsignedStr) {
    return { valid: false, value: 0, error: 'Invalid numeric input.' };
  }

  const parts = unsignedStr.split('.');
  if (parts.length > 2) {
    return { valid: false, value: 0, error: 'Only one radix point (.) is allowed.' };
  }

  const validDigits: Record<InputBase, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9A-F]+$/,
  };

  const intPartStr = parts[0] || '0';
  const fracPartStr = parts[1] || '';

  if (parts[0] !== '' && !validDigits[base].test(intPartStr)) {
    return { valid: false, value: 0, error: `Invalid base-${base} digit in integer part.` };
  }
  if (fracPartStr !== '' && !validDigits[base].test(fracPartStr)) {
    return { valid: false, value: 0, error: `Invalid base-${base} digit in fractional part.` };
  }
  if (parts[0] === '' && fracPartStr === '') {
    return { valid: false, value: 0, error: 'Enter at least one digit.' };
  }

  const intVal = intPartStr === '' ? 0 : parseInt(intPartStr, base);
  let fracVal = 0;
  for (let i = 0; i < fracPartStr.length; i++) {
    const digit = parseInt(fracPartStr[i], base);
    fracVal += digit / Math.pow(base, i + 1);
  }

  const total = (isNeg ? -1 : 1) * (intVal + fracVal);
  if (!Number.isFinite(total)) {
    return { valid: false, value: 0, error: 'Number exceeds finite range.' };
  }
  return { valid: true, value: total };
}

function formatFractionInBase(absVal: number, base: InputBase, precision = 12): string {
  const intPart = Math.floor(absVal);
  let fracPart = absVal - intPart;
  const intStr = intPart.toString(base).toUpperCase();

  if (fracPart < 1e-12) {
    return intStr;
  }

  let fracStr = '';
  let count = 0;
  while (fracPart > 1e-12 && count < precision) {
    fracPart *= base;
    const digit = Math.floor(fracPart + 1e-12);
    fracStr += digit.toString(base).toUpperCase();
    fracPart -= digit;
    if (fracPart < 0) fracPart = 0;
    count++;
  }

  // Trim trailing zeros
  fracStr = fracStr.replace(/0+$/, '');
  return fracStr.length > 0 ? `${intStr}.${fracStr}` : intStr;
}

export function convertNumberBaseAndIEEE754(raw: string, base: InputBase): BaseConversionResult {
  const parsed = parseFractionalBase(raw, base);
  if (!parsed.valid) {
    return {
      valid: false,
      error: parsed.error,
      decimalValue: 0,
      isNegative: false,
      binary: '',
      octal: '',
      hex: '',
      twosComplement8Bit: '',
      twosComplementNote: '',
      grayCode: '',
      ieee754: {
        signBit: '0',
        exponentBits: '00000000',
        mantissaBits: '0'.repeat(23),
        full32Bits: '0'.repeat(32),
        hex: '0x00000000',
        biasedExponent: 0,
        unbiasedExponent: 0,
        steps: [],
      },
    };
  }

  const val = parsed.value;
  const isNegative = val < 0 || Object.is(val, -0);
  const absVal = Math.abs(val);
  const signPrefix = isNegative && absVal > 0 ? '-' : '';

  const binaryMag = formatFractionInBase(absVal, 2, 16);
  const octalMag = formatFractionInBase(absVal, 8, 8);
  const hexMag = formatFractionInBase(absVal, 16, 8);

  // 8-bit 2's complement for integers in [-128, 127]
  const intRounded = Math.trunc(val);
  const isPureInt = Math.abs(val - intRounded) < 1e-9;
  let twosComplement8Bit = 'N/A';
  let twosComplementNote = 'Applies to integers in [-128, +127].';
  if (isPureInt && intRounded >= -128 && intRounded <= 127) {
    twosComplement8Bit = toSignedBits(intRounded, 8);
    twosComplementNote =
      intRounded < 0
        ? `Invert |${intRounded}| = ${toSignedBits(Math.abs(intRounded), 8)} -> +1 -> ${twosComplement8Bit}`
        : `Positive 8-bit signed representation (${twosComplement8Bit})`;
  } else if (!isPureInt) {
    twosComplementNote = `Fractional input (${val}); integer part ${intRounded} -> ${
      intRounded >= -128 && intRounded <= 127 ? toSignedBits(intRounded, 8) : 'out of 8-bit range'
    }`;
  } else {
    twosComplementNote = `Integer ${intRounded} exceeds 8-bit signed range [-128, 127].`;
  }

  // Gray code of integer magnitude
  const intMag = Math.floor(absVal);
  const grayInt = intMag ^ (intMag >> 1);
  const binWidth = Math.max(4, intMag.toString(2).length);
  const grayCode = grayInt.toString(2).padStart(binWidth, '0');

  // IEEE 754 Single Precision using DataView for exact IEEE rounding
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, val, false);
  const uint32 = view.getUint32(0, false);
  const full32Bits = uint32.toString(2).padStart(32, '0');
  const signBit = full32Bits.slice(0, 1);
  const exponentBits = full32Bits.slice(1, 9);
  const mantissaBits = full32Bits.slice(9);
  const biasedExponent = parseInt(exponentBits, 2);
  const unbiasedExponent = biasedExponent === 0 ? -126 : biasedExponent - 127;
  const ieeeHex = '0x' + uint32.toString(16).toUpperCase().padStart(8, '0');

  const steps: string[] = [];
  if (absVal === 0) {
    steps.push('Value is 0 -> Sign = 0, Biased Exponent = 00000000, Mantissa = all zeros.');
  } else {
    const firstOneIdx = binaryMag.replace('.', '').indexOf('1');
    const dotIdx = binaryMag.indexOf('.');
    const intLen = dotIdx === -1 ? binaryMag.length : dotIdx;
    const rawShift =
      firstOneIdx < intLen ? intLen - 1 - firstOneIdx : -(firstOneIdx - intLen + 1);
    steps.push(`1. Sign bit S = ${signBit} (${isNegative ? 'Negative' : 'Non-negative'}).`);
    steps.push(`2. Binary magnitude ≈ ${binaryMag}₂.`);
    steps.push(
      `3. Normalize: 1.${mantissaBits.slice(0, 10)}... × 2^(${unbiasedExponent}) (shift ≈ ${rawShift}).`
    );
    steps.push(
      `4. Biased Exponent E = ${unbiasedExponent} + 127 = ${biasedExponent} = ${exponentBits}₂.`
    );
    steps.push(`5. 23-bit Fraction (Mantissa M) = ${mantissaBits}.`);
  }

  return {
    valid: true,
    decimalValue: val,
    isNegative,
    binary: `${signPrefix}${binaryMag}`,
    octal: `${signPrefix}${octalMag}`,
    hex: `${signPrefix}${hexMag}`,
    twosComplement8Bit,
    twosComplementNote,
    grayCode,
    ieee754: {
      signBit,
      exponentBits,
      mantissaBits,
      full32Bits,
      hex: ieeeHex,
      biasedExponent,
      unbiasedExponent,
      steps,
    },
  };
}

export function encodeHamming74(
  dataBitsRaw: string,
  flipPosition: number | null = null
): Hamming74Result {
  const cleaned = dataBitsRaw.trim();
  if (!/^[01]{4}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Enter exactly 4 binary bits (e.g. 1011).',
      dataBits: cleaned,
      encoded7Bits: '',
      received7Bits: '',
      flippedPosition: flipPosition,
      syndromeBits: '000',
      errorPosition: 0,
      corrected7Bits: '',
      recoveredDataBits: '',
      parityDetails: {
        p1Indices: [1, 3, 5, 7],
        p2Indices: [2, 3, 6, 7],
        p4Indices: [4, 5, 6, 7],
        p1Val: 0,
        p2Val: 0,
        p4Val: 0,
        c1: 0,
        c2: 0,
        c4: 0,
      },
    };
  }

  // Positions 1..7: P1(1), P2(2), D3(3), P4(4), D5(5), D6(6), D7(7)
  const d3 = Number(cleaned[0]);
  const d5 = Number(cleaned[1]);
  const d6 = Number(cleaned[2]);
  const d7 = Number(cleaned[3]);

  // Even parity
  const p1 = d3 ^ d5 ^ d7;
  const p2 = d3 ^ d6 ^ d7;
  const p4 = d5 ^ d6 ^ d7;

  const bits = [0, p1, p2, d3, p4, d5, d6, d7]; // 1-indexed
  const encoded7Bits = bits.slice(1).join('');

  const rx = [...bits];
  const validFlip =
    flipPosition !== null && flipPosition >= 1 && flipPosition <= 7 ? flipPosition : null;
  if (validFlip !== null) {
    rx[validFlip] = rx[validFlip] ^ 1;
  }
  const received7Bits = rx.slice(1).join('');

  // Syndrome calculation C4 C2 C1
  const c1 = rx[1] ^ rx[3] ^ rx[5] ^ rx[7];
  const c2 = rx[2] ^ rx[3] ^ rx[6] ^ rx[7];
  const c4 = rx[4] ^ rx[5] ^ rx[6] ^ rx[7];
  const syndromeBits = `${c4}${c2}${c1}`;
  const errorPosition = c4 * 4 + c2 * 2 + c1;

  const corrected = [...rx];
  if (errorPosition >= 1 && errorPosition <= 7) {
    corrected[errorPosition] = corrected[errorPosition] ^ 1;
  }
  const corrected7Bits = corrected.slice(1).join('');
  const recoveredDataBits = `${corrected[3]}${corrected[5]}${corrected[6]}${corrected[7]}`;

  return {
    valid: true,
    dataBits: cleaned,
    encoded7Bits,
    received7Bits,
    flippedPosition: validFlip,
    syndromeBits,
    errorPosition,
    corrected7Bits,
    recoveredDataBits,
    parityDetails: {
      p1Indices: [1, 3, 5, 7],
      p2Indices: [2, 3, 6, 7],
      p4Indices: [4, 5, 6, 7],
      p1Val: p1,
      p2Val: p2,
      p4Val: p4,
      c1,
      c2,
      c4,
    },
  };
}

export function traceBoothMultiplication(
  multiplicand: number,
  multiplier: number,
  requestedBits?: number
): BoothResult {
  if (!Number.isInteger(multiplicand) || !Number.isInteger(multiplier)) {
    return {
      valid: false,
      error: 'Multiplicand and multiplier must be integers.',
      bitWidth: 4,
      multiplicand,
      multiplier,
      multiplicandBin: '',
      negMultiplicandBin: '',
      multiplierBin: '',
      steps: [],
      productBinary: '',
      productDecimal: 0,
      expectedDecimal: 0,
    };
  }

  const maxAbs = Math.max(Math.abs(multiplicand), Math.abs(multiplier));
  let width = requestedBits ?? 4;
  if (!requestedBits) {
    if (multiplicand < -8 || multiplicand > 7 || multiplier < -8 || multiplier > 7) {
      width = maxAbs <= 15 && multiplicand >= -16 && multiplier >= -16 ? 5 : 8;
    }
  }

  const minSigned = -(1 << (width - 1));
  const maxSigned = (1 << (width - 1)) - 1;
  if (
    multiplicand < minSigned ||
    multiplicand > maxSigned ||
    multiplier < minSigned ||
    multiplier > maxSigned
  ) {
    return {
      valid: false,
      error: `Inputs must fit in ${width}-bit signed range [${minSigned}, ${maxSigned}].`,
      bitWidth: width,
      multiplicand,
      multiplier,
      multiplicandBin: '',
      negMultiplicandBin: '',
      multiplierBin: '',
      steps: [],
      productBinary: '',
      productDecimal: 0,
      expectedDecimal: multiplicand * multiplier,
    };
  }

  // Note: for -2^(n-1), -M overflows n-bit signed, so bump width by 1 if needed
  if (multiplicand === minSigned && !requestedBits) {
    width += 1;
  }

  const mBin = toSignedBits(multiplicand, width);
  const negMBin = toSignedBits(-multiplicand, width);
  let a = 0;
  let qBits = toSignedBits(multiplier, width);
  let qMinus1 = '0';

  const steps: BoothStep[] = [
    {
      cycle: 0,
      sc: width,
      a: toSignedBits(a, width),
      q: qBits,
      qMinus1,
      pair: `${qBits[width - 1]}${qMinus1}`,
      operation: 'Initialize (A = 0, Q = Multiplier, Q₋₁ = 0)',
    },
  ];

  for (let cycle = 1; cycle <= width; cycle++) {
    const q0 = qBits[width - 1];
    const pair = `${q0}${qMinus1}`;
    let opDesc = '';

    if (pair === '10') {
      a = a - multiplicand;
      opDesc = 'A ← A - M';
      steps.push({
        cycle,
        sc: width - cycle + 1,
        a: toSignedBits(a, width),
        q: qBits,
        qMinus1,
        pair,
        operation: opDesc,
      });
    } else if (pair === '01') {
      a = a + multiplicand;
      opDesc = 'A ← A + M';
      steps.push({
        cycle,
        sc: width - cycle + 1,
        a: toSignedBits(a, width),
        q: qBits,
        qMinus1,
        pair,
        operation: opDesc,
      });
    } else {
      opDesc = 'No Add/Sub (00 or 11)';
    }

    // Arithmetic Right Shift (A, Q, Q-1)
    const aBits = toSignedBits(a, width);
    const msbA = aBits[0];
    const lsbA = aBits[width - 1];
    const nextQMinus1 = qBits[width - 1];
    const nextQBits = lsbA + qBits.slice(0, width - 1);
    const nextABits = msbA + aBits.slice(0, width - 1);

    a = fromSignedBits(nextABits);
    qBits = nextQBits;
    qMinus1 = nextQMinus1;

    steps.push({
      cycle,
      sc: width - cycle,
      a: nextABits,
      q: qBits,
      qMinus1,
      pair: pair === '00' || pair === '11' ? `${pair} -> ASR` : 'ASR',
      operation:
        pair === '00' || pair === '11'
          ? 'No Add/Sub; Arithmetic Shift Right (A, Q, Q₋₁)'
          : 'Arithmetic Shift Right (A, Q, Q₋₁)',
    });
  }

  const productBinary = toSignedBits(a, width) + qBits;
  const productDecimal = fromSignedBits(productBinary);

  return {
    valid: true,
    bitWidth: width,
    multiplicand,
    multiplier,
    multiplicandBin: mBin,
    negMultiplicandBin: negMBin,
    multiplierBin: toSignedBits(multiplier, width),
    steps,
    productBinary,
    productDecimal,
    expectedDecimal: multiplicand * multiplier,
  };
}

export function traceRestoringDivision(
  dividend: number,
  divisor: number,
  requestedBits?: number
): RestoringDivResult {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor)) {
    return {
      valid: false,
      error: 'Dividend and divisor must be integers.',
      bitWidth: 4,
      dividend,
      divisor,
      dividendBin: '',
      divisorBin: '',
      steps: [],
      quotient: 0,
      remainder: 0,
      quotientBin: '',
      remainderBin: '',
    };
  }
  if (dividend < 0 || divisor <= 0) {
    return {
      valid: false,
      error: 'Unsigned Restoring Division requires Dividend ≥ 0 and Divisor > 0.',
      bitWidth: 4,
      dividend,
      divisor,
      dividendBin: '',
      divisorBin: '',
      steps: [],
      quotient: 0,
      remainder: 0,
      quotientBin: '',
      remainderBin: '',
    };
  }

  const neededBits = Math.max(
    4,
    dividend.toString(2).length,
    divisor.toString(2).length + 1
  );
  const width = requestedBits ? Math.max(requestedBits, neededBits) : neededBits;
  const maxVal = (1 << width) - 1;
  if (dividend > maxVal || divisor > maxVal) {
    return {
      valid: false,
      error: `Inputs exceed ${width}-bit unsigned range [0, ${maxVal}].`,
      bitWidth: width,
      dividend,
      divisor,
      dividendBin: '',
      divisorBin: '',
      steps: [],
      quotient: 0,
      remainder: 0,
      quotientBin: '',
      remainderBin: '',
    };
  }

  const aWidth = width + 1; // Extra sign bit for A
  let a = 0;
  let qBits = dividend.toString(2).padStart(width, '0');
  const divisorBin = divisor.toString(2).padStart(aWidth, '0');

  const steps: RestoringDivStep[] = [
    {
      cycle: 0,
      sc: width,
      a: toSignedBits(a, aWidth),
      q: qBits,
      operation: `Initialize (A = 0, Q = ${dividend}, M = ${divisor})`,
    },
  ];

  for (let cycle = 1; cycle <= width; cycle++) {
    // 1. Shift left A, Q
    const aBits = toSignedBits(a, aWidth);
    const shiftedABits = aBits.slice(1) + qBits[0];
    a = fromSignedBits(shiftedABits);
    const shiftedQPrefix = qBits.slice(1);

    steps.push({
      cycle,
      sc: width - cycle + 1,
      a: toSignedBits(a, aWidth),
      q: `${shiftedQPrefix}_`,
      operation: 'Shift Left (A, Q)',
    });

    // 2. A <- A - M
    a = a - divisor;
    const afterSubBits = toSignedBits(a, aWidth);

    if (a < 0) {
      // Restore A and set Q0 = 0
      const q0 = '0';
      steps.push({
        cycle,
        sc: width - cycle + 1,
        a: afterSubBits,
        q: `${shiftedQPrefix}${q0}`,
        operation: 'A ← A - M (A < 0, set Q₀ = 0)',
      });
      a = a + divisor;
      qBits = `${shiftedQPrefix}${q0}`;
      steps.push({
        cycle,
        sc: width - cycle,
        a: toSignedBits(a, aWidth),
        q: qBits,
        operation: 'Restore A ← A + M',
      });
    } else {
      const q0 = '1';
      qBits = `${shiftedQPrefix}${q0}`;
      steps.push({
        cycle,
        sc: width - cycle,
        a: afterSubBits,
        q: qBits,
        operation: 'A ← A - M (A ≥ 0, set Q₀ = 1)',
      });
    }
  }

  const quotient = parseInt(qBits, 2);
  const remainder = a;

  return {
    valid: true,
    bitWidth: width,
    dividend,
    divisor,
    dividendBin: dividend.toString(2).padStart(width, '0'),
    divisorBin,
    steps,
    quotient,
    remainder,
    quotientBin: qBits,
    remainderBin: remainder.toString(2).padStart(width, '0'),
  };
}

export function calculateCacheAndAMAT(input: CacheCalcInput): CacheCalcResult {
  const {
    hitRatioPercent,
    cacheAccessNs,
    mainMemoryAccessNs,
    simultaneousAccess,
    addressBits,
    cacheSizeKB,
    blockSizeBytes,
    associativity,
    sampleHexAddress,
  } = input;

  if (hitRatioPercent < 0 || hitRatioPercent > 100) {
    return {
      valid: false,
      error: 'Hit ratio must be between 0% and 100%.',
      hitRatio: 0,
      missRate: 1,
      amatNs: 0,
      speedup: 1,
      totalBlocks: 0,
      totalSets: 0,
      wordOffsetBits: 0,
      setIndexBits: 0,
      tagBits: 0,
    };
  }
  if (cacheAccessNs <= 0 || mainMemoryAccessNs <= 0) {
    return {
      valid: false,
      error: 'Access times must be positive.',
      hitRatio: 0,
      missRate: 1,
      amatNs: 0,
      speedup: 1,
      totalBlocks: 0,
      totalSets: 0,
      wordOffsetBits: 0,
      setIndexBits: 0,
      tagBits: 0,
    };
  }

  const cacheBytes = cacheSizeKB * 1024;
  if (blockSizeBytes <= 0 || cacheBytes < blockSizeBytes) {
    return {
      valid: false,
      error: 'Cache size must be at least equal to block size.',
      hitRatio: 0,
      missRate: 1,
      amatNs: 0,
      speedup: 1,
      totalBlocks: 0,
      totalSets: 0,
      wordOffsetBits: 0,
      setIndexBits: 0,
      tagBits: 0,
    };
  }

  const totalBlocks = Math.floor(cacheBytes / blockSizeBytes);
  const effectiveAssoc = associativity === 0 ? totalBlocks : Math.max(1, associativity);
  const totalSets = Math.max(1, Math.floor(totalBlocks / effectiveAssoc));

  const wordOffsetBits = Math.round(Math.log2(blockSizeBytes));
  const setIndexBits = associativity === 0 ? 0 : Math.round(Math.log2(totalSets));
  const tagBits = addressBits - setIndexBits - wordOffsetBits;

  if (tagBits < 1) {
    return {
      valid: false,
      error: 'Address width is too small for the configured cache geometry.',
      hitRatio: 0,
      missRate: 1,
      amatNs: 0,
      speedup: 1,
      totalBlocks,
      totalSets,
      wordOffsetBits,
      setIndexBits,
      tagBits,
    };
  }

  const hitRatio = hitRatioPercent / 100;
  const missRate = 1 - hitRatio;
  const amatNs = simultaneousAccess
    ? hitRatio * cacheAccessNs + missRate * mainMemoryAccessNs
    : cacheAccessNs + missRate * mainMemoryAccessNs;
  const speedup = mainMemoryAccessNs / amatNs;

  let sampleBreakdown: CacheCalcResult['sampleBreakdown'];
  if (sampleHexAddress && /^[0-9a-fA-F]+$/.test(sampleHexAddress.replace(/^0x/i, ''))) {
    const cleanHex = sampleHexAddress.replace(/^0x/i, '');
    const addrNum = BigInt('0x' + cleanHex);
    const mask = (1n << BigInt(addressBits)) - 1n;
    const masked = addrNum & mask;
    const binStr = masked.toString(2).padStart(addressBits, '0');
    const tagBitsStr = binStr.slice(0, tagBits);
    const setBitsStr = binStr.slice(tagBits, tagBits + setIndexBits);
    const wordBitsStr = binStr.slice(tagBits + setIndexBits);
    sampleBreakdown = {
      binaryAddress: binStr,
      tagBitsStr,
      setBitsStr: setBitsStr || '—',
      wordBitsStr,
      tagHex: '0x' + parseInt(tagBitsStr, 2).toString(16).toUpperCase(),
      setIndexDec: setBitsStr ? parseInt(setBitsStr, 2) : 0,
      wordOffsetDec: wordBitsStr ? parseInt(wordBitsStr, 2) : 0,
    };
  }

  return {
    valid: true,
    hitRatio,
    missRate,
    amatNs,
    speedup,
    totalBlocks,
    totalSets,
    wordOffsetBits,
    setIndexBits,
    tagBits,
    sampleBreakdown,
  };
}

export function calculateEffectiveAddress(input: EffectiveAddressInput): EffectiveAddressResult {
  const {
    mode,
    addressField,
    pcValue,
    registerValue,
    indexRegValue,
    baseRegValue,
    memoryAtAddressField,
    memoryAtRegister,
  } = input;

  switch (mode) {
    case 'Immediate':
      return {
        mode,
        effectiveAddressLabel: 'Operand embedded in instruction (no EA)',
        effectiveAddressValue: null,
        formula: `Operand = ${addressField}`,
        operandFetchNote: `Value ${addressField} is decoded directly from the IR address field.`,
        memoryReferencesForOperand: 0,
      };
    case 'Direct (Absolute)':
      return {
        mode,
        effectiveAddressLabel: `${addressField}`,
        effectiveAddressValue: addressField,
        formula: `EA = A = ${addressField}`,
        operandFetchNote: `Fetches operand directly from M[${addressField}] (= ${memoryAtAddressField}).`,
        memoryReferencesForOperand: 1,
      };
    case 'Indirect':
      return {
        mode,
        effectiveAddressLabel: `${memoryAtAddressField}`,
        effectiveAddressValue: memoryAtAddressField,
        formula: `EA = M[A] = M[${addressField}] = ${memoryAtAddressField}`,
        operandFetchNote: `Pointer at M[${addressField}] points to operand at M[${memoryAtAddressField}].`,
        memoryReferencesForOperand: 2,
      };
    case 'Register':
      return {
        mode,
        effectiveAddressLabel: `Register R (Value: ${registerValue})`,
        effectiveAddressValue: null,
        formula: `Operand = R = ${registerValue}`,
        operandFetchNote: 'Operand resides inside CPU register R; zero data-memory reads needed.',
        memoryReferencesForOperand: 0,
      };
    case 'Register Indirect':
      return {
        mode,
        effectiveAddressLabel: `${registerValue}`,
        effectiveAddressValue: registerValue,
        formula: `EA = (R) = ${registerValue}`,
        operandFetchNote: `Register R holds pointer ${registerValue}; fetches operand from M[${registerValue}] (= ${memoryAtRegister}).`,
        memoryReferencesForOperand: 1,
      };
    case 'PC-Relative':
      return {
        mode,
        effectiveAddressLabel: `${pcValue + addressField}`,
        effectiveAddressValue: pcValue + addressField,
        formula: `EA = PC + A = ${pcValue} + ${addressField} = ${pcValue + addressField}`,
        operandFetchNote: 'Supports position-independent code and branch target displacement.',
        memoryReferencesForOperand: 1,
      };
    case 'Indexed':
      return {
        mode,
        effectiveAddressLabel: `${addressField + indexRegValue}`,
        effectiveAddressValue: addressField + indexRegValue,
        formula: `EA = A + IX = ${addressField} + ${indexRegValue} = ${addressField + indexRegValue}`,
        operandFetchNote: 'Ideal for array traversal where A is base address and IX is loop index.',
        memoryReferencesForOperand: 1,
      };
    case 'Base-Register':
      return {
        mode,
        effectiveAddressLabel: `${baseRegValue + addressField}`,
        effectiveAddressValue: baseRegValue + addressField,
        formula: `EA = BR + A = ${baseRegValue} + ${addressField} = ${baseRegValue + addressField}`,
        operandFetchNote: 'Supports memory relocation by adding offset A to Base Register BR.',
        memoryReferencesForOperand: 1,
      };
  }
}

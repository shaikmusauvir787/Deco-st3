import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertNumberBaseAndIEEE754,
  encodeHamming74,
  traceBoothMultiplication,
  traceRestoringDivision,
  calculateCacheAndAMAT,
  calculateEffectiveAddress,
} from './digitalLogic';

test('convertNumberBaseAndIEEE754 converts 13.625 accurately', () => {
  const res = convertNumberBaseAndIEEE754('13.625', 10);
  assert.equal(res.valid, true);
  assert.equal(res.binary, '1101.101');
  assert.equal(res.octal, '15.5');
  assert.equal(res.hex, 'D.A');
  assert.equal(res.grayCode, '1011'); // 13 (1101) -> Gray 1011
  assert.equal(res.ieee754.hex, '0x415A0000');
  assert.equal(res.ieee754.signBit, '0');
  assert.equal(res.ieee754.biasedExponent, 130);
});

test('convertNumberBaseAndIEEE754 converts negative integer -15 to 8-bit 2s complement', () => {
  const res = convertNumberBaseAndIEEE754('-15', 10);
  assert.equal(res.valid, true);
  assert.equal(res.twosComplement8Bit, '11110001');
  assert.equal(res.ieee754.signBit, '1');
});

test('convertNumberBaseAndIEEE754 handles 72.01 decimal without crashing', () => {
  const res = convertNumberBaseAndIEEE754('72.01', 10);
  assert.equal(res.valid, true);
  assert.ok(res.binary.startsWith('1001000.'));
  assert.equal(res.ieee754.full32Bits.length, 32);
});

test('encodeHamming74 encodes 1011 and detects/corrects single-bit error at bit 5', () => {
  const clean = encodeHamming74('1011', null);
  assert.equal(clean.valid, true);
  assert.equal(clean.errorPosition, 0);
  assert.equal(clean.syndromeBits, '000');
  assert.equal(clean.recoveredDataBits, '1011');

  const corrupted = encodeHamming74('1011', 5);
  assert.equal(corrupted.valid, true);
  assert.equal(corrupted.errorPosition, 5);
  assert.equal(corrupted.syndromeBits, '101');
  assert.equal(corrupted.corrected7Bits, clean.encoded7Bits);
  assert.equal(corrupted.recoveredDataBits, '1011');
});

test('traceBoothMultiplication computes 5 * -3 = -15 correctly', () => {
  const res = traceBoothMultiplication(5, -3);
  assert.equal(res.valid, true);
  assert.equal(res.productDecimal, -15);
  assert.equal(res.expectedDecimal, -15);
  assert.equal(res.productBinary, '11110001');
  assert.ok(res.steps.length >= 5);
});

test('traceRestoringDivision computes 11 / 3 = 3 R 2 correctly', () => {
  const res = traceRestoringDivision(11, 3);
  assert.equal(res.valid, true);
  assert.equal(res.quotient, 3);
  assert.equal(res.remainder, 2);
  assert.equal(res.quotientBin, '0011');
  assert.equal(res.remainderBin, '0010');
});

test('calculateCacheAndAMAT computes AMAT and Tag/Set/Word bits correctly', () => {
  // 32-bit address, 64KB cache, 64B block, 4-way set associative
  // totalBlocks = 1024, totalSets = 256 -> Set = 8 bits, Word = 6 bits, Tag = 18 bits
  const res = calculateCacheAndAMAT({
    hitRatioPercent: 95,
    cacheAccessNs: 10,
    mainMemoryAccessNs: 100,
    simultaneousAccess: false,
    addressBits: 32,
    cacheSizeKB: 64,
    blockSizeBytes: 64,
    associativity: 4,
    sampleHexAddress: '0x12345678',
  });
  assert.equal(res.valid, true);
  assert.equal(res.wordOffsetBits, 6);
  assert.equal(res.setIndexBits, 8);
  assert.equal(res.tagBits, 18);
  assert.equal(Number(res.amatNs.toFixed(2)), 15);
  assert.ok(res.sampleBreakdown !== undefined);
});

test('calculateEffectiveAddress computes all modes accurately', () => {
  const indexed = calculateEffectiveAddress({
    mode: 'Indexed',
    addressField: 500,
    pcValue: 200,
    registerValue: 300,
    indexRegValue: 25,
    baseRegValue: 1000,
    memoryAtAddressField: 750,
    memoryAtRegister: 900,
  });
  assert.equal(indexed.effectiveAddressValue, 525);

  const indirect = calculateEffectiveAddress({
    mode: 'Indirect',
    addressField: 500,
    pcValue: 200,
    registerValue: 300,
    indexRegValue: 25,
    baseRegValue: 1000,
    memoryAtAddressField: 750,
    memoryAtRegister: 900,
  });
  assert.equal(indirect.effectiveAddressValue, 750);
  assert.equal(indirect.memoryReferencesForOperand, 2);
});

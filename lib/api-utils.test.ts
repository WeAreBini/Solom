import { describe, it, expect } from 'vitest';
import { parseLimitParam } from './api-utils';

describe('parseLimitParam', () => {
  describe('valid inputs', () => {
    it('should return the parsed number for valid positive integers', () => {
      expect(parseLimitParam('1')).toBe(1);
      expect(parseLimitParam('10')).toBe(10);
      expect(parseLimitParam('50')).toBe(50);
      expect(parseLimitParam('100')).toBe(100);
    });

    it('should handle numeric strings with decimals (truncates to integer)', () => {
      expect(parseLimitParam('10.5')).toBe(10);
      expect(parseLimitParam('10.9')).toBe(10);
    });

    it('should handle very large numbers', () => {
      expect(parseLimitParam('1000000')).toBe(1000000);
    });
  });

  describe('default behavior', () => {
    it('should return default (10) when input is null', () => {
      expect(parseLimitParam(null)).toBe(10);
    });

    it('should return default (10) for empty string (treated as no input)', () => {
      // Empty string is falsy, so it triggers default behavior
      // This is intentional - empty string means "use default"
      expect(parseLimitParam('')).toBe(10);
    });
  });

  describe('invalid inputs - NaN cases (BUG FIX: these are the critical test cases)', () => {
    it('should return null for non-numeric strings (BUG FIX)', () => {
      // This is the main bug being fixed!
      // Previously: parseInt('abc') returns NaN, but NaN < 1 is false
      // Now: We check Number.isFinite() which properly rejects NaN
      expect(parseLimitParam('abc')).toBe(null);
      expect(parseLimitParam('invalid')).toBe(null);
      expect(parseLimitParam('NaN')).toBe(null);
    });

    it('should return null for special characters', () => {
      expect(parseLimitParam('!@#$%')).toBe(null);
      expect(parseLimitParam('<script>')).toBe(null);
    });

    it('should return null for whitespace-only strings', () => {
      expect(parseLimitParam('   ')).toBe(null);
    });

    it('should return null for mixed alphanumeric strings starting with non-numeric', () => {
      // If it starts with a letter, parseInt returns NaN
      expect(parseLimitParam('abc10')).toBe(null);
      expect(parseLimitParam('test123')).toBe(null);
    });

    it('should parse mixed strings starting with numbers (parseInt behavior)', () => {
      // parseInt stops at first non-digit, so '10abc' parses to 10
      // This is acceptable - the user provided a numeric prefix
      expect(parseLimitParam('10abc')).toBe(10);
      expect(parseLimitParam('50xyz')).toBe(50);
    });

    it('should return null for hexadecimal input with radix 10', () => {
      // parseInt('0x10', 10) returns 0, which is < 1, so null
      expect(parseLimitParam('0x10')).toBe(null);
    });
  });

  describe('boundary values', () => {
    it('should return null for zero', () => {
      expect(parseLimitParam('0')).toBe(null);
    });

    it('should return null for negative numbers', () => {
      expect(parseLimitParam('-1')).toBe(null);
      expect(parseLimitParam('-10')).toBe(null);
      expect(parseLimitParam('-100')).toBe(null);
    });

    it('should accept 1 as the minimum valid value', () => {
      expect(parseLimitParam('1')).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle string numbers with leading zeros', () => {
      expect(parseLimitParam('010')).toBe(10);
    });

    it('should handle string numbers with plus sign', () => {
      expect(parseLimitParam('+10')).toBe(10);
    });

    it('should handle string numbers with negative sign', () => {
      expect(parseLimitParam('-10')).toBe(null);
    });

    it('should handle strings that parse to Infinity', () => {
      // Note: parseInt never returns Infinity, but parseFloat would
      // parseInt('Infinity', 10) returns NaN (I think?)
      // Let's check: parseInt('Infinity', 10) returns NaN because 'I' is not a digit
      expect(parseLimitParam('Infinity')).toBe(null);
    });

    it('should parse strings with numeric prefix (valid parseInt behavior)', () => {
      // parseInt stops at non-digit characters
      expect(parseLimitParam('1_000')).toBe(1);
      expect(parseLimitParam('1e10')).toBe(1);
    });
  });

  describe('real-world attack vectors', () => {
    it('should reject ?limit=abc (original bug report)', () => {
      expect(parseLimitParam('abc')).toBe(null);
    });

    it('should reject ?limit=<script>alert(1)</script>', () => {
      expect(parseLimitParam('<script>alert(1)</script>')).toBe(null);
    });

    it('should reject ?limit=null', () => {
      expect(parseLimitParam('null')).toBe(null);
    });

    it('should reject ?limit=undefined', () => {
      expect(parseLimitParam('undefined')).toBe(null);
    });

    it('should reject ?limit=true', () => {
      expect(parseLimitParam('true')).toBe(null);
    });

    it('should reject ?limit=false', () => {
      expect(parseLimitParam('false')).toBe(null);
    });
  });
});

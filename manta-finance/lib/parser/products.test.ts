import { describe, it, expect } from 'vitest'
import { resolveCategory, CATEGORY_NAMES } from './products'

describe('resolveCategory', () => {
  it("resolves '001' to 'Klep'", () => {
    expect(resolveCategory('001')).toBe('Klep')
  })

  it("resolves '002' to 'Blok Silinder'", () => {
    expect(resolveCategory('002')).toBe('Blok Silinder')
  })

  it('passes through unknown codes unchanged', () => {
    expect(resolveCategory('999')).toBe('999')
    expect(resolveCategory('abc')).toBe('abc')
  })

  it('CATEGORY_NAMES has entries for all 8 known codes', () => {
    const codes = ['001', '002', '003', '004', '005', '006', '007', '008']
    for (const code of codes) {
      expect(CATEGORY_NAMES[code]).toBeDefined()
      expect(typeof CATEGORY_NAMES[code]).toBe('string')
    }
  })
})

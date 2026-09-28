import { expect, it } from 'vitest';
import { csvCell, reportsCsv } from '../../src/core/reports/csv';

it('escapes quotes, newlines and spreadsheet formulas', () => {
  expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
  expect(csvCell(123)).toBe('"123"');
  expect(reportsCsv([], 'ru')).toContain('\uFEFF"ID","Дата"');
});

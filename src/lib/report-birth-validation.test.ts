import { describe, expect, it } from 'vitest';
import { validateReportBirth } from './birth-validation';

describe('report birth input', () => {
  it.each([
    [{year:'2000',month:'2',day:'29',hour:'0',minute:'0'}, true],
    [{year:'1900',month:'2',day:'29',hour:'12',minute:'0'}, false],
    [{year:'2001',month:'2',day:'30',hour:'12',minute:'0'}, false],
    [{year:'1990',month:'5',day:'15',hour:'24',minute:'0'}, false],
    [{year:'1990',month:'5',day:'15',hour:'0',minute:'60'}, false],
    [{year:'1990x',month:'5',day:'15',hour:'0',minute:'0'}, false],
    [{year:'1990',month:'5',day:'15',hour:'',minute:'0'}, true],
  ])('validates calendar date and time %j', (input, expected) => {
    expect(validateReportBirth(input)).toBe(expected);
  });
});

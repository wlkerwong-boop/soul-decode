import { describe, expect, it } from 'vitest';
import { canUseEmergencyCode } from './auth-policy';

const EMERGENCY_CODE_HASH = '92925488b28ab12584ac8fcaa8a27a0f497b2c62940c8f4fbc8ef19ebc87c43e';

describe('canUseEmergencyCode', () => {
  it('rejects arbitrary customer phone numbers', () => {
    expect(canUseEmergencyCode('17712341333', EMERGENCY_CODE_HASH)).toBe(false);
  });

  it('allows the emergency code only for explicit test accounts', () => {
    expect(canUseEmergencyCode('13800000000', EMERGENCY_CODE_HASH)).toBe(true);
    expect(canUseEmergencyCode('13900000000', EMERGENCY_CODE_HASH)).toBe(true);
  });

  it('rejects an incorrect code for test accounts', () => {
    expect(canUseEmergencyCode('13800000000', 'invalid-hash')).toBe(false);
  });
});

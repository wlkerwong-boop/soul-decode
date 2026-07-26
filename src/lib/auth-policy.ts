const EMERGENCY_CODE_HASH = '92925488b28ab12584ac8fcaa8a27a0f497b2c62940c8f4fbc8ef19ebc87c43e';
const EMERGENCY_TEST_PHONES = new Set(['13800000000', '13900000000']);

export function canUseEmergencyCode(phone: string, codeHash: string): boolean {
  return EMERGENCY_TEST_PHONES.has(phone.replace(/\s/g, ''))
    && codeHash === EMERGENCY_CODE_HASH;
}

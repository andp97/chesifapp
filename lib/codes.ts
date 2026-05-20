const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

export function generateCode(length: number): string {
  let code = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (const byte of array) {
    code += CHARS[byte % CHARS.length];
  }
  return code;
}

export function generateInviteCode() {
  return generateCode(6);
}

export function generateAdminCode() {
  return generateCode(10);
}

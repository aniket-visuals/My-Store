import crypto from 'crypto';

/**
 * Creates a canonically ordered JSON string for deterministic signature generation/verification.
 */
export function createCanonicalPayload(payload: {
  version: number;
  username: string;
  deviceId: string;
  token: string;
  issuedAt: number;
  expiresAt: number;
}) {
  // Sort the keys alphabetically for deterministic serialization
  return JSON.stringify({
    deviceId: payload.deviceId,
    expiresAt: payload.expiresAt,
    issuedAt: payload.issuedAt,
    token: payload.token,
    username: payload.username,
    version: payload.version
  });
}

/**
 * Signs the given string payload using the OMNITOOL_PRIVATE_KEY.
 * Returns the base64 encoded signature.
 */
export function signPayload(payloadString: string): string {
  const privateKey = process.env.OMNITOOL_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('OMNITOOL_PRIVATE_KEY environment variable is missing.');
  }

  // Replace escaped newlines if they are passed in via env var
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(payloadString);
  sign.end();
  
  return sign.sign(formattedPrivateKey, 'base64');
}

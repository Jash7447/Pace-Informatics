export const AUTH_COOKIE_NAME = 'pace_session';
export const SESSION_MAX_AGE = 2 * 60 * 60; // 2 hours

interface SessionPayload {
  exp: number;
  username: string;
}

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? '';
}

export function getAuthCredentials() {
  return {
    username: process.env.AUTH_USERNAME ?? '',
    password: process.env.AUTH_PASSWORD ?? '',
  };
}

export function validateCredentials(username: string, password: string): boolean {
  const { username: expectedUsername, password: expectedPassword } = getAuthCredentials();

  if (!expectedUsername || !expectedPassword || !getAuthSecret()) {
    return false;
  }

  return username === expectedUsername && password === expectedPassword;
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );

  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(username: string): Promise<string | null> {
  const secret = getAuthSecret();
  if (!secret) return null;

  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    username,
  };

  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const secret = getAuthSecret();
  if (!secret) return false;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;

  const expectedSignature = await signPayload(encodedPayload, secret);
  if (signature.length !== expectedSignature.length) return false;

  let isValidSignature = true;
  for (let i = 0; i < signature.length; i += 1) {
    if (signature[i] !== expectedSignature[i]) {
      isValidSignature = false;
    }
  }

  if (!isValidSignature) return false;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload))
    ) as SessionPayload;

    return payload.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

/**
 * 개인정보 암호화 유틸리티
 *
 * AES-256-GCM 알고리즘을 사용한 대칭키 암호화
 * - 자소서, 이력서 등 민감한 개인정보 암호화
 * - 서버 사이드에서만 사용 (환경 변수 접근)
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// 암호화 설정
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 초기화 벡터 길이
const AUTH_TAG_LENGTH = 16; // 인증 태그 길이
const SALT_LENGTH = 32; // 솔트 길이
const KEY_LENGTH = 32; // AES-256 키 길이

// 키 캐싱 설정
const KEY_CACHE_MAX_SIZE = 100; // 최대 캐시 크기
const keyCache = new Map<string, { key: Buffer; timestamp: number }>();
const KEY_CACHE_TTL = 5 * 60 * 1000; // 5분 TTL

/**
 * 캐시 정리 (오래된 항목 및 크기 초과 시)
 */
function cleanupCache(): void {
  const now = Date.now();

  // TTL 만료된 항목 제거
  for (const [cacheKey, value] of keyCache.entries()) {
    if (now - value.timestamp > KEY_CACHE_TTL) {
      keyCache.delete(cacheKey);
    }
  }

  // 크기 초과 시 가장 오래된 항목 제거
  if (keyCache.size > KEY_CACHE_MAX_SIZE) {
    const entries = Array.from(keyCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - KEY_CACHE_MAX_SIZE);
    toDelete.forEach(([key]) => keyCache.delete(key));
  }
}

/**
 * 암호화 키 생성 (환경 변수 + 솔트 기반, 캐싱 적용)
 */
function deriveKey(salt: Buffer): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error('ENCRYPTION_SECRET 환경 변수가 설정되지 않았습니다');
  }

  // 캐시 키 생성 (salt의 base64)
  const cacheKey = salt.toString('base64');

  // 캐시에서 조회
  const cached = keyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < KEY_CACHE_TTL) {
    return cached.key;
  }

  // 키 파생 (느린 작업)
  const key = scryptSync(secret, salt, KEY_LENGTH);

  // 캐시에 저장
  keyCache.set(cacheKey, { key, timestamp: Date.now() });

  // 주기적 캐시 정리
  if (keyCache.size > KEY_CACHE_MAX_SIZE * 0.9) {
    cleanupCache();
  }

  return key;
}

/**
 * 텍스트 암호화
 *
 * @param plaintext - 암호화할 평문
 * @returns 암호화된 문자열 (base64: salt + iv + authTag + encrypted)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  try {
    // 랜덤 솔트와 IV 생성
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    // 키 파생
    const key = deriveKey(salt);

    // 암호화
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);

    // 인증 태그 추출
    const authTag = cipher.getAuthTag();

    // 결합: salt + iv + authTag + encrypted
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);

    // Base64 인코딩 후 접두사 추가 (암호화된 데이터 식별용)
    return `ENC:${combined.toString('base64')}`;
  } catch (error) {
    console.error('암호화 실패:', error);
    throw new Error('데이터 암호화에 실패했습니다');
  }
}

/**
 * 텍스트 복호화
 *
 * @param ciphertext - 암호화된 문자열
 * @returns 복호화된 평문
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext;

  // 암호화되지 않은 데이터는 그대로 반환 (하위 호환성)
  if (!ciphertext.startsWith('ENC:')) {
    return ciphertext;
  }

  try {
    // 접두사 제거 및 Base64 디코딩
    const combined = Buffer.from(ciphertext.slice(4), 'base64');

    // 구성 요소 분리
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

    // 키 파생
    const key = deriveKey(salt);

    // 복호화
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('복호화 실패:', error);
    throw new Error('데이터 복호화에 실패했습니다');
  }
}

/**
 * 객체의 특정 필드들을 암호화
 *
 * @param obj - 원본 객체
 * @param fields - 암호화할 필드명 배열
 * @returns 필드가 암호화된 새 객체
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string' && value) {
      result[field] = encrypt(value) as T[keyof T];
    }
  }

  return result;
}

/**
 * 객체의 특정 필드들을 복호화
 *
 * @param obj - 암호화된 객체
 * @param fields - 복호화할 필드명 배열
 * @returns 필드가 복호화된 새 객체
 */
export function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string' && value) {
      result[field] = decrypt(value) as T[keyof T];
    }
  }

  return result;
}

/**
 * 암호화된 데이터인지 확인
 */
export function isEncrypted(value: string): boolean {
  return value?.startsWith('ENC:') ?? false;
}

import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { HttpError } from './auth';

/**
 * Uniform API envelope. Errors never leak stack traces, SQL text or internal
 * identifiers to the client; unexpected failures are logged server-side and
 * reported as an opaque code.
 */

export interface ApiErrorBody {
  error: { code: string; message: string; issues?: Array<{ path: string; message: string }> };
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { ...init, headers: { 'Cache-Control': 'no-store', ...(init?.headers ?? {}) } });
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json(
    { error: { code, message } } satisfies ApiErrorBody,
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

/** Translates any thrown value into a safe response. Never rethrows. */
export function toErrorResponse(error: unknown, requestId?: string) {
  if (error instanceof HttpError) {
    return fail(error.status, error.code, error.message);
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_failed',
          message: 'البيانات المُرسلة غير صالحة',
          issues: error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
      } satisfies ApiErrorBody,
      { status: 422, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  console.error('[api] unhandled error', { requestId, error });
  return fail(500, 'internal_error', 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
}

/**
 * Parses a JSON body with a hard size cap so an attacker cannot exhaust memory
 * with a single oversized request.
 */
export async function readJson(request: Request, maxBytes = 8 * 1024): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new HttpError(413, 'حجم الطلب كبير جداً', 'payload_too_large');
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    throw new HttpError(413, 'حجم الطلب كبير جداً', 'payload_too_large');
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(400, 'صيغة JSON غير صالحة', 'invalid_json');
  }
}
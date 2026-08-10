import { NextResponse } from 'next/server';
import { ApiError } from './auth.js';

/** Wraps a route handler so thrown ApiErrors (and unexpected errors) become clean JSON responses. */
export function withApi(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  };
}

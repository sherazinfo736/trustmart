export function ok<T>(data: T, total?: number) {
  return {
    data,
    ...(total === undefined ? {} : { meta: { total } }),
    requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
  };
}
export function err(code: string, message: string, fieldErrors?: Record<string, string[]>) {
  return { code, message, ...(fieldErrors ? { fieldErrors } : {}), requestId: `req_${Math.random().toString(36).slice(2, 10)}` };
}

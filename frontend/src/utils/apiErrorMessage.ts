/** Turn FastAPI / Pydantic `detail` (or axios/Error) into a short user-facing string. */
export function formatApiErrorDetail(detail: unknown): string {
  if (detail == null) return '';
  if (detail instanceof Error && detail.message) return detail.message;
  if (typeof detail === 'object' && detail !== null && 'response' in detail) {
    const axiosDetail = (detail as { response?: { data?: { detail?: unknown } } }).response?.data
      ?.detail;
    if (axiosDetail != null) {
      const nested = formatApiErrorDetail(axiosDetail);
      if (nested) return nested;
    }
  }
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (item && typeof item === 'object' && 'msg' in item) {
        const loc = (item as { loc?: unknown[] }).loc;
        const msg = String((item as { msg: string }).msg);
        if (Array.isArray(loc) && loc.length > 0) {
          const path = loc.filter((x) => typeof x === 'string' || typeof x === 'number').join('.');
          return path ? `${path}: ${msg}` : msg;
        }
        return msg;
      }
      try {
        return JSON.stringify(item);
      } catch {
        return String(item);
      }
    });
    return parts.join(' · ') || 'Invalid request';
  }
  if (typeof detail === 'object' && detail !== null && 'detail' in detail) {
    return formatApiErrorDetail((detail as { detail: unknown }).detail);
  }
  return 'Something went wrong';
}

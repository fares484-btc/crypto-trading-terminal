// طبقة تخزين محلية آمنة (localStorage) مع معالجة الأخطاء — تُستخدم لحفظ قائمة المراقبة وسجل الصفقات بين الجلسات

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // تجاهل أخطاء التخزين (مثل امتلاء المساحة أو وضع التصفح الخاص)
  }
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

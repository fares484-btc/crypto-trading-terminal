// تنبيه صوتي بسيط باستخدام Web Audio API — بدون ملفات صوتية خارجية
// ملاحظة: المتصفحات تمنع تشغيل الصوت قبل أول تفاعل من المستخدم (نقرة/ضغطة)، وهذا سلوك طبيعي للمتصفح

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    sharedAudioContext = new AudioCtor();
  }
  return sharedAudioContext;
}

export function playAlertBeep(kind: 'buy' | 'sell' | 'info' = 'info'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => undefined);
  }

  const frequency = kind === 'buy' ? 880 : kind === 'sell' ? 440 : 660;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

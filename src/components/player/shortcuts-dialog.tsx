"use client";

import { Dialog } from "@/components/ui/dialog";
import { CloseIcon, KeyboardIcon } from "@/components/player/icons";

const shortcuts = [
  { keys: ["Space", "K"], action: "تشغيل / إيقاف مؤقت" },
  { keys: ["M"], action: "كتم / إلغاء الكتم" },
  { keys: ["F"], action: "ملء الشاشة" },
  { keys: ["↑", "↓"], action: "رفع / خفض الصوت" },
  { keys: ["←", "→"], action: "تقديم / إرجاع ١٠ ثوانٍ" },
  { keys: ["J", "L"], action: "إرجاع / تقديم ١٠ ثوانٍ" },
  { keys: ["N", "P"], action: "القناة التالية / السابقة" },
];

export function ShortcutsDialog({
  open,
  onClose,
  titleId,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <Dialog open onClose={onClose} titleId={titleId}>
      <div className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-400/10 text-brand-300">
            <KeyboardIcon className="size-5" />
          </span>
          <h2 id={titleId} className="text-base font-extrabold">
            اختصارات لوحة المفاتيح
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-foreground"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>

      <dl className="scroll-area max-h-[70dvh] divide-y divide-white/5 overflow-y-auto px-5">
        {shortcuts.map((item) => (
          <div key={item.action} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs text-muted">{item.action}</dt>
            <dd className="flex shrink-0 items-center gap-1">
              {item.keys.map((key) => (
                <kbd
                  key={key}
                  dir="ltr"
                  className="min-w-7 rounded-md border border-border-strong bg-surface-soft px-1.5 py-0.5 text-center font-mono text-[10px] font-bold text-foreground shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                >
                  {key}
                </kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-white/5 px-5 py-3 text-[10px] leading-5 text-muted">
        تعمل الاختصارات عندما لا يكون المؤشر داخل حقل إدخال.
      </p>
    </Dialog>
  );
}

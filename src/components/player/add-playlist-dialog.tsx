"use client";

import { useId, useRef, useState, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  CloseIcon,
  FileIcon,
  LinkIcon,
  LoaderIcon,
  LockIcon,
  ServerIcon,
  SparkIcon,
  UploadIcon,
} from "@/components/player/icons";
import { cn } from "@/lib/cn";

export type AddTab = "url" | "file" | "paste" | "xtream";

const tabs: { id: AddTab; label: string; icon: typeof LinkIcon }[] = [
  { id: "url", label: "رابط", icon: LinkIcon },
  { id: "file", label: "ملف", icon: FileIcon },
  { id: "paste", label: "لصق", icon: UploadIcon },
  { id: "xtream", label: "Xtream", icon: ServerIcon },
];

export function AddPlaylistDialog({
  initialTab = "url",
  onClose,
  onAddUrl,
  onAddFile,
  onAddText,
  onAddXtream,
  onDemo,
}: {
  initialTab?: AddTab;
  onClose: () => void;
  onAddUrl: (url: string, name: string) => Promise<{ count: number }>;
  onAddFile: (file: File, name: string) => Promise<{ count: number }>;
  onAddText: (text: string, name: string) => Promise<{ count: number }>;
  onAddXtream: (
    server: string,
    username: string,
    password: string,
    name: string,
  ) => Promise<{ count: number }>;
  onDemo: () => Promise<{ count: number }>;
}) {
  const titleId = useId();
  const urlId = useId();
  const urlNameId = useId();
  const fileId = useId();
  const fileNameId = useId();
  const pasteId = useId();
  const pasteNameId = useId();
  const serverId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const xtreamNameId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<AddTab>(initialTab);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [server, setServer] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileDragging, setFileDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ActiveTabIcon = tabs.find((item) => item.id === tab)?.icon ?? LinkIcon;

  function switchTab(next: AddTab) {
    if (busy) {
      return;
    }

    setTab(next);
    setError(null);
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? 1 : -1;
    const next = tabs[(index + direction + tabs.length) % tabs.length];

    switchTab(next.id);
    document.getElementById(`add-tab-${next.id}`)?.focus();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (busy) {
      return;
    }

    if (tab === "url" && !url.trim()) {
      setError("ألصق رابط قائمة M3U أولاً.");
      return;
    }

    if (tab === "file" && !file) {
      setError("اختر ملف M3U أو اسحبه إلى المساحة.");
      return;
    }

    if (tab === "paste" && !text.trim()) {
      setError("ألصق محتوى قائمة M3U أولاً.");
      return;
    }

    if (tab === "xtream") {
      if (!server.trim()) {
        setError("أدخل رابط خادم Xtream أولاً.");
        return;
      }

      if (!username.trim()) {
        setError("أدخل اسم مستخدم Xtream.");
        return;
      }

      if (!password) {
        setError("أدخل كلمة مرور Xtream.");
        return;
      }

      const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(server.trim())
        ? server.trim()
        : `http://${server.trim()}`;

      try {
        const parsed = new URL(candidate);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("protocol");
        }
      } catch {
        setError("رابط الخادم غير صالح. مثال: http://example.com:8080");
        return;
      }
    }

    setBusy(true);
    setError(null);

    try {
      if (tab === "url") {
        await onAddUrl(url.trim(), name.trim());
      } else if (tab === "file" && file) {
        await onAddFile(file, name.trim());
      } else if (tab === "xtream") {
        await onAddXtream(server.trim(), username.trim(), password, name.trim());
      } else {
        await onAddText(text, name.trim());
      }

      setBusy(false);
      onClose();
    } catch (submitError) {
      setBusy(false);
      setError(
        submitError instanceof Error ? submitError.message : "حدث خطأ غير متوقع. أعد المحاولة.",
      );
    }
  }

  async function addDemo() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await onDemo();
      setBusy(false);
      onClose();
    } catch (demoError) {
      setBusy(false);
      setError(demoError instanceof Error ? demoError.message : "تعذّر تحميل القائمة التجريبية.");
    }
  }

  function acceptFile(dropped: File | undefined) {
    if (!dropped) {
      return;
    }

    if (!/\.(m3u8?|txt)$/i.test(dropped.name)) {
      setError("اختر ملفاً بامتداد m3u أو m3u8.");
      return;
    }

    setFile(dropped);
    setError(null);

    if (!name.trim()) {
      setName(dropped.name.replace(/\.(m3u8?|txt)$/i, ""));
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setFileDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  return (
    <Dialog open onClose={onClose} titleId={titleId}>
      <form onSubmit={submit} className="flex max-h-[90dvh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-lg font-extrabold">
              إضافة قائمة تشغيل
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              رابط مباشر، ملف، محتوى M3U، أو حساب Xtream Codes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-foreground"
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="scroll-area flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div
            role="tablist"
            aria-label="طريقة إضافة القائمة"
            className="grid grid-cols-2 gap-1 rounded-xl border border-white/5 bg-surface-soft p-1 sm:grid-cols-4"
          >
            {tabs.map((item, index) => {
              const Icon = item.icon;
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  id={`add-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`add-panel-${item.id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => switchTab(item.id)}
                  onKeyDown={(event) => handleTabKey(event, index)}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-colors",
                    active
                      ? "bg-white/10 text-foreground shadow-sm"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            {tab === "url" && (
              <div
                id="add-panel-url"
                role="tabpanel"
                aria-labelledby="add-tab-url"
                className="space-y-4"
              >
                <div>
                  <label htmlFor={urlId} className="mb-1.5 block text-xs font-bold">
                    رابط القائمة
                  </label>
                  <input
                    id={urlId}
                    type="url"
                    dir="ltr"
                    inputMode="url"
                    required
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://example.com/playlist.m3u"
                    className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-left text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p className="mt-2 text-[11px] leading-5 text-muted">
                    إن منع الخادم الجلب المباشر (CORS)، نزّل الملف وأضفه من تبويب «ملف».
                  </p>
                </div>
                <div>
                  <label htmlFor={urlNameId} className="mb-1.5 block text-xs font-bold">
                    اسم القائمة <span className="font-normal text-muted">(اختياري)</span>
                  </label>
                  <input
                    id={urlNameId}
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="مثال: قنواتي المفضلة"
                    maxLength={60}
                    className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                  />
                </div>
              </div>
            )}

            {tab === "file" && (
              <div
                id="add-panel-file"
                role="tabpanel"
                aria-labelledby="add-tab-file"
                className="space-y-4"
              >
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setFileDragging(true);
                  }}
                  onDragLeave={() => setFileDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "rounded-2xl border border-dashed p-6 text-center transition-colors",
                    fileDragging
                      ? "border-brand-400 bg-brand-400/10"
                      : "border-border-strong bg-surface-soft/60",
                  )}
                >
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-400/10 text-brand-300">
                    <UploadIcon className="size-6" />
                  </span>
                  <p className="mt-3 text-sm font-bold">
                    {file ? file.name : "اسحب ملف M3U إلى هنا"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {file
                      ? `${(file.size / 1024).toFixed(1)} كيلوبايت`
                      : "أو اختر ملفاً من جهازك — m3u أو m3u8"}
                  </p>
                  <input
                    ref={fileInputRef}
                    id={fileId}
                    type="file"
                    accept=".m3u,.m3u8,.txt,audio/x-mpegurl,application/vnd.apple.mpegurl,text/plain"
                    className="sr-only"
                    onChange={(event) => acceptFile(event.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileIcon className="size-4" />
                    اختيار ملف
                  </Button>
                </div>
                <div>
                  <label htmlFor={fileNameId} className="mb-1.5 block text-xs font-bold">
                    اسم القائمة <span className="font-normal text-muted">(اختياري)</span>
                  </label>
                  <input
                    id={fileNameId}
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="مثال: قنواتي المفضلة"
                    maxLength={60}
                    className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                  />
                </div>
              </div>
            )}

            {tab === "paste" && (
              <div
                id="add-panel-paste"
                role="tabpanel"
                aria-labelledby="add-tab-paste"
                className="space-y-4"
              >
                <div>
                  <label htmlFor={pasteId} className="mb-1.5 block text-xs font-bold">
                    محتوى M3U
                  </label>
                  <textarea
                    id={pasteId}
                    dir="ltr"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={"#EXTM3U\n#EXTINF:-1,Channel Name\nhttps://..."}
                    rows={7}
                    className="scroll-area w-full resize-y rounded-xl border border-border-subtle bg-surface-soft p-3 text-left font-mono text-xs leading-6 outline-none placeholder:text-muted/60 focus:border-brand-400"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label htmlFor={pasteNameId} className="mb-1.5 block text-xs font-bold">
                    اسم القائمة <span className="font-normal text-muted">(اختياري)</span>
                  </label>
                  <input
                    id={pasteNameId}
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="مثال: قنواتي المفضلة"
                    maxLength={60}
                    className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                  />
                </div>
              </div>
            )}

            {tab === "xtream" && (
              <div
                id="add-panel-xtream"
                role="tabpanel"
                aria-labelledby="add-tab-xtream"
                className="space-y-4"
              >
                <div>
                  <label htmlFor={serverId} className="mb-1.5 block text-xs font-bold">
                    رابط الخادم
                  </label>
                  <input
                    id={serverId}
                    type="text"
                    dir="ltr"
                    inputMode="url"
                    value={server}
                    onChange={(event) => setServer(event.target.value)}
                    placeholder="http://example.com:8080"
                    className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-left text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p className="mt-2 text-[11px] leading-5 text-muted">
                    عنوان لوحة Xtream فقط. يدعم شاشة البث المباشر بصيغة HLS (m3u8).
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={usernameId} className="mb-1.5 block text-xs font-bold">
                      اسم المستخدم
                    </label>
                    <input
                      id={usernameId}
                      type="text"
                      dir="ltr"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="username"
                      className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-left text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                      autoComplete="username"
                      spellCheck={false}
                    />
                  </div>
                  <div>
                    <label htmlFor={passwordId} className="mb-1.5 block text-xs font-bold">
                      كلمة المرور
                    </label>
                    <input
                      id={passwordId}
                      type="password"
                      dir="ltr"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-left text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={xtreamNameId} className="mb-1.5 block text-xs font-bold">
                    اسم القائمة <span className="font-normal text-muted">(اختياري)</span>
                  </label>
                  <input
                    id={xtreamNameId}
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="مثال: اشتراكي"
                    maxLength={60}
                    className="h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-sm outline-none placeholder:text-muted/60 focus:border-brand-400"
                  />
                </div>

                <p className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] leading-5 text-muted">
                  <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    تُحفظ القنوات على جهازك فقط، وتُرسل بيانات الدخول إلى خادمك عبر وسيط شاشة لجلب
                    القائمة. لا تُستخدم لدى أي طرف آخر.
                  </span>
                </p>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/10 p-3 text-xs leading-5 text-danger"
            >
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border-subtle p-3">
            <div className="flex items-center gap-2">
              <SparkIcon className="size-4 text-accent-300" />
              <span className="text-xs font-semibold">جرّب شاشة فوراً</span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={addDemo} disabled={busy}>
              القائمة التجريبية
            </Button>
          </div>
        </div>

        <footer className="safe-bottom flex items-center justify-between gap-3 border-t border-white/5 px-5 py-4 sm:px-6">
          <p className="hidden text-[10px] text-muted sm:block">تُحفظ القوائم على جهازك فقط.</p>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={busy}>
              إلغاء
            </Button>
            <Button type="submit" size="sm" disabled={busy} className="flex-1 sm:flex-none">
              {busy ? <LoaderIcon className="size-4" /> : <ActiveTabIcon className="size-4" />}
              {busy ? "جارٍ التحقق..." : "إضافة القائمة"}
            </Button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}

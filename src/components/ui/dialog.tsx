"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Dialog({
  open,
  onClose,
  titleId,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);

    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={cn(
        "m-auto max-h-[90dvh] w-[min(94vw,34rem)] overflow-hidden rounded-3xl border border-white/10 bg-surface-raised p-0 text-foreground shadow-2xl",
        "backdrop:bg-black/75 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </dialog>
  );
}

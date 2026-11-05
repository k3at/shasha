import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/20 hover:bg-brand-300 active:bg-brand-500",
  secondary:
    "border border-white/10 bg-white/[0.04] text-foreground hover:border-white/20 hover:bg-white/[0.08]",
  ghost: "text-muted hover:bg-white/[0.06] hover:text-foreground",
  danger: "bg-danger/15 text-danger border border-danger/25 hover:bg-danger/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors",
    "focus-visible:outline-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:text-foreground",
        "hover:bg-white/[0.07] active:bg-white/[0.12]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

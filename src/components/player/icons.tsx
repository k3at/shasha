import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, className, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ?? "size-5"}
      {...props}
    >
      {children}
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 5.5 18.5 12 8 18.5v-13Z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
      <path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.8 7a7 7 0 0 1 0 10" />
    </Svg>
  );
}

export function MuteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" fill="currentColor" stroke="none" />
      <path d="m16 9 5 6M21 9l-5 6" />
    </Svg>
  );
}

export function FullscreenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </Svg>
  );
}

export function ExitFullscreenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </Svg>
  );
}

export function PipIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <rect x="12" y="11" width="7" height="6" rx="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 7h9M18 7h1M5 17h3M12 17h7" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  );
}

export function StarIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props}>
      <path
        d="m12 3.8 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.8Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function ChevronNextIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </Svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.2-1.2" />
    </Svg>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  );
}

export function TvIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M8 21h8M12 18v3" />
    </Svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function KeyboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 9.5v4M12 16.5h.01" />
    </Svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 16V4m0 0L7 9m5-5 5 5" />
      <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </Svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 11a8 8 0 1 0-2.3 6.3M20 4v7h-7" />
    </Svg>
  );
}

export function RadioIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15" />
    </Svg>
  );
}

export function ServerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="6.5" rx="2" />
      <rect x="4" y="13.5" width="16" height="6.5" rx="2" />
      <path d="M8 7.2h.01M8 16.8h.01M12 7.2h4M12 16.8h4" />
    </Svg>
  );
}

export function ArrowStartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  );
}

export function ArrowEndIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  );
}

export function LoaderIcon({ className, ...props }: IconProps) {
  return (
    <Svg className={className ?? "size-5 animate-spin"} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" strokeWidth={2.2} />
    </Svg>
  );
}

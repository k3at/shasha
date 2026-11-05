const countFormatter = new Intl.NumberFormat("ar-SA-u-nu-latn");

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatDuration(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "00:00";
  }

  const total = Math.floor(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts = [minutes, seconds].map((part) => String(part).padStart(2, "0"));

  return hours > 0 ? `${hours}:${parts.join(":")}` : parts.join(":");
}

export function formatBitrate(bitsPerSecond: number): string {
  if (!Number.isFinite(bitsPerSecond) || bitsPerSecond <= 0) {
    return "";
  }

  const megabits = bitsPerSecond / 1_000_000;

  return `${megabits.toFixed(megabits >= 10 ? 0 : 1)} Mbps`;
}

/** صيغة الجمع العربية المناسبة لعدد القنوات. */
export function formatChannelCount(value: number): string {
  if (value === 1) {
    return "قناة واحدة";
  }

  if (value === 2) {
    return "قناتان";
  }

  const remainder = value % 100;

  if (remainder >= 3 && remainder <= 10) {
    return `${formatCount(value)} قنوات`;
  }

  return `${formatCount(value)} قناة`;
}

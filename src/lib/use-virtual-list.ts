"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

type Range = { start: number; end: number };

/**
 * قائمة افتراضية خفيفة: ترسم الصفوف المرئية فقط، ما يجعل آلاف القنوات سلسة.
 * يستقبل الحاوية من المكوّن كي يبقى التعامل مع الـ ref واضحاً.
 */
export function useVirtualList(
  ref: RefObject<HTMLDivElement | null>,
  count: number,
  rowHeight: number,
  resetKey: string,
) {
  const [range, setRange] = useState<Range>({ start: 0, end: Math.min(count, 24) });

  const update = useCallback(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const overscan = 6;
    const start = Math.max(0, Math.floor(element.scrollTop / rowHeight) - overscan);
    const visible = Math.ceil(element.clientHeight / rowHeight) + overscan * 2;
    const end = Math.min(count, start + visible);

    setRange((current) =>
      current.start === start && current.end === end ? current : { start, end },
    );
  }, [count, ref, rowHeight]);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    element.scrollTop = 0;
    update();
  }, [resetKey, ref, update]);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, update]);

  return { range, onScroll: update };
}

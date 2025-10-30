// src/hooks/useOutsideClick.ts
import { useEffect } from "react";

/**
 * useOutsideClick
 * - ref: React.RefObject<HTMLElement>
 * - handler: () => void  (gọi khi click bên ngoài ref.current)
 * - deps: dependency array cho effect (tùy chọn)
 */
export default function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event?: MouseEvent | TouchEvent) => void,
  deps: any[] = []
) {
  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (!el) return;
      // Nếu click vào trong element thì bỏ qua
      if (event.target instanceof Node && el.contains(event.target)) {
        return;
      }
      handler(event);
    }

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, deps);
}

"use client";

import { useRef } from "react";

// A tilting, shimmering gift card that follows the pointer.
export default function GiftCard() {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 22}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div className="card-stage" aria-hidden="true">
      <div className="gift-card" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="gc-shine" />
        <div className="gc-ribbon-v" />
        <div className="gc-ribbon-h" />
        <div className="gc-top">
          <span className="gc-label">Gift Card</span>
          <span className="gc-chip" />
        </div>
        <div className="gc-amount">
          <span className="gc-currency">$</span>100
        </div>
        <div className="gc-bottom">
          <span>CSU · Computer Science</span>
          <span>×5</span>
        </div>
      </div>
    </div>
  );
}

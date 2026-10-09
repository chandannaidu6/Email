"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "submitting" | "done";

export default function RaffleForm({ token }: { token: string }) {
  const [email, setEmail] = useState("");
  const [completed, setCompleted] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "done") {
      doneRef.current?.focus();
      burstConfetti();
    }
  }, [status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!completed) {
      setError("Please confirm you completed the code review.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, completed, website, token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setEmail("");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="panel panel-done" role="status">
        <div className="check" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" />
            <path d="M15 27l7 7 15-16" />
          </svg>
        </div>
        <h2 ref={doneRef} tabIndex={-1}>
          You&rsquo;re in the drawing!
        </h2>
        <p>
          Thank you for taking part in the study. If you win, we&rsquo;ll email you to deliver your gift
          card. Your email is deleted after the drawing.
        </p>
        <p className="muted">You can close this tab now.</p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="panel" onSubmit={onSubmit} noValidate>
      <h2>Enter the drawing</h2>
      <p className="panel-sub">We only ask for one thing: an email address to reach you if you win.</p>

      <label className="field">
        <span>Email address</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
      </label>

      <label className="hp" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>

      <label className="confirm">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          disabled={submitting}
        />
        <span className="box" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </span>
        <span>I completed the CSU code review study and would like to enter the gift card drawing.</span>
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="submit" disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" aria-hidden="true" /> Entering…
          </>
        ) : (
          <>
            Enter the drawing
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h11M11 5l5 5-5 5" />
            </svg>
          </>
        )}
      </button>

      <p className="fine">
        Not connected to your study answers · Used only to notify winners · Deleted after the drawing
      </p>
    </form>
  );
}

function burstConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.remove();

  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const colors = ["#c8c372", "#e3df9c", "#4e9a63", "#8fd0a2", "#ffffff", "#f2c14e"];
  const pieces = Array.from({ length: 160 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 120,
    y: H * 0.45,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 16 - 6,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0],
  }));

  const start = performance.now();
  function frame(t: number) {
    const elapsed = t - start;
    ctx!.clearRect(0, 0, W, H);
    for (const p of pieces) {
      p.vy += 0.38;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx!.save();
      ctx!.globalAlpha = Math.max(0, 1 - elapsed / 3200);
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.r);
      ctx!.fillStyle = p.c;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      ctx!.restore();
    }
    if (elapsed < 3200) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

import GiftCard from "./GiftCard";
import RaffleForm from "./RaffleForm";
import LockedView from "./LockedView";
import { checkToken } from "../lib/token";

const FACTS = [
  { value: "$100", label: "gift card each" },
  { value: "5", label: "winners drawn" },
  { value: "~1 in 20", label: "approx. odds" },
];

const PROMISES = [
  {
    title: "Not linked to your answers",
    body: "This form is a separate site with separate storage. Your email is never connected to the review you just completed.",
    icon: (
      <path d="M9 15l6-6M8.5 6.5l1-1a4.24 4.24 0 016 6l-1 1M15.5 17.5l-1 1a4.24 4.24 0 01-6-6l1-1M4 4l16 16" />
    ),
  },
  {
    title: "Used only to reach winners",
    body: "We use it only to notify winners and deliver the gift card. No newsletters, no follow-ups, no sharing.",
    icon: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  },
  {
    title: "Deleted after the drawing",
    body: "Only your email address is stored. No name, IP address or timestamp is kept, and every entry is permanently deleted once the drawing is done.",
    icon: <path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const check = checkToken(t);

  // This page only renders the entry form for a visitor who arrived with
  // a valid, not-yet-used link minted by the study app's completion page.
  // A bare or guessed URL, an expired link, or a link someone already
  // used shows this message instead -- it never falls back to showing
  // the form.
  if (!check.ok) {
    return <LockedView reason={check.reason} />;
  }

  return (
    <main>
      <div className="backdrop" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid" />
      </div>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="dot" /> CSU Code Review Study · Optional
          </p>
          <h1>
            Thanks for reviewing.
            <br />
            <span className="accent">Enter the drawing.</span>
          </h1>
          <p className="lede">
            As a thank-you for completing the review, you can enter a drawing for one of five $100 gift
            cards. It takes ten seconds and is completely optional.
          </p>

          <ul className="facts">
            {FACTS.map((f) => (
              <li key={f.label}>
                <strong>{f.value}</strong>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <GiftCard />
        </div>

        <RaffleForm token={t!} />
      </section>

      <section className="promises" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Your privacy, in plain terms</h2>
        <div className="promise-grid">
          {PROMISES.map((p) => (
            <article key={p.title} className="promise">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {p.icon}
              </svg>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <p>
          Entry is open to participants who completed the code review with valid answers. You do not have
          to enter the drawing, and not entering has no effect on your participation.
        </p>
        <p>
          Questions? Contact Fabio De Abreu Santos, Research Scholar, Colorado State University, at{" "}
          <a href="mailto:fabio.deabreusantos@colostate.edu">fabio.deabreusantos@colostate.edu</a> or (970)
          491-8791. For questions about your rights as a research volunteer, contact the CSU IRB at{" "}
          <a href="mailto:CSU_IRB@colostate.edu">CSU_IRB@colostate.edu</a>.
        </p>
      </footer>
    </main>
  );
}

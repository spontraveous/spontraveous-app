import { useMemo, useState } from "react";
import { experiences } from "./data/experiences";

const vibes = ["SURPRISE", "CHILL", "WEIRD", "ROMANTIC", "WILD"];

function pickExperience(vibe, budget, previous) {
  const pool = experiences.filter((x) =>
    (vibe === "SURPRISE" || x.tags.includes(vibe.toLowerCase())) &&
    (!budget || budget === "ANY" || x.price === budget)
  );
  const candidates = pool.length ? pool : experiences;
  const fresh = candidates.filter((x) => x.id !== previous?.id);
  return (fresh.length ? fresh : candidates)[Math.floor(Math.random() * (fresh.length ? fresh : candidates).length)];
}

export default function App() {
  const [location, setLocation] = useState("NYC");
  const [when, setWhen] = useState("RIGHT NOW");
  const [vibe, setVibe] = useState("SURPRISE");
  const [budget, setBudget] = useState("ANY");
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = useMemo(() => result ? "result" : "home", [result]);

  function spin() {
    setSpinning(true);
    setCopied(false);
    window.setTimeout(() => {
      setResult(pickExperience(vibe, budget, result));
      setSpinning(false);
    }, 650);
  }

  async function share() {
    const text = result
      ? `I got SPONTRAVEOUS. It picked “${result.title}” in ${result.place}. Would you do it?`
      : "I got SPONTRAVEOUS. Surprise me.";
    if (navigator.share) {
      await navigator.share({ title: "Spontraveous", text, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(text + " " + window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <main className={status}>
      <nav className="nav">
        <div className="logo">SPONTRAVEOUS<span>®</span></div>
        <button className="ghost" onClick={() => setResult(null)}>START OVER</button>
      </nav>

      {!result ? (
        <section className="hero">
          <div className="eyebrow">THE ANTI-ITINERARY</div>
          <h1>YOU WEREN'T<br/><em>PLANNING</em><br/>TO GO ANYWHERE.</h1>
          <p className="lede">Good. Tell us where + when. We'll find something worth booking.</p>

          <section className="controls">
            <label><span>WHERE</span><input value={location} onChange={e => setLocation(e.target.value)} aria-label="Where" /></label>
            <label><span>WHEN</span><select value={when} onChange={e => setWhen(e.target.value)}><option>RIGHT NOW</option><option>TONIGHT</option><option>TOMORROW</option><option>THIS WEEKEND</option></select></label>
          </section>

          <div className="chips">
            {vibes.map(v => <button key={v} className={vibe === v ? "chip active" : "chip"} onClick={() => setVibe(v)}>{v}</button>)}
          </div>

          <div className="budget">
            {["ANY", "$", "$$", "$$$"].map(b => <button key={b} className={budget === b ? "budget-btn active" : "budget-btn"} onClick={() => setBudget(b)}>{b}</button>)}
          </div>

          <button className={spinning ? "spin spinning" : "spin"} onClick={spin} disabled={spinning}>
            <span>{spinning ? "..." : "SPIN"}</span>
            <small>{spinning ? "FINDING YOUR MOVE" : "SURPRISE ME"}</small>
          </button>
          <p className="fine">No itinerary. No overthinking. Just go.</p>
        </section>
      ) : (
        <section className="result-wrap">
          <div className="eyebrow">YOU'VE BEEN</div>
          <h1>SPONTRAVEOUS.</h1>
          <article className="card">
            <div className="card-top"><span>{result.icon} &nbsp;{result.category}</span><span>{result.price}</span></div>
            <div className="big-icon">{result.icon}</div>
            <h2>{result.title}</h2>
            <p className="meta">{result.place} · {result.time} · {result.duration}</p>
            <div className="card-actions">
              <button className="primary" onClick={() => alert("Booking links will connect to live inventory next.")}>DO IT →</button>
              <button className="secondary" onClick={spin}>NOPE, SPIN AGAIN</button>
            </div>
          </article>
          <div className="share-row">
            <button onClick={share}>{copied ? "COPIED!" : "↗ SHARE THIS PLAN"}</button>
            <span>Would you do it?</span>
          </div>
          <p className="disclaimer">Prototype inventory · live booking integrations coming next.</p>
        </section>
      )}
    </main>
  );
}
import {
  Check,
  Layers3,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { ProviderIcon } from "./Brand";
export default function Home({ onStart }: { onStart: () => void }) {
  return (
    <main className="home-main">
      <section className="hero">
        <div className="eyebrow">
          <span className="status-dot" /> ONE CLEAR VIEW OF YOUR CLOUD
        </div>
        <h1>
          More clouds.
          <br />
          Less uncertainty<span className="text-sage">.</span>
        </h1>
        <p className="hero-copy">
          A little clarity goes a long way. Find security gaps across
          <br className="hidden sm:block" /> your cloud accounts, and know
          exactly where to start.
        </p>
        <button className="button primary hero-button" onClick={onStart}>
          Get started <ScanLine size={18} />
        </button>
        <div className="hero-note">
          <ShieldCheck size={14} /> Read-only inventory scans <span>·</span> No
          cloud credentials needed
        </div>
        <div
          className="cloud-visual"
          aria-label="AWS, Azure and Google Cloud connected to one security view"
        >
          <div className="visual-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="connection horizontal" />
          <div className="connection vertical" />
          <div className="cloud-node node-aws">
            <ProviderIcon provider="aws" />
            <span>Amazon Web Services</span>
            <span className="node-check">
              <Check size={12} />
            </span>
          </div>
          <div className="cloud-node node-azure">
            <ProviderIcon provider="azure" />
            <span>Microsoft Azure</span>
            <span className="node-check">
              <Check size={12} />
            </span>
          </div>
          <div className="cloud-node node-gcp">
            <ProviderIcon provider="gcp" />
            <span>Google Cloud</span>
            <span className="node-check">
              <Check size={12} />
            </span>
          </div>
          <div className="central-shield">
            <ShieldCheck size={38} strokeWidth={1.3} />
          </div>
          <span className="visual-caption">
            Different clouds. One perspective.
          </span>
        </div>
      </section>
      <section className="features" aria-label="How Mini Gauntlet works">
        <Feature
          icon={<Layers3 size={21} />}
          title="Bring your clouds together"
          text="Scan AWS, Azure and Google Cloud together. Get a consistent view across all your accounts."
        />
        <Feature
          icon={<ScanLine size={21} />}
          title="Check what matters"
          text="Run 10 focused security checks for public exposure, access controls, and more."
        />
        <Feature
          icon={<SlidersHorizontal size={21} />}
          title="Find your next step"
          text="See clear findings, filter the noise, and understand what needs your attention."
        />
      </section>
      <div className="home-bottom">
        <span>BUILT FOR CLARITY, NOT COMPLEXITY</span>
        <span>
          3 cloud providers <i /> 10 security checks <i /> One simple workspace
        </span>
      </div>
    </main>
  );
}
function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="feature">
      <span className="feature-icon">{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

import { ShieldCheck, Cloud } from "lucide-react";
import type { Provider } from "../lib/types";
export function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="brand-mark">
        <ShieldCheck size={22} strokeWidth={1.7} />
      </span>
      <span className="text-lg font-semibold tracking-tight">
        mini gauntlet<span className="text-sage">.</span>
      </span>
    </span>
  );
}
export function ProviderIcon({
  provider,
  className = "",
}: {
  provider: Provider;
  className?: string;
}) {
  if (provider === "aws")
    return (
      <span aria-hidden="true" className={`provider-icon aws ${className}`}>
        <span>aws</span>
        <i />
      </span>
    );
  if (provider === "azure")
    return (
      <span aria-hidden="true" className={`provider-icon ${className}`}>
        <svg viewBox="0 0 32 32" width="33" height="33">
          <path fill="#1689d5" d="M13 3h9L11 25H2z" />
          <path fill="#0874bd" d="m20 3 10 26H13l4-7h5L16 9z" />
        </svg>
      </span>
    );
  return (
    <span aria-hidden="true" className={`provider-icon ${className}`}>
      <Cloud size={35} className="text-blue-500" strokeWidth={2.8} />
      <span className="gcp-stripe" />
    </span>
  );
}

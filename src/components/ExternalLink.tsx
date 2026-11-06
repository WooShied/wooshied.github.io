import type { AnchorHTMLAttributes } from "react";

/** Opens in a new tab without leaking the referrer or window handle. */
export function ExternalLink({ children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...rest} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

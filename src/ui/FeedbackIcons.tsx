export function SuccessBadge() {
  return <svg className="success-badge-icon success-trophy" width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <g stroke="#141414" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M14 10H6V17C6 23 10 27 17 27V22C13 22 11 20 11 16V15H14Z" fill="#fbbf24" />
      <path d="M34 10H42V17C42 23 38 27 31 27V22C35 22 37 20 37 16V15H34Z" fill="#fbbf24" />
      <path d="M21 28H27V38H21Z" fill="#ca8a04" />
      <path d="M14 7H34V18C34 25 30 30 24 30C18 30 14 25 14 18Z" fill="#fde047" />
      <path d="M16 37H32L35 43H13Z" fill="#fbbf24" />
      <path d="M13 7H35" strokeLinecap="round" />
    </g>
    <path d="M18 12V18C18 22 20 25 22 26" stroke="#fff7cc" strokeWidth="2.5" strokeLinecap="round" />
  </svg>;
}

export function HintIcon() {
  return <svg className="hint-inline-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="15" height="18" rx="2" fill="#fff7e5" stroke="#141414" strokeWidth="1.6" />
    <rect x="8" y="2" width="7" height="4" rx="1" fill="#bae6fd" stroke="#141414" strokeWidth="1.5" />
    <path d="M7 10H13M7 14H10" stroke="#141414" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12 16L18 10L21 13L15 19L11 20Z" fill="#fde047" stroke="#141414" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M17 11L20 14" stroke="#141414" strokeWidth="1.4" />
  </svg>;
}

export function BookIcon() {
  return (
    <svg
      className="book-inline-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* Left page */}
      <path
        d="M2.5 5.5C2.5 4.4 3.4 3.5 4.5 3.5H10C11.1 3.5 12 4.4 12 5.5V19.5C12 18.7 11.3 18 10.5 18H4.5C3.4 18 2.5 17.1 2.5 16V5.5Z"
        fill="#ffffff"
        stroke="#141414"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Right page (sky blue tint like reference) */}
      <path
        d="M21.5 5.5C21.5 4.4 20.6 3.5 19.5 3.5H14C12.9 3.5 12 4.4 12 5.5V19.5C12 18.7 12.7 18 13.5 18H19.5C20.6 18 21.5 17.1 21.5 16V5.5Z"
        fill="#bae6fd"
        stroke="#141414"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Bottom book cover lip */}
      <path
        d="M3 18.5H21"
        stroke="#35a7f4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}


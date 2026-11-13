export function SuccessBadge() {
  return (
    <svg
      className="success-badge-icon"
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      {/* Top-left pink sparkle */}
      <path
        d="M6.5 4L7.7 6.8L10.5 8L7.7 9.2L6.5 12L5.3 9.2L2.5 8L5.3 6.8L6.5 4Z"
        fill="#fb85c6"
        stroke="#141414"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Top-right orange sparkle */}
      <path
        d="M34 5L35 7.3L37.3 8.3L35 9.3L34 11.6L33 9.3L30.7 8.3L33 7.3L34 5Z"
        fill="#f97316"
        stroke="#141414"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Bottom-left purple dot */}
      <circle
        cx="5.5"
        cy="30.5"
        r="2.3"
        fill="#8c52ff"
        stroke="#141414"
        strokeWidth="1.6"
      />
      {/* 3D bottom shadow layer of main badge */}
      <circle
        cx="20"
        cy="23"
        r="13.5"
        fill="#15803d"
        stroke="#141414"
        strokeWidth="2.2"
      />
      {/* Main golden star-circle badge */}
      <circle
        cx="20"
        cy="19.5"
        r="13.5"
        fill="#fde047"
        stroke="#141414"
        strokeWidth="2.2"
      />
      {/* Inner green circle */}
      <circle
        cx="20"
        cy="19.5"
        r="9.8"
        fill="#4ade80"
        stroke="#141414"
        strokeWidth="2"
      />
      {/* Chunky white checkmark with dark outline */}
      <path
        d="M15.2 19.8L18.5 23.1L25.2 16.2"
        stroke="#141414"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 19.8L18.5 23.1L25.2 16.2"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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


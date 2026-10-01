export default function Alpaca({ mood }: { mood: 'focus' | 'break' }) {
  return (
    <svg viewBox="0 0 200 170" className="mx-auto w-48" aria-hidden="true">
      <g fill="#faf6f0">
        <circle cx="100" cy="100" r="68" /><circle cx="52" cy="88" r="34" /><circle cx="148" cy="88" r="34" />
        <circle cx="72" cy="48" r="32" /><circle cx="128" cy="48" r="32" /><circle cx="100" cy="36" r="34" />
      </g>
      <ellipse cx="100" cy="104" rx="42" ry="46" fill="#f7d9bb" />
      <ellipse cx="100" cy="122" rx="22" ry="16" fill="#fdebd0" />
      <ellipse cx="100" cy="112" rx="9" ry="6" fill="#4a2f3d" />
      <path d="M92 124q8 8 16 0" stroke="#4a2f3d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="68" cy="114" r="8" fill="#f4a77a" opacity=".6" />
      <circle cx="132" cy="114" r="8" fill="#f4a77a" opacity=".6" />
      {mood === 'focus' ? (
        <>
          <rect x="60" y="88" width="80" height="16" rx="8" fill="#9cc3dd" opacity=".75" />
          <path d="M72 98q9-9 18 0M110 98q9-9 18 0" stroke="#4a2f3d" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="81" cy="98" r="4.5" fill="#4a2f3d" />
          <circle cx="119" cy="98" r="4.5" fill="#4a2f3d" />
        </>
      )}
    </svg>
  )
}
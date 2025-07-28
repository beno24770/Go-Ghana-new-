export function Logo() {
  return (
    <div className="flex items-center gap-2" style={{ width: '250px' }}>
      <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <g>
          {/* Simplified Map Pin */}
          <circle cx="40" cy="40" r="35" fill="#006837" />
          <circle cx="40" cy="40" r="25" fill="#fbb040" />
          <circle cx="40" cy="40" r="15" fill="#fff" />
          <circle cx="40" cy="40" r="10" fill="#fbb040" />
           <path d="M 40 5 L 40 75" stroke="#c1272d" strokeWidth="4" />
           <path d="M 5 40 L 75 40" stroke="#c1272d" strokeWidth="4" />


          {/* Text */}
          <text x="85" y="45" fontFamily="Verdana, sans-serif" fontSize="32" fontWeight="bold" fill="#006837">
            Go
          </text>
          <text x="140" y="45" fontFamily="Verdana, sans-serif" fontSize="32" fontWeight="bold" fill="#c1272d">
            Ghana
          </text>
          <text x="85" y="68" fontFamily="Verdana, sans-serif" fontSize="14" fill="#fff">
            Your Journey, Your Way
          </text>
        </g>
      </svg>
    </div>
  );
}

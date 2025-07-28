export function Logo() {
  return (
    <div className="flex items-center gap-2" style={{ width: '250px' }}>
      <svg viewBox="0 0 213 80" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, -2)">
          {/* Map Pin */}
          <g transform="scale(0.8) translate(5, 5)">
            <path 
              d="M40 80C17.909 80 0 62.091 0 40S17.909 0 40 0s40 17.909 40 40-17.909 40-40 40zm0-75C20.67 5 5 20.67 5 40s15.67 35 35 35 35-15.67 35-35S59.33 5 40 5z" 
              transform="matrix(.72498 0 0 .72498 2.158 5.86)" 
              fill="#006837"
            />
            <path 
              d="M41.523 79.432c-15.05 0-27.248-12.198-27.248-27.248S26.473 25 41.523 25s27.248 12.198 27.248 27.248-12.198 27.184-27.248 27.184z" 
              transform="matrix(.72498 0 0 .72498 2.158 5.86)" 
              fill="#fbb040"
            />
            <path 
              d="M40.083 61.27c-8.995 0-16.27-7.275-16.27-16.27s7.275-16.27 16.27-16.27 16.27 7.275 16.27 16.27-7.275 16.27-16.27 16.27z" 
              transform="matrix(.72498 0 0 .72498 2.158 5.86)" 
              fill="#fff"
            />
            <path 
              d="M39.695 56.41c-6.286 0-11.375-5.088-11.375-11.374s5.09-11.374 11.374-11.374c6.287 0 11.375 5.088 11.375 11.374s-5.089 11.374-11.375 11.374z" 
              transform="matrix(.72498 0 0 .72498 2.158 5.86)" 
              fill="#fbb040"
            />
            <path 
              d="M33.642 56.666a2.05 2.05 0 01-1.44-.602L18.007 41.87a2.05 2.05 0 012.898-2.898l12.747 12.747a2.05 2.05 0 01-1.45 3.499z" 
              transform="matrix(.72498 0 0 .72498 2.158 5.86)" 
              fill="#fbb040"
            />
             <path
              fill="#006837"
              d="M32.53,61.5 A30,30 0 1,1 32.53,1.5 A30,30 0 0,1 32.53,61.5 M32.53,0 C14.56,0,0,14.56,0,32.53 s14.56,32.53,32.53,32.53 c17.96,0,32.53-14.56,32.53-32.53v-0.01C64.82,14.63,50.32,0.24,32.53,0L32.53,0z M32.53,61.5 A30,30 0 1,1 32.53,1.5 A30,30 0 0,1 32.53,61.5 M32.53,0 C14.56,0,0,14.56,0,32.53 s14.56,32.53,32.53,32.53 c17.96,0,32.53-14.56,32.53-32.53v-0.01C64.82,14.63,50.32,0.24,32.53,0L32.53,0z"
              transform="matrix(0.85, 0, 0, 0.85, -2, 4.5) rotate(45, 32.5, 32.5)"
            />
             <path
              d="M32.5 65 C32.5 65, 32.5 80, 32.5 80 C32.5 80, 20 70, 32.5 65"
              fill="#006837"
              transform="matrix(0.8, 0, 0, 0.9, 0, -2) translate(-1, 0) rotate(45, 32.5, 32.5)"
            />
            <circle cx="21" cy="56" r="3" fill="#006837" />
          </g>

          {/* Text */}
          <g transform="translate(60, 0)">
            <text x="5" y="40" fontFamily="Verdana, sans-serif" fontSize="32" fontWeight="bold" fill="#006837">
              Go
            </text>
            <text x="55" y="40" fontFamily="Verdana, sans-serif" fontSize="32" fontWeight="bold" fill="#c1272d">
              Ghana
            </text>
            <text x="5" y="65" fontFamily="Verdana, sans-serif" fontSize="14" fill="#231F20">
              Your Journey, Your Way
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

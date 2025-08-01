
export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="48"
        height="48"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-lg"
      >
        <defs>
          <clipPath id="rounded-rect">
            <rect width="100" height="100" rx="20" ry="20" />
          </clipPath>
        </defs>

        <g clipPath="url(#rounded-rect)">
          {/* Background with Ghana flag colors */}
          <rect width="100" height="33.3" y="0" fill="hsl(var(--primary))" /> {/* Kente Red */}
          <rect width="100" height="33.4" y="33.3" fill="hsl(var(--secondary))" /> {/* Royal Gold */}
          <rect width="100" height="33.3" y="66.7" fill="#006B3F" /> {/* Ghana Green */}
          
           {/* Traveler Silhouette - Simplified and Bolder */}
            <g transform="translate(15, 15) scale(0.7)">
                <path d="M57.3,39.4c-0.6-0.6-1.3-1.1-2-1.6c-2.3-1.6-4.9-2.8-7.6-3.6c-2-0.6-4-1-6-1.1c-2.6-0.1-5.2,0.4-7.6,1.4   c-2.8,1.2-5.3,2.9-7.4,5.1c-1.8,1.9-3.1,4.2-3.8,6.7c-0.5,1.6-0.7,3.3-0.7,5c0,2.1,0.4,4.2,1.2,6.1c0.7,1.8,1.8,3.4,3.1,4.9   c1.6,1.7,3.5,3.1,5.6,4.1c2.4,1.1,5,1.7,7.7,1.7c2.9,0,5.7-0.7,8.3-2.1c2.8-1.5,5.2-3.6,7-6.2c1.4-2,2.3-4.4,2.7-6.8   c0.4-2.7,0.2-5.4-0.6-8C60.4,44,59.2,41.4,57.3,39.4z" fill="#000000"/>
                <path d="M47.7,29.9c-2.1-0.9-4.3-1.4-6.5-1.4c-2.9,0-5.7,0.9-8.2,2.5c-2.7,1.8-5,4.2-6.6,7.1c-1.3,2.3-2,4.9-2,7.6   c0,2.9,0.7,5.7,2,8.2c0.2-1.6,0.6-3.2,1.1-4.7c0.8-2.2,2-4.2,3.5-6c1.3-1.6,2.8-2.9,4.5-4c2-1.2,4.2-2,6.5-2.2   c1.9-0.2,3.8,0.2,5.5,1c0.7,0.3,1.4,0.7,2,1.1C50.1,36.5,48.8,33,47.7,29.9z" fill="#000000"/>
                <polygon points="46.3,51.8 40.8,55.9 42.6,49.5 37.2,45.4 43.8,45.4 46.3,39 48.8,45.4 55.4,45.4 50,49.5 51.8,55.9" fill="#000000"/>
            </g>
        </g>
      </svg>
      <div className="flex flex-col">
        <h1 className="font-headline text-3xl font-bold tracking-tight -mb-1">
          <span className="text-primary">Go</span>
          <span className="text-secondary">Ghana</span>
        </h1>
        <p className="text-xs text-muted-foreground">Your Trusted Travel Planner</p>
      </div>
    </div>
  );
}

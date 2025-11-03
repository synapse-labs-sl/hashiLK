function BridgeLogo({ className = "w-12 h-12" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left H forming bridge arch */}
      <path 
        d="M20 20 L20 50 Q20 60 30 60 L40 60 Q50 60 50 50 L50 20" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
        fill="none"
        className="text-white"
      />
      
      {/* Right H forming bridge arch (mirrored) */}
      <path 
        d="M80 20 L80 50 Q80 60 70 60 L60 60 Q50 60 50 50 L50 20" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round"
        fill="none"
        className="text-white"
      />
      
      {/* Connecting bridge deck */}
      <path 
        d="M30 40 L70 40" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round"
        className="text-accent-light"
      />
      
      {/* Gokkola weave pattern (subtle) */}
      <path 
        d="M35 35 L40 40 L35 45 M45 35 L50 40 L45 45 M55 35 L60 40 L55 45 M65 35 L70 40 L65 45" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round"
        fill="none"
        className="text-white opacity-30"
      />
      
      {/* Foundation dots */}
      <circle cx="30" cy="65" r="3" fill="currentColor" className="text-accent" />
      <circle cx="50" cy="65" r="3" fill="currentColor" className="text-accent" />
      <circle cx="70" cy="65" r="3" fill="currentColor" className="text-accent" />
    </svg>
  );
}

export default BridgeLogo;

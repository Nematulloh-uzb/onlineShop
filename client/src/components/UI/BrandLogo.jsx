export default function BrandLogo({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 260 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="6"
        y="32"
        fill="currentColor"
        fontFamily="Cinzel, Georgia, serif"
        fontSize="30"
        fontWeight="700"
        letterSpacing="0.26em"
      >
        VERDE
      </text>
      <circle cx="161" cy="22" r="4.5" fill="#8A9A5B" />
      <text
        x="8"
        y="47"
        fill="#8A9A5B"
        fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
        fontSize="8"
        fontWeight="600"
        letterSpacing="0.42em"
      >
        LUXE NATURE
      </text>
    </svg>
  );
}

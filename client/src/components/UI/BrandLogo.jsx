export default function BrandLogo({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 220 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="10"
        y="35"
        fill="currentColor"
        fontFamily="'Cormorant Garamond', 'Playfair Display', serif"
        fontSize="38"
        fontWeight="700"
        letterSpacing="0.18em"
      >
        AURA
      </text>
      <path d="M188 18C188 18 198 20 197 31C193 31 187 29 188 18Z" fill="#8A9A5B" />
      <circle cx="184" cy="30" r="3.5" fill="#8A9A5B" />
      <text
        x="12"
        y="49"
        fill="#8A9A5B"
        fontFamily="Montserrat, Inter, sans-serif"
        fontSize="9"
        fontWeight="600"
        letterSpacing="0.35em"
      >
        ECO ATELIER
      </text>
    </svg>
  );
}

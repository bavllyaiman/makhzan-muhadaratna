import React from "react";

interface Props {
  logoId: string;
  className?: string;
}

export default function ScoutLogo({ logoId, className = "w-20 h-20" }: Props) {

  const logos: Record<string, React.ReactNode> = {
    "al-oqab": (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M60 10C60 10 20 35 15 55C10 75 25 85 35 80C45 75 50 65 55 60C55 60 50 50 55 40C60 30 65 35 60 45C65 40 70 35 75 40C80 45 75 55 70 60C70 60 75 70 80 75C85 80 95 70 90 55C85 35 60 10 60 10Z" fill="currentColor" />
        <path d="M35 80C35 80 25 95 30 105C35 110 45 105 50 100C55 95 55 85 55 80" fill="currentColor" />
        <path d="M85 80C85 80 95 95 90 105C85 110 75 105 70 100C65 95 65 85 65 80" fill="currentColor" />
        <path d="M50 100C50 100 55 110 60 115C65 110 70 100 70 100" fill="currentColor" />
      </svg>
    ),
    "al-bawashiq": (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M60 15C60 15 25 35 20 55C15 70 30 80 40 75C45 72 50 60 55 55C55 55 52 48 55 42C58 36 63 38 60 45C63 40 68 38 72 42C76 46 73 52 70 58C70 58 73 65 78 70C83 75 93 67 88 52C83 35 60 15 60 15Z" fill="currentColor" />
        <path d="M40 75C40 75 32 90 36 100C40 105 48 100 52 94C55 88 54 80 52 75" fill="currentColor" />
        <path d="M80 75C80 75 88 90 84 100C80 105 72 100 68 94C65 88 66 80 68 75" fill="currentColor" />
        <circle cx="55" cy="45" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="65" cy="45" r="3" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    "al-ghurab": (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M60 5C60 5 20 30 15 55C10 75 25 85 40 78C45 75 50 65 55 58C55 58 52 50 55 42C58 34 63 36 60 44C63 38 68 36 73 40C78 44 75 52 72 58C72 58 75 66 80 72C85 78 95 70 90 52C85 32 60 5 60 5Z" fill="currentColor" />
        <path d="M38 78C38 78 30 92 34 102C38 107 46 103 50 97C53 91 52 83 50 78" fill="currentColor" />
        <path d="M82 78C82 78 90 92 86 102C82 107 74 103 70 97C67 91 68 83 70 78" fill="currentColor" />
        <circle cx="52" cy="42" r="2.5" fill="currentColor" opacity="0.3" />
        <circle cx="68" cy="42" r="2.5" fill="currentColor" opacity="0.3" />
        <path d="M45 50 L60 55 L75 50" fill="currentColor" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    "al-shahin": (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M60 20C60 20 15 40 10 60C5 75 22 80 32 75C38 72 45 60 50 55C50 55 47 48 50 40C53 32 58 34 55 42C58 36 63 33 68 37C73 41 70 49 67 55C67 55 70 63 75 69C80 75 95 68 90 50C85 32 60 20 60 20Z" fill="currentColor" />
        <path d="M32 75C32 75 22 88 26 100C30 106 38 101 42 95C45 89 44 80 42 75" fill="currentColor" />
        <path d="M75 69C75 69 85 82 81 94C77 100 69 96 65 90C62 84 63 76 65 71" fill="currentColor" />
        <path d="M60 42 L60 60 L68 66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="38" r="5" fill="currentColor" />
      </svg>
    ),
    "al-nusur": (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M30 50C30 50 10 35 15 55C18 70 35 78 42 72C46 68 50 58 54 52C54 52 52 45 55 38C58 31 62 33 60 40C62 35 66 32 71 36C76 40 73 48 70 54C70 54 73 62 78 68C83 74 95 66 90 50C86 35 72 25 60 20C48 25 34 35 30 50Z" fill="currentColor" />
        <path d="M42 72C42 72 35 85 38 98C41 104 48 99 52 93C54 87 53 78 51 72" fill="currentColor" />
        <path d="M78 68C78 68 85 85 82 98C79 104 72 99 68 93C66 87 67 78 69 72" fill="currentColor" />
        <path d="M48 60 L60 65 L72 60" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    "al-suqur": (
      <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M60 15C60 15 18 38 13 58C8 73 24 82 35 76C40 73 46 62 52 56C52 56 49 48 52 40C55 32 60 34 57 42C60 36 65 33 70 38C75 43 72 51 68 57C68 57 72 66 77 72C82 78 96 68 90 52C85 35 60 15 60 15Z" fill="currentColor" />
        <path d="M35 76C35 76 25 92 30 104C34 109 43 104 47 97C50 90 49 82 47 76" fill="currentColor" />
        <path d="M77 72C77 72 87 88 82 100C78 106 69 101 65 94C62 88 63 80 65 74" fill="currentColor" />
        <path d="M45 52 L60 48 L75 52" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="34" r="4" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  };

  const fallback = (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.2" />
      <path d="M60 30C60 30 35 45 35 60C35 75 45 80 50 75C55 70 55 60 60 55C65 60 65 70 70 75C75 80 85 75 85 60C85 45 60 30 60 30Z" fill="currentColor" />
    </svg>
  );

  return logos[logoId] || fallback;
}
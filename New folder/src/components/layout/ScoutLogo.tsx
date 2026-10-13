import { Compass } from 'lucide-react';

/** Placeholder mark for the scout logo — swap for the official SVG/emblem. */
export function ScoutLogo({ condensed = false }: { condensed?: boolean }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span
        className={`grid place-items-center rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700
                    text-white shadow-sm transition-all duration-300
                    ${condensed ? 'h-9 w-9' : 'h-11 w-11'}`}
      >
        <Compass className={condensed ? 'h-5 w-5' : 'h-6 w-6'} strokeWidth={2.2} />
      </span>
      <span
        className={`mt-1 font-display font-bold text-forest-800 transition-all duration-300
          ${condensed ? 'text-sm' : 'text-base'}`}
      >
        دوري الكشافة
      </span>
    </span>
  );
}
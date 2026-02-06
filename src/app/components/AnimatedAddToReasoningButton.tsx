import { useEffect, useRef } from 'react';

interface InsertCitationButtonProps {
  onClick: () => void;
  autoFocus?: boolean;
  className?: string;
}

/**
 * "Insert citation" button component
 *
 * Simple button that can be triggered by click or Enter key.
 * Auto-focuses when mounted so user can press Enter immediately after naming citation.
 *
 * User flow:
 * 1. User types citation title and presses Enter → saves title
 * 2. This button appears and auto-focuses
 * 3. User presses Enter again → inserts citation into reasoning
 */
export function AnimatedAddToReasoningButton({
  onClick,
  autoFocus = true,
  className = ''
}: InsertCitationButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus when button appears so Enter works immediately
  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-[6px] py-[2px] rounded-[5px]
        hover:bg-[rgba(0,0,0,0.08)] transition-colors shrink-0
        focus:outline-none focus:shadow-[0_0_0_2px_rgba(0,0,0,0.14)]
        ${className}
      `}
    >
      {/* Add citation icon */}
      <img src="/icon_citation.svg" alt="Add citation" className="w-[13px] h-[13px] shrink-0" />

      {/* Button text */}
      <span className="text-[13px] leading-[19px] font-[475] text-[#141414] whitespace-nowrap">
        Insert citation
      </span>
    </button>
  );
}

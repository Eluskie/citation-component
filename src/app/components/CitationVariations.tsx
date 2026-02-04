import { useRef, useState, useEffect } from 'react';
import { Plus, PanelRight } from 'lucide-react';

export const getCitationHtml = (number: number) =>
  `<span class="inline-flex items-center justify-center bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 mx-1 text-[11px] font-[500] select-none" contenteditable="false">${number}</span>`;

export const DraggableChip = ({ number }: { number: number }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('text/html', getCitationHtml(number));
      e.dataTransfer.effectAllowed = 'copy';
    }}
    className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform select-none"
    title={`Drag citation ${number}`}
  >
    <div className="bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 text-[11px] font-[500] min-w-[18px] text-center hover:bg-[#DCDCDC] transition-colors">
      {number}
    </div>
  </div>
);

// Helper range
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

// --- Citation Tools (right side) for scroll-strip and popover modes ---
const ScrollStripCitations = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const check = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 5);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    check();
    const t = setTimeout(check, 100);
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('resize', check); clearTimeout(t); };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#525252] shrink-0">Insert citation</span>

      <div className="relative max-w-[350px]">
        <div className={`absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity ${showLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity ${showRight ? 'opacity-100' : 'opacity-0'}`} />

        <div
          ref={scrollRef}
          onScroll={check}
          className="flex items-center gap-2 overflow-x-auto pb-0 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {range(1, 15).map((num) => (
            <DraggableChip key={num} number={num} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PopoverCitations = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, number: number) => {
    e.dataTransfer.setData('text/html', getCitationHtml(number));
    e.dataTransfer.effectAllowed = 'copy';
    // Delay closing the popover so the drag operation can initialize first
    setTimeout(() => setIsOpen(false), 0);
  };

  return (
    <div className="relative flex items-center gap-3">
      <span className="text-[13px] text-[#525252] shrink-0">Insert citation</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[13px] text-[#141414] transition-colors"
      >
        <Plus size={14} />
        <span>Add</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 p-2 bg-white rounded shadow-lg border border-gray-200 flex flex-wrap gap-2 w-[200px] z-50">
            {range(1, 15).map((num) => (
              <div
                key={num}
                draggable
                onDragStart={(e) => handleDragStart(e, num)}
                className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform select-none"
                title={`Drag citation ${num}`}
              >
                <div className="bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 text-[11px] font-[500] min-w-[18px] text-center hover:bg-[#DCDCDC] transition-colors">
                  {num}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- Unified Citation Header: Label on left, citation tools on right ---
interface CitationHeaderProps {
  label: string;
  mode: 'scroll-strip' | 'sidebar' | 'popover';
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
}

export const CitationHeader = ({ label, mode, sidebarVisible, onToggleSidebar }: CitationHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      {/* Label on the left */}
      <span className="text-[13px] font-[500] text-[#141414]">{label}</span>

      {/* Citation tools on the right */}
      {mode === 'scroll-strip' && <ScrollStripCitations />}
      {mode === 'popover' && <PopoverCitations />}
      {mode === 'sidebar' && (
        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 text-[13px] transition-colors ${
            sidebarVisible ? 'text-[#141414]' : 'text-[#8A8A8A] hover:text-[#525252]'
          }`}
        >
          <PanelRight size={16} strokeWidth={1.5} />
          <span>Insert citation</span>
        </button>
      )}
    </div>
  );
};

// --- 2. Sidebar Variation (In-Editor Sidebar) ---
// Minimalist floating citation chips inside the editor area
// No borders, backgrounds, or titles - chips appear to float over the white editor background
const SidebarChip = ({ number }: { number: number }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('text/html', getCitationHtml(number));
      e.dataTransfer.effectAllowed = 'copy';
    }}
    className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform select-none"
    title={`Drag citation ${number}`}
  >
    <div className="bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 text-[11px] font-[500] min-w-[20px] text-center hover:bg-[#DCDCDC] transition-colors">
      {number}
    </div>
  </div>
);

interface SidebarVariationProps {
  visible?: boolean;
}

export const SidebarVariation = ({ visible = true }: SidebarVariationProps) => {
  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-[40px] flex flex-col items-center gap-1.5 py-1 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-300 ease-out ${
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full pointer-events-none'
      }`}
    >
      {range(1, 15).map((num) => (
        <SidebarChip key={num} number={num} />
      ))}
    </div>
  );
};

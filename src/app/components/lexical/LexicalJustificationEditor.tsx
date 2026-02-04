import { useState, useCallback, useRef, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  EditorState,
  LexicalEditor,
} from 'lexical';
import { Plus, PanelRight } from 'lucide-react';
import { CitationNode, $createCitationNode, CITATION_NODE_VERSION } from './CitationNode';
import { CitationPlugin, insertCitation } from './CitationPlugin';
import { CitationProvider, CitationData } from './CitationContext';

// Theme for Lexical editor
const theme = {
  paragraph: 'mb-1',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
};

function onError(error: Error): void {
  console.error('Lexical Error:', error);
}

// Base config moved outside component to prevent recreation on every render
// Note: editorState is added inside component since prepopulateEditor needs to run fresh
const baseInitialConfig = {
  namespace: 'JustificationEditor',
  theme,
  onError,
  nodes: [CitationNode],
};

// Initial content with citations
function prepopulateEditor(): void {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    const paragraph = $createParagraphNode();
    paragraph.append(
      $createTextNode(
        'Das Leitungsorgan legt die gesamte Informationssicherheitsrichtlinie fest und stellt deren Verbreitung sicher, wobei diese mit den IT- und Risikostrategien des Unternehmens übereinstimmen muss '
      ),
      $createCitationNode(1),
      $createTextNode(
        ' . Es ist auch für die Überprüfung und Genehmigung der Auslagerungsrichtlinie verantwortlich '
      ),
      $createCitationNode(2),
      $createTextNode(
        ' und muss die Gesamtverantwortung für alle Risiken im Zusammenhang mit neuen Geschäftsaktivitäten tragen '
      ),
      $createCitationNode(3),
      $createTextNode(' .')
    );
    root.append(paragraph);
  }
}

// Component to expose editor instance
function EditorRefPlugin({
  onEditorReady,
}: {
  onEditorReady: (editor: LexicalEditor) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useState(() => {
    onEditorReady(editor);
  });

  return null;
}

// Helper range function
const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// Draggable citation chip for Lexical
interface LexicalDraggableChipProps {
  number: number;
  onInsert: (citationId: number) => void;
}

const LexicalDraggableChip = ({ number, onInsert }: LexicalDraggableChipProps) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('application/x-citation', String(number));
      e.dataTransfer.effectAllowed = 'copy';
    }}
    onClick={() => onInsert(number)}
    className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform select-none"
    title={`Click or drag citation ${number}`}
  >
    <div className="bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 text-[11px] font-[500] min-w-[18px] text-center hover:bg-[#DCDCDC] transition-colors">
      {number}
    </div>
  </div>
);

// Lexical-specific scroll strip variation
interface LexicalScrollStripProps {
  onInsertCitation: (citationId: number) => void;
}

const LexicalScrollStrip = ({ onInsertCitation }: LexicalScrollStripProps) => {
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
    return () => {
      window.removeEventListener('resize', check);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#525252] shrink-0">Insert citation</span>

      <div className="relative max-w-[350px]">
        <div
          className={`absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity ${
            showLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity ${
            showRight ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          ref={scrollRef}
          onScroll={check}
          className="flex items-center gap-2 overflow-x-auto pb-0 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {range(1, 15).map((num) => (
            <LexicalDraggableChip key={num} number={num} onInsert={onInsertCitation} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Lexical-specific popover variation
interface LexicalPopoverProps {
  onInsertCitation: (citationId: number) => void;
}

const LexicalPopover = ({ onInsertCitation }: LexicalPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, number: number) => {
    e.dataTransfer.setData('application/x-citation', String(number));
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
                onClick={() => {
                  onInsertCitation(num);
                  setIsOpen(false);
                }}
                className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform select-none"
                title={`Click or drag citation ${num}`}
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

// Lexical-specific sidebar variation
interface LexicalSidebarProps {
  visible: boolean;
  onInsertCitation: (citationId: number) => void;
}

const LexicalSidebar = ({ visible, onInsertCitation }: LexicalSidebarProps) => {
  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-[40px] flex flex-col items-center gap-1.5 py-1 overflow-y-auto z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-300 ease-out ${
        visible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full pointer-events-none'
      }`}
    >
      {range(1, 15).map((num) => (
        <LexicalDraggableChip
          key={num}
          number={num}
          onInsert={onInsertCitation}
        />
      ))}
    </div>
  );
};

// Lexical-specific citation header
interface LexicalCitationHeaderProps {
  label: string;
  mode: 'scroll-strip' | 'sidebar' | 'popover';
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
  onInsertCitation: (citationId: number) => void;
}

const LexicalCitationHeader = ({
  label,
  mode,
  sidebarVisible,
  onToggleSidebar,
  onInsertCitation,
}: LexicalCitationHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      {/* Label on the left */}
      <span className="text-[13px] font-[500] text-[#141414]">{label}</span>

      {/* Citation tools on the right */}
      {mode === 'scroll-strip' && <LexicalScrollStrip onInsertCitation={onInsertCitation} />}
      {mode === 'popover' && <LexicalPopover onInsertCitation={onInsertCitation} />}
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

export interface LexicalJustificationEditorProps {
  mode?: 'scroll-strip' | 'sidebar' | 'popover';
  label?: string;
  citations?: CitationData[];
  onChange?: (editorState: EditorState) => void;
}

export function LexicalJustificationEditor({
  mode = 'scroll-strip',
  label = 'Begründung',
  citations = [],
  onChange,
}: LexicalJustificationEditorProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [editorInstance, setEditorInstance] = useState<LexicalEditor | null>(null);

  // Merge base config with editorState (needs to be fresh for each mount)
  const initialConfig = {
    ...baseInitialConfig,
    editorState: prepopulateEditor,
  };

  const handleChange = useCallback(
    (editorState: EditorState) => {
      onChange?.(editorState);
    },
    [onChange]
  );

  const handleInsertCitation = useCallback(
    (citationId: number) => {
      if (editorInstance) {
        insertCitation(editorInstance, citationId);
      }
    },
    [editorInstance]
  );

  return (
    <CitationProvider citations={citations}>
      <div className="w-full">
        {/* Header with label on left, citation tools on right - same line */}
        <LexicalCitationHeader
          label={label}
          mode={mode}
          sidebarVisible={sidebarVisible}
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          onInsertCitation={handleInsertCitation}
        />

        {/* Editor area */}
        {/* Key forces remount when CitationNode module is hot-reloaded, fixing HMR node mismatch */}
        <LexicalComposer key={CITATION_NODE_VERSION} initialConfig={initialConfig}>
        <div className="bg-white rounded-[6px] border border-[#E1E1E1] p-3 relative overflow-hidden">
          <div className="flex relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={`text-[13px] leading-[20px] text-[#141414] focus:outline-none min-h-[80px] w-full transition-[padding] duration-300 ${
                    mode === 'sidebar' && sidebarVisible ? 'pr-10' : ''
                  }`}
                />
              }
              placeholder={
                <div className="text-[13px] text-gray-400 absolute top-0 left-0 pointer-events-none">
                  Enter justification text...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />

            {/* Sidebar sits inside the editor area to the right */}
            {mode === 'sidebar' && (
              <LexicalSidebar
                visible={sidebarVisible}
                onInsertCitation={handleInsertCitation}
              />
            )}
          </div>
        </div>

        {/* Plugins */}
        <HistoryPlugin />
        <CitationPlugin />
        <OnChangePlugin onChange={handleChange} />
        <EditorRefPlugin onEditorReady={setEditorInstance} />
      </LexicalComposer>
      </div>
    </CitationProvider>
  );
}

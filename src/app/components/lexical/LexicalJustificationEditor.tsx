import { useState, useCallback, useEffect } from 'react';
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
import { Plus } from 'lucide-react';
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

// Popover for inserting citations via click or drag
interface LexicalPopoverProps {
  onInsertCitation: (citationId: number) => void;
  usedCitationIds: Set<number>;
  availableCitationIds: number[];
}

const LexicalPopover = ({ onInsertCitation, usedCitationIds, availableCitationIds }: LexicalPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, number: number) => {
    e.dataTransfer.setData('application/x-citation', String(number));
    e.dataTransfer.effectAllowed = 'copy';
    // Delay closing the popover so the drag operation can initialize first
    setTimeout(() => setIsOpen(false), 0);
  };

  return (
    <div className="relative flex items-center gap-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-gray-100 rounded text-[13px] text-[#141414] font-[500] transition-colors"
      >
        <Plus size={14} className="text-[#8A8A8A]" />
        <span>Insert citation</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-1 p-2 bg-white rounded shadow-lg border border-gray-200 flex flex-wrap gap-2 w-[200px] z-50">
            {availableCitationIds.map((num) => (
              <div
                key={num}
                draggable
                onDragStart={(e) => handleDragStart(e, num)}
                onClick={() => {
                  onInsertCitation(num);
                  setIsOpen(false);
                }}
                className={`cursor-grab active:cursor-grabbing hover:scale-105 transition-all select-none ${usedCitationIds.has(num) ? 'opacity-35' : ''}`}
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

// Header with label and popover insert button
interface LexicalCitationHeaderProps {
  label: string;
  onInsertCitation: (citationId: number) => void;
  usedCitationIds: Set<number>;
  availableCitationIds: number[];
}

const LexicalCitationHeader = ({
  label,
  onInsertCitation,
  usedCitationIds,
  availableCitationIds,
}: LexicalCitationHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[13px] font-[500] text-[#141414]">{label}</span>
      <LexicalPopover onInsertCitation={onInsertCitation} usedCitationIds={usedCitationIds} availableCitationIds={availableCitationIds} />
    </div>
  );
};

export interface LexicalJustificationEditorProps {
  label?: string;
  citations?: CitationData[];
  onChange?: (editorState: EditorState) => void;
}

export function LexicalJustificationEditor({
  label = 'Begründung',
  citations = [],
  onChange,
}: LexicalJustificationEditorProps) {
  const [editorInstance, setEditorInstance] = useState<LexicalEditor | null>(null);
  const [usedCitationIds, setUsedCitationIds] = useState<Set<number>>(new Set());

  // Get available citation IDs from props
  const availableCitationIds = citations.map(c => c.id);

  // Merge base config with editorState (needs to be fresh for each mount)
  const initialConfig = {
    ...baseInitialConfig,
    editorState: prepopulateEditor,
  };

  const handleChange = useCallback(
    (editorState: EditorState) => {
      // Extract used citation IDs from editor state
      editorState.read(() => {
        const root = $getRoot();
        const usedIds = new Set<number>();
        const processNode = (node: any) => {
          if (node.getType?.() === 'citation') {
            usedIds.add(node.getCitationId());
          }
          if (node.getChildren) {
            node.getChildren().forEach(processNode);
          }
        };
        processNode(root);
        setUsedCitationIds(usedIds);
      });
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

  // Extract used citations on initial load
  useEffect(() => {
    if (editorInstance) {
      editorInstance.getEditorState().read(() => {
        const root = $getRoot();
        const usedIds = new Set<number>();
        const processNode = (node: any) => {
          if (node.getType?.() === 'citation') {
            usedIds.add(node.getCitationId());
          }
          if (node.getChildren) {
            node.getChildren().forEach(processNode);
          }
        };
        processNode(root);
        setUsedCitationIds(usedIds);
      });
    }
  }, [editorInstance]);

  // Listen for external "add citation to reasoning" events
  useEffect(() => {
    const handleAddCitationEvent = (event: CustomEvent<{ citationId: number }>) => {
      if (editorInstance && event.detail?.citationId) {
        insertCitation(editorInstance, event.detail.citationId);
      }
    };

    window.addEventListener('add-citation-to-reasoning', handleAddCitationEvent as EventListener);
    return () => {
      window.removeEventListener('add-citation-to-reasoning', handleAddCitationEvent as EventListener);
    };
  }, [editorInstance]);

  return (
    <CitationProvider citations={citations}>
      <div className="w-full">
        <LexicalCitationHeader
          label={label}
          onInsertCitation={handleInsertCitation}
          usedCitationIds={usedCitationIds}
          availableCitationIds={availableCitationIds}
        />

        {/* Editor area */}
        {/* Key forces remount when CitationNode module is hot-reloaded, fixing HMR node mismatch */}
        <LexicalComposer key={CITATION_NODE_VERSION} initialConfig={initialConfig}>
        <div className="bg-white rounded-[6px] border border-[#E1E1E1] p-3 relative overflow-hidden">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="text-[13px] leading-[20px] text-[#141414] focus:outline-none min-h-[80px] w-full"
              />
            }
            placeholder={
              <div className="text-[13px] text-gray-400 absolute top-0 left-0 pointer-events-none">
                Enter justification text...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
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

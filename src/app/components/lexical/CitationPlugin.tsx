import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $createRangeSelection,
  $isTextNode,
  $getNearestNodeFromDOMNode,
  COMMAND_PRIORITY_HIGH,
  DROP_COMMAND,
  DRAGOVER_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getRoot,
  RangeSelection,
  LexicalEditor,
} from 'lexical';
import { $createCitationNode } from './CitationNode';

// Store for the last known selection (used for click-to-insert when editor loses focus)
let lastKnownSelection: RangeSelection | null = null;

// Create and manage the drop indicator element
function createDropIndicator(): HTMLDivElement {
  const indicator = document.createElement('div');
  indicator.className = 'lexical-drop-indicator';
  indicator.style.cssText = `
    position: fixed;
    width: 2px;
    height: 18px;
    background-color: #3b82f6;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.1s ease;
    border-radius: 1px;
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
  `;

  // Add blinking animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dropIndicatorBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .lexical-drop-indicator.active {
      opacity: 1 !important;
      animation: dropIndicatorBlink 0.8s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(indicator);

  return indicator;
}

// Get caret position from coordinates
function getCaretPosition(x: number, y: number): { range: Range; rect: DOMRect } | null {
  let range: Range | null = null;

  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  } else if ((document as any).caretPositionFromPoint) {
    const pos = (document as any).caretPositionFromPoint(x, y);
    if (pos) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
    }
  }

  if (range) {
    const rect = range.getBoundingClientRect();
    return { range, rect };
  }

  return null;
}

export function CitationPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const dropIndicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create drop indicator on mount
    dropIndicatorRef.current = createDropIndicator();

    const hideIndicator = () => {
      if (dropIndicatorRef.current) {
        dropIndicatorRef.current.classList.remove('active');
        dropIndicatorRef.current.style.opacity = '0';
      }
    };

    const showIndicator = (x: number, y: number, height: number) => {
      if (dropIndicatorRef.current) {
        dropIndicatorRef.current.style.left = `${x}px`;
        dropIndicatorRef.current.style.top = `${y}px`;
        dropIndicatorRef.current.style.height = `${height}px`;
        dropIndicatorRef.current.classList.add('active');
      }
    };

    // Track selection changes to preserve last known selection
    const removeSelectionListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          lastKnownSelection = selection.clone();
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Handle dragover to allow dropping and show indicator
    const removeDragOverListener = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        const types = event.dataTransfer?.types || [];
        if (types.includes('application/x-citation')) {
          event.preventDefault();
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'copy';
          }

          // Show drop indicator at caret position
          const caretPos = getCaretPosition(event.clientX, event.clientY);
          if (caretPos) {
            const { rect } = caretPos;
            // Position indicator at the caret location
            showIndicator(rect.left, rect.top, rect.height || 18);
          }

          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Hide indicator when drag leaves editor
    const rootElement = editor.getRootElement();
    const handleDragLeave = (e: DragEvent) => {
      // Only hide if actually leaving the editor (not entering a child)
      const relatedTarget = e.relatedTarget as Node | null;
      if (!rootElement?.contains(relatedTarget)) {
        hideIndicator();
      }
    };

    const handleDragEnd = () => {
      hideIndicator();
    };

    rootElement?.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('drop', hideIndicator);

    // Handle drop events for citations
    const removeDropListener = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const data = event.dataTransfer?.getData('application/x-citation');
        if (data) {
          event.preventDefault();
          event.stopPropagation();
          hideIndicator(); // Hide indicator on drop

          const citationId = parseInt(data, 10);

          // Get drop position using shared helper
          const caretPos = getCaretPosition(event.clientX, event.clientY);

          if (caretPos) {
            const { range } = caretPos;
            const domNode = range.startContainer;
            const domOffset = range.startOffset;

            editor.update(() => {
              const lexicalNode = $getNearestNodeFromDOMNode(domNode);

              if (lexicalNode) {
                const selection = $createRangeSelection();

                if ($isTextNode(lexicalNode)) {
                  selection.anchor.set(lexicalNode.getKey(), domOffset, 'text');
                  selection.focus.set(lexicalNode.getKey(), domOffset, 'text');
                } else {
                  selection.anchor.set(lexicalNode.getKey(), lexicalNode.getChildrenSize(), 'element');
                  selection.focus.set(lexicalNode.getKey(), lexicalNode.getChildrenSize(), 'element');
                }

                $setSelection(selection);
                const citationNode = $createCitationNode(citationId);
                selection.insertNodes([citationNode]);
              } else {
                insertAtEnd(citationId);
              }
            });
          } else {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const citationNode = $createCitationNode(citationId);
                selection.insertNodes([citationNode]);
              } else {
                insertAtEnd(citationId);
              }
            });
          }

          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      // Cleanup listeners
      removeSelectionListener();
      removeDragOverListener();
      removeDropListener();
      rootElement?.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('drop', hideIndicator);

      // Remove indicator element
      if (dropIndicatorRef.current) {
        dropIndicatorRef.current.remove();
        dropIndicatorRef.current = null;
      }
    };
  }, [editor]);

  return null;
}

// Helper to insert citation at end of document
function insertAtEnd(citationId: number): void {
  const root = $getRoot();
  const lastChild = root.getLastDescendant();
  if (lastChild) {
    const newSelection = $createRangeSelection();
    if ($isTextNode(lastChild)) {
      newSelection.anchor.set(lastChild.getKey(), lastChild.getTextContentSize(), 'text');
      newSelection.focus.set(lastChild.getKey(), lastChild.getTextContentSize(), 'text');
    } else {
      newSelection.anchor.set(lastChild.getKey(), 0, 'element');
      newSelection.focus.set(lastChild.getKey(), 0, 'element');
    }
    $setSelection(newSelection);
    const citationNode = $createCitationNode(citationId);
    newSelection.insertNodes([citationNode]);
  }
}

// Helper function to insert a citation at the current or last known selection
export function insertCitation(editor: LexicalEditor, citationId: number): void {
  editor.update(() => {
    let selection = $getSelection();

    // If no current selection, try to use the last known selection
    if (!$isRangeSelection(selection) && lastKnownSelection) {
      $setSelection(lastKnownSelection.clone());
      selection = $getSelection();
    }

    // If still no selection, insert at end
    if (!$isRangeSelection(selection)) {
      insertAtEnd(citationId);
      return;
    }

    const citationNode = $createCitationNode(citationId);
    selection.insertNodes([citationNode]);
  });

  // Focus editor after insertion
  editor.focus();
}

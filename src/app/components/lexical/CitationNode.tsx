import { useState } from 'react';
import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { useCitationData } from './CitationContext';

// HMR version identifier - changes when this module is hot-reloaded
// Used to force LexicalComposer remount and re-register nodes
export const CITATION_NODE_VERSION = Date.now();

// Citation chip component with tooltip
function CitationChip({ citationId }: { citationId: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { getCitation } = useCitationData();
  const citation = getCitation(citationId);

  return (
    <span
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className="inline-flex items-center justify-center bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 mx-0.5 text-[11px] font-[500] min-w-[20px] text-center select-none align-middle cursor-default"
        contentEditable={false}
      >
        {citationId}
      </span>

      {/* Tooltip - positioned to the right */}
      {showTooltip && citation && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
          style={{ width: '380px' }}
        >
          {/* Arrow pointing left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45" />

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-5">
            {/* Citation text - larger, more readable */}
            <p className="text-[15px] leading-[1.6] text-[#141414]">
              {citation.fullText || citation.text}
            </p>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Source info */}
            <div className="flex items-center justify-between text-[13px] text-[#8A8A8A]">
              <span className="truncate pr-4">{citation.fileName}</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span>§</span>
                <span>Page {citation.page}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

export type SerializedCitationNode = Spread<
  {
    citationId: number;
  },
  SerializedLexicalNode
>;

function convertCitationElement(domNode: HTMLElement): DOMConversionOutput | null {
  const citationId = domNode.getAttribute('data-citation-id');
  if (citationId !== null) {
    const node = $createCitationNode(parseInt(citationId, 10));
    return { node };
  }
  return null;
}

export class CitationNode extends DecoratorNode<JSX.Element> {
  __citationId: number;

  static getType(): string {
    return 'citation';
  }

  static clone(node: CitationNode): CitationNode {
    return new CitationNode(node.__citationId, node.__key);
  }

  static importJSON(serializedNode: SerializedCitationNode): CitationNode {
    return $createCitationNode(serializedNode.citationId);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-citation-id')) {
          return null;
        }
        return {
          conversion: convertCitationElement,
          priority: 1,
        };
      },
    };
  }

  constructor(citationId: number, key?: NodeKey) {
    super(key);
    this.__citationId = citationId;
  }

  exportJSON(): SerializedCitationNode {
    return {
      ...super.exportJSON(),
      citationId: this.__citationId,
      type: 'citation',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.setAttribute('data-citation-id', String(this.__citationId));
    element.className =
      'inline-flex items-center justify-center bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 mx-0.5 text-[11px] font-[500] min-w-[20px] text-center select-none align-middle';
    element.textContent = String(this.__citationId);
    return { element };
  }

  createDOM(): HTMLElement {
    // Minimal wrapper - decorate() handles the actual styling
    const span = document.createElement('span');
    span.setAttribute('data-citation-id', String(this.__citationId));
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getCitationId(): number {
    return this.__citationId;
  }

  decorate(): JSX.Element {
    return <CitationChip citationId={this.__citationId} />;
  }

  isInline(): boolean {
    return true;
  }
}

export function $createCitationNode(citationId: number): CitationNode {
  return new CitationNode(citationId);
}

export function $isCitationNode(
  node: LexicalNode | null | undefined
): node is CitationNode {
  return node instanceof CitationNode;
}

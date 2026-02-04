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

// HMR version identifier - changes when this module is hot-reloaded
// Used to force LexicalComposer remount and re-register nodes
export const CITATION_NODE_VERSION = Date.now();

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
    // This is the actual rendered citation chip - all styling goes here
    return (
      <span
        className="inline-flex items-center justify-center bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 mx-0.5 text-[11px] font-[500] min-w-[20px] text-center select-none align-middle"
        contentEditable={false}
      >
        {this.__citationId}
      </span>
    );
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

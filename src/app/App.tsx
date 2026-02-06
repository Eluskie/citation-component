import React, { useState, useRef } from 'react';
import { LexicalJustificationEditor, CitationData } from './components/lexical';
import { ChevronDown, ChevronRight, Plus, X, FileText, Check, Search, Filter, Highlighter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';
import { Input } from './components/ui/input';
import { AnimatedAddToReasoningButton } from './components/AnimatedAddToReasoningButton';

// ============================================================================
// MOCK COMPONENTS — For demo context only. Not production code.
// The developer receiving this codebase should replace these with real
// application components. They exist so you can run the demo and see
// citations in context (sidebar nav, PDF viewer, page header).
// ============================================================================

// Mock: Cortea Logo
const MockLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
      <span className="text-white text-xs font-bold">C</span>
    </div>
  </div>
);

// Mock: Top Header Bar
const MockTopHeader = () => (
  <div className="bg-[#163449] h-[48px] flex items-center px-4 justify-between shrink-0 text-white select-none">
    <div className="flex items-center gap-4">
      <MockLogo />
      <div className="flex items-center gap-2 text-[13px] opacity-90 cursor-pointer hover:opacity-100">
        <span>Engagement</span>
        <ChevronDown size={14} />
      </div>
      <div className="flex items-center gap-2 text-[13px] opacity-70">
        <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center">
          <span className="text-[10px]">i</span>
        </div>
        <span>Alle Dateien geprüft, 24 Checks benötigen Überprüfung</span>
      </div>
    </div>
    <div className="flex items-center gap-2 text-[13px] cursor-pointer">
      <span>John Doe</span>
      <ChevronDown size={14} />
    </div>
  </div>
);

// Mock: Sidebar Tree Item
const MockTreeItem = ({
  label,
  level = 0,
  expanded,
  hasChildren,
  status,
  active,
  onClick
}: {
  label: string;
  level?: number;
  expanded?: boolean;
  hasChildren?: boolean;
  status?: 'passed' | 'failed' | 'none';
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-gray-100 rounded text-[13px] ${active ? 'bg-blue-50' : ''}`}
    style={{ paddingLeft: `${8 + level * 16}px` }}
    onClick={onClick}
  >
    {hasChildren ? (
      expanded ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />
    ) : (
      <div className="w-3.5 shrink-0" />
    )}
    {status === 'passed' && <Check size={14} className="text-green-500 shrink-0" />}
    {status === 'failed' && <X size={14} className="text-red-500 shrink-0" />}
    <span className={`truncate ${active ? 'text-[#141414] font-medium' : 'text-[#525252]'}`}>{label}</span>
  </div>
);

// Mock: Left Sidebar with Tree Navigation
const MockSidebar = () => {
  const [expanded, setExpanded] = useState({ ikt: true, governance: true, pruefung: true });

  return (
    <div className="w-[280px] border-r border-gray-200 flex flex-col bg-white shrink-0">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-[600] text-[#141414]">Ergebnisse</h2>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-[13px] hover:bg-gray-50 w-full justify-center">
          <Filter size={14} className="text-gray-500" />
          Filter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <MockTreeItem label="Name" level={0} hasChildren />
        <MockTreeItem label="Strategie" level={0} hasChildren />
        <MockTreeItem
          label="IKT-Risikomanagement"
          level={0}
          hasChildren
          expanded={expanded.ikt}
          onClick={() => setExpanded(e => ({ ...e, ikt: !e.ikt }))}
        />
        {expanded.ikt && (
          <>
            <MockTreeItem
              label="Governance des Risikomanagements"
              level={1}
              hasChildren
              expanded={expanded.governance}
              onClick={() => setExpanded(e => ({ ...e, governance: !e.governance }))}
            />
            {expanded.governance && (
              <>
                <MockTreeItem label="Aufsicht über das IKT-Risikomanagement" level={2} status="passed" />
                <MockTreeItem label="Verantwortung des Leitungsorgans für IKT-Risiken" level={2} status="passed" active />
                <MockTreeItem label="Definition von IKT-Rollen und Verantwortlichkeiten" level={2} status="failed" />
                <MockTreeItem label="Definition von IKT-Governance-Regelungen" level={2} status="none" />
                <MockTreeItem label="Definierte IKT-Koordinationsmechanismen" level={2} status="passed" />
              </>
            )}
          </>
        )}
        <MockTreeItem
          label="Prüfung & Compliance"
          level={0}
          hasChildren
          expanded={expanded.pruefung}
          onClick={() => setExpanded(e => ({ ...e, pruefung: !e.pruefung }))}
        />
        {expanded.pruefung && (
          <MockTreeItem label="Genehmigung und Überprüfung von IKT-Prüfungsplänen/-prüfungen durch das Leitungsorgan" level={1} status="passed" />
        )}
      </div>
    </div>
  );
};

// Mock: PDF Viewer Panel with area selection
interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HighlightedArea extends SelectionArea {
  id: number;
  text: string;
}

const MockPDFViewer = ({
  isSelectionMode,
  onToggleSelectionMode,
  onAreaSelected,
  highlightedAreas
}: {
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  onAreaSelected: (area: SelectionArea) => void;
  highlightedAreas: HighlightedArea[];
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentSelection, setCurrentSelection] = useState<SelectionArea | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelectionMode || !contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCurrentSelection({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCurrentSelection({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      width: Math.abs(currentX - startPos.x),
      height: Math.abs(currentY - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentSelection && currentSelection.width > 20 && currentSelection.height > 20) {
      onAreaSelected(currentSelection);
    }
    setCurrentSelection(null);
  };

  return (
    <div className="min-w-[40%] flex-1 border-l border-gray-200 flex flex-col bg-white">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 pt-3 border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 border-b-white rounded-t-md text-[13px] font-medium -mb-px z-10">
          <FileText size={14} className="text-gray-400" />
          <span className="truncate max-w-[100px]">Information...</span>
          <X size={12} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-t-md text-[13px] text-gray-500 cursor-pointer hover:bg-gray-100">
          <FileText size={14} className="text-gray-400" />
          <span className="truncate max-w-[80px]">Leitlinie IKT-...</span>
          <X size={12} className="text-gray-400" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-t-md text-[13px] text-gray-500 cursor-pointer hover:bg-gray-100">
          <FileText size={14} className="text-gray-400" />
          <span className="truncate max-w-[80px]">New Product...</span>
          <X size={12} className="text-gray-400" />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Plus size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          <button
            onClick={onToggleSelectionMode}
            className={`p-1 rounded transition-colors ${isSelectionMode ? 'bg-[#BFF981] text-gray-700' : 'hover:bg-gray-100'}`}
            title="Draw area to create citation"
          >
            <Highlighter size={16} className={isSelectionMode ? 'text-gray-700' : 'text-gray-400'} />
          </button>
        </div>
        <div className="flex items-center gap-1 text-[13px] text-gray-500 cursor-pointer">
          <span>Optionen</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Selection mode indicator */}
      {isSelectionMode && (
        <div className="px-3 py-2 bg-[#BFF981]/30 border-b border-[#BFF981] text-[12px] text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#BFF981] animate-pulse" />
          Draw an area on the PDF to create a citation
        </div>
      )}

      {/* PDF Content Mock */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div
          ref={contentRef}
          className={`bg-white shadow-sm rounded border border-gray-200 p-6 text-[11px] leading-relaxed text-gray-700 relative select-none ${isSelectionMode ? 'cursor-crosshair' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Company Header Mock */}
          <div className="flex justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <div className="text-[10px] text-gray-400">ETL-Heimfarth & Kollegen GmbH</div>
              <div className="text-[10px] text-gray-400">Wirtschaftsprüfungsgesellschaft</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400">Dr. Boy GmbH & Co. KG</div>
              <div className="text-[10px] text-gray-400">Neustadt/Wied</div>
            </div>
          </div>

          {/* Document Title */}
          <div className="mb-4">
            <span className="font-medium">A.</span>
            <span className="ml-2 font-medium">Prüfungsauftrag</span>
            <span className="ml-2 text-blue-600">(2)</span>
          </div>

          {/* Content */}
          <p className="mb-3">Die Geschäftsführung der</p>
          <p className="mb-3 text-center font-medium">
            Dr. Boy GmbH & Co. KG, Neustadt/Wied<br />
            <span className="text-[10px] text-gray-500">(nachfolgend „Gesellschaft")</span>
          </p>
          <p className="mb-4">
            hat uns aufgrund des Beschlusses der Gesellschafterversammlung mit der Prüfung des Jahres-
            abschlusses zum 31. März 2025 unter Einbeziehung der zugrunde liegenden Buchführung und
            des Lageberichts beauftragt.
          </p>

          {/* Static Highlighted Area */}
          <div className="relative my-4">
            <div className="bg-[#BFF981]/40 border-l-4 border-[#BFF981] p-3 rounded-r">
              <p className="text-[11px]">
                Darüber hinaus wurden wir beauftragt, die wirtschaftlichen Verhältnisse der Gesellschaft zum
                Prüfungsstichtag darzulegen und zu erläutern. Wir sind diesem Auftrag durch die
                Erstellung des „Finanz- und Ertragslage" in Anlage 8 nachgekommen.
              </p>
            </div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-[#BFF981] text-[#141414] text-[11px] w-5 h-5 rounded flex items-center justify-center font-medium">
              4
            </div>
          </div>

          <p className="mb-3">
            Auftragsgemäß haben wir ferner den Prüfungsbericht um einen besonderen Erläuterungsteil er-
            weitert, der diesem Bericht als Anlage 9 beigefügt ist.
          </p>

          <p className="mb-3">
            Wir bestätigen gemäß § 321 Abs. 4a HGB, dass wir bei unserer Abschlussprüfung die anwend-
            baren Vorschriften zur Unabhängigkeit beachtet haben.
          </p>

          <p className="mb-3">
            Unsere Berichterstattung erfolgt nach den Grundsätzen ordnungsmäßiger Erstellung von Prüf-
            ungsberichten des Instituts der Wirtschaftsprüfer e.V., Düsseldorf (IDW PS 450 n.F.).
          </p>

          <p className="mb-3">
            Dieser Prüfungsbericht richtet sich an die Dr. Boy GmbH & Co. KG.
          </p>

          {/* Dynamic highlighted areas */}
          {highlightedAreas.map((area) => (
            <div
              key={area.id}
              className="absolute bg-[#BFF981]/40 border-2 border-[#BFF981] rounded pointer-events-none"
              style={{
                left: area.x,
                top: area.y,
                width: area.width,
                height: area.height,
              }}
            >
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-[#BFF981] text-[#141414] text-[11px] w-5 h-5 rounded flex items-center justify-center font-medium shadow-sm">
                {area.id}
              </div>
            </div>
          ))}

          {/* Current selection being drawn */}
          {currentSelection && currentSelection.width > 0 && currentSelection.height > 0 && (
            <div
              className="absolute bg-[#BFF981]/30 border-2 border-dashed border-[#BFF981] rounded pointer-events-none"
              style={{
                left: currentSelection.x,
                top: currentSelection.y,
                width: currentSelection.width,
                height: currentSelection.height,
              }}
            />
          )}

          {/* Page number */}
          <div className="text-center text-[10px] text-gray-400 mt-8 pt-4 border-t border-gray-100">
            Seite 4
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// REAL COMPONENTS - Production-ready citation reference components
// ============================================================================
//
// Usage:
// 1. ReferenceGroup - Container for a document with multiple citations
//    - Collapsible header with document name
//    - Remove reference functionality
//    - Maps through citations array
//
// 2. CitationRow - Individual citation display
//    - Shows page number, citation text, and badge
//    - Edit mode for new citations
//    - Hover actions: add to reasoning, delete
//    - Full-width hover background
//
// Styling: Exact Figma specs with rgba colors, precise spacing
// Structure: Scalable for multiple reference documents
// ============================================================================

// Real: Citation data types
interface Citation {
  page: number;
  text: string;
  fullText?: string;
  id: number;
  isNew?: boolean;
  justCreated?: boolean; // Shows full "Add to reasoning" button when true
}

interface ReferenceDoc {
  fileName: string;
  citations: Citation[];
}

// Citation Row - displays individual citation with edit/delete functionality
// States: default, hover, creating (isNew), created (justCreated)
const CitationRow = ({
  citation,
  fileName,
  onUpdateTitle,
  onDelete,
  onAddToReasoning,
  confirmingDelete = false,
  onCancelDelete
}: {
  citation: Citation;
  fileName: string;
  onUpdateTitle?: (id: number, title: string) => void;
  onDelete?: (id: number) => void;
  onAddToReasoning?: (citation: Citation) => void;
  confirmingDelete?: boolean;
  onCancelDelete?: () => void;
}) => {
  const [editValue, setEditValue] = useState(citation.isNew ? '' : citation.text);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Determine state
  const isCreating = citation.isNew;
  const isCreated = citation.justCreated;
  const showGrayBackground = isCreating || isCreated;

  // Auto-focus input when new citation is created
  React.useEffect(() => {
    if (citation.isNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [citation.isNew]);

  const handleFinishEditing = () => {
    if (editValue.trim() && onUpdateTitle) {
      onUpdateTitle(citation.id, editValue.trim());
    }
  };

  const handleCancel = () => {
    if (onDelete) {
      onDelete(citation.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEditing();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className={`group border-t border-[rgba(0,0,0,0.14)] -mx-px last:-mb-px transition-colors ${
        showGrayBackground ? 'bg-[#f9f9f9]' : 'hover:bg-[#f9f9f9]'
      }`}
      onMouseLeave={() => confirmingDelete && onCancelDelete?.()}
    >
      <div className={`flex gap-[6px] pb-[6px] pt-[7px] px-[8px] h-[40px] items-center`}>
        {/* Page number */}
        <span className="text-[13px] leading-[19px] font-[425] text-[#525252] whitespace-nowrap shrink-0">
          S. {citation.page}
        </span>

        {/* Text or input field */}
        {isCreating ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleFinishEditing}
            onKeyDown={handleKeyDown}
            placeholder="Enter citation title..."
            className="flex-1 text-[13px] leading-[19px] font-[475] text-[#141414] placeholder:text-[rgba(0,0,0,0.2)] bg-transparent outline-none"
          />
        ) : (
          <span className="flex-1 text-[13px] leading-[19px] font-[475] text-[#141414]">
            {citation.text}
          </span>
        )}

        {/* Buttons - different for each state */}
        {isCreated && (
          <>
            {/* Animated "Add to reasoning" button - animates on click */}
            <AnimatedAddToReasoningButton
              onClick={() => onAddToReasoning?.(citation)}
            />
          </>
        )}

        {/* Add citation icon button - shows on hover for saved citations (not creating/created states) */}
        {!isCreating && !isCreated && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onAddToReasoning?.(citation)}
                className="px-[5px] py-[2px] rounded-[5px] hover:bg-[rgba(0,0,0,0.08)] transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              >
                <img src="/icon_citation.svg" alt="Add citation" className="w-[13px] h-[13px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#141414] text-white text-xs px-2 py-1">
              Insert citation
            </TooltipContent>
          </Tooltip>
        )}

        {/* X button - shows on hover (default state) or always (creating/created states) */}
        {!isCreated && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCancel}
                className={`px-[5px] py-[2px] rounded-[5px] transition-colors shrink-0 ${
                  confirmingDelete
                    ? 'bg-red-100 opacity-100'
                    : isCreating
                      ? 'opacity-100 hover:bg-[rgba(0,0,0,0.08)]'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.08)]'
                }`}
              >
                <X size={13} className={`transition-colors ${confirmingDelete ? 'text-red-600' : 'text-[#8a8a8a]'}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#141414] text-white text-xs px-2 py-1">
              {confirmingDelete ? 'Click again to confirm' : (citation.isNew ? 'Cancel' : 'Remove citation')}
            </TooltipContent>
          </Tooltip>
        )}

        {/* X button - always visible in created state */}
        {isCreated && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCancel}
                className={`px-[5px] py-[2px] rounded-[5px] transition-colors shrink-0 ${
                  confirmingDelete ? 'bg-red-100' : 'hover:bg-[rgba(0,0,0,0.08)]'
                }`}
              >
                <X size={13} className={`transition-colors ${confirmingDelete ? 'text-red-600' : 'text-[#8a8a8a]'}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#141414] text-white text-xs px-2 py-1">
              {confirmingDelete ? 'Click again to confirm' : 'Remove citation'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Citation badge - green for creating/created, gray for default/hover */}
        <div className={`flex items-center justify-center px-1 rounded-[4px] shrink-0 ${
          isCreating || isCreated ? 'bg-[#c8ff8d]' : 'bg-[rgba(0,0,0,0.06)]'
        }`}>
          <span className="text-[13px] leading-[19px] font-[425] text-[#141414]">
            {citation.id}
          </span>
        </div>
      </div>
    </div>
  );
};

// Real: Reference Group (Figma exact + full functionality)
const ReferenceGroup = ({
  doc,
  onRemove,
  onUpdateCitationTitle,
  onDeleteCitation,
  onAddCitationToReasoning,
  confirmingDeleteId,
  setConfirmingDeleteId
}: {
  doc: ReferenceDoc;
  onRemove?: (docFileName: string) => void;
  onUpdateCitationTitle?: (citationId: number, title: string) => void;
  onDeleteCitation?: (citationId: number) => void;
  onAddCitationToReasoning?: (citation: Citation, fileName: string) => void;
  confirmingDeleteId: number | null;
  setConfirmingDeleteId: (id: number | null) => void;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.14)] rounded-[5px] overflow-clip p-px">
      {/* Header - clickable to toggle collapse (disabled during remove) */}
      <div
        className={`flex gap-[6px] items-center pl-[12px] pr-[8px] pt-[7px] pb-[6px] h-[40px] transition-colors -mx-px -mt-px ${
          showRemoveConfirm ? 'cursor-default' : 'cursor-pointer hover:bg-[rgba(0,0,0,0.03)]'
        }`}
        onClick={() => !showRemoveConfirm && setCollapsed(!collapsed)}
      >
        <FileText className="w-[13px] h-[19px] text-[#8a8a8a] shrink-0" />
        <span className="flex-1 text-[13px] leading-[19px] font-[475] text-[#141414] truncate">
          {doc.fileName}
        </span>

        {/* Show citation badges when collapsed OR removing */}
        {(collapsed || showRemoveConfirm) && doc.citations.map(cite => (
          <div key={cite.id} className="bg-[rgba(0,0,0,0.06)] relative rounded-[4px] shrink-0">
            <div className="flex items-center justify-center px-[4px]">
              <span className="text-[13px] leading-[19px] font-[425] text-[#141414] text-center">
                {cite.id}
              </span>
            </div>
          </div>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => { e.stopPropagation(); setShowRemoveConfirm(!showRemoveConfirm); }}
              className="flex items-center px-[5px] py-[2px] rounded-[5px] hover:bg-[rgba(0,0,0,0.08)] transition-colors"
            >
              <X size={13} className="text-[#8a8a8a]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#141414] text-white text-xs px-2 py-1">
            Remove reference
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center px-[5px] py-[2px]">
          <ChevronDown size={13} className={`text-[#8a8a8a] transition-transform ${collapsed || showRemoveConfirm ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Remove Confirm */}
      {showRemoveConfirm && (
        <div className="border-t border-[rgba(0,0,0,0.14)] px-[8px] py-[4px] flex items-center justify-between bg-[#f9f9f9] -mx-px -mb-px">
          <span className="text-[13px] leading-[19px] font-[425] text-[#525252]">Remove this reference?</span>
          <div className="flex items-center gap-[6px]">
            <button
              onClick={() => { onRemove?.(doc.fileName); setShowRemoveConfirm(false); }}
              className="px-2.5 py-1 text-[13px] leading-[19px] font-[475] text-[#141414] hover:bg-[rgba(0,0,0,0.08)] rounded-[4px] transition-colors"
            >
              Remove
            </button>
            <button
              onClick={() => setShowRemoveConfirm(false)}
              className="px-2.5 py-1 text-[13px] leading-[19px] font-[425] text-[#8A8A8A] hover:text-[#141414] hover:bg-[rgba(0,0,0,0.08)] rounded-[4px] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Citation Rows */}
      {!collapsed && !showRemoveConfirm && doc.citations.map((cite) => (
        <CitationRow
          key={cite.id}
          citation={cite}
          fileName={doc.fileName}
          onUpdateTitle={onUpdateCitationTitle}
          onDelete={onDeleteCitation}
          onAddToReasoning={(c) => onAddCitationToReasoning?.(c, doc.fileName)}
          confirmingDelete={confirmingDeleteId === cite.id}
          onCancelDelete={() => setConfirmingDeleteId(null)}
        />
      ))}
    </div>
  );
};

// Real: Main Content Panel (contains Begründung and Referenzen)
const RealContentPanel = ({
  linkedDocs,
  setLinkedDocs
}: {
  linkedDocs: ReferenceDoc[];
  setLinkedDocs: React.Dispatch<React.SetStateAction<ReferenceDoc[]>>;
}) => {
  // Citation insertion uses the Popover variation (shipped)
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);

  const allCitations: CitationData[] = linkedDocs.flatMap((doc) =>
    doc.citations.map((cite) => ({
      id: cite.id,
      text: cite.text,
      fullText: cite.fullText,
      page: cite.page,
      fileName: doc.fileName,
    }))
  );

  const availableForLinking = [
    { fileName: "Compliance Guidelines 2024.pdf", citations: [] },
    { fileName: "Data Protection Policy.pdf", citations: [] },
  ].filter(doc => doc.fileName.toLowerCase().includes(linkSearchQuery.toLowerCase()));

  // Handle citation title update (when user finishes editing a new citation)
  const handleUpdateCitationTitle = (citationId: number, title: string) => {
    console.log(`💾 Saving citation ${citationId} with title: "${title}" - setting justCreated=true`);

    // Clear justCreated flag from any other citations first
    setLinkedDocs(prev => prev.map(doc => ({
      ...doc,
      citations: doc.citations.map(cite => ({
        ...cite,
        justCreated: false // Clear any existing justCreated flags
      }))
    })));

    // Then set the new citation's justCreated flag
    setLinkedDocs(prev => prev.map(doc => ({
      ...doc,
      citations: doc.citations.map(cite =>
        cite.id === citationId
          ? { ...cite, text: title, isNew: false, justCreated: true }
          : cite
      )
    })));

    // NOTE: justCreated flag is now only cleared when:
    // 1. User clicks "Add to reasoning" (animation completes)
    // 2. User creates another citation (above code clears old ones)
  };

  // Handle citation deletion with two-click confirmation
  const handleDeleteCitation = (citationId: number) => {
    // First click: Mark for confirmation
    if (confirmingDeleteId !== citationId) {
      setConfirmingDeleteId(citationId);
      return;
    }

    // Second click: Actually delete
    setLinkedDocs(prev => prev.map(doc => ({
      ...doc,
      citations: doc.citations.filter(cite => cite.id !== citationId)
    })));
    setConfirmingDeleteId(null);
  };

  // Handle adding citation to reasoning
  // Dispatches a custom event that the editor can listen to
  const handleAddCitationToReasoning = (citation: Citation, fileName: string) => {
    const event = new CustomEvent('add-citation-to-reasoning', {
      detail: { citationId: citation.id, fileName }
    });
    window.dispatchEvent(event);

    // Clear justCreated flag after adding to reasoning
    setLinkedDocs(prev => prev.map(doc => ({
      ...doc,
      citations: doc.citations.map(cite =>
        cite.id === citation.id
          ? { ...cite, justCreated: false }
          : cite
      )
    })));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Mock: Status */}
      <div>
        <div className="text-[13px] font-[500] text-[#141414] mb-2">Status</div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
          <span className="text-[13px] text-[#525252]">Überprüft</span>
        </label>
      </div>

      {/* Mock: Ergebnis */}
      <div>
        <div className="text-[13px] font-[500] text-[#141414] mb-2">Ergebnis</div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md text-[13px] text-green-700">
          <Check size={14} />
          Bestanden
          <ChevronDown size={14} className="ml-2" />
        </button>
      </div>

      {/* REAL COMPONENT: Begründung */}
      <div>
        <LexicalJustificationEditor
          label="Begründung"
          citations={allCitations}
        />
      </div>

      {/* REAL COMPONENT: Referenzen */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[16px] leading-[22px] font-[550] text-[#141414]">Referenzen</div>

          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[rgba(0,0,0,0.06)] rounded-[5px] text-[13px] leading-[19px] font-[475] text-[#141414] transition-colors">
                <Plus size={14} className="text-[#8A8A8A]" />
                Add document
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-white border border-[rgba(0,0,0,0.14)] rounded-[6px] shadow-lg" align="end">
              <div className="p-3 border-b border-[rgba(0,0,0,0.09)]">
                <Input
                  placeholder="Search documents..."
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  className="h-8 text-[13px] leading-[19px] bg-[#F9F9F9] border-[rgba(0,0,0,0.09)]"
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {availableForLinking.map((doc) => (
                  <button
                    key={doc.fileName}
                    onClick={() => {
                      setLinkedDocs(prev => [...prev, doc]);
                      setLinkPopoverOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-[rgba(0,0,0,0.03)] flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#8a8a8a] shrink-0" />
                    <span className="text-[13px] leading-[19px] text-[#141414] truncate">{doc.fileName}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-3">
          {linkedDocs.map((doc) => (
            <ReferenceGroup
              key={doc.fileName}
              doc={doc}
              onRemove={(fileName) => setLinkedDocs(prev => prev.filter(d => d.fileName !== fileName))}
              onUpdateCitationTitle={handleUpdateCitationTitle}
              onDeleteCitation={handleDeleteCitation}
              onAddCitationToReasoning={handleAddCitationToReasoning}
              confirmingDeleteId={confirmingDeleteId}
              setConfirmingDeleteId={setConfirmingDeleteId}
            />
          ))}
        </div>
      </div>

      {/* Mock: Kommentare */}
      <div>
        <div className="text-[16px] leading-[22px] font-[550] text-[#141414] mb-2">Kommentare</div>
        <div className="border border-[rgba(0,0,0,0.14)] rounded-[6px] h-10 bg-white"></div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP - Combines mock and real components
// ============================================================================

export default function App() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [highlightedAreas, setHighlightedAreas] = useState<HighlightedArea[]>([]);

  // Sample citation data
  const mockFullText = "Das Leitungsorgan trägt die Gesamtverantwortung für die Informationssicherheitspolitik des Unternehmens und muss sicherstellen, dass angemessene Ressourcen für die Implementierung und Aufrechterhaltung der Sicherheitsmaßnahmen bereitgestellt werden.";

  const [linkedDocs, setLinkedDocs] = useState<ReferenceDoc[]>([
    {
      fileName: "Information Security Policy.pdf",
      citations: [
        { page: 4, text: "Rolle des Vorstands bei der Informationssicherheitspolitik", fullText: mockFullText, id: 1 },
        { page: 12, text: "Risikostrategie", fullText: mockFullText, id: 4 }
      ]
    },
    {
      fileName: "Outsourcing Policy.pdf",
      citations: [{ page: 4, text: "Verantwortlichkeiten des Vorstands für Outsourcing-Richtlinie", fullText: mockFullText, id: 2 }]
    },
    {
      fileName: "New Product Processes and Project.pdf",
      citations: [{ page: 6, text: "Bereitschaft des Managements zur Risikoübernahme", fullText: mockFullText, id: 3 }]
    }
  ]);

  // Get next citation ID
  const getNextId = () => {
    const allIds = linkedDocs.flatMap(doc => doc.citations.map(c => c.id));
    return Math.max(...allIds, 0) + 1;
  };

  // Handle area selection from PDF viewer
  const handleAreaSelected = (area: SelectionArea) => {
    const newId = getNextId();

    // Add to highlighted areas for visual display
    setHighlightedAreas(prev => [...prev, {
      ...area,
      id: newId,
      text: ""
    }]);

    // Add citation to first document (Information Security Policy.pdf)
    // Text is empty - user will type the title in the focused input
    setLinkedDocs(prev => prev.map((doc, index) => {
      if (index === 0) {
        return {
          ...doc,
          citations: [...doc.citations, {
            id: newId,
            page: 4,
            text: "",
            fullText: "Dies ist der vollständige Text aus dem markierten Bereich des PDF-Dokuments. Der Text würde normalerweise durch OCR oder Textextraktion ermittelt werden.",
            isNew: true
          }]
        };
      }
      return doc;
    }));

    // Exit selection mode after creating citation
    setIsSelectionMode(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white font-sans text-[#141414]">
      {/* Dev banner — remove in production */}
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-1 text-[11px] text-amber-800 flex items-center gap-4 shrink-0">
        <span className="font-semibold">DEV MODE</span>
        <span>Gray areas = mock scaffolding (header, sidebar, PDF viewer). Center panel = real citation components.</span>
      </div>

      {/* MOCK: Top Header — replace with your app shell */}
      <MockTopHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* MOCK: Left Sidebar — replace with your tree navigation */}
        <MockSidebar />

        {/* Main Content Area */}
        <div className="w-[35%] min-w-[400px] flex flex-col bg-white border-r border-gray-200 shrink-0">
          {/* MOCK: Page Title — replace with your page header */}
          <div className="px-6 py-5 border-b border-gray-100 shrink-0">
            <h1 className="text-[18px] font-[600] text-[#141414] mb-1">
              Verantwortung des Leitungsorgans für IKT-Risiken
            </h1>
            <p className="text-[14px] text-[#525252]">
              Ist die Letztverantwortung für das Management des IKT-Risikos des Unternehmens dem Leitungsorgan zugewiesen?
            </p>
          </div>

          {/* REAL: Content Panel with Begründung and Referenzen */}
          <RealContentPanel linkedDocs={linkedDocs} setLinkedDocs={setLinkedDocs} />
        </div>

        {/* MOCK: PDF Viewer — replace with your document viewer */}
        <MockPDFViewer
          isSelectionMode={isSelectionMode}
          onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
          onAreaSelected={handleAreaSelected}
          highlightedAreas={highlightedAreas}
        />
      </div>
    </div>
  );
}

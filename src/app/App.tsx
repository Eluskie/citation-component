import React, { useState, useRef } from 'react';
import { LexicalJustificationEditor, CitationData } from './components/lexical';
import { ChevronDown, ChevronRight, Plus, X, FileText, Check, Link2, Search, Filter, Highlighter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';
import { Input } from './components/ui/input';

// ============================================================================
// MOCK COMPONENTS - These are placeholder UI elements for demonstration
// These should be replaced with your actual application components
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
// REAL COMPONENTS - These are the actual components to be handed over
// ============================================================================

// Real: Citation data types
interface Citation {
  page: number;
  text: string;
  fullText?: string;
  id: number;
  isNew?: boolean;
}

interface ReferenceDoc {
  fileName: string;
  citations: Citation[];
}

// Real: Citation Row with tooltip
const CitationRow = ({
  citation,
  fileName,
  onUpdateTitle,
  onDelete
}: {
  citation: Citation;
  fileName: string;
  onUpdateTitle?: (id: number, title: string) => void;
  onDelete?: (id: number) => void;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipY, setTooltipY] = useState(0);
  const [editValue, setEditValue] = useState(citation.isNew ? '' : citation.text);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus input when new citation is created
  React.useEffect(() => {
    if (citation.isNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [citation.isNew]);

  const handleMouseEnter = () => {
    if (citation.isNew) return; // Don't show tooltip while editing
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setTooltipY(rect.top + rect.height / 2);
    }
    setShowTooltip(true);
  };

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
      ref={rowRef}
      className="group relative px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 cursor-default"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && !citation.isNew && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            width: '320px',
            right: '640px',
            top: tooltipY,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            <p className="text-[13px] leading-[1.7] text-[#141414]">
              {citation.fullText || citation.text}
            </p>
            <div className="border-t border-gray-100 my-3" />
            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A]">
              <span className="truncate pr-4">{fileName}</span>
              <span className="shrink-0">Page {citation.page}</span>
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-3 h-3 bg-white border-r border-t border-gray-200 rotate-45" />
        </div>
      )}

      {citation.isNew ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleFinishEditing}
          onKeyDown={handleKeyDown}
          placeholder="Enter citation title..."
          className="flex-1 text-[13px] leading-snug text-[#141414] bg-transparent border-b border-gray-300 focus:border-gray-500 outline-none py-0.5"
        />
      ) : (
        <div className="text-[13px] leading-snug text-[#141414] flex-1">
          {citation.text}
        </div>
      )}

      {/* Delete/Cancel button - appears on hover, right side before page number */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCancel}
            className="p-0.5 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          >
            <X size={14} className="text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#141414] text-white text-xs px-2 py-1">
          {citation.isNew ? 'Cancel' : 'Remove citation'}
        </TooltipContent>
      </Tooltip>

      <span className="text-[#8A8A8A] text-[13px] shrink-0">S. {citation.page}</span>
      <div className={`shrink-0 px-1.5 py-0.5 rounded text-[11px] font-[500] min-w-[18px] text-center ${citation.isNew ? 'bg-[#BFF981] text-[#141414]' : 'bg-[#EAEAEA] text-[#141414]'}`}>
        {citation.id}
      </div>
    </div>
  );
};

// Real: Reference Group (Document accordion)
const ReferenceGroup = ({
  doc,
  isCollapsed = false,
  onUnlink,
  onUpdateCitationTitle,
  onDeleteCitation
}: {
  doc: ReferenceDoc;
  isCollapsed?: boolean;
  onUnlink?: (docFileName: string) => void;
  onUpdateCitationTitle?: (citationId: number, title: string) => void;
  onDeleteCitation?: (citationId: number) => void;
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <div
        className="bg-white px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-[13px] font-[500] text-[#141414] truncate">{doc.fileName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {doc.citations.map((cite) => (
            <span
              key={cite.id}
              className={`rounded px-1.5 py-0.5 text-[11px] font-[500] min-w-[18px] text-center ${cite.isNew ? 'bg-[#BFF981] text-[#141414]' : 'bg-[#EAEAEA] text-[#141414]'}`}
            >
              {cite.id}
            </span>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => { e.stopPropagation(); setShowUnlinkConfirm(true); }}
                className="p-1 rounded hover:bg-gray-100 transition-colors ml-1 group"
              >
                <X size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#141414] text-white text-xs px-2 py-1">
              Click to unlink
            </TooltipContent>
          </Tooltip>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {showUnlinkConfirm && (
        <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between bg-[#FAFAFA]">
          <span className="text-[13px] text-[#525252]">Unlink this document?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onUnlink?.(doc.fileName); setShowUnlinkConfirm(false); }}
              className="px-2.5 py-1 text-[13px] font-[500] text-[#141414] hover:bg-gray-200 rounded transition-colors"
            >
              Unlink
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowUnlinkConfirm(false); }}
              className="px-2.5 py-1 text-[13px] text-[#8A8A8A] hover:text-[#141414] hover:bg-gray-200 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!collapsed && !showUnlinkConfirm && (
        <div className="border-t border-gray-100">
          {doc.citations.map((cite) => (
            <CitationRow
              key={cite.id}
              citation={cite}
              fileName={doc.fileName}
              onUpdateTitle={onUpdateCitationTitle}
              onDelete={onDeleteCitation}
            />
          ))}
        </div>
      )}
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
  const [citationMode] = useState<'scroll-strip' | 'sidebar' | 'popover'>('popover');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");

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
    setLinkedDocs(prev => prev.map(doc => ({
      ...doc,
      citations: doc.citations.map(cite =>
        cite.id === citationId
          ? { ...cite, text: title, isNew: false }
          : cite
      )
    })));
  };

  // Handle citation deletion (cancel new citation)
  const handleDeleteCitation = (citationId: number) => {
    setLinkedDocs(prev => prev.map(doc => ({
      ...doc,
      citations: doc.citations.filter(cite => cite.id !== citationId)
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
          mode={citationMode}
          label="Begründung"
          citations={allCitations}
        />
      </div>

      {/* REAL COMPONENT: Referenzen */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-[500] text-[#141414]">Referenzen</div>

          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-[5px] text-[13px] font-[500] text-[#141414] transition-colors">
                <Link2 size={14} className="text-[#8A8A8A]" />
                Link document
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-white border border-gray-200 rounded-[6px] shadow-lg" align="end">
              <div className="p-3 border-b border-gray-100">
                <Input
                  placeholder="Search documents..."
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  className="h-8 text-[13px] bg-[#F9F9F9] border-gray-200"
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
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[13px] text-[#141414] truncate">{doc.fileName}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-3">
          {linkedDocs.map((doc) => (
            <ReferenceGroup
              key={doc.fileName}
              doc={doc}
              isCollapsed={false}
              onUnlink={(fileName) => setLinkedDocs(prev => prev.filter(d => d.fileName !== fileName))}
              onUpdateCitationTitle={handleUpdateCitationTitle}
              onDeleteCitation={handleDeleteCitation}
            />
          ))}
        </div>
      </div>

      {/* Mock: Kommentare */}
      <div>
        <div className="text-[13px] font-[500] text-[#141414] mb-2">Kommentare</div>
        <div className="border border-gray-200 rounded-[6px] h-10 bg-white"></div>
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
      {/* MOCK: Top Header */}
      <MockTopHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* MOCK: Left Sidebar */}
        <MockSidebar />

        {/* Main Content Area */}
        <div className="w-[35%] min-w-[400px] flex flex-col bg-white border-r border-gray-200 shrink-0">
          {/* MOCK: Page Title */}
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

        {/* MOCK: PDF Viewer */}
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

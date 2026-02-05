import React, { useState } from 'react';
import svgPaths from '../imports/svg-kz4mqjgf9s';
import { LexicalJustificationEditor, CitationData } from './components/lexical';
import { ChevronDown, Search, Filter, Plus, X, Maximize2, Minimize2, MoreHorizontal, Paperclip, ChevronRight, ChevronUp, FileText, Check, Link2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';
import { Input } from './components/ui/input';

// --- Icons using the imported paths ---

const SvgIcon = ({ path, className = "size-full", fill = "none", stroke = "currentColor", strokeWidth = "1.25" }: any) => (
  <svg className={className} fill={fill} viewBox="0 0 13 13" preserveAspectRatio="none">
    <path d={path} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
  </svg>
);

const LogoIcon = () => (
  <svg className="h-[21px] w-auto" viewBox="0 0 21.0195 14.8242" fill="none">
    <mask fill="white" id="logo-mask">
      <path d={svgPaths.p11fd700} />
    </mask>
    <path d={svgPaths.p11fd700} fill="white" />
    <path d={svgPaths.p35097a00} fill="white" mask="url(#logo-mask)" />
  </svg>
);

// --- Layout Components ---

const TopHeader = () => (
  <div className="bg-[#163449] h-[48px] flex items-center px-3 justify-between shrink-0 text-white select-none z-50 relative">
    <div className="flex items-center gap-4">
      <div className="pl-1"><LogoIcon /></div>
      <div className="h-6 w-px bg-white/10 mx-2" />
      <div className="flex items-center gap-2 opacity-90 hover:opacity-100 cursor-pointer">
        <span className="text-[13px] font-[475]">Engagement</span>
        <SvgIcon path={svgPaths.pa029e20} className="w-3 h-3" stroke="white" />
      </div>
      <div className="flex items-center gap-2 opacity-80 text-[13px]">
        <SvgIcon path={svgPaths.p18c2a980} className="w-3 h-3" stroke="white" />
        <span>Alle Dateien geprüft, 24 Checks benötigen Überprüfung</span>
      </div>
    </div>
    
    <div className="flex items-center gap-2 pr-2 cursor-pointer">
      <span className="text-[13px] font-[475]">John Doe</span>
      <SvgIcon path={svgPaths.pa029e20} className="w-3 h-3" stroke="white" />
    </div>
  </div>
);

const SidebarItem = ({ iconPath, active = false }: { iconPath: string, active?: boolean }) => (
  <div className={`w-[29px] h-[29px] flex items-center justify-center rounded-[6px] cursor-pointer ${active ? 'bg-black/5' : 'hover:bg-black/5'}`}>
    <SvgIcon path={iconPath} className="w-[13px] h-[13px]" stroke={active ? "#141414" : "#8A8A8A"} />
  </div>
);

const Sidebar = () => (
  <div className="w-[48px] bg-[#f9f9f9] flex flex-col items-center py-3 gap-1 shrink-0 border-r border-gray-200/50">
    <SidebarItem iconPath={svgPaths.p21459440} /> {/* Dashboard */}
    <SidebarItem iconPath={svgPaths.p3f87df80} /> {/* Files */}
    <SidebarItem iconPath={svgPaths.p31fed150} active /> {/* Checks/List */}
    <div className="flex-1" />
    <div className="flex flex-col gap-1 mb-2">
      <SidebarItem iconPath={svgPaths.p35246c48} /> {/* Building */}
      <SidebarItem iconPath={svgPaths.p164cd700} /> {/* Users */}
      <SidebarItem iconPath={svgPaths.p208c5400} /> {/* FileText */}
      <SidebarItem iconPath={svgPaths.p5618b80} /> {/* Settings */}
      <SidebarItem iconPath={svgPaths.p424b080} /> {/* Collapse */}
    </div>
  </div>
);

// --- Table Components ---

const TableHeader = () => (
  <div className="flex items-center h-[32px] border-b border-[rgba(0,0,0,0.09)] text-[13px] text-[#525252] font-[475]">
    <div className="w-[320px] shrink-0 pl-4 flex items-center h-full border-r border-[rgba(0,0,0,0.09)]">Name</div>
    <div className="w-[184px] shrink-0 pl-3 flex items-center h-full border-r border-[rgba(0,0,0,0.09)]">Ergebnis</div>
    <div className="w-[144px] shrink-0 pl-3 flex items-center h-full border-r border-[rgba(0,0,0,0.09)]">Status</div>
    <div className="w-[192px] shrink-0 pl-3 flex items-center h-full border-r border-[rgba(0,0,0,0.09)]">Lücke</div>
    <div className="min-w-[200px] flex-1 pl-3 flex items-center h-full">Begründung</div>
  </div>
);

const StatusPill = ({ current, total }: { current: number, total: number }) => (
  <div className="flex items-center gap-2 text-[13px] text-[#141414]">
    <div className="w-[32px] h-[19px] relative flex flex-col justify-center">
      <div className="w-full h-[3px] bg-black/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#339b6a]" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
    <span className="font-[425]">{current}/{total}</span>
  </div>
);

const TableRow = ({ 
  name, 
  result, 
  total, 
  status, 
  level = 0, 
  expanded = false, 
  active = false 
}: any) => {
  const paddingLeft = 10 + (level * 20);
  
  return (
    <div className={`flex h-[40px] border-b border-[rgba(0,0,0,0.09)] text-[13px] text-[#141414]`}>
      <div className="w-[320px] shrink-0 flex items-center h-full border-r border-[rgba(0,0,0,0.09)] pr-2 relative">
         <div style={{ paddingLeft }} className="flex items-center gap-2 w-full">
           <button className="p-1 hover:bg-black/5 rounded shrink-0">
             {expanded ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
           </button>
           <span className="truncate font-[475]">{name}</span>
         </div>
      </div>
      
      <div className="w-[184px] shrink-0 px-3 flex items-center h-full border-r border-[rgba(0,0,0,0.09)]">
        {result === 'passed' ? (
           <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium border border-green-100">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
             Bestanden
           </span>
        ) : result === 'failed' ? (
           <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-medium border border-red-100">
             <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
             Nicht bestanden
           </span>
        ) : (
           <StatusPill current={result.current} total={result.total} />
        )}
      </div>
      
      <div className="w-[144px] shrink-0 px-3 flex items-center h-full border-r border-[rgba(0,0,0,0.09)]">
         {status === 'checked' ? (
           <div className="flex items-center gap-2 opacity-80">
             <div className="bg-black text-white rounded p-0.5"><SvgIcon path={svgPaths.p1098da98} className="w-2 h-2" strokeWidth={2} /></div>
             <span>Überprüft</span>
           </div>
         ) : status === 'unchecked' ? (
           <div className="flex items-center gap-2 opacity-40">
             <div className="border border-black rounded w-3.5 h-3.5" />
             <span>Überprüft</span>
           </div>
         ) : (
           <StatusPill current={status.current} total={status.total} />
         )}
      </div>
      
      <div className="w-[192px] shrink-0 px-3 flex items-center h-full border-r border-[rgba(0,0,0,0.09)] text-gray-400">
        {/* Gap column content */}
      </div>
      
      <div className="min-w-[200px] flex-1 px-3 flex items-center h-full">
        {/* Justification preview */}
      </div>
    </div>
  );
};

// --- Right Panel ---

interface Citation {
  page: number;
  text: string;
  fullText?: string; // Longer text for tooltip
  id: number;
}

interface ReferenceDoc {
  fileName: string;
  citations: Citation[];
}

// Citation row with tooltip on the LEFT side of the entire row
const CitationRow = ({ citation, fileName }: { citation: Citation; fileName: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipY, setTooltipY] = useState(0);
  const rowRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setTooltipY(rect.top + rect.height / 2);
    }
    setShowTooltip(true);
  };

  return (
    <div
      ref={rowRef}
      className="relative px-3 py-2.5 flex items-start justify-between gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 cursor-default"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip - positioned to the LEFT of the entire row, outside the container */}
      {showTooltip && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            width: '380px',
            right: '620px', // Right panel is 600px wide + some margin
            top: tooltipY,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            {/* Citation text - 13px, full text */}
            <p className="text-[13px] leading-[1.7] text-[#141414]">
              {citation.fullText || citation.text}
            </p>

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Source info - smaller */}
            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A]">
              <span className="truncate pr-4">{fileName}</span>
              <span className="shrink-0">Page {citation.page}</span>
            </div>
          </div>

          {/* Arrow pointing right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-3 h-3 bg-white border-r border-t border-gray-200 rotate-45" />
        </div>
      )}

      {/* Title first */}
      <div className="text-[13px] leading-snug text-[#141414] flex-1">
        {citation.text}
      </div>
      {/* Page number */}
      <span className="text-[#8A8A8A] text-[13px] shrink-0">S. {citation.page}</span>
      {/* Citation badge */}
      <div className="shrink-0 bg-[#EAEAEA] text-[#141414] px-1.5 py-0.5 rounded text-[11px] font-[500] min-w-[18px] text-center">
        {citation.id}
      </div>
    </div>
  );
};

const ReferenceGroup = ({
  doc,
  isCollapsed = false,
  onUnlink
}: {
  doc: ReferenceDoc;
  isCollapsed?: boolean;
  onUnlink?: (docFileName: string) => void;
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const handleUnlink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUnlinkConfirm(true);
  };

  const confirmUnlink = () => {
    onUnlink?.(doc.fileName);
    setShowUnlinkConfirm(false);
  };

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
              className="bg-[#EAEAEA] text-[#141414] rounded px-1.5 py-0.5 text-[11px] font-[500] min-w-[18px] text-center"
            >
              {cite.id}
            </span>
          ))}
          {/* Unlink (X) button with tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleUnlink}
                className="p-1 rounded hover:bg-gray-100 transition-colors ml-1 group"
              >
                <X size={14} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#141414] text-white text-xs px-2 py-1">
              Click to unlink
            </TooltipContent>
          </Tooltip>
          {/* Chevron */}
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Inline unlink confirmation - subtle, single line */}
      {showUnlinkConfirm && (
        <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between bg-[#FAFAFA]">
          <span className="text-[13px] text-[#525252]">Unlink this document?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={confirmUnlink}
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
            <CitationRow key={cite.id} citation={cite} fileName={doc.fileName} />
          ))}
        </div>
      )}
    </div>
  );
};

// Available documents pool for linking
const DOCUMENT_POOL: ReferenceDoc[] = [
  { fileName: "Compliance Guidelines 2024.pdf", citations: [] },
  { fileName: "Data Protection Policy.pdf", citations: [] },
  { fileName: "Business Continuity Plan.pdf", citations: [] },
  { fileName: "Internal Control Standards.pdf", citations: [] },
  { fileName: "Vendor Management Policy.pdf", citations: [] },
  { fileName: "Incident Response Plan.pdf", citations: [] },
];

const RightPanel = () => {
  const [citationMode, setCitationMode] = useState<
    'scroll-strip' | 'sidebar' | 'popover'
  >('scroll-strip');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");

  // Long mock text for tooltip testing (approximately 10 lines)
  const mockFullText = "Das Leitungsorgan trägt die Gesamtverantwortung für die Informationssicherheitspolitik des Unternehmens und muss sicherstellen, dass angemessene Ressourcen für die Implementierung und Aufrechterhaltung der Sicherheitsmaßnahmen bereitgestellt werden. Die Politik muss regelmäßig überprüft und an neue Bedrohungen und regulatorische Anforderungen angepasst werden. Darüber hinaus ist das Leitungsorgan verpflichtet, eine Kultur der Sicherheitsbewusstheit im gesamten Unternehmen zu fördern. Die Überwachung der Wirksamkeit der Sicherheitsmaßnahmen erfolgt durch regelmäßige Berichte an den Vorstand, der mindestens vierteljährlich über den Status der Informationssicherheit informiert wird. Bei wesentlichen Sicherheitsvorfällen ist eine sofortige Eskalation an das Leitungsorgan erforderlich. Die Verantwortung umfasst auch die Genehmigung des jährlichen Sicherheitsbudgets sowie die Freigabe strategischer Sicherheitsinitiativen.";

  // Define initial documents
  const initialDocs: ReferenceDoc[] = [
    {
      fileName: "Information Security Policy.pdf",
      citations: [{ page: 4, text: "Rolle des Vorstands bei der Informationssicherheitspolitik", fullText: mockFullText, id: 1 }]
    },
    {
      fileName: "Internal Audit Report 2024.pdf",
      citations: [
        { page: 12, text: "Audit findings regarding risk appetite framework", fullText: mockFullText, id: 4 },
        { page: 12, text: "Observations on board oversight mechanisms", fullText: mockFullText, id: 5 },
        { page: 14, text: "Recommendations for ICT governance structure", fullText: mockFullText, id: 6 },
        { page: 15, text: "Management response to audit finding #4", fullText: mockFullText, id: 7 },
        { page: 18, text: "Timeline for remediation implementation", fullText: mockFullText, id: 8 },
        { page: 22, text: "Final conclusion on control effectiveness", fullText: mockFullText, id: 9 }
      ]
    },
    {
      fileName: "Outsourcing Policy.pdf",
      citations: [{ page: 4, text: "Verantwortlichkeiten des Vorstands für Outsourcing-Richtlinie", fullText: mockFullText, id: 2 }]
    },
    {
      fileName: "Board Meeting Minutes Q1.pdf",
      citations: [{ page: 3, text: "Approval of new ICT strategy", fullText: mockFullText, id: 10 }]
    },
    {
      fileName: "Risk Management Framework.pdf",
      citations: [
        { page: 8, text: "Roles and responsibilities definition", fullText: mockFullText, id: 11 },
        { page: 9, text: "Reporting lines structure", fullText: mockFullText, id: 12 }
      ]
    },
    {
      fileName: "IT Governance Charter.pdf",
      citations: [{ page: 2, text: "Delegation of authority matrix", fullText: mockFullText, id: 13 }]
    },
    {
      fileName: "External Regulator Report.pdf",
      citations: [{ page: 45, text: "Compliance assessment summary", fullText: mockFullText, id: 14 }]
    },
    {
      fileName: "Annual Report.pdf",
      citations: [{ page: 88, text: "Risk declaration statement", fullText: mockFullText, id: 15 }]
    }
  ];

  // State for linked documents
  const [linkedDocs, setLinkedDocs] = useState<ReferenceDoc[]>(initialDocs);

  // Filter available documents for linking (not already linked)
  const availableForLinking = DOCUMENT_POOL.filter(
    poolDoc => !linkedDocs.some(linked => linked.fileName === poolDoc.fileName)
  ).filter(doc =>
    doc.fileName.toLowerCase().includes(linkSearchQuery.toLowerCase())
  );

  // Handle linking a document
  const handleLinkDocument = (doc: ReferenceDoc) => {
    setLinkedDocs(prev => [...prev, doc]);
    setLinkPopoverOpen(false);
    setLinkSearchQuery("");
  };

  // Handle unlinking a document
  const handleUnlinkDocument = (fileName: string) => {
    setLinkedDocs(prev => prev.filter(doc => doc.fileName !== fileName));
  };

  // Use linkedDocs instead of allDocs
  const allDocs = linkedDocs;

  // Flatten citations for tooltip data
  const allCitations: CitationData[] = allDocs.flatMap((doc) =>
    doc.citations.map((cite) => ({
      id: cite.id,
      text: cite.text,
      fullText: cite.fullText,
      page: cite.page,
      fileName: doc.fileName,
    }))
  );

  return (
    <div className="fixed top-0 right-0 h-full w-[600px] flex flex-col bg-white border-l border-gray-200 shadow-2xl z-50">
      {/* 1. Header */}
      <div className="px-5 py-4 flex items-start justify-between bg-white shrink-0">
        <X size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
        <div className="flex items-center gap-4 text-gray-400">
           <Maximize2 size={18} className="cursor-pointer hover:text-gray-600" />
           <div className="flex items-center gap-1">
             <ChevronUp size={20} className="cursor-pointer hover:text-gray-600" />
             <ChevronDown size={20} className="cursor-pointer hover:text-gray-600" />
           </div>
        </div>
      </div>
      
      {/* Title Area */}
      <div className="px-6 pb-6 shrink-0">
        <h2 className="text-[18px] font-[600] text-[#141414] leading-tight mb-2">Verantwortung des Leitungsorgans für IKT-Risiken</h2>
        <p className="text-[14px] text-[#525252] leading-snug">
          Ist die Letztverantwortung für das Management des IKT-Risikos des Unternehmens dem Leitungsorgan zugewiesen?
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 flex items-center gap-2 overflow-x-auto no-scrollbar bg-white shrink-0 border-b border-gray-100">
        <div className="px-4 py-2 bg-white border border-b-0 border-gray-200 rounded-t-md text-[13px] font-[500] text-[#141414] relative top-[1px] z-10">
          Ergebnis
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] rounded-t-md text-[13px] text-[#525252] whitespace-nowrap cursor-pointer hover:bg-gray-200">
           <FileText className="w-3.5 h-3.5 text-gray-500" />
           Information...
           <X size={14} className="ml-1 text-gray-400 hover:text-gray-600" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] rounded-t-md text-[13px] text-[#525252] whitespace-nowrap cursor-pointer hover:bg-gray-200">
           <FileText className="w-3.5 h-3.5 text-gray-500" />
           Leitlinie IKT-...
           <X size={14} className="ml-1 text-gray-400 hover:text-gray-600" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] rounded-t-md text-[13px] text-[#525252] whitespace-nowrap cursor-pointer hover:bg-gray-200">
           <FileText className="w-3.5 h-3.5 text-gray-500" />
           New Product...
           <X size={14} className="ml-1 text-gray-400 hover:text-gray-600" />
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
          <Plus size={16} />
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        
        {/* Status */}
        <div>
          <div className="text-[13px] font-[500] text-[#141414] mb-2">Status</div>
          <label className="flex items-center gap-2 text-[13px] text-[#141414] cursor-pointer select-none">
            <div className="w-4 h-4 border border-gray-300 rounded bg-white flex items-center justify-center">
              {/* Checkbox unchecked state visual */}
            </div>
            Überprüft
          </label>
        </div>
        
        {/* Ergebnis (Dropdown Control for Citation Mode) */}
        <div>
          <div className="text-[13px] font-[500] text-[#141414] mb-2">Ergebnis (Interaction Model)</div>
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-[6px] text-[13px] font-medium text-[#141414] shadow-sm hover:bg-gray-50 min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                 {citationMode === 'scroll-strip' && 'Scroll Strip'}
                 {citationMode === 'sidebar' && 'Sidebar'}
                 {citationMode === 'popover' && 'Popover'}
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-[6px] shadow-lg z-20 overflow-hidden">
                  <div
                    className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${citationMode === 'scroll-strip' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => { setCitationMode('scroll-strip'); setIsDropdownOpen(false); }}
                  >
                    Scroll Strip
                    {citationMode === 'scroll-strip' && <Check size={12} />}
                  </div>
                  <div
                    className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${citationMode === 'sidebar' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => { setCitationMode('sidebar'); setIsDropdownOpen(false); }}
                  >
                    Sidebar
                    {citationMode === 'sidebar' && <Check size={12} />}
                  </div>
                  <div
                    className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${citationMode === 'popover' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => { setCitationMode('popover'); setIsDropdownOpen(false); }}
                  >
                    Popover
                    {citationMode === 'popover' && <Check size={12} />}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Begründung (Justification) */}
        <div>
          <LexicalJustificationEditor
            mode={citationMode}
            label="Begründung"
            citations={allCitations}
          />
        </div>

        {/* Referenzen - Unified List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-[500] text-[#141414]">Referenzen</div>

            {/* Link Document Button with Popover */}
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
                    className="h-8 text-[13px] bg-[#F9F9F9] border-gray-200 focus:border-gray-300 focus:ring-0"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {availableForLinking.length > 0 ? (
                    availableForLinking.map((doc) => (
                      <button
                        key={doc.fileName}
                        onClick={() => handleLinkDocument(doc)}
                        className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-[13px] text-[#141414] truncate">{doc.fileName}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <span className="text-[13px] text-[#8A8A8A]">
                        {linkSearchQuery ? "No matching documents" : "No documents available"}
                      </span>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
             {allDocs.map((doc, i) => (
               <ReferenceGroup
                 key={doc.fileName}
                 doc={doc}
                 isCollapsed={i > 2}
                 onUnlink={handleUnlinkDocument}
               />
             ))}
          </div>
        </div>

        {/* Kommentare */}
        <div>
          <div className="text-[13px] font-[500] text-[#141414] mb-2">Kommentare</div>
          <div className="border border-gray-200 rounded-[6px] h-10 bg-white shadow-sm hover:border-gray-300 transition-colors"></div>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-[6px] text-[13px] font-[500] text-[#141414] transition-colors">
            <Plus size={14} className="text-[#8A8A8A]" />
            Empfehlung hinzufügen
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F5] hover:bg-[#EAEAEA] rounded-[6px] text-[13px] font-[500] text-[#141414] transition-colors">
            <Plus size={14} className="text-[#8A8A8A]" />
            Kommentar hinzufügen
          </button>
        </div>

        {/* Bottom Spacer */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white font-sans text-[#141414] relative">
      <TopHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Page Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h1 className="text-[16px] font-[550] tracking-tight">Ergebnisse</h1>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Search" className="pl-8 pr-3 py-1.5 rounded-md border border-gray-200 text-sm w-[200px] focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  Filter
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-200 mx-2" />
              
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50">
                <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Dokumente hochladen
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50">
                <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Exportieren
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#163449] border border-[#163449] rounded-md text-sm text-white hover:opacity-90">
                Prüfung durchführen
              </button>
            </div>
          </div>
          
          {/* Main Content Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-white">
              <div className="min-w-full inline-block align-middle">
                {/* 
                   Table Layout Strategy:
                   Using a min-width on the container to ensure columns don't crunch.
                   Each column has a fixed width or percentage, adding up to the total.
                   No animations.
                */}
                <div className="min-w-[1100px] p-4">
                  <TableHeader />
                  <div className="mt-1">
                    <TableRow name="Strategie" result={{current: 4, total: 9}} status={{current: 9, total: 9}} level={0} expanded={true} />
                    <TableRow name="IKT-Risikomanagement" result={{current: 27, total: 42}} status={{current: 2, total: 42}} level={0} expanded={true} />
                    <TableRow name="Governance des Risikomanagements" result={{current: 4, total: 5}} status={{current: 2, total: 5}} level={1} expanded={true} />
                    <TableRow name="Aufsicht über das IKT-Risikomanagement" result="passed" status="checked" level={2} />
                    <TableRow name="Verantwortung des Leitungsorgans für IKT-Risiken" result="passed" status="checked" level={2} active={true} />
                    <TableRow name="Definition von IKT-Rollen und Verantwortlichkeiten" result="failed" status="unchecked" level={2} />
                    <TableRow name="Definition von IKT-Governance-Regelungen" result="passed" status="unchecked" level={2} />
                    <TableRow name="Definierte IKT-Koordinationsmechanismen" result="passed" status="unchecked" level={2} />
                    <TableRow name="Prüfung & Compliance" result={{current: 5, total: 5}} status={{current: 0, total: 5}} level={0} expanded={true} />
                    <TableRow name="Genehmigung und Überprüfung von IKT-Prüfungsplänen/-prüfungen durch das Leitungsorgan" result="passed" status="unchecked" level={1} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel is fixed */}
          </div>
        </div>
      </div>
      
      {/* Right Panel Placed here */}
      <RightPanel />
    </div>
  );
}

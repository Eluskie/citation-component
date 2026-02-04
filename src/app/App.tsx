import React, { useState } from 'react';
import svgPaths from '../imports/svg-kz4mqjgf9s';
import { JustificationEditor } from './components/JustificationEditor';
import { LexicalJustificationEditor } from './components/lexical';
import { ChevronDown, Search, Filter, Plus, X, Maximize2, Minimize2, MoreHorizontal, Paperclip, ChevronRight, ChevronUp, FileText, Check } from 'lucide-react';

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
  id: number;
}

interface ReferenceDoc {
  fileName: string;
  citations: Citation[];
}

const ReferenceGroup = ({ doc, isCollapsed = false }: { doc: ReferenceDoc; isCollapsed?: boolean }) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const citationCount = doc.citations.length;

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
          <ChevronDown size={14} className={`text-gray-400 ml-1 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {!collapsed && (
        <div className="border-t border-gray-100">
          {doc.citations.map((cite, i) => (
            <div key={i} className="px-3 py-2.5 flex items-start justify-between gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
              <div className="text-[13px] leading-snug text-[#141414]">
                <span className="text-[#8A8A8A] mr-1">S. {cite.page}</span>
                {cite.text}
              </div>
              <div className="shrink-0 bg-[#EAEAEA] text-[#141414] px-1.5 py-0.5 rounded text-[11px] font-[500] min-w-[18px] text-center">
                {cite.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RightPanel = () => {
  const [citationMode, setCitationMode] = useState<
    'scroll-strip' | 'sidebar' | 'popover' | 'lexical-scroll-strip' | 'lexical-sidebar' | 'lexical-popover'
  >('scroll-strip');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Define all distinct documents
  const doc1: ReferenceDoc = {
    fileName: "Information Security Policy.pdf",
    citations: [{ page: 4, text: "Rolle des Vorstands bei der Informationssicherheitspolitik", id: 1 }]
  };

  const doc2_multi: ReferenceDoc = {
    fileName: "Internal Audit Report 2024.pdf",
    citations: [
      { page: 12, text: "Audit findings regarding risk appetite framework", id: 4 },
      { page: 12, text: "Observations on board oversight mechanisms", id: 5 },
      { page: 14, text: "Recommendations for ICT governance structure", id: 6 },
      { page: 15, text: "Management response to audit finding #4", id: 7 },
      { page: 18, text: "Timeline for remediation implementation", id: 8 },
      { page: 22, text: "Final conclusion on control effectiveness", id: 9 }
    ]
  };

  const doc3: ReferenceDoc = {
    fileName: "Outsourcing Policy.pdf",
    citations: [{ page: 4, text: "Verantwortlichkeiten des Vorstands für Outsourcing-Richtlinie", id: 2 }]
  };

  const doc4: ReferenceDoc = {
    fileName: "Board Meeting Minutes Q1.pdf",
    citations: [{ page: 3, text: "Approval of new ICT strategy", id: 10 }]
  };

  const doc5: ReferenceDoc = {
    fileName: "Risk Management Framework.pdf",
    citations: [{ page: 8, text: "Roles and responsibilities definition", id: 11 }, { page: 9, text: "Reporting lines structure", id: 12 }]
  };

  const doc6: ReferenceDoc = {
    fileName: "IT Governance Charter.pdf",
    citations: [{ page: 2, text: "Delegation of authority matrix", id: 13 }]
  };

  const doc7: ReferenceDoc = {
    fileName: "External Regulator Report.pdf",
    citations: [{ page: 45, text: "Compliance assessment summary", id: 14 }]
  };

  const doc8: ReferenceDoc = {
    fileName: "Annual Report.pdf",
    citations: [{ page: 88, text: "Risk declaration statement", id: 15 }]
  };

  // Combine into one single list
  const allDocs = [doc1, doc2_multi, doc3, doc4, doc5, doc6, doc7, doc8];

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
                 {citationMode === 'lexical-scroll-strip' && 'Lexical Scroll Strip'}
                 {citationMode === 'lexical-sidebar' && 'Lexical Sidebar'}
                 {citationMode === 'lexical-popover' && 'Lexical Popover'}
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-[6px] shadow-lg z-20 overflow-hidden">
                  {/* ContentEditable versions */}
                  <div className="px-3 py-1.5 text-[11px] text-[#8A8A8A] font-medium border-b border-gray-100">
                    ContentEditable
                  </div>
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

                  {/* Lexical versions */}
                  <div className="px-3 py-1.5 text-[11px] text-[#8A8A8A] font-medium border-t border-b border-gray-100">
                    Lexical
                  </div>
                  <div
                    className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${citationMode === 'lexical-scroll-strip' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => { setCitationMode('lexical-scroll-strip'); setIsDropdownOpen(false); }}
                  >
                    Scroll Strip
                    {citationMode === 'lexical-scroll-strip' && <Check size={12} />}
                  </div>
                  <div
                    className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${citationMode === 'lexical-sidebar' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => { setCitationMode('lexical-sidebar'); setIsDropdownOpen(false); }}
                  >
                    Sidebar
                    {citationMode === 'lexical-sidebar' && <Check size={12} />}
                  </div>
                  <div
                    className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50 flex items-center justify-between ${citationMode === 'lexical-popover' ? 'bg-gray-50 font-medium' : ''}`}
                    onClick={() => { setCitationMode('lexical-popover'); setIsDropdownOpen(false); }}
                  >
                    Popover
                    {citationMode === 'lexical-popover' && <Check size={12} />}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Begründung (Justification) */}
        <div>
          {citationMode.startsWith('lexical-') ? (
            <LexicalJustificationEditor
              mode={citationMode.replace('lexical-', '') as 'scroll-strip' | 'sidebar' | 'popover'}
              label="Begründung"
            />
          ) : (
            <JustificationEditor mode={citationMode} label="Begründung" />
          )}
        </div>

        {/* Referenzen - Unified List */}
        <div>
          <div className="text-[13px] font-[500] text-[#141414] mb-2">Referenzen</div>
          
          <div className="space-y-3">
             {allDocs.map((doc, i) => (
               <ReferenceGroup key={i} doc={doc} isCollapsed={i > 2} />
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

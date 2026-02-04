import { useState } from 'react';
import { CitationHeader, SidebarVariation, getCitationHtml } from './CitationVariations';

const INITIAL_TEXT = `Das Leitungsorgan legt die gesamte Informationssicherheitsrichtlinie fest und stellt deren Verbreitung sicher, wobei diese mit den IT- und Risikostrategien des Unternehmens übereinstimmen muss ${getCitationHtml(1)} . Es ist auch für die Überprüfung und Genehmigung der Auslagerungsrichtlinie verantwortlich ${getCitationHtml(2)} und muss die Gesamtverantwortung für alle Risiken im Zusammenhang mit neuen Geschäftsaktivitäten tragen ${getCitationHtml(3)} .`;

interface JustificationEditorProps {
  mode?: 'scroll-strip' | 'sidebar' | 'popover';
  label?: string;
}

export const JustificationEditor = ({ mode = 'scroll-strip', label = 'Begründung' }: JustificationEditorProps) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="w-full">
      {/* Header with label on left, citation tools on right - same line */}
      <CitationHeader
        label={label}
        mode={mode}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
      />

      {/* Content area */}
      <div className="bg-white rounded-[6px] border border-[#E1E1E1] p-3 relative overflow-hidden">
        <div className="flex relative">
          <div
            contentEditable
            suppressContentEditableWarning
            className={`text-[13px] leading-[20px] text-[#141414] focus:outline-none min-h-[80px] w-full transition-[padding] duration-300 ${
              mode === 'sidebar' && sidebarVisible ? 'pr-10' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: INITIAL_TEXT }}
          />

          {/* Sidebar sits inside the editor area to the right */}
          {mode === 'sidebar' && <SidebarVariation visible={sidebarVisible} />}
        </div>
      </div>
    </div>
  );
};

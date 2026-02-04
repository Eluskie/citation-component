import { createContext, useContext, ReactNode } from 'react';

export interface CitationData {
  id: number;
  text: string;
  fullText?: string; // Longer text for tooltip
  page: number;
  fileName: string;
}

interface CitationContextValue {
  getCitation: (id: number) => CitationData | undefined;
}

const CitationContext = createContext<CitationContextValue | null>(null);

export function useCitationData() {
  const context = useContext(CitationContext);
  if (!context) {
    // Return a fallback that returns undefined for all citations
    return { getCitation: () => undefined };
  }
  return context;
}

interface CitationProviderProps {
  citations: CitationData[];
  children: ReactNode;
}

export function CitationProvider({ citations, children }: CitationProviderProps) {
  const citationMap = new Map(citations.map((c) => [c.id, c]));

  const getCitation = (id: number) => citationMap.get(id);

  return (
    <CitationContext.Provider value={{ getCitation }}>
      {children}
    </CitationContext.Provider>
  );
}

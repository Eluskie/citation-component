# Citation Component — Developer Handover

## Figma

All states and interactions are designed here:
https://www.figma.com/design/yPrdHh0ZQnFm3cHRF3YMk7/Cortea-App-2.0?node-id=598-9911

---

## Setup

```bash
npm install
npm run dev
```

The app opens with a demo page showing the citation system in context. A yellow "DEV MODE" banner at the top tells you what's mock scaffolding vs real components.

---

## What's Real (Ship This)

Everything in `src/app/components/lexical/` is production-ready:

| File | Purpose |
|------|---------|
| `CitationNode.tsx` | Custom Lexical node — renders citation chips, supports drag/drop |
| `CitationPlugin.tsx` | Handles drop events, caret positioning, drop indicator animation |
| `CitationContext.tsx` | React Context providing citation data to chips via `useCitationData()` |
| `LexicalJustificationEditor.tsx` | Main editor component with popover citation insertion |
| `index.ts` | Public exports |

Also real:
- `App.tsx` > `RealContentPanel` — Citation references section (ReferenceGroup, CitationRow)
- `App.tsx` > `CitationRow` — Individual citation with create/edit/delete states
- `AnimatedAddToReasoningButton.tsx` — "Insert citation" button that auto-focuses

### Citation insertion uses the **Popover** variation
User clicks "Insert citation" > popover opens with available citations > click or drag to insert.

---

## What's Mock (For Demo Context Only)

These components in `App.tsx` exist so you can see citations in a realistic layout. Replace them with your real app:

| Mock Component | What it simulates |
|---------------|-------------------|
| `MockTopHeader` | App header bar |
| `MockSidebar` | Tree navigation (Ergebnisse) |
| `MockPDFViewer` | PDF viewer with area selection for creating citations |
| Status/Ergebnis sections | Check result dropdowns |
| Kommentare section | Comments placeholder |

All mock components are clearly labeled with `Mock` prefix and `// MOCK:` comments.

---

## Data Flow

```
App state (linkedDocs, citations)
    |
    v
CitationProvider  -->  CitationContext  -->  CitationChip (useCitationData)
    |
    v
LexicalJustificationEditor
    |-- LexicalPopover (click/drag to insert)
    |-- CitationPlugin (handles drop, positions caret)
    |-- CitationNode (renders inline chip)

Custom Event: 'add-citation-to-reasoning'
    dispatched from CitationRow buttons
    listened by LexicalJustificationEditor
```

---

## API Integration Points

Replace these with your backend:

### 1. Citation data
```tsx
// Current: hardcoded in App.tsx (linkedDocs state)
// Your API should return:
interface CitationData {
  id: number;
  text: string;        // Short label shown in reference list
  fullText?: string;   // Full text for tooltip (currently disabled)
  page: number;
  fileName: string;
}
```

### 2. Document linking
```tsx
// Current: local state in App.tsx
// Replace with API calls for:
// - Fetch linked documents
// - Link/unlink a document
// - Search available documents
```

### 3. Editor content persistence
```tsx
<LexicalJustificationEditor
  onChange={(editorState) => {
    const json = editorState.toJSON();
    saveToAPI(json);
  }}
/>
```

### 4. Citation creation (from PDF selection)
Currently `MockPDFViewer.handleAreaSelected` creates a citation with `isNew: true`. Your real PDF viewer should call the same pattern to trigger the create flow.

---

## Known Issues

| Issue | Location | Impact |
|-------|----------|--------|
| Tooltip disabled | `CitationNode.tsx:86` — `false && showTooltip` | Re-enable when `fullText` available from API |
| Global selection state | `CitationPlugin.tsx:22` — module-level variable | Fine for single editor per page; fix if multiple editors |
| HMR workaround | `CitationNode.tsx:16` — `Date.now()` version | Harmless in production, can remove |
| Runtime style injection | `CitationPlugin.tsx:42-53` | Consider moving drop indicator CSS to stylesheet |
| Hardcoded tooltip position | `CitationNode.tsx:90` — `620px` | Make responsive if panel width changes |

---

## File Structure

```
src/app/
├── App.tsx                              # Demo shell + REAL reference components
├── components/
│   ├── lexical/                         # <-- THE REAL COMPONENT (ship this)
│   │   ├── CitationNode.tsx             # Custom Lexical node
│   │   ├── CitationPlugin.tsx           # Drag/drop handler
│   │   ├── CitationContext.tsx          # Citation data provider
│   │   ├── LexicalJustificationEditor.tsx  # Main editor (popover mode)
│   │   └── index.ts                     # Public API
│   ├── ui/                              # shadcn/ui components (keep as-is)
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── AnimatedAddToReasoningButton.tsx
└── styles/
    └── index.css
```

---

## Simplest Path to Production

1. Extract `src/app/components/lexical/` into your app
2. Feed real citation data via the `citations` prop
3. Wire up `onChange` to persist editor content
4. Replace mock components with your real app shell
5. Re-enable tooltips when `fullText` is available from the backend
6. Remove the DEV MODE banner from `App.tsx`

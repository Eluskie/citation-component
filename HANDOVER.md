# Citation Component - Developer Handover

## Quick Summary

This is a **prototype/demo** codebase showing 3 UX variations for inserting citations into a Lexical text editor. **Only one variation will be used in production** - pick one and delete the others.

**Your team should:**
1. Pick ONE variation (Scroll Strip, Sidebar, or Popover)
2. Delete the other 2 variations from `LexicalJustificationEditor.tsx`
3. Replace all mock data with API calls
4. Remove the demo mode switcher dropdown

---

## What's Real vs Mock

### REAL (Keep and adapt)
- `src/app/components/lexical/` - The Lexical editor integration (CitationNode, CitationPlugin)
- Citation drag-and-drop mechanism
- Tooltip rendering for citation details
- Document linking/unlinking UI

### MOCK (Replace with your API)
| Location | What to replace |
|----------|-----------------|
| `App.tsx:339-346` | `DOCUMENT_POOL` - hardcoded available documents |
| `App.tsx:360-403` | `initialDocs` - hardcoded linked documents with citations |
| `App.tsx:357` | `mockFullText` - same German text repeated for all citations |
| `App.tsx:735-745` | Table rows are static, no interaction |
| `LexicalJustificationEditor.tsx:45-66` | `prepopulateEditor()` - hardcoded editor content |

---

## The 3 Variations (Pick ONE)

The demo has a dropdown to switch between 3 interaction modes (all use Lexical):

| Mode | UI Pattern | Description |
|------|------------|-------------|
| `scroll-strip` | Scroll Strip | Horizontal scrollable citations above editor |
| `sidebar` | Sidebar | Floating chips on right edge of editor |
| `popover` | Popover | Citations in dropdown menu |

**All variations use Lexical** - the ContentEditable versions have been removed.

---

## Code to DELETE After Choosing

Once you pick one variation:

1. **The mode switcher dropdown:** Delete from `App.tsx` (search for "Interaction Model")
2. **Unused UI variations:** In `LexicalJustificationEditor.tsx`, delete the 2 unused variation components (e.g., if you pick Sidebar, delete `LexicalScrollStrip` and `LexicalPopover`)
3. **Hardcode the mode:** Replace `mode={citationMode}` with your chosen mode, e.g., `mode="sidebar"`

---

## Key Integration Points

### 1. Citation Data (API Connection)

Replace this prop passing with your API:

```tsx
// Current (mock):
const allCitations: CitationData[] = allDocs.flatMap((doc) =>
  doc.citations.map((cite) => ({
    id: cite.id,
    text: cite.text,
    fullText: cite.fullText,
    page: cite.page,
    fileName: doc.fileName,
  }))
);

// Your API should return this shape:
interface CitationData {
  id: number;
  text: string;           // Short description
  fullText?: string;      // Full text for tooltip
  page: number;
  fileName: string;
}
```

### 2. Document Linking (API Connection)

Replace state management in `App.tsx:405-425`:

```tsx
// Current (local state):
const [linkedDocs, setLinkedDocs] = useState<ReferenceDoc[]>(initialDocs);

// Replace with:
// - API call to fetch linked documents
// - API call to link/unlink documents
// - useQuery/useMutation if using React Query
```

### 3. Editor Content Persistence

The editor content needs to be saved. Hook into `onChange`:

```tsx
<LexicalJustificationEditor
  onChange={(editorState) => {
    // Serialize and save to your API
    const json = editorState.toJSON();
    saveToAPI(json);
  }}
/>
```

---

## Hardcoded Values to Make Configurable

| Location | Value | What it is |
|----------|-------|------------|
| `CitationNode.tsx:90` | `620px` | Tooltip position (assumes 600px panel) |
| `CitationVariations.tsx:51` | `350px` | Max width of scroll strip |
| `CitationVariations.tsx:60` | `range(1, 15)` | Citation count limit |
| `App.tsx:442` | `600px` | Right panel width |

---

## Known Issues / Technical Debt

### 1. Global State in CitationPlugin (Medium Priority)
```tsx
// CitationPlugin.tsx:22
let lastKnownSelection: RangeSelection | null = null;
```
This module-level variable could cause issues with multiple editor instances. If you only have one editor per page, it's fine.

### 2. HMR Workaround (Ignore for Production)
```tsx
// CitationNode.tsx:16
export const CITATION_NODE_VERSION = Date.now();
```
This forces remount during development hot-reload. It's harmless in production but can be removed.

### 3. Style Injection (Low Priority)
```tsx
// CitationPlugin.tsx:42-53
const style = document.createElement('style');
document.head.appendChild(style);
```
The drop indicator animation styles are injected at runtime. Consider moving to your CSS file.

---

## File Structure Overview

```
src/app/
├── App.tsx                              # Main container, ALL mock data lives here
├── components/
│   ├── figma/                           # Figma-related utilities
│   └── lexical/
│       ├── LexicalJustificationEditor.tsx  # Main Lexical editor component
│       ├── CitationNode.tsx                # Custom Lexical node for citations
│       ├── CitationPlugin.tsx              # Drag/drop handling
│       ├── CitationContext.tsx             # Citation data provider
│       └── index.ts                        # Exports
└── components/ui/                       # shadcn/ui components (keep as-is)
```

---

## Simplest Path to Production

1. **Pick** one mode in `LexicalJustificationEditor.tsx` and delete the other two
2. **Delete** mode switcher dropdown in `App.tsx`
3. **Replace** `initialDocs` and `DOCUMENT_POOL` with API calls
4. **Add** `onChange` handler to save editor content
5. **Test** drag-and-drop still works with your real data

---

## Questions for Product

Before starting, clarify:

1. Which variation did stakeholders approve?
2. Where does citation data come from? (API endpoint)
3. How should editor content be saved? (Auto-save? Manual save?)
4. Should citations be validated? (e.g., can't insert citation #5 if it doesn't exist)
5. What happens when a linked document is deleted? (Remove citations? Show warning?)

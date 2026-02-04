# Justification Editor & Citation Variations

This project implements a rich text editor component (`JustificationEditor`) designed for a dashboard application. A key feature is the ability to drag and drop citation chips (e.g., `[1]`, `[2]`) into the text area. We have implemented three different UX patterns (interaction models) for accessing these citation chips, plus a Lexical-based editor option.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Component: `JustificationEditor`

The `JustificationEditor` is a wrapper around a `contentEditable` div. It accepts a `mode` prop to determine which citation interaction model to display.

**Props:**
- `mode` (optional): `'scroll-strip' | 'sidebar' | 'popover'` (default: `'scroll-strip'`)
- `label` (optional): `string` (default: `'Begründung'`) - The label text displayed above the editor.

**Usage:**
```tsx
import { JustificationEditor } from './components/JustificationEditor';

<JustificationEditor mode="scroll-strip" label="Begründung" />
```

## Interaction Models (Variations)

### 1. Scroll Strip (`'scroll-strip'`)
A horizontal, scrollable list of citation chips located in the header line, to the right of the label.

### 2. Sidebar (`'sidebar'`)
A vertical column of citation chips floating inside the editor text area, anchored to the right side. Includes a toggle button to show/hide.

### 3. Popover (`'popover'`)
A simplified "+ Add" button in the header. Clicking it opens a floating popup containing all available citations.

### 4. Lexical Editor (`'lexical'`)
A full-featured rich text editor powered by [Lexical](https://lexical.dev/), Meta's extensible text editor framework.

## Lexical Integration

The Lexical-based editor provides:
- **Custom CitationNode**: An inline DecoratorNode that renders citation chips
- **CitationPlugin**: Handles drag-and-drop insertion of citations
- **Full undo/redo support**: Via Lexical's HistoryPlugin
- **Serialization**: Citations can be serialized to/from JSON

**Usage:**
```tsx
import { LexicalJustificationEditor } from './components/lexical';

<LexicalJustificationEditor
  mode="sidebar"
  label="Begründung"
  onChange={(editorState) => console.log(editorState)}
/>
```

## File Structure

- **`/src/app/components/JustificationEditor.tsx`**: Main editor container (contentEditable version)
- **`/src/app/components/CitationVariations.tsx`**: UI for the three variations + DraggableChip
- **`/src/app/components/lexical/`**: Lexical-based editor components
  - `CitationNode.tsx`: Custom DecoratorNode for citations
  - `CitationPlugin.tsx`: Plugin for handling citation insertion
  - `LexicalJustificationEditor.tsx`: Main Lexical editor component
  - `index.ts`: Exports

## Drag and Drop Implementation

- **ContentEditable version**: Uses native HTML5 Drag and Drop API with `text/html` data transfer
- **Lexical version**: Uses custom `application/x-citation` data transfer type with Lexical's DROP_COMMAND

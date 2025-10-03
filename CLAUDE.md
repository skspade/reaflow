# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

REAFLOW is a React library for building node-based diagrams and workflow editors. It provides a modular diagram engine with automatic layout powered by ELKJS, supporting both static displays and interactive editors.

## Development Commands

### Setup and Development
- `npm i` - Install dependencies
- `npm start` - Start Storybook development server on port 9009
- `npm run build` - Build the library for production (outputs to `dist/`)
- `npm run build:watch` - Build in watch mode for development

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run prettier` - Format code with Prettier
- `npm test` - Run tests with Vitest

### Testing
- Tests use Vitest with jsdom environment
- Test files are colocated with source code (e.g., `*.test.ts`)
- Run tests in watch mode: `npm test -- --watch`

## Architecture

### Core Components

**Canvas** (`src/Canvas.tsx`)
- Main component that orchestrates the entire diagram
- Manages zoom, pan, layout, and rendering
- Uses a Provider/Consumer pattern via `CanvasProvider`
- Supports two rendering modes: pannable scrollable canvas or fixed-size viewport
- Handles drag interactions for both nodes and edges
- Key props: `nodes`, `edges`, `direction`, `pannable`, `zoomable`, `zoom`, `minZoom`, `maxZoom`, `zoomSpeed`, `layoutOptions`

**Layout System** (`src/layout/`)
- `useLayout.ts` - Core hook managing ELKJS layout calculation and positioning
- `elkLayout.ts` - Wraps ELKJS for automatic graph layout with cancellable promises
- Layout runs asynchronously whenever nodes/edges change
- Supports directional layouts (UP, DOWN, LEFT, RIGHT)
- Handles fit-to-viewport and positioning (center, top, left, right, bottom)

**Symbols** (`src/symbols/`)
- `Node/` - Node component with support for ports, icons, labels, drag-and-drop
- `Edge/` - Edge component with curved paths, arrows, and labels
- `Port/` - Connection points on nodes for edge attachment
- `Arrow/` - SVG marker definitions for edge arrowheads
- `Add/Remove/` - Interactive controls for nodes

### Key Data Types (`src/types.ts`)

- `NodeData` - Node definition with id, text, dimensions, ports, parent (for nesting)
- `EdgeData` - Edge definition with id, from/to nodes, optional port connections
- `PortData` - Port definition with side (NORTH/SOUTH/EAST/WEST) and alignment
- `LayoutNodeData` - Extended NodeData with calculated x/y positions from layout

### Helper Utilities (`src/helpers/`)

**crudHelpers.ts**
- Functions for manipulating graph structure: `addNodeAndEdge`, `removeNode`, `removeEdge`, `upsertNode`
- `removeAndUpsertNodes` - Removes nodes and reconnects their edges

**useSelection.ts**
- Hook for multi-selection of nodes/edges with keyboard shortcuts
- Supports Cmd+A (select all), Backspace (delete), Escape (deselect)
- Handles both single and multi-select with meta key

**useUndo.ts**
- Undo/redo functionality using the `undoo` library
- Tracks history of nodes/edges changes
- Keyboard shortcuts: Cmd+Z (undo), Cmd+Shift+Z (redo)

**useProximity.ts**
- Helper for showing proximity indicators when dragging nodes near other nodes
- Used for suggesting potential connections

### Interaction Hooks (`src/utils/`)

**useZoom.ts**
- Manages zoom level with constraints (minZoom/maxZoom)
- Provides `zoomIn`, `zoomOut`, `setZoom` methods
- Supports mouse wheel zooming when `zoomable` is true
- Zoom speed can be customized via `zoomSpeed` prop (default: 0.02)
- Supports cursor-based zooming (zoom toward mouse position)

**useNodeDrag.ts** / **useEdgeDrag.ts**
- Handle drag interactions for creating connections
- Support dragging from nodes or ports to create new edges
- Includes link validation via `onNodeLinkCheck` callback

## Important Patterns

### Provider Pattern
The library uses `CanvasProvider` to share context (layout, zoom, refs) between Canvas and its children. When working with Canvas internals, access context via `useCanvas()`.

### Layout Updates
Layout recalculation is triggered by changes to `nodes` or `edges` arrays. The layout process is asynchronous and cancellable. Use `onLayoutChange` callback to react to layout completion.

### Drag and Drop
- Node drag: Set `readonly={false}` on Canvas
- Dragging creates temporary "drag nodes/edges" that follow the cursor
- On drop, `onNodeLink` callback is fired with source/target node data
- Use `onNodeLinkCheck` to validate connections before allowing them

### Customization
All visual components (Node, Edge, Port, Arrow) can be customized:
- Pass custom React elements via `node={}`, `edge={}` props
- Or pass render functions: `node={(props) => <CustomNode {...props} />}`

## Build System

- Uses Vite with library mode for building
- TypeScript with declaration file generation via `vite-plugin-dts`
- CSS is injected into JS bundle via `vite-plugin-css-injected-by-js`
- Outputs: ESM (`dist/index.js`), UMD (`dist/index.umd.cjs`), and type definitions (`dist/index.d.ts`)
- Peer dependencies (React, React DOM) are externalized

## Development Notes

- Storybook stories are in `stories/` directory (not `src/`)
- TypeScript is configured with `baseUrl: "./src"` for module resolution
- The library uses `motion` (formerly framer-motion) for animations
- Pre-commit hooks run linting and formatting via husky and lint-staged

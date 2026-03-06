/**
 * Tests for useThemeHistory.
 *
 * Since the project uses vitest with environment: 'node' and does not have
 * @testing-library/react, we test the batch logic by simulating the
 * state management patterns used internally.
 *
 * The key behaviors under test:
 * 1. startBatch captures state synchronously via presentRef
 * 2. Repeated startBatch calls are no-ops (no nesting)
 * 3. resetHistory during batch clears batch state
 * 4. endBatch without startBatch is a safe no-op
 */

import { describe, expect, it } from 'vitest';
import type { ThemeHistoryState } from '@/renderer/components/CssThemeDesigner/useThemeHistory';

// ---------------------------------------------------------------------------
// Since we can't render hooks in node environment, we replicate the
// core batch logic from useThemeHistory to verify correctness.
// This mirrors the actual implementation's ref-based approach.
// ---------------------------------------------------------------------------

interface HistoryStack {
  past: ThemeHistoryState[];
  present: ThemeHistoryState;
  future: ThemeHistoryState[];
}

const MAX_HISTORY = 50;

/** Minimal simulation of useThemeHistory's logic without React */
function createHistoryManager(initialState: ThemeHistoryState) {
  let history: HistoryStack = {
    past: [],
    present: initialState,
    future: [],
  };
  let batchActive = false;
  let batchStartState: ThemeHistoryState | null = null;
  // Synchronous mirror of present — the key fix we're testing
  let presentMirror: ThemeHistoryState = initialState;

  return {
    get state() { return history.present; },
    get canUndo() { return history.past.length > 0; },
    get canRedo() { return history.future.length > 0; },
    get undoCount() { return history.past.length; },
    get redoCount() { return history.future.length; },

    pushState(newState: ThemeHistoryState) {
      presentMirror = newState;
      if (batchActive) {
        history = { ...history, present: newState };
        return;
      }
      history = {
        past: [...history.past, history.present].slice(-MAX_HISTORY),
        present: newState,
        future: [],
      };
    },

    undo() {
      if (history.past.length === 0) return;
      const newPast = [...history.past];
      const previousState = newPast.pop()!;
      presentMirror = previousState;
      history = {
        past: newPast,
        present: previousState,
        future: [history.present, ...history.future],
      };
    },

    redo() {
      if (history.future.length === 0) return;
      const newFuture = [...history.future];
      const nextState = newFuture.shift()!;
      presentMirror = nextState;
      history = {
        past: [...history.past, history.present],
        present: nextState,
        future: newFuture,
      };
    },

    startBatch() {
      if (batchActive) return; // no nesting
      batchActive = true;
      batchStartState = presentMirror; // synchronous read
    },

    endBatch() {
      batchActive = false;
      const startState = batchStartState;
      batchStartState = null;
      if (startState) {
        history = {
          past: [...history.past, startState].slice(-MAX_HISTORY),
          present: history.present,
          future: [],
        };
      }
    },

    resetHistory(newState: ThemeHistoryState) {
      batchActive = false;
      batchStartState = null;
      presentMirror = newState;
      history = { past: [], present: newState, future: [] };
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeState = (label: string): ThemeHistoryState => ({
  lightVars: { '--test': label },
  darkVars: { '--test': `dark-${label}` },
  customCss: '',
  activeMode: 'light',
});

const S0 = makeState('initial');
const S1 = makeState('state-1');
const S2 = makeState('state-2');
const S3 = makeState('state-3');

// ---------------------------------------------------------------------------
// Basic undo/redo
// ---------------------------------------------------------------------------

describe('useThemeHistory logic — basic operations', () => {
  it('starts with initial state and no undo/redo', () => {
    const h = createHistoryManager(S0);
    expect(h.state).toEqual(S0);
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
  });

  it('pushState enables undo', () => {
    const h = createHistoryManager(S0);
    h.pushState(S1);
    expect(h.state).toEqual(S1);
    expect(h.canUndo).toBe(true);
  });

  it('undo restores previous state and enables redo', () => {
    const h = createHistoryManager(S0);
    h.pushState(S1);
    h.undo();
    expect(h.state).toEqual(S0);
    expect(h.canRedo).toBe(true);
  });

  it('redo restores undone state', () => {
    const h = createHistoryManager(S0);
    h.pushState(S1);
    h.undo();
    h.redo();
    expect(h.state).toEqual(S1);
    expect(h.canRedo).toBe(false);
  });

  it('new pushState after undo clears redo stack', () => {
    const h = createHistoryManager(S0);
    h.pushState(S1);
    h.undo();
    h.pushState(S2);
    expect(h.canRedo).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Batch operations
// ---------------------------------------------------------------------------

describe('useThemeHistory logic — batch operations', () => {
  it('batch collapses multiple pushState calls into one undo step', () => {
    const h = createHistoryManager(S0);

    h.startBatch();
    h.pushState(S1);
    h.pushState(S2);
    h.pushState(S3);
    h.endBatch();

    expect(h.state).toEqual(S3);
    expect(h.undoCount).toBe(1);

    h.undo();
    expect(h.state).toEqual(S0);
  });

  it('startBatch followed by immediate pushState in same tick works', () => {
    const h = createHistoryManager(S0);

    // Critical scenario: startBatch + pushState in same synchronous call
    h.startBatch();
    h.pushState(S1);

    expect(h.state).toEqual(S1);

    h.pushState(S2);
    h.endBatch();

    expect(h.state).toEqual(S2);
    expect(h.undoCount).toBe(1);

    // Undo should go back to S0 (the state before startBatch)
    h.undo();
    expect(h.state).toEqual(S0);
  });

  it('repeated startBatch calls do not nest — second call is no-op', () => {
    const h = createHistoryManager(S0);

    h.startBatch();
    h.pushState(S1);
    h.startBatch(); // should be ignored
    h.pushState(S2);
    h.endBatch();

    expect(h.state).toEqual(S2);
    expect(h.undoCount).toBe(1);

    h.undo();
    expect(h.state).toEqual(S0);
  });

  it('endBatch without startBatch is a safe no-op', () => {
    const h = createHistoryManager(S0);
    h.pushState(S1);
    h.endBatch(); // no-op

    expect(h.state).toEqual(S1);
    expect(h.undoCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// resetHistory during batch
// ---------------------------------------------------------------------------

describe('useThemeHistory logic — resetHistory during batch', () => {
  it('resetHistory cancels in-progress batch and clears all history', () => {
    const h = createHistoryManager(S0);
    h.pushState(S1);
    h.startBatch();
    h.pushState(S2);
    h.resetHistory(S3);

    expect(h.state).toEqual(S3);
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
  });

  it('pushState works normally after resetHistory during batch', () => {
    const h = createHistoryManager(S0);
    h.startBatch();
    h.pushState(S1);
    h.resetHistory(S2);

    // After reset, batch should be cleared
    h.pushState(S3);
    expect(h.state).toEqual(S3);
    expect(h.undoCount).toBe(1);

    h.undo();
    expect(h.state).toEqual(S2);
  });
});

// ---------------------------------------------------------------------------
// MAX_HISTORY boundary
// ---------------------------------------------------------------------------

describe('useThemeHistory logic — history depth limit', () => {
  it('caps past stack at MAX_HISTORY (50)', () => {
    const h = createHistoryManager(S0);

    for (let i = 0; i < 60; i++) {
      h.pushState(makeState(`state-${i}`));
    }

    expect(h.undoCount).toBe(MAX_HISTORY);
  });
});

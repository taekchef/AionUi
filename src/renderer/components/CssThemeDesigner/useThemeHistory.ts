/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Undo/Redo state history for Theme Designer.
 *
 * Manages a stack-based history of editor states with:
 *   - Max depth of 50 states
 *   - Batch operations (e.g. applying a preset = 1 undo step)
 *   - Keyboard shortcut support (Cmd+Z / Cmd+Shift+Z)
 */

import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeHistoryState {
  /** Light mode variable values */
  lightVars: Record<string, string>;
  /** Dark mode variable values */
  darkVars: Record<string, string>;
  /** Custom CSS (selector overrides, keyframes, etc.) */
  customCss: string;
  /** Which mode was active when this state was saved */
  activeMode: 'light' | 'dark';
}

interface HistoryStack {
  past: ThemeHistoryState[];
  present: ThemeHistoryState;
  future: ThemeHistoryState[];
}

const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useThemeHistory(initialState: ThemeHistoryState) {
  const [history, setHistory] = useState<HistoryStack>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track whether we're in a batch operation.
  // Uses a ref + synchronous snapshot to avoid React async setState timing issues.
  const batchRef = useRef(false);
  const batchStartStateRef = useRef<ThemeHistoryState | null>(null);

  // Keep a synchronous mirror of present state for startBatch to read.
  // Updated in every setHistory call via the updater pattern.
  const presentRef = useRef<ThemeHistoryState>(initialState);

  /** Push current state to history and set new present */
  const pushState = useCallback((newState: ThemeHistoryState) => {
    if (batchRef.current) {
      // During batch: update present without pushing to past
      setHistory((prev) => {
        presentRef.current = newState;
        return {
          ...prev,
          present: newState,
        };
      });
      return;
    }

    setHistory((prev) => {
      presentRef.current = newState;
      return {
        past: [...prev.past, prev.present].slice(-MAX_HISTORY),
        present: newState,
        future: [], // Clear redo stack on new action
      };
    });
  }, []);

  /** Undo: pop from past, push current to future */
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = [...prev.past];
      const previousState = newPast.pop()!;
      presentRef.current = previousState;
      return {
        past: newPast,
        present: previousState,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  /** Redo: pop from future, push current to past */
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const nextState = newFuture.shift()!;
      presentRef.current = nextState;
      return {
        past: [...prev.past, prev.present],
        present: nextState,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Start a batch operation.
   * All pushState calls until endBatch() are treated as one undo step.
   * Use for preset application, sync operations, etc.
   *
   * The batch start state is captured synchronously from presentRef
   * so that immediate pushState calls in the same tick work correctly.
   */
  const startBatch = useCallback(() => {
    if (batchRef.current) {
      // Already in a batch — don't nest, just continue
      return;
    }
    batchRef.current = true;
    // Synchronous read — no React setState timing issue
    batchStartStateRef.current = presentRef.current;
  }, []);

  /**
   * End a batch operation. Pushes the batch start state to past.
   * Safe to call even if startBatch was never called (no-op).
   */
  const endBatch = useCallback(() => {
    batchRef.current = false;
    const startState = batchStartStateRef.current;
    batchStartStateRef.current = null;

    if (startState) {
      setHistory((prev) => ({
        past: [...prev.past, startState].slice(-MAX_HISTORY),
        present: prev.present,
        future: [], // Clear redo stack
      }));
    }
  }, []);

  /** Reset history to a new initial state (e.g. when loading a different theme) */
  const resetHistory = useCallback((newState: ThemeHistoryState) => {
    // Also reset any in-progress batch to prevent stale state
    batchRef.current = false;
    batchStartStateRef.current = null;
    presentRef.current = newState;
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undoCount: history.past.length,
    redoCount: history.future.length,
    pushState,
    undo,
    redo,
    startBatch,
    endBatch,
    resetHistory,
  };
}

// ---------------------------------------------------------------------------
// Keyboard shortcut handler
// ---------------------------------------------------------------------------

/**
 * Creates a keyboard event handler for undo/redo shortcuts.
 * Attach to the editor container's onKeyDown.
 *
 * - Cmd/Ctrl+Z → undo
 * - Cmd/Ctrl+Shift+Z → redo
 * - Cmd/Ctrl+S → save callback
 */
export function createKeyboardHandler(handlers: {
  undo: () => void;
  redo: () => void;
  save?: () => void;
}) {
  return (e: KeyboardEvent | React.KeyboardEvent) => {
    const isMeta = e.metaKey || e.ctrlKey;

    if (isMeta && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handlers.undo();
    } else if (isMeta && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      handlers.redo();
    } else if (isMeta && e.key === 's' && handlers.save) {
      e.preventDefault();
      handlers.save();
    }
  };
}

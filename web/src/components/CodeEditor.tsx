import { useEffect, useRef } from 'react';

const INDENT = '  ';

/**
 * A lightweight code-friendly textarea: Tab inserts an indent (and indents a
 * multi-line selection); Shift+Tab outdents. Intentionally minimal — a full
 * editor (Monaco/CodeMirror, syntax highlighting) is a tracked contribution,
 * not part of the shell. See docs/BACKLOG.md.
 */
export function CodeEditor({
  value,
  onChange,
  gotoLine,
}: {
  value: string;
  onChange: (next: string) => void;
  /** 1-based line to select/scroll to; bump a counter to re-trigger same line. */
  gotoLine?: { line: number; nonce: number } | null;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!gotoLine) return;
    const el = ref.current;
    if (!el) return;

    const lines = value.split('\n');
    const idx = Math.min(Math.max(gotoLine.line, 1), lines.length) - 1;
    const start = lines.slice(0, idx).reduce((n, l) => n + l.length + 1, 0);
    const end = start + lines[idx].length;

    el.focus();
    el.selectionStart = start;
    el.selectionEnd = end;
    // Approximate scroll: line index × line height.
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 18;
    el.scrollTop = Math.max(0, (idx - 3) * lineHeight);
  }, [gotoLine, value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();

    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Multi-line selection: indent/outdent each line.
    if (start !== end && value.slice(start, end).includes('\n')) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const block = value.slice(lineStart, end);
      const updated = e.shiftKey
        ? block.replace(new RegExp(`^( {1,${INDENT.length}}|\\t)`, 'gm'), '')
        : block.replace(/^/gm, INDENT);
      const next = value.slice(0, lineStart) + updated + value.slice(end);
      onChange(next);
      queueMicrotask(() => {
        el.selectionStart = lineStart;
        el.selectionEnd = lineStart + updated.length;
      });
      return;
    }

    // Caret only: insert/remove one indent.
    if (e.shiftKey) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      if (value.startsWith(INDENT, lineStart)) {
        const next = value.slice(0, lineStart) + value.slice(lineStart + INDENT.length);
        onChange(next);
        queueMicrotask(() => {
          const p = Math.max(lineStart, start - INDENT.length);
          el.selectionStart = el.selectionEnd = p;
        });
      }
      return;
    }

    const next = value.slice(0, start) + INDENT + value.slice(end);
    onChange(next);
    queueMicrotask(() => {
      el.selectionStart = el.selectionEnd = start + INDENT.length;
    });
  }

  return (
    <textarea
      ref={ref}
      value={value}
      spellCheck={false}
      onKeyDown={handleKeyDown}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

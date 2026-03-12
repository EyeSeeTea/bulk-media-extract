export function insertAtCursor(
    text: string,
    insertion: string,
    selectionStart?: number | null,
    selectionEnd?: number | null
): { value: string; caret: number } {
    const start = Math.max(0, selectionStart ?? text.length);
    const end = Math.max(start, selectionEnd ?? start);
    const value = `${text.slice(0, start)}${insertion}${text.slice(end)}`;
    return { value, caret: start + insertion.length };
}

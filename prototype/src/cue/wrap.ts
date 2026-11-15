// Line breaking exactly as the layout engine counts it (wrapLines in layout.ts), returning the lines.
export function wrapText(text: string, width: number): string[] {
  const out: string[] = [];
  if (width <= 0) return [text];
  for (const para of text.split('\n')) {
    if (para.length === 0) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of para.split(' ')) {
      let w = word;
      if (line.length > 0 && line.length + 1 + w.length <= width) {
        line += ` ${w}`;
        continue;
      }
      if (line.length === 0 && w.length <= width) {
        line = w;
        continue;
      }
      if (line.length > 0) {
        out.push(line);
        line = '';
      }
      while (w.length > width) {
        out.push(w.slice(0, width));
        w = w.slice(width);
      }
      line = w;
    }
    out.push(line);
  }
  return out;
}


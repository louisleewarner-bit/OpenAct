/**
 * Saving a file the app made (D-042). In the hosted preview the page asks the viewer through its download
 * capability, which accepts only some file types; everywhere else (the offline and installed editions) the
 * browser downloads the file directly. Nothing is uploaded either way.
 */
export type SaveOutcome = { ok: true; name: string } | { ok: false; reason: 'declined' | 'type' | 'blocked'; message: string };

type Downloads = { save(r: { filename: string; data: Blob }): Promise<{ status: string }> };
type ClaudeHost = { use?: (name: string) => Promise<unknown> };

/** File types the hosted preview's save prompt accepts. */
const HOSTED_TYPES = new Set(['pdf', 'docx', 'txt', 'json', 'zip', 'csv', 'md', 'html', 'svg', 'png']);

let hosted: Promise<Downloads | null> | null = null;
function hostedDownloads(): Promise<Downloads | null> {
  if (hosted) return hosted;
  const c = (window as unknown as { claude?: ClaudeHost }).claude;
  if (!c?.use) return (hosted = Promise.resolve(null));
  hosted = Promise.race([
    c.use('downloads').then((d) => (d as Downloads | null) ?? null).catch(() => null),
    new Promise<null>((r) => window.setTimeout(() => r(null), 4000)),
  ]);
  return hosted;
}

/** Whether this view saves through the hosted preview's prompt (which limits file types). */
export const inHostedPreview = (): boolean => !!(window as unknown as { claude?: ClaudeHost }).claude?.use;
export const hostedAccepts = (ext: string) => HOSTED_TYPES.has(ext.toLowerCase());

export async function saveFile(filename: string, data: Blob): Promise<SaveOutcome> {
  const ext = filename.split('.').pop() ?? '';
  const d = await hostedDownloads();
  if (d) {
    if (!hostedAccepts(ext)) return { ok: false, reason: 'type', message: `This preview window can’t save .${ext} files. Copy the text below, or use the downloaded or installed OpenAct, which saves it as a file.` };
    try {
      await d.save({ filename, data });
      return { ok: true, name: filename };
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'declined') return { ok: false, reason: 'declined', message: 'Not saved.' };
      return { ok: false, reason: 'blocked', message: 'This window couldn’t save the file. Try the downloaded or installed OpenAct.' };
    }
  }
  try {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    return { ok: true, name: filename };
  } catch {
    return { ok: false, reason: 'blocked', message: 'This browser couldn’t save the file.' };
  }
}

/** A file name from a script title: keeps letters, digits, spaces and simple punctuation. */
export const safeName = (title: string) =>
  (title.trim() || 'Untitled')
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

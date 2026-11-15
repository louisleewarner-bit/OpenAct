# Core flows

Each flow lists its steps and its state in the prototype (docs/design/prototype.md): **Built** (works in the prototype), **Simulated** (the dialog exists, the file save is faked), **Designed** (described here, not in the prototype).

## 1. First run to a formatted page in under two minutes (Built)
1. OpenAct opens on "Start a script": three samples (panto, musical, screenplay) and two blank options, with a line on where scripts are stored.
2. The writer picks one; the caret lands on the first scene heading.
3. They type. The status line shows the current element and what Enter and Tab will do next ("Enter: Speech", "Tab: Direction in speech"), and the current element's name sits in the left margin in pencil.
4. Success: a correctly laid-out page without reading any help. Measured in the usability test (prd.md, success measures).

## 2. Import an existing script (Built for paste; Designed for files)
1. "Paste a script…" from the menu, or paste more than one line into the page.
2. OpenAct splits the text into elements, recognising scene headings, cues (including the UK `NAME:` style), parentheticals, songs' lyrics (`~`) and transitions.
3. A review list shows each element's detected type in a drop-down; the writer fixes any that are wrong.
4. "Add 24 elements to the end" inserts them. Nothing lands before that.
5. Files (Fountain, FDX) open through the same review step when anything couldn't be mapped. (Designed.)

## 3. Write a scene keyboard-only (Built)
1. Enter after an action starts another action; Tab on an empty line turns it into a Character.
2. Typing the first letters of a name offers matching characters; Tab or Enter accepts.
3. Enter gives the speech; Tab gives a parenthetical with both brackets and the caret between them; Enter returns to the speech.
4. Shift+Tab on an empty element steps back through the types; Ctrl+Alt+1–9 (⌘⌥ on a Mac) sets any type directly.
5. Esc, then Tab, leaves the script for the next control (the script is a single tab stop).

## 4. Add a song (Built)
1. In a musical or panto, Tab on an empty Character line gives a Song (or Ctrl+Alt+7).
2. The song heading numbers itself ("SONG 3:") and shows its singers; Enter goes straight to lyrics.
3. Enter on an empty lyric line ends the song and returns to stage directions.
4. The song list (right panel) shows number, title, singers, dramatic function and page; "Edit" sets singers, function, staging, musical feel and reprise (numbered 2a).

## 5. Reorder scenes (Built)
1. Drag a scene in the outline, or select it and press Alt+↑ or Alt+↓; the move is announced to screen readers.
2. Scene numbers, song numbers and page numbers update.
3. In a panto, a dismissible note appears when two full-stage scenes end up back to back.

## 6. Export for a director (Simulated)
1. Export: choose PDF, Word, Fountain or Final Draft (screenplays only), A4 or US Letter, title page on or off. A thumbnail shows page 1.
2. The real app saves the file to the device. The prototype shows the Fountain or FDX text to copy and describes the PDF and Word files.

## 7. Recover after a crash (Designed; partly built)
1. Every pause in typing saves to the device (the prototype saves to this browser and shows "Saved in this browser").
2. On reopen, the script is exactly as it was, at most two seconds behind.
3. Snapshots (every ten minutes and on export) can be restored from a "History" panel. (Designed.)
4. If the browser refuses persistent storage, or a week passes without a backup, OpenAct asks the writer to save a copy to a file. (Designed.)

## 8. Edit on a phone (Built)
1. Under 760 px wide, the script reflows as continuous text with proportional indents; no page frames.
2. A bar above the keyboard offers a Tab key and a chip for each element type; the current type is pressed.
3. The outline and the details panel open as drawers.

## 9. Check a script before sending it (Built)
1. The writer finishes a draft and chooses the **Review** tab in the side panel (or Review in the phone's bottom bar, or "Ready to submit?" in the menu). On a wide screen the panel opens beside the page; on smaller screens it slides over and closes when the writer jumps to a problem.
2. "Where is it going?" defaults from the format (agent or producer for screen formats; theatre, musical programme, radio or comics publisher for the others). The writer picks the real target: say, the Nicholl.
3. A line under the target says when its rules were researched and links to the current rules. Counts follow: to fix, to consider, passed.
4. Each row opens to show where the problem is (page links), why it matters, and its sources with their kind and date. Fix buttons appear only where a change is safe and reversible: remove the draft date, add a character to the cast list, make exports anonymous.
5. A "consider" row the writer disagrees with can be set aside for this script and put back later.
6. "Before you send" lists what OpenAct can't check, as ticks saved with the script.
7. **Export** (or **Export an anonymous copy** for blind targets) opens the export dialog with the right options set.

Design notes: the panel changes nothing unless a fix is pressed; statuses use words and icons as well as colour; rows are native disclosure widgets, so they work by keyboard and with screen readers; the current target and ticks are saved with the script.

## Not in the prototype
Find and replace (rename exists in the Cast panel), real file open and save, snapshots, persistent-storage prompts, DOCX and PDF generation, notes editing on touch.

## 10. Bring your own format (Built in the prototype)
1. From the Start screen or the menu the writer chooses **Import a format file…** and picks or drops a Final Draft, Word or OpenAct format file. A pasted OpenAct format file also works.
2. A screen shows what was read: name, the built-in it is based on, paper and margins, a note for anything assumed, a sample page beside the values, and every element's layout in a list that opens for editing. For Word files the writer also matches Word styles to elements.
3. The writer corrects anything that looks wrong, then chooses **Save** or **Save and use for this script**.
4. The format appears under **Your formats** in the format menu and on the Start screen, where it can be edited, exported or deleted.
5. **Find a format…** lists common formats from a built-in catalogue. Each entry says how close OpenAct gets, offers to start a script in the nearest format, and links to the organisation's own page, which opens only when chosen. No match leads to **Import a format file**.
Failure paths: an unreadable file says so in plain words and how to fix it (for example, save an old Word file as .docx); a script that uses a format missing from this device opens in its base format, and the format menu says so.

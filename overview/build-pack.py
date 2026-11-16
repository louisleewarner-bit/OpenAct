"""Assemble the shareable overview page (openact-design-pack.html) from the kit's prompts and screenshots."""
import base64, html, pathlib, sys
kit = pathlib.Path('/home/user/script-app-kit')
shots = pathlib.Path(sys.argv[1])
out = kit / 'overview' / 'openact-design-pack.html'
p1 = html.escape((kit / 'PROMPT-1-design.md').read_text())
p2 = html.escape((kit / 'PROMPT-2-build-slice.md').read_text())
img = lambda name: 'data:image/jpeg;base64,' + base64.b64encode((shots / name).read_bytes()).decode()
PROTO = 'https://claude.ai/artifact/6EzKdcrFGEGHoqQnbY5eJM'

page = f'''<title>OpenAct Design Pack</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400..700;1,400..700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap">
<style>
/* Layout: OpenAct's own world. A title page and one long script page laid on a quiet desk; ink, pencil and highlighter. */
:root {{
  --desk: #E8EBF0; --paper: #FFFFFF; --ink: #1C2433; --ink-soft: #566074; --pencil: #6A7387; --rule: #D5DAE2; --mark-hi: #2D4DA6; --mark-lo: #223C86;
  --accent: #2D4DA6; --accent-ink: #FFFFFF; --highlight: #FFEE8A;
  --tint-blue: #D7E6FA; --tint-pink: #F9D9E6; --tint-gold: #F6E2A6; --tint-salmon: #F8D3C4; --warn-ink: #8A3B1E; --yes: #1F6B3A;
  --shadow: 0 0 0 1px rgb(28 36 51 / .06), 0 1px 2px rgb(28 36 51 / .08), 0 4px 10px rgb(28 36 51 / .06), 0 18px 40px rgb(28 36 51 / .10);
  --e1: 0 1px 1px rgb(28 36 51 / .06), 0 1px 2px rgb(28 36 51 / .08);
  --font-body: "Atkinson Hyperlegible Next", "Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-script: "Courier Prime", "Courier New", Courier, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --desk: #12161E; --paper: #1D2330; --ink: #E3E6EC; --ink-soft: #A2AABA; --pencil: #8E97AA; --rule: #2C3444; --mark-hi: #9DB2FF; --mark-lo: #6F88E6;
  --accent: #9DB2FF; --accent-ink: #10162A; --highlight: #5A4E1C;
  --tint-blue: #22324D; --tint-pink: #43263A; --tint-gold: #43391C; --tint-salmon: #4A2A22; --warn-ink: #F3B49C; --yes: #8FD3A6;
  --shadow: 0 0 0 1px rgb(255 255 255 / .05), 0 4px 10px rgb(0 0 0 / .30), 0 18px 40px rgb(0 0 0 / .40); --e1: 0 1px 2px rgb(0 0 0 / .35), inset 0 1px 0 rgb(255 255 255 / .05); color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --desk: #12161E; --paper: #1D2330; --ink: #E3E6EC; --ink-soft: #A2AABA; --pencil: #8E97AA; --rule: #2C3444; --mark-hi: #9DB2FF; --mark-lo: #6F88E6;
  --accent: #9DB2FF; --accent-ink: #10162A; --highlight: #5A4E1C;
  --tint-blue: #22324D; --tint-pink: #43263A; --tint-gold: #43391C; --tint-salmon: #4A2A22; --warn-ink: #F3B49C; --yes: #8FD3A6;
  --shadow: 0 0 0 1px rgb(255 255 255 / .05), 0 4px 10px rgb(0 0 0 / .30), 0 18px 40px rgb(0 0 0 / .40); --e1: 0 1px 2px rgb(0 0 0 / .35), inset 0 1px 0 rgb(255 255 255 / .05); color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--desk); color: var(--ink); font-family: var(--font-body); font-size: 16px; line-height: 1.6;
  padding-block: 32px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
a {{ color: var(--accent); text-underline-offset: 3px; }}
:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
.wrap {{ max-width: 920px; margin: 0 auto; display: grid; gap: 28px; }}
.hero {{ display: grid; grid-template-columns: minmax(0, 300px) minmax(0, 1fr); gap: 32px; align-items: center; }}
.title-sheet {{ background: var(--paper); box-shadow: var(--shadow); aspect-ratio: 210 / 297; max-width: 100%; padding: 12% 10% 8%;
  font-family: var(--font-script); font-size: 13px; line-height: 1.5; display: grid; grid-template-rows: 1fr auto; text-align: center; }}
.title-sheet h1 {{ font-family: var(--font-script); font-size: 26px; font-weight: 700; margin: 30% 0 18px; letter-spacing: -.03em; display: inline-flex; align-items: baseline; gap: .3em; justify-content: center; }}
.mark {{ width: .64em; height: .64em; flex: none; }} .mark-v {{ fill: var(--mark-lo); }} .mark-h {{ fill: var(--mark-hi); }}
.title-sheet p {{ margin: 0 0 14px; }}
.title-sheet .foot {{ display: flex; justify-content: space-between; text-align: left; font-size: 11px; gap: 12px; }}
.lede {{ display: grid; gap: 16px; min-width: 0; }}
.lede .kicker {{ font-size: 15px; color: var(--ink-soft); margin: 0; }}
.lede h2 {{ font-size: clamp(26px, 4vw, 34px); line-height: 1.2; margin: 0; text-wrap: balance; }}
.lede p {{ margin: 0; max-width: 60ch; }}
.actions {{ display: flex; flex-wrap: wrap; gap: 10px; }}
.btn {{ display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: 4px; font: inherit; font-weight: 700;
  border: 1px solid var(--rule); background: var(--paper); color: var(--ink); text-decoration: none; cursor: pointer; }}
.btn {{ box-shadow: var(--e1); }}
.btn.primary {{ background: var(--accent); border-color: var(--accent); color: var(--accent-ink); box-shadow: var(--e1), inset 0 1px 0 rgb(255 255 255 / .22); }}
.status {{ font-size: 14px; color: var(--ink-soft); }}
.status b {{ color: var(--ink); }}
.page {{ background: var(--paper); box-shadow: var(--shadow); padding: 48px clamp(20px, 6vw, 72px) 56px; display: grid; gap: 52px; }}
section {{ display: grid; gap: 16px; min-width: 0; }}
section > header {{ display: grid; gap: 4px; }}
.slug {{ font-family: var(--font-script); font-weight: 700; font-size: 13px; color: var(--ink-soft); }}
h2 {{ font-size: 24px; line-height: 1.25; margin: 0; text-wrap: balance; }}
h3 {{ font-size: 17px; margin: 0; }}
p {{ margin: 0; max-width: 66ch; }}
.muted {{ color: var(--ink-soft); font-size: 14.5px; }}
.note {{ border-left: 2px solid var(--pencil); padding: 2px 0 2px 14px; font-style: italic; color: var(--ink-soft); max-width: 70ch; }}
.table-wrap {{ overflow-x: auto; border: 1px solid var(--rule); border-radius: 4px; }}
table {{ border-collapse: collapse; width: 100%; font-size: 14.5px; }}
th, td {{ text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--rule); vertical-align: top; }}
thead th {{ font-size: 13px; color: var(--ink-soft); font-weight: 700; }}
tbody tr:last-child td, tbody tr:last-child th {{ border-bottom: 0; }}
.matrix td {{ text-align: center; white-space: nowrap; }}
.matrix th[scope="row"] {{ white-space: nowrap; }}
.yes {{ color: var(--yes); font-weight: 700; }}
.part {{ color: var(--ink-soft); }}
.no {{ color: var(--pencil); }}
.target th, .target td {{ background: var(--highlight); }}
.req-grid {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 28px; }}
.req-grid h3 {{ margin-bottom: 6px; }}
ul.tight {{ margin: 0; padding-left: 20px; display: grid; gap: 4px; }}
.chip {{ display: inline-block; font-size: 12.5px; font-weight: 700; padding: 1px 9px; border-radius: 4px; color: var(--ink); }}
.chip.blue {{ background: var(--tint-blue); }} .chip.pink {{ background: var(--tint-pink); }} .chip.gold {{ background: var(--tint-gold); }}
.chip.salmon {{ background: var(--tint-salmon); color: var(--warn-ink); }}
td.lvl {{ white-space: nowrap; font-weight: 700; }}
.shots {{ display: grid; grid-template-columns: minmax(0, 3.4fr) minmax(0, 1fr); gap: 16px; align-items: start; }}
figure {{ margin: 0; display: grid; gap: 8px; min-width: 0; }}
figure img {{ width: 100%; height: auto; border: 1px solid var(--rule); border-radius: 4px; display: block; }}
figcaption {{ font-size: 13.5px; color: var(--ink-soft); }}
.ideas {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px; }}
.ideas p {{ font-size: 15px; }}
.flow {{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; align-items: stretch; }}
.box {{ border: 1px solid var(--rule); border-radius: 4px; padding: 10px 12px; display: grid; gap: 2px; background: var(--paper); position: relative; }}
.box b {{ font-size: 14.5px; }} .box span {{ font-size: 13px; color: var(--ink-soft); }}
.box.core {{ border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }}
.flow .box:not(:last-child)::after {{ content: "\\2192"; position: absolute; right: -10px; top: 50%; transform: translate(50%, -50%); color: var(--pencil); font-size: 16px; }}
.split {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }}
ol.slices {{ list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; counter-reset: s -1; }}
ol.slices li {{ display: grid; grid-template-columns: 2.4em minmax(0, 1fr); gap: 4px 12px; counter-increment: s; }}
ol.slices li::before {{ content: counter(s); font-family: var(--font-script); font-weight: 700; color: var(--accent); text-align: right; }}
ol.slices li p {{ font-size: 14.5px; color: var(--ink-soft); grid-column: 2; }}
.milestone {{ font-family: var(--font-script); font-weight: 700; font-size: 14px; background: var(--highlight); padding: 2px 8px; border-radius: 4px; justify-self: start; }}
.todo {{ list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }}
.todo label {{ display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 10px; align-items: start; cursor: pointer; }}
.todo input {{ width: 20px; height: 20px; margin: 3px 0 0; accent-color: var(--accent); }}
.todo input:checked + span {{ text-decoration: line-through; color: var(--ink-soft); }}
details {{ border: 1px solid var(--rule); border-radius: 4px; }}
summary {{ cursor: pointer; padding: 10px 14px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 44px; }}
details[open] summary {{ border-bottom: 1px solid var(--rule); }}
.prompt {{ padding: 12px 14px 14px; display: grid; gap: 10px; }}
pre {{ margin: 0; font-family: var(--font-script); font-size: 13px; line-height: 1.5; background: var(--desk); color: var(--ink); border-radius: 4px;
  padding: 12px 14px; max-height: 420px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }}
.copy-row {{ display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }}
footer {{ font-size: 13.5px; color: var(--ink-soft); display: grid; gap: 6px; max-width: 920px; margin: 0 auto; }}
@media (max-width: 760px) {{
  .hero {{ grid-template-columns: minmax(0, 1fr); }}
  .title-sheet {{ max-width: 280px; }}
  .req-grid, .ideas, .split {{ grid-template-columns: minmax(0, 1fr); }}
  .shots {{ grid-template-columns: minmax(0, 1fr); }}
  .shots figure:last-child {{ max-width: 260px; }}
  .flow {{ grid-template-columns: minmax(0, 1fr); }}
  .flow .box:not(:last-child)::after {{ content: "\\2193"; right: 50%; top: auto; bottom: -10px; transform: translate(50%, 50%); }}
}}
@media (prefers-reduced-motion: reduce) {{ * {{ transition: none !important; animation: none !important; }} }}
</style>

<div class="wrap">
  <div class="hero">
    <div class="title-sheet" aria-label="Title page">
      <div>
        <h1><svg class="mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><polygon class="mark-v" points="0,7 27,0 27,68 0,68"/><polygon class="mark-h" points="0,72 100,72 94,100 0,100"/></svg>OpenAct</h1>
        <p>The free script editor for stage and screen</p>
        <p>Free for everyone. No account, nothing to buy.</p>
      </div>
      <div class="foot"><span>Design pack</span><span>Draft 3<br>November 2026</span></div>
    </div>
    <div class="lede">
      <p class="kicker">Screen, stage, audio and comics</p>
      <h2>Everything decided so far, and where the build starts</h2>
      <p>Research, a product spec, a clickable prototype, ten architecture decisions and a build plan for OpenAct: free for everyone, works offline, keeps scripts on their own device, and gets the pages right in fifteen formats. Version 2 adds a review that checks a script before it goes out; version 3 adds spelling and grammar.</p>
      <div class="actions">
        <a class="btn primary" href="{PROTO}" target="_blank" rel="noopener">Open the prototype</a>
        <a class="btn" href="#review">See the review</a>
        <a class="btn" href="#plan">See the build plan</a>
      </div>
      <p class="status"><b>Design complete; build started.</b> 16 formats, 20 requirements, 20 build slices; the project skeleton is in place.</p>
    </div>
  </div>

  <main class="page">
    <section aria-labelledby="why">
      <header><span class="slug">Research</span><h2 id="why">Why OpenAct should exist</h2></header>
      <p>Paid screenwriting tools cost up to $250. Free tiers cap scripts, watermark exports or want a subscription, and the fully free apps each run on a single platform. Stage writers have it worse: no tool found treats pantomime structure as a feature, and musical writers format songs by hand.</p>
      <div class="table-wrap" role="region" aria-label="Positioning against other tools" tabindex="0">
        <table class="matrix">
          <thead><tr><th scope="col">Tool</th><th scope="col">Free, no caps or watermark</th><th scope="col">In a browser</th><th scope="col">Offline, no account</th><th scope="col">UK and US stage</th><th scope="col">Songs and lyrics</th><th scope="col">Panto structure</th></tr></thead>
          <tbody>
            <tr><th scope="row">Final Draft</th><td class="no">No</td><td class="no">No</td><td class="yes">Yes</td><td class="part">Partly</td><td class="part">Partly</td><td class="no">No</td></tr>
            <tr><th scope="row">Fade In</th><td class="no">No</td><td class="no">No</td><td class="yes">Yes</td><td class="part">?</td><td class="part">?</td><td class="no">No</td></tr>
            <tr><th scope="row">WriterDuet</th><td class="no">No</td><td class="yes">Yes</td><td class="no">No</td><td class="part">Partly</td><td class="part">?</td><td class="no">No</td></tr>
            <tr><th scope="row">Arc Studio</th><td class="no">No</td><td class="yes">Yes</td><td class="no">No</td><td class="part">?</td><td class="part">?</td><td class="no">No</td></tr>
            <tr><th scope="row">Highland Pro</th><td class="no">No</td><td class="no">No</td><td class="yes">Yes</td><td class="part">?</td><td class="part">?</td><td class="no">No</td></tr>
            <tr><th scope="row">Beat</th><td class="part">Mac only</td><td class="no">No</td><td class="yes">Yes</td><td class="part">?</td><td class="part">?</td><td class="no">No</td></tr>
            <tr><th scope="row">Trelby</th><td class="yes">Yes</td><td class="no">No</td><td class="yes">Yes</td><td class="no">No</td><td class="no">No</td><td class="no">No</td></tr>
            <tr><th scope="row">Scrivener</th><td class="no">No</td><td class="no">No</td><td class="yes">Yes</td><td class="yes">Yes</td><td class="no">No</td><td class="no">No</td></tr>
            <tr class="target"><th scope="row">OpenAct (target)</th><td class="yes">Yes</td><td class="yes">Yes</td><td class="yes">Yes</td><td class="yes">Yes</td><td class="yes">Yes</td><td class="yes">Yes</td></tr>
          </tbody>
        </table>
      </div>
      <p class="muted">"?" means no source was found. Prices and limits were checked on 3 November 2026 and change often.</p>
      <p class="note">For UK stage writers and for screenwriters who want professional pages without paying, OpenAct is a free, local-first app that gets the format right for stage and screen, exports clean A4 or US Letter PDF and Word files, and keeps every script on the writer's device.</p>
    </section>

    <section aria-labelledby="decided">
      <header><span class="slug">Decisions</span><h2 id="decided">Decided with the recommended defaults</h2></header>
      <div class="table-wrap">
        <table>
          <tbody>
            <tr><th scope="row">Who it's for first</th><td>UK stage writers (panto, musicals, amateur companies), then screenwriters</td></tr>
            <tr><th scope="row">Formats in the MVP</th><td>Fifteen, in six groups: film, TV, theatre, audio, comics and documents</td></tr>
            <tr><th scope="row">Platform</th><td>An installable web app that works offline; a desktop wrapper only if needed later</td></tr>
            <tr><th scope="row">Paper</th><td>A4, with US Letter one click away (and the default for US and Canadian browsers)</td></tr>
            <tr><th scope="row">Licence</th><td>App GPL-3.0; format libraries MIT, so other tools can get formatting right too</td></tr>
            <tr><th scope="row">Co-writing</th><td>Not in the MVP; share files for now, with a set path to add it later</td></tr>
            <tr><th scope="row">AI</th><td>None in the MVP; later an opt-in collaborator for feedback, using the writer's own key, after a legal review</td></tr>
            <tr><th scope="row">Version 2</th><td>"Ready to submit?": checks a script against where it's going, with sources</td></tr>
            <tr><th scope="row">Version 3</th><td>Spelling and grammar on the device; grammar as an optional download</td></tr>
            <tr><th scope="row">Price</th><td>Free for everyone, with every feature; nothing to buy (D-036)</td></tr>
            <tr><th scope="row">Network</th><td>Nothing loads from other sites; fonts ship with the app</td></tr>
          </tbody>
        </table>
      </div>
      <p class="muted">44 decisions, each with its reason and source, are logged in docs/decisions.md. To change one, add a new entry there.</p>
    </section>

    <section aria-labelledby="mvp">
      <header><span class="slug">Spec</span><h2 id="mvp">What the first version does</h2></header>
      <div class="req-grid">
        <div><h3>Writing</h3><ul class="tight"><li>Enter and Tab move through script elements, with suggestions for names and places</li><li>Find and replace, and renaming a character everywhere</li><li>Fifteen formats on A4 or US Letter, switchable at any time</li><li>Real pages with correct breaks, (MORE) and (CONT'D)</li></ul></div>
        <div><h3>Structure</h3><ul class="tight"><li>Outline of acts and scenes with drag to reorder</li><li>Title page and cast list</li><li>Numbered songs with singers and dramatic function</li><li>Line counts and a who's-in-which-scene chart</li><li>Notes that never print</li></ul></div>
        <div><h3>Files</h3><ul class="tight"><li>Open Fountain, Final Draft and pasted text, with a check before anything lands</li><li>Save as PDF, Word, Fountain or Final Draft, never watermarked</li><li>Autosave, snapshots, and prompts to keep a backup</li><li>Works offline once loaded</li></ul></div>
        <div><h3>Everyone</h3><ul class="tight"><li>Readable and editable on a phone</li><li>Keyboard-first, WCAG 2.2 AA</li><li>Smooth in a 150-page script</li><li>A first formatted page in under two minutes</li></ul></div>
      </div>
      <p class="muted">After the MVP: version 2 (the review) and version 3 (spelling and grammar), then index cards, story trackers, revision mode, rehearsal scripts and co-writing.</p>
    </section>

    <section aria-labelledby="formats">
      <header><span class="slug">Formats</span><h2 id="formats">Fifteen formats, each with its own furniture</h2></header>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Group</th><th scope="col">Formats</th><th scope="col">What OpenAct numbers and lays out for you</th></tr></thead>
          <tbody>
            <tr><th scope="row">Film</th><td>Screenplay</td><td>(MORE) and (CONT'D) at page breaks; A4 or US Letter</td></tr>
            <tr><th scope="row">Television</th><td>One-hour drama, single-camera comedy, multi-camera sitcom, UK studio sitcom, vertical micro-drama</td><td>Acts on new pages, closed by END OF ACT; lettered or numbered scenes with the cast listed under each; double-spaced multi-camera dialogue; numbered episodes</td></tr>
            <tr><th scope="row">Theatre</th><td>UK and US stage plays, UK and US musicals, pantomime</td><td>Speaker beside or above the speech; numbered songs with singers and function; front-cloth and full-stage scenes</td></tr>
            <tr><th scope="row">Audio</th><td>UK radio drama, audio drama and podcast</td><td>Cue numbers that restart on each page; sound cues; double-spaced speeches</td></tr>
            <tr><th scope="row">Comics</th><td>Comic or graphic novel</td><td>PAGE ONE (FOUR PANELS), panel numbers, and lettering numbered for the letterer</td></tr>
            <tr><th scope="row">Documents</th><td>Treatment or outline</td><td>Headings and prose</td></tr>
          </tbody>
        </table>
      </div>
      <p class="muted">Each format starts from an original template. Show- and network-branded templates are left out because the names belong to others; two-column AV scripts come later.</p>
    </section>

    <section aria-labelledby="design">
      <header><span class="slug">Design</span><h2 id="design">The prototype</h2></header>
      <div class="shots">
        <figure><img src="{img('pack-desktop.jpg')}" alt="OpenAct on a laptop: a pantomime page in UK layout with names beside speeches, the outline with full-stage and front-cloth scenes, and the song list." width="1440" height="860"><figcaption>Pantomime in UK layout: scene types in the outline and margin, numbered songs, a note, and a warning about back-to-back full-stage scenes.</figcaption></figure>
        <figure><img src="{img('pack-phone.jpg')}" alt="OpenAct on a phone: the script reflowed as continuous text, with the element bar above a bottom bar for Outline, Details, Review and New." width="390" height="780"><figcaption>On a phone the script reflows. A bottom bar reaches the outline, details, review and a new script; while typing it becomes an element bar with a Done key.</figcaption></figure>
      </div>
      <div class="ideas">
        <div><h3>The margin speaks</h3><p>The current element's name sits in the left margin in pencil, as a stage manager annotates a prompt copy. It teaches the element names without a tutorial.</p></div>
        <div><h3>A real highlighter</h3><p>Pick a character and their lines are highlighted, the way actors mark their scripts.</p></div>
        <div><h3>Bring your own format</h3><p>Import a Final Draft or Word template, check a sample page, and save it as a format. A built-in finder lists common formats and links to each organisation's own page; searching it sends nothing anywhere.</p></div>
        <div><h3>A friendly start page</h3><p>Starting, opening and carrying on are on one page: a blank screenplay or a file in one click, every format as a card with a small line drawing, and a card to carry on with the script on screen.</p></div>
        <div><h3>Video game scripts</h3><p>Nodes, player choices, conditions, barks and quest beats, with a branch map that checks every jump and recording line IDs you can lock. Exports a recording sheet, Ink and Yarn Spinner files.</p></div>
        <div><h3>Revision-paper colours</h3><p><span class="chip blue">Full stage</span> <span class="chip pink">Front cloth</span> <span class="chip gold">Songs</span> borrow the pale colours of revised script pages, always with a label.</p></div>
      </div>
      <p class="muted">Automated accessibility checks (axe) report no violations in light, dark and phone views. The script is a single tab stop; Esc then Tab leaves it. Still open: a pass with VoiceOver and NVDA.</p>
    </section>

    <section aria-labelledby="review">
      <header><span class="slug">Version 2</span><h2 id="review">Ready to submit?</h2></header>
      <p>The layout engine guarantees the formatting. What drifts while a script is redrafted is another matter: length, a stale title page, your name left in for a blind read, TK placeholders and notes, a character renamed in some cues but not others, act breaks that no longer match, songs without lyrics. The review checks those against where the script is going, and shows its sources.</p>
      <div class="shots">
        <figure><img src="{img('pack-review.jpg')}" alt="OpenAct with the review panel open beside a short screenplay. The target is the Academy Nicholl Fellowships; the panel shows 4 to fix, 6 to consider and 8 passed, and an open row lists a TK placeholder on page 1 with why it matters and its source." width="1440" height="900"><figcaption>Set to the Nicholl, the review flags the writer's name on the title page and a TK placeholder, each with a page link, a reason and a source.</figcaption></figure>
        <figure><img src="{img('pack-review-phone.jpg')}" alt="The same review on a phone, as a sheet over the script, with the placeholder row open." width="390" height="780"><figcaption>On a phone the review slides over the script and closes when you jump to a page.</figcaption></figure>
      </div>
      <div class="req-grid">
        <div><h3>Ten targets</h3><ul class="tight"><li>An agent, manager or producer</li><li>Academy Nicholl Fellowships, Austin Film Festival, BBC Writersroom, Bruntwood Prize</li><li>UK new-writing theatre, a US theatre's literary office, new musical programmes</li><li>A comics publisher, BBC radio drama</li></ul></div>
        <div><h3>Four answers</h3><ul class="tight"><li><span class="chip salmon">Fix</span> breaks a rule, such as your name in a blind entry</li><li><span class="chip gold">Consider</span> a convention you can set aside for this script</li><li><span class="chip blue">Passed</span> nothing to do</li><li>Note: information only, such as a running-time estimate</li></ul></div>
        <div><h3>Shows its working</h3><ul class="tight"><li>Every check names its sources, what kind they are (official rules, a listing, an industry guide, writer advice) and their date</li><li>Each target says when its rules were researched and links to the current ones</li><li>A "Before you send" list covers what OpenAct can't check</li></ul></div>
        <div><h3>Changes nothing by itself</h3><ul class="tight"><li>Fix buttons only for safe changes: remove a draft date, add someone to the cast list, make exports anonymous</li><li>An anonymous export shows the title only and leaves the PDF's author field empty</li></ul></div>
      </div>
      <p class="muted">The sources, gathered on 8 November 2026, are listed in docs/research/submission-checks.md. Every rule was then confirmed against the official sites or consistent listings; that pass found that 2026–27 Nicholl entries now come only through official partners and that Bruntwood excludes pantomime.</p>
    </section>

    <section aria-labelledby="arch">
      <header><span class="slug">Architecture</span><h2 id="arch">One layout engine for screen and paper</h2></header>
      <div class="flow" aria-label="How a keystroke becomes a page">
        <div class="box"><b>Typing</b><span>Enter and Tab element flow</span></div>
        <div class="box"><b>Editor</b><span>ProseMirror, one node per element</span></div>
        <div class="box core"><b>Layout engine</b><span>Pure TypeScript; page breaks from the format rules</span></div>
        <div class="box"><b>Pages</b><span>The same output feeds the page view and the PDF</span></div>
      </div>
      <div class="split">
        <div class="box"><b>Stored as OpenAct Fountain</b><span>Plain text any Fountain app can read, plus OpenAct's conventions for songs and scene types</span></div>
        <div class="box"><b>On the device</b><span>IndexedDB with snapshots; real files on Chrome and Edge; backup prompts elsewhere</span></div>
        <div class="box"><b>Free to run</b><span>A static app on a free host: no server, no accounts, no analytics</span></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Decision</th><th scope="col">Choice</th><th scope="col">Why</th></tr></thead>
          <tbody>
            <tr><td>Editor</td><td>ProseMirror</td><td>Typed elements, and page breaks drawn inside the text</td></tr>
            <tr><td>File format</td><td>OpenAct Fountain everywhere</td><td>One plain-text format; no lock-in</td></tr>
            <tr><td>Storage</td><td>IndexedDB, persistence, files, backups</td><td>Safari can clear unvisited sites; three layers keep work safe</td></tr>
            <tr><td>Pagination</td><td>One pure engine</td><td>Screen, PDF and page counts can't disagree</td></tr>
            <tr><td>PDF and Word</td><td>jsPDF and docx</td><td>Maintained in 2026; pdf-lib has had no release since 2022</td></tr>
            <tr><td>App and hosting</td><td>React, Radix, Vite; static hosting</td><td>Accessible building blocks; costs nothing to run</td></tr>
            <tr><td>Desktop app</td><td>Not yet (Tauri if needed)</td><td>The installable web app covers it</td></tr>
            <tr><td>Licence</td><td>GPL app, MIT libraries</td><td>Stays free; formatting reusable by others</td></tr>
            <tr><td>Co-writing</td><td>Later: cloud folder, then Yjs</td><td>Needs a server, so waits for evidence</td></tr>
            <tr><td>Spelling and grammar</td><td>nspell, then Harper as an optional download</td><td>Both run on the device; Harper's grammar engine is 8 MB, so it waits to be asked for</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section aria-labelledby="offline">
      <header><span class="slug">Tested</span><h2 id="offline">Works offline, downloaded or installed</h2></header>
      <p>The same test ran four ways: open a sample, type, autosave, open the review, reload. Once the fonts were bundled with the app, all four behaved the same.</p>
      <div class="table-wrap" role="region" aria-label="Offline test results" tabindex="0">
        <table>
          <thead><tr><th scope="col">Opened as</th><th scope="col">Ready in</th><th scope="col">Edit kept after reload</th><th scope="col">Other sites called</th></tr></thead>
          <tbody>
            <tr><th scope="row">Hosted, online</th><td>0.8 s</td><td class="yes">Yes</td><td>Google Fonts</td></tr>
            <tr><th scope="row">Installed app, online</th><td>0.6 s</td><td class="yes">Yes</td><td class="yes">None</td></tr>
            <tr><th scope="row">Installed app, offline</th><td>0.04 s (cache)</td><td class="yes">Yes, even offline edits</td><td class="yes">None</td></tr>
            <tr><th scope="row">Downloaded file, offline</th><td>0.8 s</td><td class="yes">Yes</td><td class="yes">None (all blocked)</td></tr>
          </tbody>
        </table>
      </div>
      <p class="muted">Chromium only; Safari and Firefox are tested in build slice 12. The installable app passed Chrome's install check with no errors. Details: docs/research/offline-check.md. The downloadable file is prototype/offline/dist/openact-offline.html in the kit.</p>
    </section>

    <section aria-labelledby="legal">
      <header><span class="slug">Legal</span><h2 id="legal">Can you give it away?</h2></header>
      <p><b>Very likely, yes.</b> Copyright protects code, artwork and text, not features, file formats or the layouts writers are expected to follow, as courts have held in the UK, EU and US (<i>SAS v World Programming</i>, <i>Navitaire v easyJet</i>, <i>Lotus v Borland</i>). That holds whether it is free or sold, so the risk lies in what you copy and what you call things.</p>
      <div class="table-wrap" role="region" aria-label="Legal risks" tabindex="0">
        <table>
          <thead><tr><th scope="col">Risk</th><th scope="col">Level now</th><th scope="col">What to do</th></tr></thead>
          <tbody>
            <tr><td>Copying another app's code, screens, icons, help text or templates</td><td class="lvl">Low</td><td>Build everything yourself; now a rule in CLAUDE.md</td></tr>
            <tr><td>Naming Final Draft</td><td class="lvl">Medium</td><td>Only to describe compatibility, in plain text, with a not-affiliated line</td></tr>
            <tr><td>Your own app name</td><td class="lvl">Medium</td><td>Search the registers and consider filing a UK mark before launch</td></tr>
            <tr><td>Open-source notices and the GPL source offer</td><td class="lvl">Medium</td><td>A licences screen and a link to the source</td></tr>
            <tr><td>Fonts loaded from Google</td><td class="lvl">Medium</td><td>Self-host them; done in the offline editions</td></tr>
            <tr><td>Lost work and marketing claims</td><td class="lvl">Medium</td><td>Backups, honest wording, a no-warranty notice</td></tr>
            <tr><td>Sharing, sync, co-writing and AI features</td><td class="lvl">High, once built</td><td>A legal review before building them</td></tr>
          </tbody>
        </table>
      </div>
      <p class="note">Not legal advice. Prepared with the legal plugin's risk-assessment and compliance-check frameworks (docs/legal/legal-review.md, 38 sources). Have a UK IP and technology solicitor review the name, the marketing copy and Final Draft compatibility before launch.</p>
    </section>

    <section aria-labelledby="plan">
      <header><span class="slug">Build</span><h2 id="plan">The build plan</h2></header>
      <p>One slice per Claude Code session, each tested before the next starts.</p>
      <span class="milestone">Milestone 1: write a panto in OpenAct</span>
      <ol class="slices">
        <li><b>Repository and CI</b><p>Built: lint, type-check, tests and build pass. Waiting for a GitHub repository to run them automatically</p></li>
        <li><b>Model and OpenAct Fountain</b><p>Every Fountain rule tested; samples round-trip exactly</p></li>
        <li><b>Layout engine</b><p>Every page-break rule has a golden test; 150 pages in under 200 ms</p></li>
        <li><b>Editor</b><p>Element flow tested in Chromium, WebKit and Firefox</p></li>
        <li><b>Page view</b><p>Breaks match the engine; typing stays under 50 ms</p></li>
        <li><b>Storage</b><p>20 crash tests, at most two seconds lost</p></li>
        <li><b>PDF export</b><p>Matches the page view within half a point</p></li>
        <li><b>Outline, title page, cast, notes, find</b><p>Every acceptance test for those requirements passes</p></li>
        <li><b>Stage, musical and panto</b><p>Songs, scene types, UK layout confirmed with a director</p></li>
      </ol>
      <span class="milestone">Milestone 2: public release (version 1)</span>
      <ol class="slices" style="counter-reset: s 8">
        <li><b>Format library</b><p>TV, audio, comics and treatments, each rule with a golden test</p></li>
        <li><b>Counts, chart and paste</b><p>Pasted scripts typed at least 95% right</p></li>
        <li><b>Word and Final Draft</b><p>Opens cleanly in Word, LibreOffice and Google Docs</p></li>
        <li><b>Offline, install and phone</b><p>The four-way offline test passes in three browsers</p></li>
        <li><b>First run, accessibility, release</b><p>4 of 5 new writers format a page in under two minutes; launch legal actions done</p></li>
      </ol>
      <span class="milestone">Milestone 3: version 2, ready to submit</span>
      <ol class="slices" style="counter-reset: s 13">
        <li><b>Submission review</b><p>Every check tested at every status; an anonymous PDF holds no name, in text or metadata</p></li>
      </ol>
      <span class="milestone">Milestone 4: version 3, spelling and grammar</span>
      <ol class="slices" style="counter-reset: s 14">
        <li><b>Language engine</b><p>Planted errors found; no character name ever flagged</p></li>
        <li><b>Marks and suggestions</b><p>Every action works by keyboard and screen reader</p></li>
        <li><b>Grammar download</b><p>Works offline once downloaded; off in dialogue by default</p></li>
        <li><b>Review and settings</b><p>Issues listed in the review; dialect and dictionary saved with the script</p></li>
      </ol>
    </section>

    <section aria-labelledby="todo">
      <header><span class="slug">Your part</span><h2 id="todo">What only you can do</h2></header>
      <ul class="todo">
        <li><label><input type="checkbox" id="todo-repo"><span>Create an empty private GitHub repository for OpenAct and tell Claude its name</span></label></li>
        <li><label><input type="checkbox" id="todo-name"><span>Search the trade mark registers for OPENACT and OPEN ACT (classes 9 and 42), GitHub and the app stores, and check domains</span></label></li>
        <li><label><input type="checkbox" id="todo-director"><span>Send your director the layout sheet (docs/owner/uk-layout-choice.png): name beside or above the speech?</span></label></li>
        <li><label><input type="checkbox" id="todo-solicitor"><span>Book a one-off review with a UK IP and technology solicitor before launch</span></label></li>
        <li><label><input type="checkbox" id="todo-1"><span>Run 6 to 8 interviews and share the survey (the guide is in docs/research/user-research.md)</span></label></li>
        <li><label><input type="checkbox" id="todo-2"><span>Collect reference PDFs and real Final Draft files for the page-break tests</span></label></li>
        <li><label><input type="checkbox" id="todo-4"><span>Confirm the three scripts you'll write in OpenAct first</span></label></li>
        <li><label><input type="checkbox" id="todo-v3"><span>Version 3: confirm British spelling as the default for A4 and UK formats</span></label></li>
      </ul>
      <p class="muted">Ticks are saved in this browser only.</p>
      <h3>The name: OpenAct</h3>
      <p>The first choice, <b>ActOne</b>, turned out to be taken, so the app is now <b>OpenAct</b>, written as one word. It has <b>not been searched yet</b>: search the UK, EU and US trade mark registers (classes 9 and 42), GitHub and the app stores before launch, and expect near-matches, since "Open" names are common in open-source software. Always pair it with "the free script editor".</p>
      <h3>The shortlist ActOne was chosen over</h3>
      <div class="table-wrap" role="region" aria-label="Name shortlist" tabindex="0">
        <table>
          <thead><tr><th scope="col">Name</th><th scope="col">Why it fits</th><th scope="col">Clash risk</th></tr></thead>
          <tbody>
            <tr><th scope="row">Matinee</th><td>Theatre and cinema in one warm word</td><td>Low to medium: no software use or live software mark found</td></tr>
            <tr><th scope="row">Scenebook</th><td>A book of scenes, true for every format</td><td>Low to medium: a publisher is called Scenebooks Inc.</td></tr>
            <tr><th scope="row">Pagelight</th><td>A light on the page, like a stage light</td><td>Low: nothing found</td></tr>
            <tr><th scope="row">Inkstage</th><td>Coined: ink plus stage</td><td>Low: nothing found</td></tr>
            <tr><th scope="row">Readthrough</th><td>The first table read</td><td>Low to medium: Table Read apps exist</td></tr>
            <tr><th scope="row">Sceneshift</th><td>The scene change, on stage and screen</td><td>Low: nothing found</td></tr>
          </tbody>
        </table>
      </div>
      <p class="muted">Twelve names are ranked in docs/research/names.md, and twenty more were ruled out because apps or brands already use them (Ghost Light, Callboard, Off Book, Draftline and others). "OpenAct" itself is crowded with teleprompter apps for actors and creators.</p>
    </section>

    <section aria-labelledby="kit">
      <header><span class="slug">The kit</span><h2 id="kit">Build it with Claude Code</h2></header>
      <p>The kit folder holds these prompts, every document above, the prototype source and the script-formats skill. Open it as a project in Claude Code and start with slice 0.</p>
      <details>
        <summary>Prompt 2: build one slice (use for each build session)</summary>
        <div class="prompt"><pre id="p2">{p2}</pre><div class="copy-row"><button class="btn" type="button" data-copy="p2" id="copy-p2">Copy prompt</button></div></div>
      </details>
      <details>
        <summary>Prompt 1: the design kickoff (already run)</summary>
        <div class="prompt"><pre id="p1">{p1}</pre><div class="copy-row"><button class="btn" type="button" data-copy="p1" id="copy-p1">Copy prompt</button></div></div>
      </details>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Stage</th><th scope="col">Skills</th></tr></thead>
          <tbody>
            <tr><td>Each build slice</td><td>cunning-plan, run, code-review, simplify, script-formats</td></tr>
            <tr><td>Before release</td><td>security-review, engineering:deploy-checklist, engineering:documentation</td></tr>
            <tr><td>After interviews</td><td>design:research-synthesis</td></tr>
            <tr><td>Version 2 and 3, and before launch</td><td>script-formats (submission reference), legal:legal-risk-assessment, legal:compliance-check</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>

  <footer>
    <p>Research drew on 34 web sources for the product (3 and 8 November 2026, docs/research/competitors.md), 55 for the review stage (docs/research/submission-checks.md) and 38 for the legal review. Re-check prices and competition rules before launch.</p>
    <p>The prototype and this page are private until shared from each page's Share menu.</p>
  </footer>
</div>

<script>
(function () {{
  var KEY = 'openact-pack-todo';
  var saved = {{}};
  try {{ saved = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem('cue-pack-todo') || '{{}}'); }} catch (e) {{ saved = {{}}; }}
  document.querySelectorAll('.todo input').forEach(function (box) {{
    box.checked = !!saved[box.id];
    box.addEventListener('change', function () {{
      saved[box.id] = box.checked;
      try {{ localStorage.setItem(KEY, JSON.stringify(saved)); }} catch (e) {{}}
    }});
  }});
  document.querySelectorAll('[data-copy]').forEach(function (btn) {{
    btn.addEventListener('click', function () {{
      var pre = document.getElementById(btn.getAttribute('data-copy'));
      var done = function () {{ btn.textContent = 'Copied'; setTimeout(function () {{ btn.textContent = 'Copy prompt'; }}, 2000); }};
      var fallback = function () {{ var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Selected: press Ctrl+C'; }};
      try {{ navigator.clipboard.writeText(pre.textContent).then(done, fallback); }} catch (e) {{ fallback(); }}
    }});
  }});
}})();
</script>
'''
out.write_text(page)
print(out, out.stat().st_size)

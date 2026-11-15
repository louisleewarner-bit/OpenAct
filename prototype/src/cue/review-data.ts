import type { FormatGroup } from './profiles';
import type { ProfileId } from './model';
import { baseId } from './profiles';

/**
 * Submission rules as data. Every check and every rule names its sources, so the review panel can show
 * them and docs/research/submission-checks.md can list them. Rules change every year: each target carries
 * the date it was researched, and the panel tells the writer to read the current rules too.
 */

export type SourceKind = 'official' | 'listing' | 'guide' | 'practitioner' | 'forum' | 'reference' | 'house';

export interface Source {
  label: string;
  url?: string;
  kind: SourceKind;
  date: string;
}

export const KIND_LABEL: Record<SourceKind, string> = {
  official: 'Official rules',
  listing: 'Listing quoting the rules',
  guide: 'Industry guide',
  practitioner: 'Writer or reader advice',
  forum: 'Forum, rule of thumb',
  reference: 'Reference',
  house: 'OpenAct convention',
};

export const SOURCES: Record<string, Source> = {
  'nicholl-2026': { label: 'Academy Nicholl Fellowships: 2026–2027 rules', url: 'https://www.oscars.org/sites/oscars/files/2026-06/2026-2027%20Nicholl%20Rules%20Terms%20and%20Conditions%20(1).pdf?VersionId=nR0FBxECCDhQqRHFQbe08v4dccpBtxwf', kind: 'official', date: 'Jun 2026' },
  'nicholl-faq-2024': { label: 'Academy Nicholl Fellowships: 2024 FAQ', url: 'https://www.oscars.org/sites/oscars/files/2024_nicholl_faq.pdf', kind: 'official', date: '2024' },
  'aff-rules-2026': { label: 'Austin Film Festival: 2026 Screenplay Competition rules', url: 'https://austinfilmfestival.com/wp-content/uploads/2025/11/2026-SPLAY-COMPETITION-RULES.pdf', kind: 'official', date: '2026 cycle' },
  'aff-faq-2026': { label: 'Austin Film Festival: 2026 Screenplay Competition FAQ', url: 'https://austinfilmfestival.com/wp-content/uploads/2025/11/2026-SPLAY-COMPETITION-FAQ.pdf', kind: 'official', date: '2026 cycle' },
  'bbc-open-call': { label: 'BBC Writers: how to submit a script to us (read through a copy of the page)', url: 'https://www.bbc.co.uk/writers/opportunities/open-call', kind: 'official', date: '2026' },
  'bbc-celtx': { label: 'Celtx blog: the BBC Writers open call', url: 'https://blog.celtx.com/?p=8286', kind: 'listing', date: '2025' },
  'bruntwood-anon': { label: 'Bruntwood Prize: anonymity and your entry', url: 'https://www.writeaplay.co.uk/anonymity-and-your-entry/', kind: 'official', date: '2019–2022 cycles' },
  'royal-court-submit': { label: 'Royal Court Theatre: submit your play', url: 'https://royalcourttheatre.com/write-and-create/writers/script-submissions-invitations/submit-your-play/', kind: 'official', date: 'current' },
  'fd-title-format': { label: 'Final Draft blog: how to format a screenplay title page', url: 'https://www.finaldraft.com/blog/how-to-format-a-screenplay-title-page-free-template-included', kind: 'guide', date: 'undated' },
  'nicholl-2024': { label: 'Academy Nicholl Fellowships: 2024 rules', url: 'https://www.oscars.org/sites/oscars/files/2024_nicholl_rules.pdf', kind: 'official', date: '2024' },
  'nicholl-wgf': { label: 'Writers Guild Foundation: submit to the Nicholl (2026 cycle)', url: 'https://wgfoundation.org/nicholl', kind: 'official', date: '2026' },
  'nicholl-lfs': { label: 'London Film School: Nicholl Fellowship listing', url: 'https://lfs.org.uk/nicholl-fellowship-in-screenwriting-presented-by-the-academy-of-motion-picture-arts-and-sciences/', kind: 'listing', date: '2026' },
  'aff-rules': { label: 'Austin Film Festival: Screenplay Competition rules', url: 'https://austinfilmfestival.com/wp-content/uploads/2024/11/SPLAY-COMPETITION-RULES.pdf', kind: 'official', date: '2025 cycle' },
  'aff-online': { label: 'Austin Film Festival: online submission rules', url: 'http://screenplaysub.austinfilmfestival.com/rules.html', kind: 'official', date: 'undated' },
  'aff-faq': { label: 'Austin Film Festival: Screenplay Competition FAQ', url: 'https://austinfilmfestival.com/wp-content/uploads/2024/11/SPLAY-COMPETITION-FAQ.pdf', kind: 'official', date: '2025 cycle' },
  'aff-digital': { label: 'Austin Film Festival: Digital Series Competition', url: 'https://austinfilmfestival.com/about-aff-digital-series/', kind: 'official', date: '2026' },
  'aff-top5': { label: 'Austin Film Festival blog: top 5 things to check before you submit', url: 'https://austinfilmfestival.com/blog/news/top-5-things-to-check-for-before-you-submit-your-screenplay/', kind: 'official', date: 'undated' },
  'bbc-nawe-2025': { label: 'NAWE: BBC Writersroom open call for scripts', url: 'https://www.nawe.co.uk/DB/jobs-and-opportunities/bbc-writersroom-open-call-for-scripts.html', kind: 'listing', date: 'Aug 2025' },
  'bbc-nawe-drama': { label: 'NAWE: BBC Writersroom open call for drama and comedy-drama', url: 'https://nawe.co.uk/DB/competitions-and-submissions/bbc-writersroom-open-call-for-drama-and-comedy-drama-scripts.html', kind: 'listing', date: 'Apr 2025' },
  'bbc-script-room': { label: 'Writers Online: BBC Writersroom Script Room (drama)', url: 'https://www.writers-online.co.uk/news/script-submissions-drama-for-bbc-writersroom-script-room', kind: 'listing', date: 'undated' },
  'bruntwood-layout': { label: 'Bruntwood Prize: suggested layout guidelines', url: 'https://writeaplay.co.uk/?p=11621', kind: 'official', date: 'undated' },
  'bruntwood-rules': { label: 'Bruntwood Prize: how do I enter?', url: 'https://www.writeaplay.co.uk/?p=388', kind: 'official', date: '2025 prize' },
  'bruntwood-faq': { label: 'Bruntwood Prize: entry FAQ', url: 'https://writeaplay.co.uk/?p=20545', kind: 'official', date: '2025 prize' },
  'royal-court': { label: 'Royal Court Theatre: script submissions', url: 'https://royalcourttheatre.com/playwriting/submissions-invitations/script-submissions', kind: 'official', date: 'undated' },
  'royal-court-nycp': { label: 'NYC Playwrights: Royal Court submission guidelines', url: 'https://www.nycplaywrights.org/2022/06/royal-court-submission-guidelines.html', kind: 'listing', date: 'Jun 2022' },
  'writers-theatre': { label: 'Writers Theatre (US): play submissions', url: 'https://www.writerstheatre.org/play-submissions', kind: 'official', date: 'undated' },
  'walnut-street': { label: 'Walnut Street Theatre (US): literary office', url: 'https://WalnutStreetTheatre.org/about/literary.php', kind: 'official', date: 'undated' },
  'lafpi-litmgr': { label: 'LA Female Playwrights Initiative: literary managers talk back', url: 'https://lafpi.com/2011/09/lit-mgrs-talk-back-about-play-submissions/', kind: 'practitioner', date: 'Sep 2011' },
  'village-musicals': { label: 'NYC Playwrights: Village Theatre musical submissions', url: 'https://www.nycplaywrights.org/2018/07/village-theatre-musicals.html', kind: 'listing', date: 'Jul 2018' },
  'new-musical-project': { label: 'BroadwayWorld: New Musical Project submissions open', url: 'https://www.broadwayworld.com/denver/article/Submissions-Open-For-2026-New-Musical-Project-20250903', kind: 'listing', date: 'Sep 2025' },
  'dh-guide': { label: 'Dark Horse Comics: script format guide', url: 'https://images.darkhorse.com/darkhorse08/company/submissions/DHScriptFormatGuides.pdf', kind: 'official', date: 'older guide, undated' },
  'dh-submissions': { label: 'Dark Horse Comics: submissions', url: 'https://www.darkhorse.com/Company/Submissions', kind: 'official', date: 'undated' },
  'dh-faq': { label: 'Dark Horse Comics: submissions FAQ', url: 'https://www.darkhorse.com/Help/FAQ/submissions', kind: 'official', date: 'undated' },
  'comixtribe-pages': { label: 'ComixTribe: what counts, with page counts', url: 'https://www.comixtribe.com/what-counts-with-page-counts/', kind: 'practitioner', date: 'undated' },
  'fd-title': { label: 'Final Draft blog: the nuances of the title page', url: 'https://www.finaldraft.com/blog/screenwriting-basics-the-nuances-of-the-title-page', kind: 'guide', date: 'undated' },
  'celtx-title': { label: 'Celtx blog: the screenplay title page', url: 'https://blog.celtx.com/screenplay-title-page', kind: 'guide', date: 'undated' },
  'srp-title': { label: 'Script Reader Pro: the screenplay title page', url: 'https://www.scriptreaderpro.com/screenplay-title-page/', kind: 'practitioner', date: 'undated' },
  'celtx-shooting': { label: 'Celtx blog: what is a shooting script?', url: 'https://blog.celtx.com/shooting-script/', kind: 'guide', date: 'undated' },
  'sb-shooting': { label: 'StudioBinder: shooting script example', url: 'https://www.studiobinder.com/blog/shooting-script-example/', kind: 'guide', date: 'undated' },
  'fd-caps': { label: 'Final Draft blog: everything you need to know about caps', url: 'https://www.finaldraft.com/blog/screenwriting-basics-everything-you-need-to-know-about-caps', kind: 'guide', date: 'undated' },
  'sb-intros': { label: 'StudioBinder: character descriptions and introductions', url: 'https://www.studiobinder.com/blog/screenplay-character-descriptions-introductions/', kind: 'guide', date: 'undated' },
  'scriptmag-camera': { label: 'Script Magazine (Dave Trottier): why not use camera directions?', url: 'https://scriptmag.com/features/screenplay-format-use-camera-directions-for-screenplays', kind: 'practitioner', date: 'undated' },
  'filmthreat-avoid': { label: 'Film Threat: writing a screenplay, what to avoid', url: 'https://filmthreat.com/features/writing-a-screenplay-what-to-avoid/', kind: 'practitioner', date: 'undated' },
  'cs-wesee': { label: 'Creative Screenwriting (James Napoli): search for “we see” and cut it', url: 'https://www.creativescreenwriting.com/cswcms/?p=7895', kind: 'practitioner', date: 'undated' },
  'fd-length': { label: 'Final Draft blog: how long should my movie script be?', url: 'https://www.finaldraft.com/blog/how-long-should-my-movie-script-be', kind: 'guide', date: 'undated' },
  'sb-length': { label: 'StudioBinder: how long is a movie script?', url: 'https://studiobinder.com/blog/how-long-is-a-movie-script', kind: 'guide', date: 'undated' },
  'ja-minute': { label: 'John August: the one-page-a-minute rule', url: 'https://johnaugust.com/?p=577', kind: 'practitioner', date: 'undated' },
  'sb-tv': { label: 'StudioBinder: how long is a TV show script?', url: 'https://studiobinder.com/blog/how-long-is-a-tv-show-script', kind: 'guide', date: 'undated' },
  'scriptmag-pilots': { label: 'Script Magazine: pilot page counts', url: 'https://scriptmag.com/features/primetime-wannabe-a-writer-get-in-the-game-or-go-home-also-comedy-writing-programs-and-pilot-page-counts', kind: 'practitioner', date: 'undated' },
  'fd-tv-structure': { label: 'Final Draft blog: how to structure a TV pilot', url: 'https://www.finaldraft.com/blog/how-to-structure-a-tv-pilot', kind: 'guide', date: 'undated' },
  'filmdaft-action': { label: 'FilmDaft: action lines in screenplays', url: 'https://filmdaft.com/action-lines-in-screenplays-definition/', kind: 'practitioner', date: 'Oct 2025' },
  'scriptmag-action': { label: 'Script Magazine: the magic bullet, action lines', url: 'https://scriptmag.com/features/the-magic-bullet-action-lines', kind: 'practitioner', date: 'undated' },
  'fd-transitions': { label: 'Final Draft blog: to CUT TO or not to CUT TO', url: 'https://www.finaldraft.com/blog/transitions-cut-not-cut', kind: 'guide', date: 'undated' },
  'scriptmag-drformat': { label: 'Script Magazine (Ask Dr. Format): transitions and parentheticals', url: 'https://scriptmag.com/features/ask-dr-format-formatting-cause-insanity-screenwriters', kind: 'practitioner', date: 'undated' },
  'scribophile-mistakes': { label: 'Scribophile: common screenplay mistakes', url: 'https://www.scribophile.com/academy/common-screenplay-mistakes', kind: 'practitioner', date: 'undated' },
  'writersstore-cues': { label: 'The Writers Store (Dave Trottier): one cue name per character', url: 'https://writersstore.com/blogs/news/how-do-i-format-simultaneous-dialogue', kind: 'practitioner', date: 'undated' },
  'scriptmag-names': { label: 'Script Magazine (Column D): choosing character names', url: 'https://scriptmag.com/features/column-d-the-name-game-choosing-character-names-part-3', kind: 'practitioner', date: 'undated' },
  'radio4-slot': { label: 'Writers Online: BBC radio drama prize (45-minute Afternoon Drama)', url: 'https://www.writers-online.co.uk/news/script-competition-the-bbc-writers-prize-for-radio-drama', kind: 'listing', date: 'Sep 2014' },
  'radio-producers': { label: 'Anita Sullivan: BBC radio drama commissioning 101', url: 'https://www.anitasullivan.co.uk/post/bbc-radio-drama-commissioning-101', kind: 'practitioner', date: 'undated' },
  'wpm': { label: 'Killer Spots: timing a radio script (150 words a minute)', url: 'https://killerspots.com/blog/radio-script-timer-how-long-is-a-30-second-script', kind: 'practitioner', date: 'undated' },
  'bcg-timing': { label: 'British Comedy Guide forum: time it by reading it aloud', url: 'https://comedy.co.uk/forums/post/1112079', kind: 'forum', date: 'undated' },
  tk: { label: 'Wikipedia: To come (publishing), the TK placeholder', url: 'https://en.wikipedia.org/wiki/To_come_(publishing)', kind: 'reference', date: 'current' },
  'blind-metadata': { label: 'AEJMC: ensure a blind review (clear the document properties)', url: 'https://aejmc.us/wp-content/uploads/sites/29/2013/01/Ensure-a-Blind-Review.pdf', kind: 'guide', date: '2013' },
  'chrome-spell': { label: 'Google Chrome Help: basic and enhanced spell check', url: 'https://support.google.com/chrome/answer/12027911', kind: 'official', date: 'current' },
  'skill-stage': { label: 'OpenAct script-formats skill: stage and panto conventions', kind: 'house', date: '2026' },
  house: { label: 'OpenAct house check, no outside source', kind: 'house', date: '2026' },
  'bruntwood-enter': { label: 'Bruntwood Prize: how do I enter? (2025 prize)', url: 'https://www.writeaplay.co.uk/how-do-i-enter/', kind: 'official', date: '2025 prize' },
  'bbc-scriptie-2025': { label: 'Screen Ireland Script.ie: BBC Writers open call (2025)', url: 'https://script.ie/whats-new/2025/11/bbc-writers-open-call-2/', kind: 'listing', date: 'Nov 2025' },
  'bbc-pss': { label: 'Playwrights’ Studio Scotland: BBC Writers open call', url: 'https://playwrightsstudio.co.uk/opportunities-news/bbc-writers-open-call', kind: 'listing', date: '2025' },
};

export type TargetId = 'spec' | 'nicholl' | 'aff' | 'bbc' | 'bruntwood' | 'uk-theatre' | 'us-theatre' | 'musical-dev' | 'comics' | 'radio' | 'game';

export type TargetGroup = 'General' | 'Competitions and open calls' | 'Theatres and programmes' | 'Publishers and producers';

export interface ManualItem {
  id: string;
  text: string;
  sources: string[];
}

export interface Target {
  id: TargetId;
  name: string;
  group: TargetGroup;
  blurb: string;
  /** Format groups (or exact profiles) the target is for. */
  suits: (FormatGroup | ProfileId)[];
  /** Readers mustn't learn who wrote it. */
  blind: boolean;
  /** Spec-script conventions apply (no draft date, few camera directions). */
  spec: boolean;
  rules?: { label: string; url: string };
  researched: string;
  manual: ManualItem[];
}

export const TARGET_GROUPS: TargetGroup[] = ['General', 'Competitions and open calls', 'Theatres and programmes', 'Publishers and producers'];

export const TARGETS: Record<TargetId, Target> = {
  spec: {
    id: 'spec',
    name: 'Agent, manager or producer',
    group: 'General',
    blurb: 'A spec script sent to get representation or a read. Your name and contact details belong on the title page.',
    suits: ['Film', 'Television', 'Audio', 'Documents'],
    blind: false,
    spec: true,
    researched: 'November 2026',
    manual: [
      { id: 'logline', text: 'A one-line logline and a short synopsis are ready to paste into an email or form.', sources: ['nicholl-2024'] },
      { id: 'pdf-read', text: 'You have opened the exported PDF and read the first ten pages as a stranger would.', sources: ['house'] },
    ],
  },
  nicholl: {
    id: 'nicholl',
    name: 'Academy Nicholl Fellowships',
    group: 'Competitions and open calls',
    blurb: 'Feature screenplays only, read blind, entered through an official Nicholl partner. 80 to 125 pages.',
    suits: ['screenplay'],
    blind: true,
    spec: true,
    rules: { label: 'Nicholl rules (oscars.org)', url: 'https://www.oscars.org/nicholl' },
    researched: 'November 2026 (2026–27 rules, confirmed on oscars.org)',
    manual: [
      { id: 'partner', text: 'You are entering through an official Nicholl partner: the 2026–27 rules accept applications only from writers put forward by partners.', sources: ['nicholl-2026'] },
      { id: 'logline', text: 'The logline is ready: the 2026–27 rules disqualify applications without one. Older FAQs capped it at 300 characters, and judges never see it. Note an adaptation of your own work in it.', sources: ['nicholl-2026', 'nicholl-faq-2024'] },
      { id: 'adult', text: 'You are 18 or over and entering as yourself, not for a production company or an AI agent.', sources: ['nicholl-2026'] },
      { id: 'english', text: 'It is one original feature screenplay, in English, uploaded as a PDF.', sources: ['nicholl-2026', 'nicholl-2024'] },
      { id: 'window', text: 'The window is open. In 2026 it ran from 22 June to 20 July, or until 2,000 scripts arrived.', sources: ['nicholl-wgf'] },
    ],
  },
  aff: {
    id: 'aff',
    name: 'Austin Film Festival Script Competition',
    group: 'Competitions and open calls',
    blurb: 'Features and pilots, read blind: the cover page shows the title only. Pages numbered top right, 12-point Courier.',
    suits: ['Film', 'Television'],
    blind: true,
    spec: true,
    rules: { label: 'AFF competition rules', url: 'https://austinfilmfestival.com/about-aff-script-competitions/' },
    researched: 'November 2026 (2026 rules, confirmed on austinfilmfestival.com)',
    manual: [
      { id: 'eligible', text: 'You don’t currently earn a living writing for film or television, and have no WGA writing credits.', sources: ['aff-rules-2026'] },
      { id: 'category', text: 'You have picked the right category. Pilots must be original series; bibles and treatments are removed before judging.', sources: ['aff-rules-2026'] },
      { id: 'online', text: 'Entering online: no separate contact page is needed.', sources: ['aff-rules-2026', 'aff-online'] },
    ],
  },
  bbc: {
    id: 'bbc',
    name: 'BBC Writersroom open call',
    group: 'Competitions and open calls',
    blurb: 'Yearly UK open call for drama and comedy scripts for TV, film, radio and stage, entered online and read anonymously. At least 30 pages; the first ten are the first sift.',
    suits: ['Film', 'Television', 'Theatre', 'Audio'],
    blind: true,
    spec: true,
    rules: { label: 'BBC Writersroom open call (bbc.co.uk/writers)', url: 'https://www.bbc.co.uk/writers/' },
    researched: 'November 2026 (from a copy of the BBC page and listings)',
    manual: [
      { id: 'eligible', text: 'You are 18 or over and live in the UK or the Republic of Ireland.', sources: ['bbc-open-call'] },
      { id: 'window', text: 'The call is open. The BBC announces the dates each autumn and takes scripts only through its online E-Submissions system.', sources: ['bbc-open-call'] },
      { id: 'one', text: 'This is your only script for this window (one per writer or team).', sources: ['bbc-nawe-2025'] },
      { id: 'polished', text: 'It is a finished draft, not an early or rough one, and its first ten pages are its strongest: they are the first sift.', sources: ['bbc-scriptie-2025', 'bbc-pss'] },
      { id: 'full', text: 'It is a full script or episode: no outlines, treatments, loglines or samples.', sources: ['bbc-open-call', 'bbc-nawe-2025'] },
      { id: 'pdf', text: 'You will upload one PDF (older calls set a 10 MB limit).', sources: ['bbc-nawe-drama'] },
    ],
  },
  bruntwood: {
    id: 'bruntwood',
    name: 'Bruntwood Prize for Playwriting',
    group: 'Competitions and open calls',
    blurb: 'Original plays judged anonymously, under a pseudonym. The cover page shows the title only. No musicals, pantomimes, translations or adaptations.',
    suits: ['Theatre'],
    blind: true,
    spec: false,
    rules: { label: 'Bruntwood Prize (writeaplay.co.uk)', url: 'https://www.writeaplay.co.uk/' },
    researched: 'November 2026 (the prize’s own pages for the 2025 prize; check the next round’s rules)',
    manual: [
      { id: 'pseudonym', text: 'You will enter under a pseudonym, and the script carries no address, phone number or agent details: those disqualify an entry.', sources: ['bruntwood-anon'] },
      { id: 'produced', text: 'The play is unproduced: no professional production anywhere (up to two rehearsed readings are fine), and never optioned or published.', sources: ['bruntwood-anon'] },
      { id: 'original', text: 'It is an original play: not a musical, pantomime, translation or adaptation of someone else’s work.', sources: ['bruntwood-anon'] },
      { id: 'age', text: 'You are 16 or over, this is your only entry, and you have not won the prize before.', sources: ['bruntwood-enter', 'bruntwood-faq'] },
      { id: 'resident', text: 'You live in the UK, the Republic of Ireland or a British Overseas Territory, or have a BFPO address.', sources: ['bruntwood-enter'] },
      { id: 'online', text: 'You will enter online as one PDF, DOC or DOCX file.', sources: ['bruntwood-layout'] },
    ],
  },
  'uk-theatre': {
    id: 'uk-theatre',
    name: 'UK new-writing theatre',
    group: 'Theatres and programmes',
    blurb: 'An unsolicited play for a literary department, such as the Royal Court’s.',
    suits: ['Theatre'],
    blind: false,
    spec: false,
    rules: { label: 'Royal Court: submit your play', url: 'https://royalcourttheatre.com/write-and-create/writers/script-submissions-invitations/submit-your-play/' },
    researched: 'November 2026 (confirmed on royalcourttheatre.com)',
    manual: [
      { id: 'one', text: 'This is your only script with this theatre at the moment.', sources: ['royal-court-submit'] },
      { id: 'redraft', text: 'It is not a new draft of a play they have already read, unless they asked for one.', sources: ['royal-court-submit'] },
      { id: 'file', text: 'You will send one PDF or Word file of 10 MB or less.', sources: ['royal-court-submit'] },
      { id: 'musical', text: 'For a musical, send the script only at first: no scores or recordings.', sources: ['royal-court-submit'] },
    ],
  },
  'us-theatre': {
    id: 'us-theatre',
    name: 'US theatre literary office',
    group: 'Theatres and programmes',
    blurb: 'A submission to a US theatre, which usually asks for a short package before the full play.',
    suits: ['Theatre'],
    blind: false,
    spec: false,
    rules: { label: 'Example: Writers Theatre play submissions', url: 'https://www.writerstheatre.org/play-submissions' },
    researched: 'November 2026',
    manual: [
      { id: 'synopsis', text: 'A synopsis, as long as the theatre asks (some want 200 words, some a page or two).', sources: ['walnut-street', 'writers-theatre'] },
      { id: 'breakdown', text: 'A character breakdown giving the number of actors, and how many roles are female, male or any gender.', sources: ['writers-theatre'] },
      { id: 'sample', text: 'A sample of 10 to 15 consecutive pages, if they ask for one.', sources: ['writers-theatre'] },
      { id: 'letter', text: 'A short cover letter: one paragraph, saying why the play suits this theatre.', sources: ['lafpi-litmgr', 'writers-theatre'] },
      { id: 'runtime', text: 'An approximate running time.', sources: ['walnut-street'] },
    ],
  },
  'musical-dev': {
    id: 'musical-dev',
    name: 'New musical programme',
    group: 'Theatres and programmes',
    blurb: 'A development programme or festival for new musicals, which reads a libretto excerpt with demo recordings.',
    suits: ['musical', 'musical-us', 'panto'],
    blind: false,
    spec: false,
    researched: 'November 2026',
    manual: [
      { id: 'excerpt', text: 'A libretto excerpt of 20 to 30 pages, including the songs that fall inside it.', sources: ['village-musicals'] },
      { id: 'demos', text: 'At least three demo recordings in which the lyrics, melody and accompaniment are clear. They needn’t be studio quality.', sources: ['village-musicals'] },
      { id: 'songlist', text: 'A song list giving each song’s place in the show and what it does.', sources: ['village-musicals'] },
      { id: 'package', text: 'A synopsis of about 100 words, a cast breakdown and any sheet music you have.', sources: ['new-musical-project'] },
    ],
  },
  comics: {
    id: 'comics',
    name: 'Comics publisher',
    group: 'Publishers and producers',
    blurb: 'A full script for a publisher pitch. The limits come from Dark Horse’s script guide.',
    suits: ['Comics'],
    blind: false,
    spec: false,
    rules: { label: 'Dark Horse submissions', url: 'https://www.darkhorse.com/Company/Submissions' },
    researched: 'November 2026 (Dark Horse’s pages, which are several years old)',
    manual: [
      { id: 'artist', text: 'You are pitching with an artist: Dark Horse does not review writer-only proposals.', sources: ['dh-submissions'] },
      { id: 'ai', text: 'No part of the pitch was made with AI tools: Dark Horse does not accept AI-generated material.', sources: ['dh-submissions'] },
      { id: 'licensed', text: 'The story is not for a licensed property: those are not accepted unsolicited.', sources: ['dh-faq'] },
      { id: 'package', text: 'The proposal has a short logline, an outline, six consecutive finished pages, and a submission agreement signed by every creator.', sources: ['dh-submissions'] },
    ],
  },
  game: {
    id: 'game',
    name: 'Game studio hand-off',
    group: 'Publishers and producers',
    blurb: 'A branching script for a developer, a narrative team or a recording studio. There is no standard to follow, so these are checks for the structure and the recording.',
    suits: ['Games'],
    blind: false,
    spec: false,
    researched: 'November 2026 (OpenAct checks; game studios set their own rules)',
    manual: [
      { id: 'house-style', text: 'You have asked the studio for its own script template and ID rules: studios set their own, and OpenAct’s are a sensible default.', sources: ['house'] },
      { id: 'engine', text: 'You know which engine format the developers use (Ink, Yarn Spinner, or their own), or you are handing over the recording sheet only.', sources: ['house'] },
      { id: 'play', text: 'You have played through each branch on paper or in the engine, since a branch that reads well can still play badly.', sources: ['house'] },
    ],
  },
  radio: {
    id: 'radio',
    name: 'BBC radio drama (45 minutes)',
    group: 'Publishers and producers',
    blurb: 'A single play for Radio 4’s 45-minute afternoon slot, pitched through a producer.',
    suits: ['Audio'],
    blind: false,
    spec: false,
    researched: 'November 2026',
    manual: [
      { id: 'producer', text: 'You have a producer to take it in: BBC radio drama is pitched through producers, not sent to the BBC directly.', sources: ['radio-producers'] },
      { id: 'timed', text: 'You have read a few scenes aloud against a clock to check the estimate below.', sources: ['bcg-timing'] },
    ],
  },
};

export const TARGET_ORDER: TargetId[] = ['spec', 'nicholl', 'aff', 'bbc', 'bruntwood', 'uk-theatre', 'us-theatre', 'musical-dev', 'comics', 'radio', 'game'];

export function defaultTarget(profile: ProfileId): TargetId {
  switch (baseId(profile)) {
    case 'stage-uk':
    case 'panto':
      return 'uk-theatre';
    case 'stage-us':
      return 'us-theatre';
    case 'musical':
    case 'musical-us':
      return 'musical-dev';
    case 'radio-uk':
      return 'radio';
    case 'comic':
      return 'comics';
    case 'game':
      return 'game';
    default:
      return 'spec';
  }
}

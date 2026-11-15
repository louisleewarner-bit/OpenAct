import type { ProfileId } from './model';

/**
 * The format finder's catalogue (D-040). It is built into OpenAct and checked by hand, so searching it
 * never touches the network. Each entry names a format, says how close OpenAct gets, and links to the
 * organisation's own page; OpenAct holds no copy of anyone's template.
 */
export type FinderGroup = 'Competitions and schemes' | 'Theatre and publisher house styles' | 'Screen industry standards' | 'Other forms';
export const FINDER_GROUPS: FinderGroup[] = ['Competitions and schemes', 'Theatre and publisher house styles', 'Screen industry standards', 'Other forms'];

export interface FinderEntry {
  id: string;
  name: string;
  group: FinderGroup;
  /** One line: what it is and who it is for. */
  summary: string;
  /** covered: a built-in format matches. close: a built-in is near, with differences. missing: OpenAct can't draw it yet. */
  status: 'covered' | 'close' | 'missing';
  /** What to know or what is missing. */
  gap: string;
  nearest: ProfileId;
  /** The organisation's own page. Left out when no official page could be confirmed. */
  url?: string;
  /** What the link is, when it isn't the organisation's own rules page. Default: Official page. */
  linkLabel?: string;
  /** Month the link and wording were checked, as YYYY-MM. */
  checked: string;
  /** Extra words people search by. */
  tags?: string;
}

export const FINDER: FinderEntry[] = [
  {
    id: "nicholl",
    name: "Academy Nicholl Fellowships",
    group: "Competitions and schemes",
    summary: "The Academy’s screenwriting fellowship for new writers.",
    status: "covered",
    gap: "Standard screenplay layout fits. OpenAct’s “Ready to submit?” has a Nicholl target for the anonymity and logline rules. Rules change each year.",
    nearest: "screenplay",
    checked: "2026-11",
    url: "https://wgfoundation.org/nicholl",
    tags: "contest competition fellowship oscars spec feature"
  },
  {
    id: "austin",
    name: "Austin Film Festival Screenplay Competition",
    group: "Competitions and schemes",
    summary: "A long-running US screenplay competition with feature, teleplay and other categories.",
    status: "covered",
    gap: "Standard screenplay layout fits. OpenAct has an Austin target in “Ready to submit?”.",
    nearest: "screenplay",
    checked: "2026-11",
    url: "https://austinfilmfestival.com/wp-content/uploads/2025/11/2026-SPLAY-COMPETITION-RULES.pdf",
    linkLabel: "Official rules (PDF)",
    tags: "contest festival teleplay spec"
  },
  {
    id: "bbc-open-call",
    name: "BBC Writers open calls",
    group: "Competitions and schemes",
    summary: "Scripts read anonymously when the BBC opens a call for new writers.",
    status: "close",
    gap: "Calls open and close at set times and ask for different things. OpenAct’s “Ready to submit?” has a BBC target for anonymity and length. Read the current call.",
    nearest: "tv-single",
    checked: "2026-11",
    url: "https://www.bbc.co.uk/writers/opportunities/open-call",
    tags: "writersroom drama tv uk radio comedy"
  },
  {
    id: "bruntwood",
    name: "Bruntwood Prize for Playwriting",
    group: "Competitions and schemes",
    summary: "A UK playwriting prize for full-length plays, read without writers’ names.",
    status: "close",
    gap: "Publishes suggested layout guidelines. OpenAct’s UK stage layout is close; compare it with theirs, and import their template if they give you one.",
    nearest: "stage-uk",
    checked: "2026-11",
    url: "https://writeaplay.co.uk/?p=11621",
    linkLabel: "Suggested layout guidelines",
    tags: "play prize contest theatre stage uk manchester"
  },
  {
    id: "slamdance",
    name: "Slamdance Screenplay Competition",
    group: "Competitions and schemes",
    summary: "A US competition for emerging screenwriters.",
    status: "covered",
    gap: "Asks for current industry standard layout in 12-point Courier, with a title page. Page limits differ by category: features 41 to 140, pilots up to 80, shorts up to 40. Check each year. OpenAct has no Slamdance target yet.",
    nearest: "screenplay",
    checked: "2026-11",
    url: "https://slamdance.com/screenplay-submit/",
    tags: "contest festival pilot short spec"
  },
  {
    id: "page",
    name: "PAGE International Screenwriting Awards",
    group: "Competitions and schemes",
    summary: "A US competition for screenplays and teleplays.",
    status: "covered",
    gap: "Standard spec screenplay or teleplay layout in 12-point Courier, page numbers top right, only the title on the title page, and a 135-page limit. OpenAct has no PAGE target yet.",
    nearest: "screenplay",
    checked: "2026-11",
    url: "https://pageawards.com/the-contest/the-rules/",
    tags: "contest awards teleplay spec"
  },
  {
    id: "royal-court",
    name: "Royal Court Theatre script submissions",
    group: "Competitions and schemes",
    summary: "The London new-writing theatre’s route for unsolicited plays.",
    status: "close",
    gap: "UK stage layout is close. OpenAct’s “Ready to submit?” has a UK new-writing theatre target.",
    nearest: "stage-uk",
    checked: "2026-11",
    url: "https://royalcourttheatre.com/write-and-create/writers/script-submissions-invitations/submit-your-play/",
    tags: "theatre play uk london new writing literary"
  },
  {
    id: "theatre503",
    name: "Theatre503 script policy and awards",
    group: "Competitions and schemes",
    summary: "A London new-writing theatre with an open script portal and an international playwriting award.",
    status: "close",
    gap: "Rules differ by scheme. The 2027 award asks for no name in the script, no more than six actors and no musicals. Check the scheme’s page.",
    nearest: "stage-uk",
    checked: "2026-11",
    url: "https://theatre503.com/503-twp/scriptpolicy/",
    tags: "theatre play uk london award new writing"
  },
  {
    id: "soho",
    name: "Soho Theatre: Verity Bargate Award",
    group: "Competitions and schemes",
    summary: "A UK and Ireland playwriting award for new plays.",
    status: "close",
    gap: "The 2024 rules asked for a PDF, one unproduced play per writer, and no redrafts after entry. Check the current round.",
    nearest: "stage-uk",
    checked: "2026-11",
    url: "https://sohotheatre.com/project/verity-bargate-award/",
    tags: "theatre play uk london award prize"
  },
  {
    id: "dg-play",
    name: "US stage play manuscript (Dramatists Guild samples)",
    group: "Theatre and publisher house styles",
    summary: "The Guild’s free sample formats for plays, as guidelines, not requirements.",
    status: "covered",
    gap: "Modern and traditional samples: names in capitals, centred or about 3.5 inches from the left. The samples listed are PDFs, so OpenAct can’t read them as templates; adjust by their numbers, or import a Word version if you are given one.",
    nearest: "stage-us",
    checked: "2026-11",
    url: "https://www.dramatistsguild.com/script-formats",
    tags: "dramatists guild american play manuscript broadway stageplay"
  },
  {
    id: "dg-musical",
    name: "US musical manuscript (Dramatists Guild sample)",
    group: "Theatre and publisher house styles",
    summary: "The Guild’s sample format for a musical’s book and lyrics.",
    status: "close",
    gap: "The sample puts dialogue about 1.5 inches from the left, lyrics in capitals, and a list of musical numbers after the cast page. OpenAct’s US musical is close; compare.",
    nearest: "musical-us",
    checked: "2026-11",
    url: "https://www.dramatistsguild.com/script-formats",
    tags: "dramatists guild american musical book lyrics broadway"
  },
  {
    id: "nhb",
    name: "Nick Hern Books",
    group: "Theatre and publisher house styles",
    summary: "A UK publisher of playscripts.",
    status: "close",
    gap: "Only considers plays that already have a professional stage production in the UK or Ireland. It states no layout, so use the UK stage layout and ask them.",
    nearest: "stage-uk",
    checked: "2026-11",
    url: "https://www.nickhernbooks.co.uk/submissions",
    tags: "publisher playscript uk theatre"
  },
  {
    id: "dark-horse",
    name: "Dark Horse Comics script format guide",
    group: "Theatre and publisher house styles",
    summary: "A US comics publisher’s guide to writing a comic script.",
    status: "covered",
    gap: "The guide linked is an older one. OpenAct’s comic format numbers pages, panels and lettering for the artist and letterer.",
    nearest: "comic",
    checked: "2026-11",
    url: "https://images.darkhorse.com/darkhorse08/company/submissions/DHScriptFormatGuides.pdf",
    linkLabel: "Script format guide (PDF, older)",
    tags: "comics graphic novel publisher"
  },
  {
    id: "2000ad",
    name: "2000 AD submissions",
    group: "Theatre and publisher house styles",
    summary: "The UK comic’s route for new writers, starting with Future Shocks.",
    status: "close",
    gap: "Asks for a four-page Future Shock with a one-page synopsis, lean panel descriptions, no more than 25 words a balloon and three balloons or captions a panel. The page is dated, so check it.",
    nearest: "comic",
    checked: "2026-11",
    url: "http://2000ad.com/submissions/",
    tags: "comics uk future shock short sci-fi"
  },
  {
    id: "image",
    name: "Image Comics submissions",
    group: "Theatre and publisher house styles",
    summary: "A US creator-owned comics publisher.",
    status: "close",
    gap: "Takes a proposal (cover letter, one-page synopsis and at least five finished pages), not a full script. OpenAct’s comic format covers the writing side.",
    nearest: "comic",
    checked: "2026-11",
    url: "https://imagecomics.com/submissions",
    tags: "comics graphic novel publisher proposal"
  },
  {
    id: "multicam",
    name: "US multi-camera sitcom",
    group: "Screen industry standards",
    summary: "The studio-audience sitcom layout.",
    status: "covered",
    gap: "Lettered scenes on new pages, action in capitals, double-spaced dialogue, and acts that end with END OF ACT, as Final Draft’s guide describes. OpenAct’s multi-camera format does this.",
    nearest: "tv-multi",
    checked: "2026-11",
    url: "https://www.finaldraft.com/blog/differences-single-camera-multi-camera-tv-pilot-scripts",
    linkLabel: "Final Draft’s guide",
    tags: "sitcom teleplay tv comedy studio audience"
  },
  {
    id: "tv-drama-us",
    name: "US one-hour TV drama and single-camera comedy",
    group: "Screen industry standards",
    summary: "A teaser, acts and a tag, each act starting a new page.",
    status: "covered",
    gap: "OpenAct’s TV drama and single-camera formats follow this. Check a specific show’s own rules before sending.",
    nearest: "tv-drama",
    checked: "2026-11",
    url: "https://www.finaldraft.com/blog/how-to-structure-a-tv-pilot",
    linkLabel: "Final Draft’s guide",
    tags: "pilot teleplay tv drama teaser act"
  },
  {
    id: "uk-tv",
    name: "UK television drama and comedy (BBC, ITV, Channel 4)",
    group: "Screen industry standards",
    summary: "Scripts for British commissioners.",
    status: "close",
    gap: "No single common layout was found. Follow the commissioner’s guidance, or import their template; A4 with the screenplay layout is the closest starting point.",
    nearest: "tv-single",
    checked: "2026-11",
    tags: "bbc itv channel 4 television uk drama teleplay"
  },
  {
    id: "av",
    name: "Two-column AV script (documentary, corporate, adverts)",
    group: "Screen industry standards",
    summary: "Picture on the left, sound and words on the right.",
    status: "missing",
    gap: "OpenAct draws single columns only, so it can’t lay this out yet (it’s on the later list). Final Draft’s support page says it doesn’t support the two-column format either.",
    nearest: "screenplay",
    checked: "2026-11",
    url: "https://kb.finaldraft.com/hc/en-us/articles/15573810949780-Can-I-write-a-documentary-or-television-commercial-script-with-Final-Draft",
    linkLabel: "Final Draft’s note on AV scripts",
    tags: "documentary corporate advert commercial video av two column"
  },
  {
    id: "fd-templates",
    name: "Final Draft’s own script templates",
    group: "Screen industry standards",
    summary: "Templates Final Draft offers for download, including TV and stage layouts.",
    status: "close",
    gap: "If you have a Final Draft template (.fdxt), import it and OpenAct copies its layout. OpenAct keeps no copy of anyone’s template.",
    nearest: "screenplay",
    checked: "2026-11",
    url: "https://www.finaldraft.com/support/script-templates/",
    linkLabel: "Final Draft’s template page",
    tags: "fdx fdxt template final draft import"
  },
  {
    id: "big-finish",
    name: "Big Finish writing opportunities",
    group: "Other forms",
    summary: "A UK audio drama company that runs new-writer calls.",
    status: "close",
    gap: "Calls ask for different things (synopses, excerpts, sometimes a supplied template). Read each call.",
    nearest: "audio-us",
    checked: "2026-11",
    url: "https://www.bigfinish.com/news/v/big-finish-s-new-writer-competition-2026",
    linkLabel: "Latest call",
    tags: "audio drama doctor who radio uk"
  },
  {
    id: "radio-uk",
    name: "UK radio drama",
    group: "Other forms",
    summary: "Numbered sound cues and speeches on A4.",
    status: "covered",
    gap: "OpenAct’s UK radio drama format numbers cues from the top of each page. No single published layout was found, so check the producer’s guidance.",
    nearest: "radio-uk",
    checked: "2026-11",
    tags: "radio bbc afternoon drama audio uk"
  },
  {
    id: "podcast",
    name: "Audio fiction and podcast scripts",
    group: "Other forms",
    summary: "Scripts for audio you produce or pitch yourself.",
    status: "covered",
    gap: "OpenAct’s audio drama format has numbered sound cues. No standard exists, so use your producer’s template if they have one.",
    nearest: "audio-us",
    checked: "2026-11",
    tags: "podcast audio drama fiction"
  },
  {
    id: "treatment",
    name: "Treatments and outlines",
    group: "Other forms",
    summary: "A prose description of a story, sent before or beside a script.",
    status: "covered",
    gap: "OpenAct’s treatment format has headings and prose.",
    nearest: "treatment",
    checked: "2026-11",
    tags: "outline synopsis pitch document"
  },
  {
    id: "interactive",
    name: "Games and interactive stories",
    group: "Other forms",
    summary: "Branching narrative for games and interactive fiction.",
    status: "missing",
    gap: "OpenAct draws linear scripts only; it can’t lay out branching or choice-based writing.",
    nearest: "screenplay",
    checked: "2026-11",
    tags: "game video game interactive branching twine"
  }
];

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9+]+/).filter(Boolean);

/** Every word typed must appear in the entry's name, summary, group, tags or nearest format. */
export function searchFinder(query: string, nearestName: (id: ProfileId) => string): FinderEntry[] {
  const q = words(query);
  if (!q.length) return FINDER;
  return FINDER.filter((e) => {
    const hay = ` ${e.name} ${e.summary} ${e.group} ${e.tags ?? ''} ${nearestName(e.nearest)} ${e.status}`.toLowerCase();
    return q.every((w) => hay.includes(w));
  });
}

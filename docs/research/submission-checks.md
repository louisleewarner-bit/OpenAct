# Submission readiness: research and checks

What a writer has to get right before sending a script out, beyond the formatting OpenAct already guarantees. These conventions drift while a script is developed: pages are added and cut, characters are renamed, scenes move, notes pile up and title pages go stale. The "Ready to submit?" review (PRD R18) checks them against a chosen submission target and shows the source for every check.

Researched 2026-11-08; official sites rechecked the same evening. Source ids match `prototype/src/cue/review-data.ts`, so the app and this file cite the same list.

## How this was researched, and how far to trust it
- **Method:** web searches for each target's rules and for the conventions readers enforce, then a second search for each claim used in a check. Every claim below names its source and the kind of source it is.
- **Official pages were read through search extracts.** The sandbox's network policy blocked direct page fetches (DNS errors for oscars.org, wgfoundation.org, austinfilmfestival.com, writeaplay.co.uk, royalcourttheatre.com, darkhorse.com and finaldraft.com), and bbc.co.uk refuses automated readers. The claims therefore come from search-engine extracts of those pages, and for the BBC from listings that quote its calls. Before launch, someone opens each official URL and confirms the rule (owner task in open-questions.md).
- **Kinds of source**, strongest first: *Official rules* (the body's own page or PDF); *Listing* (a third party quoting the rules); *Industry guide* (an editorial or vendor guide such as Final Draft's blog or StudioBinder); *Writer or reader advice* (practitioners); *Forum, rule of thumb*; *Reference* (encyclopedia). The review panel shows this label beside each source.
- **Second pass, the same evening:** searches restricted to each official site (oscars.org, austinfilmfestival.com, writeaplay.co.uk, royalcourttheatre.com, darkhorse.com, finaldraft.com) quoted the official pages directly. Rules confirmed that way are marked **Confirmed** below; that pass also corrected four rules (Nicholl entry route, Austin page ranges, Bruntwood exclusions, Royal Court file limits). A third pass confirmed the last three: the Nicholl's 2026–27 logline requirement, Bruntwood's one-hour rule (on its 2025 entry page) and the BBC call's anonymity and length (consistent across listings for the 2025 call; the BBC page itself still can't be read from the sandbox).
- **Rules change every year.** Each target in the app carries the date it was researched and a link to the current rules, and the panel tells the writer to read them. The rules live in one data file so a yearly update is a data change, not a code change.

## What drifts during development
| What drifts | Why | Check (id) |
|---|---|---|
| Length | Redrafts add and cut pages; competitions and slots have limits | `length` |
| Title page | Draft dates, "Revised draft" labels and registration notices go stale or don't suit a spec | `title`, `writer`, `contact`, `date`, `draft-label`, `registration` |
| Anonymity | A blind read needs the name off the title page, out of the text and out of the PDF's author field | `anon-title`, `anon-body`, `anon-file` |
| Leftovers | TK and TBD placeholders, open notes, empty cues and headings left by cuts, OMITTED scenes | `placeholders`, `notes`, `empty`, `omitted` |
| Character names | Renaming leaves old names in a few cues; reordering scenes moves first appearances | `variants`, `intros` |
| Cast list (stage) | Characters added or cut in the scenes but not in the list | `cast-list`, `cast-silent`, `breakdown` |
| Spec conventions (screen) | Camera directions, "we see", CUT TO, long action, parentheticals creep in while drafting | `camera`, `we-see`, `cut-to`, `long-action`, `parens`, `sluglines` |
| TV acts | Moving scenes between acts breaks act numbering and END OF ACT lines | `acts` |
| Songs (musical, panto) | Song spots placed before lyrics exist; singers and function unfilled | `songs` |
| Panto scene rhythm | Two full-stage scenes end up back to back | `scene-types` |
| Comics | Balloons and panels grow with each pass | `balloon-words`, `panel-words`, `panels` |
| Audio | Running time; names that sound alike | `length`, `sound-alike` |
| Spelling and grammar | Every redraft adds typos | `spelling` (v3; a note until then) |

Formatting itself (margins, indents, page breaks, (MORE) and (CONT'D)) is not checked: the layout engine guarantees it.

## Targets and their rules
Each target is a preset in the app. "Blind" targets turn on the anonymity checks and offer an anonymous export.

### Academy Nicholl Fellowships (feature screenplays, blind)
| Rule | Source | Kind |
|---|---|---|
| **Confirmed:** 80 to 125 pages; outside standard format or with cheated margins, a script "may have this counted against them" | nicholl-2026 | Official (2026–27 rules) |
| **Confirmed:** the title page doesn't count towards the pages | nicholl-faq-2024 | Official (2024 FAQ) |
| **Confirmed:** standard industry format, 12-point Courier; one original feature screenplay as a PDF | nicholl-2026 | Official |
| **Confirmed:** the entrant must make sure their name, address, phone or any other identifying information appears on no page, title page included | nicholl-2026 | Official |
| **Confirmed:** a US Copyright Office or WGA registration number is allowed on the title page but not required | nicholl-2026 | Official |
| **New for 2026–27:** applications are accepted only from writers put forward by official Nicholl partners | nicholl-2026 | Official |
| **Confirmed:** the application needs a logline, and entries without one are disqualified; older FAQs capped it at 300 characters and say judges never see it; adaptations of your own work are noted in it | nicholl-2026, nicholl-faq-2024 | Official |
| **Confirmed:** entrants are human, 18 or over, and don't represent a production company or an AI agent | nicholl-2026 | Official |
| 2026 window: 22 June to 20 July 2026, or until 2,000 scripts arrived | nicholl-wgf | Official partner |
| Earlier years allowed 70 to 160 pages with 80 to 125 suggested | nicholl-2024 | Official (2023–24) |

### Austin Film Festival Script Competition (features and pilots, blind)
| Rule | Source | Kind |
|---|---|---|
| **Confirmed:** online entries show only the title on the front cover; the writer's name, contact details or anything identifying must appear nowhere in the script. Mailed entries add a separate contact page kept apart from the script | aff-rules-2026 | Official (2026 rules) |
| **Confirmed:** features about 90 to 120 pages; the festival doesn't disqualify on format or length if the script is feature length | aff-rules-2026, aff-faq-2026 | Official |
| **Confirmed:** pilots must be original series: about 22 to 40 pages for single-camera half-hours, 45 to 70 for one-hours, 52 to 58 for multi-camera; bibles and treatments are removed before judging | aff-rules-2026 | Official |
| **Confirmed:** 12-point Courier; pages numbered top right | aff-rules-2026 | Official |
| **Confirmed:** open only to writers who don't currently earn a living writing for film or TV and have no WGA writing credits | aff-rules-2026 | Official |
| 2026 deadlines have passed; 2027 rules may differ | aff-rules-2026 | Official |

### BBC Writersroom open call (TV, film, radio and stage scripts)
| Rule | Source | Kind |
|---|---|---|
| Open to writers aged 18 and over living in the UK or the Republic of Ireland; dates announced each autumn; scripts only through the online E-Submissions system | bbc-open-call (read through a copy of the page) | Official, unverified copy |
| No outlines, treatments, loglines or script samples: a full script or episode | bbc-open-call, bbc-nawe-2025 | Official copy; listing |
| At least 30 pages, not counting title and character pages (an older listing said 30 minutes) | bbc-celtx, bbc-nawe-2025, bbc-nawe-drama | Listing |
| **Consistent across 2025 listings:** read anonymously; at least 30 pages with no exceptions; no early, first or rough drafts; the first ten pages are the first sift. The 2025 window ran 4 November to 2 December | bbc-scriptie-2025, bbc-pss | Listing |
| One script per writer or team per window | bbc-nawe-2025 | Listing |
| One listing gave the 2026 window as 3 November to 1 December 2026 | Aggregator listing | Unverified |

### Bruntwood Prize for Playwriting (plays, blind)
| Rule | Source | Kind |
|---|---|---|
| **Confirmed:** enter under a pseudonym, including on the script; addresses, phone numbers or agent details on the script disqualify the entry | bruntwood-anon | Official (2019–2022 pages) |
| **Confirmed:** the cover page shows the title of the play and nothing else; no other layout rules | bruntwood-anon, bruntwood-layout | Official |
| **Confirmed:** no translations, adaptations of others' work, pantomime or musicals | bruntwood-anon | Official (2022) |
| **Confirmed:** unproduced: no professional production anywhere (up to two rehearsed readings allowed); optioned, produced or published scripts are disqualified | bruntwood-anon | Official (2022) |
| One document: PDF, DOC or DOCX | bruntwood-layout | Official |
| 16 or over; previous winners can't re-enter | bruntwood-rules, bruntwood-faq | Official (2025 prize) |
| **Confirmed (2025 prize):** more than an hour of playing time, written for the stage; one entry each; entrants live in the UK, the Republic of Ireland or a British Overseas Territory, or have a BFPO address | bruntwood-enter | Official (2025 prize) |

### UK new-writing theatre (the Royal Court as the example)
| Rule | Source | Kind |
|---|---|---|
| **Confirmed:** one submission at a time; no unsolicited resubmissions or new drafts of plays already read (an older page allows a new draft they asked for) | royal-court-submit | Official |
| **Confirmed:** original, full-length plays of about 50 pages; 25 to 30 for a monologue (an older page said 35 to 40) | royal-court-submit | Official |
| **Confirmed:** PDF or Word, 10 MB at most; a personal reply within three to four months | royal-court-submit | Official |
| **Confirmed:** scripts for original musicals accepted, but no scores or soundtracks with a first submission (an older page said no musicals) | royal-court-submit | Official |

### US theatre literary office (requirements vary by theatre)
| Rule | Source | Kind |
|---|---|---|
| A synopsis: examples range from 200 words to one or two pages | walnut-street, writers-theatre, listings | Official (examples) |
| A character breakdown, sometimes with the number of female, male and any-gender roles | writers-theatre | Official (example) |
| Sample pages: 10 to 15 consecutive pages | writers-theatre, listings | Official (example) |
| A short cover letter: "one paragraph max"; some ask how the play fits the theatre's mission | lafpi-litmgr, writers-theatre | Writer advice; official |
| An approximate running time | walnut-street | Official (example) |

### New musical programmes
| Rule | Source | Kind |
|---|---|---|
| A libretto sample of up to 20 pages (Village Theatre); other programmes ask for 20 to 30 | village-musicals | Listing (2018) |
| At least three demo recordings with clear lyrics, melody and accompaniment; studio quality not needed | village-musicals | Listing (2018) |
| For songs outside the sample, a brief note of their place in the show and their function | village-musicals | Listing (2018) |
| A synopsis of about 100 words, a cast breakdown, and sheet music if you have it | new-musical-project | Listing (2025) |

### Comics publisher (Dark Horse as the example)
| Rule | Source | Kind |
|---|---|---|
| **Confirmed:** about 25 words a balloon and about 50 a panel, at most; a sentence or two of panel description is usually enough | dh-guide | Official (older guide) |
| Three or four panels a page for action; quieter pages can hold more | dh-guide | Official (older guide) |
| **Confirmed:** panels numbered; character names in capitals on their own line; no tabs or unusual fonts | dh-guide | Official (older guide) |
| **Confirmed:** no AI-generated material; writer-only proposals not reviewed | dh-submissions | Official (pages several years old) |
| **Confirmed:** a proposal needs a short logline, an outline, six consecutive finished pages, and a submission agreement signed by every creator; full screenplays are not wanted | dh-submissions | Official |
| No unsolicited pitches for licensed or creator-owned properties | dh-faq | Official |
| A US single issue has about 22 story pages (20 to 24) inside a 32-page book | comixtribe-pages | Writer advice |

### BBC radio drama (Radio 4's 45-minute slot)
| Rule | Source | Kind |
|---|---|---|
| Most opportunities are in the 45-minute afternoon slot | radio4-slot | Listing (2014) |
| A 2026 commissioning brief describes 44-minute singles, Tuesday to Thursday 14:15 to 15:00 | Seen only on a mirror of the BBC commissioning site; unverified | Unverified |
| Plays are pitched through producers (in-house or independent), not sent to the BBC directly | radio-producers | Writer advice |
| Length is estimated at 150 to 180 spoken words a minute; time a read-aloud to be sure | wpm, bcg-timing | Writer advice; forum |

### Agent, manager or producer (spec scripts)
| Convention | Source | Kind |
|---|---|---|
| Features usually run 90 to 120 pages; the one-page-a-minute rule is rough | fd-length, sb-length, ja-minute | Industry guide; writer advice |
| One-hour TV 45 to 65 pages; single-camera half-hour 28 to 35; multi-camera 40 to 55 | sb-tv, scriptmag-pilots | Industry guide |
| **Confirmed:** no draft date on a spec (scripts take a long time to reach readers); Final Draft's own guides disagree on whether a registration number belongs in a corner | fd-title, fd-title-format | Industry guide |
| Contact details bottom left; your representative's if you have one; leave off draft labels, loglines and "First Draft" | srp-title, celtx-title | Writer advice; industry guide |
| Scene numbers, CONTINUED and revision marks belong to shooting scripts | celtx-shooting, sb-shooting | Industry guide |
| Characters' names in capitals at first appearance, usually with an age | fd-caps, sb-intros | Industry guide |
| Camera directions are frowned on; "we see" is padding | scriptmag-camera, filmthreat-avoid, cs-wesee | Writer and reader advice |
| CUT TO between every scene is the commonest transition mistake | fd-transitions, scriptmag-drformat | Industry guide; writer advice |
| Parentheticals overused, or holding action, are a reader complaint | scribophile-mistakes, scriptmag-drformat | Writer advice |
| Action paragraphs of three or four lines at most | filmdaft-action, scriptmag-action | Writer advice |
| One cue name per character; names that look or sound alike confuse | writersstore-cues, scriptmag-names | Writer advice |

## The checks
Status: **fix** (breaks a rule or will be noticed at once), **consider** (a convention; can be set aside for this script), **pass**, **note** (information only). Checks never change the script unless the writer presses a fix button.

| Id | Runs for | Fix when | Consider when | Sources |
|---|---|---|---|---|
| `length` | All | Outside a hard limit (Nicholl 80–125; BBC at least 30 pages) | Outside the usual range; estimates (minutes) only ever reach "consider" | see targets |
| `title` | All | No title | – | celtx-title |
| `writer`, `contact` | Non-blind | No writer name; no contact (agent target) | No contact (others) | celtx-title, srp-title |
| `date` | Spec screen and audio | – | A draft date is present (fix button removes it) | fd-title |
| `draft-label` | Spec | – | "First draft", "Revised", "Draft 3" in the title, credit or source | srp-title, celtx-title |
| `registration` | All | – | WGA or copyright notice (passes for the Nicholl) | fd-title, nicholl-2024 |
| `anon-title`, `anon-file` | Blind | Name or contact on the title page and the anonymous copy is off (fix button turns it on) | – | target rules, blind-metadata |
| `anon-body` | Blind | The writer's name, email or phone appears in the pages | – | target rules |
| `placeholders` | All | TK, TBD, TBC, TODO, FIXME, XXX, ???, [text], <<text>> | – | tk |
| `notes` | All | – | Open notes (they never print) | OpenAct house check |
| `empty` | All | Empty headings, cues, speeches, panels; a cue with no speech | – | OpenAct house check |
| `omitted` | Spec screen | OMITTED scene headings | – | celtx-shooting, sb-shooting |
| `variants` | All | – | Names equal once punctuation goes (DR. JONES, DR JONES), one letter apart (JON, JOHN), or a first name of another (NELL, NELL HARPER) | writersstore-cues, scriptmag-names |
| `intros` | Screen | – | First mention not in capitals, or a character speaks before any introduction | fd-caps, sb-intros |
| `cast-list` | Stage | Speaking characters missing (fix button adds them) | – | writers-theatre, walnut-street |
| `cast-silent`, `breakdown` | Stage | – | Listed but never speak; entries without a description | OpenAct house check; writers-theatre |
| `sound-alike` | Audio | – | Main characters share a first letter, rhyme, or are two letters apart | scriptmag-names |
| `camera`, `we-see`, `cut-to`, `long-action`, `parens`, `sluglines` | Spec screen | – | Any camera direction; any "we see/hear"; CUT TO before over a third of scenes; action over four lines; parentheticals in over 25% of speeches or over eight words; headings without INT./EXT. or a time of day | see table above |
| `acts` | TV formats with END OF ACT | Act numbers out of order, an act with no END OF line, or an END OF line naming another act | – | fd-tv-structure |
| `songs` | Musical, panto | A song with no lyrics | Singers not named; function not noted (musical programmes) | village-musicals |
| `scene-types` | Panto | – | Two full-stage scenes back to back | script-formats skill |
| `balloon-words`, `panel-words`, `panels` | Comics | – | Over 25 words a balloon; over 50 a panel; over six panels a page | dh-guide |
| `pdf` | Nicholl, AFF, BBC, Bruntwood | – (passes: OpenAct exports one PDF, 12-point Courier Prime, fonts embedded) | – | target rules |
| `spelling` | All | – (a note until v3) | – | chrome-spell |

Each target also has a **Before you send** list: things OpenAct can't check (eligibility, demos, deadlines, the entry form), each with its source.

## Conflicts and gaps
- **Draft dates:** Final Draft says no date on a spec; other guides list a date as a normal title-page item (unverified: the search summary named John August's site without a pinned page). OpenAct suggests removing it and lets the writer set the suggestion aside.
- **Registration numbers:** Final Draft says they mean nothing on a title page; the Nicholl explicitly allows one. The check passes for the Nicholl and is "consider" elsewhere.
- **Camera directions and "we see":** most readers object; some writers defend a few. Both checks are "consider" and dismissible.
- **Ages at introduction:** StudioBinder says most introductions include one; others call it optional. The check doesn't require an age.
- **Running time:** words a minute and pages a minute are rules of thumb. Estimates never produce "fix".
- **Bruntwood's one-hour rule** is on the prize's own 2025 entry page. The running-time check stays a "consider" because OpenAct can only estimate playing time.
- **The Nicholl's entry route** changed for 2026–27 to partners only, so "Before you send" now asks about it first.
- **Not covered:** competition page limits beyond the Nicholl and BBC; publisher-specific comics rules other than Dark Horse's; UK sitcom page ranges (only the BBC's 30-page minimum was found); vertical drama and treatments, which have no published length norms.

## Sources
| Id | Source | Kind | Date |
|---|---|---|---|
| bruntwood-enter | [Bruntwood Prize: how do I enter?](https://www.writeaplay.co.uk/how-do-i-enter/) | Official | 2025 prize |
| bbc-scriptie-2025 | [Script.ie: BBC Writers open call](https://script.ie/whats-new/2025/11/bbc-writers-open-call-2/) | Listing | Nov 2025 |
| bbc-pss | [Playwrights' Studio Scotland: BBC Writers open call](https://playwrightsstudio.co.uk/opportunities-news/bbc-writers-open-call) | Listing | 2025 |
| nicholl-2026 | [Academy Nicholl Fellowships: 2026–2027 rules](https://www.oscars.org/sites/oscars/files/2026-06/2026-2027%20Nicholl%20Rules%20Terms%20and%20Conditions%20(1).pdf?VersionId=nR0FBxECCDhQqRHFQbe08v4dccpBtxwf) | Official | Jun 2026 |
| nicholl-faq-2024 | [Academy Nicholl Fellowships: 2024 FAQ](https://www.oscars.org/sites/oscars/files/2024_nicholl_faq.pdf) | Official | 2024 |
| aff-rules-2026 | [Austin Film Festival: 2026 Screenplay Competition rules](https://austinfilmfestival.com/wp-content/uploads/2025/11/2026-SPLAY-COMPETITION-RULES.pdf) | Official | 2026 cycle |
| aff-faq-2026 | [Austin Film Festival: 2026 Screenplay Competition FAQ](https://austinfilmfestival.com/wp-content/uploads/2025/11/2026-SPLAY-COMPETITION-FAQ.pdf) | Official | 2026 cycle |
| bbc-open-call | [BBC Writers: how to submit a script to us](https://www.bbc.co.uk/writers/opportunities/open-call) (read through a copy of the page) | Official, unverified copy | 2026 |
| bbc-celtx | [Celtx blog: the BBC Writers open call](https://blog.celtx.com/?p=8286) | Listing | 2025 |
| bruntwood-anon | [Bruntwood Prize: anonymity and your entry](https://www.writeaplay.co.uk/anonymity-and-your-entry/) | Official | 2019–2022 cycles |
| royal-court-submit | [Royal Court Theatre: submit your play](https://royalcourttheatre.com/write-and-create/writers/script-submissions-invitations/submit-your-play/) | Official | Current |
| fd-title-format | [Final Draft blog: how to format a screenplay title page](https://www.finaldraft.com/blog/how-to-format-a-screenplay-title-page-free-template-included) | Industry guide | Undated |
| nicholl-2024 | [Academy Nicholl Fellowships: 2024 rules](https://www.oscars.org/sites/oscars/files/2024_nicholl_rules.pdf) | Official | 2024 |
| nicholl-wgf | [Writers Guild Foundation: submit to the Nicholl](https://wgfoundation.org/nicholl) | Official partner | 2026 |
| nicholl-lfs | [London Film School: Nicholl Fellowship listing](https://lfs.org.uk/nicholl-fellowship-in-screenwriting-presented-by-the-academy-of-motion-picture-arts-and-sciences/) | Listing | 2026 |
| aff-rules | [Austin Film Festival: Screenplay Competition rules](https://austinfilmfestival.com/wp-content/uploads/2024/11/SPLAY-COMPETITION-RULES.pdf) | Official | 2025 cycle |
| aff-online | [Austin Film Festival: online submission rules](http://screenplaysub.austinfilmfestival.com/rules.html) | Official | Undated |
| aff-faq | [Austin Film Festival: Screenplay Competition FAQ](https://austinfilmfestival.com/wp-content/uploads/2024/11/SPLAY-COMPETITION-FAQ.pdf) | Official | 2025 cycle |
| aff-top5 | [AFF blog: top 5 things to check before you submit](https://austinfilmfestival.com/blog/news/top-5-things-to-check-for-before-you-submit-your-screenplay/) | Official | Undated |
| aff-digital | [AFF: Digital Series Competition](https://austinfilmfestival.com/about-aff-digital-series/) | Official | 2026 |
| bbc-nawe-2025 | [NAWE: BBC Writersroom open call for scripts](https://www.nawe.co.uk/DB/jobs-and-opportunities/bbc-writersroom-open-call-for-scripts.html) | Listing | Aug 2025 |
| bbc-nawe-drama | [NAWE: BBC Writersroom open call for drama and comedy-drama](https://nawe.co.uk/DB/competitions-and-submissions/bbc-writersroom-open-call-for-drama-and-comedy-drama-scripts.html) | Listing | Apr 2025 |
| bbc-script-room | [Writers Online: BBC Writersroom Script Room (drama)](https://www.writers-online.co.uk/news/script-submissions-drama-for-bbc-writersroom-script-room) | Listing | Undated |
| bruntwood-layout | [Bruntwood Prize: suggested layout guidelines](https://writeaplay.co.uk/?p=11621) | Official | Undated |
| bruntwood-rules | [Bruntwood Prize: how do I enter?](https://www.writeaplay.co.uk/?p=388) | Official | 2025 prize |
| bruntwood-faq | [Bruntwood Prize: entry FAQ](https://writeaplay.co.uk/?p=20545) | Official | 2025 prize |
| royal-court | [Royal Court Theatre: script submissions](https://royalcourttheatre.com/playwriting/submissions-invitations/script-submissions) | Official | Undated |
| royal-court-nycp | [NYC Playwrights: Royal Court submission guidelines](https://www.nycplaywrights.org/2022/06/royal-court-submission-guidelines.html) | Listing | Jun 2022 |
| writers-theatre | [Writers Theatre: play submissions](https://www.writerstheatre.org/play-submissions) | Official | Undated |
| walnut-street | [Walnut Street Theatre: literary office](https://WalnutStreetTheatre.org/about/literary.php) | Official | Undated |
| lafpi-litmgr | [LA Female Playwrights Initiative: literary managers talk back](https://lafpi.com/2011/09/lit-mgrs-talk-back-about-play-submissions/) | Writer advice | Sep 2011 |
| village-musicals | [NYC Playwrights: Village Theatre musical submissions](https://www.nycplaywrights.org/2018/07/village-theatre-musicals.html) | Listing | Jul 2018 |
| new-musical-project | [BroadwayWorld: New Musical Project submissions](https://www.broadwayworld.com/denver/article/Submissions-Open-For-2026-New-Musical-Project-20250903) | Listing | Sep 2025 |
| dh-guide | [Dark Horse Comics: script format guide](https://images.darkhorse.com/darkhorse08/company/submissions/DHScriptFormatGuides.pdf) | Official (older guide) | Undated |
| dh-submissions | [Dark Horse Comics: submissions](https://www.darkhorse.com/Company/Submissions) | Official | Undated |
| dh-faq | [Dark Horse Comics: submissions FAQ](https://www.darkhorse.com/Help/FAQ/submissions) | Official | Undated |
| comixtribe-pages | [ComixTribe: what counts, with page counts](https://www.comixtribe.com/what-counts-with-page-counts/) | Writer advice | Undated |
| fd-title | [Final Draft blog: the nuances of the title page](https://www.finaldraft.com/blog/screenwriting-basics-the-nuances-of-the-title-page) | Industry guide | Undated |
| celtx-title | [Celtx blog: the screenplay title page](https://blog.celtx.com/screenplay-title-page) | Industry guide | Undated |
| srp-title | [Script Reader Pro: the screenplay title page](https://www.scriptreaderpro.com/screenplay-title-page/) | Writer advice | Undated |
| celtx-shooting | [Celtx blog: what is a shooting script?](https://blog.celtx.com/shooting-script/) | Industry guide | Undated |
| sb-shooting | [StudioBinder: shooting script example](https://www.studiobinder.com/blog/shooting-script-example/) | Industry guide | Undated |
| fd-caps | [Final Draft blog: everything you need to know about caps](https://www.finaldraft.com/blog/screenwriting-basics-everything-you-need-to-know-about-caps) | Industry guide | Undated |
| sb-intros | [StudioBinder: character descriptions and introductions](https://www.studiobinder.com/blog/screenplay-character-descriptions-introductions/) | Industry guide | Undated |
| scriptmag-camera | [Script Magazine (Dave Trottier): why not use camera directions?](https://scriptmag.com/features/screenplay-format-use-camera-directions-for-screenplays) | Writer advice | Undated |
| filmthreat-avoid | [Film Threat: writing a screenplay, what to avoid](https://filmthreat.com/features/writing-a-screenplay-what-to-avoid/) | Writer advice | Undated |
| cs-wesee | [Creative Screenwriting (James Napoli): cutting "we see"](https://www.creativescreenwriting.com/cswcms/?p=7895) | Writer advice | Undated |
| fd-length | [Final Draft blog: how long should my movie script be?](https://www.finaldraft.com/blog/how-long-should-my-movie-script-be) | Industry guide | Undated |
| sb-length | [StudioBinder: how long is a movie script?](https://studiobinder.com/blog/how-long-is-a-movie-script) | Industry guide | Undated |
| ja-minute | [John August: the one-page-a-minute rule](https://johnaugust.com/?p=577) | Writer advice | Undated |
| sb-tv | [StudioBinder: how long is a TV show script?](https://studiobinder.com/blog/how-long-is-a-tv-show-script) | Industry guide | Undated |
| scriptmag-pilots | [Script Magazine: pilot page counts](https://scriptmag.com/features/primetime-wannabe-a-writer-get-in-the-game-or-go-home-also-comedy-writing-programs-and-pilot-page-counts) | Writer advice | Undated |
| fd-tv-structure | [Final Draft blog: how to structure a TV pilot](https://www.finaldraft.com/blog/how-to-structure-a-tv-pilot) | Industry guide | Undated |
| filmdaft-action | [FilmDaft: action lines in screenplays](https://filmdaft.com/action-lines-in-screenplays-definition/) | Writer advice | Oct 2025 |
| scriptmag-action | [Script Magazine: the magic bullet, action lines](https://scriptmag.com/features/the-magic-bullet-action-lines) | Writer advice | Undated |
| fd-transitions | [Final Draft blog: to CUT TO or not to CUT TO](https://www.finaldraft.com/blog/transitions-cut-not-cut) | Industry guide | Undated |
| scriptmag-drformat | [Script Magazine (Ask Dr. Format)](https://scriptmag.com/features/ask-dr-format-formatting-cause-insanity-screenwriters) | Writer advice | Undated |
| scribophile-mistakes | [Scribophile: common screenplay mistakes](https://www.scribophile.com/academy/common-screenplay-mistakes) | Writer advice | Undated |
| writersstore-cues | [The Writers Store (Dave Trottier): one cue name per character](https://writersstore.com/blogs/news/how-do-i-format-simultaneous-dialogue) | Writer advice | Undated |
| scriptmag-names | [Script Magazine (Column D): choosing character names](https://scriptmag.com/features/column-d-the-name-game-choosing-character-names-part-3) | Writer advice | Undated |
| radio4-slot | [Writers Online: BBC radio drama prize](https://www.writers-online.co.uk/news/script-competition-the-bbc-writers-prize-for-radio-drama) | Listing | Sep 2014 |
| radio-producers | [Anita Sullivan: BBC radio drama commissioning 101](https://www.anitasullivan.co.uk/post/bbc-radio-drama-commissioning-101) | Writer advice | Undated |
| wpm | [Killer Spots: timing a radio script](https://killerspots.com/blog/radio-script-timer-how-long-is-a-30-second-script) | Writer advice | Undated |
| bcg-timing | [British Comedy Guide forum: timing a script](https://comedy.co.uk/forums/post/1112079) | Forum | Undated |
| tk | [Wikipedia: To come (publishing)](https://en.wikipedia.org/wiki/To_come_(publishing)) | Reference | Current |
| blind-metadata | [AEJMC: ensure a blind review](https://aejmc.us/wp-content/uploads/sites/29/2013/01/Ensure-a-Blind-Review.pdf) | Industry guide (academic reviewing) | 2013 |
| chrome-spell | [Google Chrome Help: spell check](https://support.google.com/chrome/answer/12027911) | Official | Current |

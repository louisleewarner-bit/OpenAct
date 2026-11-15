# Your task pack

Everything on your list in docs/open-questions.md, with what's already done, what's left for you, and text you can copy. Times are rough.

**Done for you on 2026-11-08:** the name is OpenAct and everything is renamed; the Fountain rules and every competition and theatre rule are confirmed (format-verification.md, submission-checks.md) and the review uses them; the targets, version 3 defaults and a provisional UK layout default are decided (D-030 to D-032); a layout sheet for your director is ready (below); the survey and interview guide now ask about submitting scripts (user-research.md).

## 1. Clear the name, OpenAct (before launch) · about an hour
ActOne was found to be taken, so the app is now **OpenAct** (D-045). **Nobody has searched for OpenAct yet.** The old clash check (docs/research/names.md) was for ActOne and does not carry over.
1. Search the registers for **OPENACT** and **OPEN ACT** in classes 9 (software) and 42 (software services): the [UK IPO](https://trademarks.ipo.gov.uk/ipo-tmtext), the [USPTO](https://tmsearch.uspto.gov/) (filter to live marks) and [TMview](https://www.tmdn.org/tmview/) (EU and national offices). Note anything for writing, film, theatre or creative software, and any open-source project with the name.
2. Check the web addresses you'd want (for example openact.app or openact.co.uk), GitHub, and the App Store and Google Play.
3. If the registers are clear, consider filing a UK trade mark in classes 9 and 42.
4. Always write it as one word, and pair it with "the free script editor for stage and screen" in anything public.

## 2. The last rules: done
All three were confirmed on 2026-11-08: the Nicholl's 2026–27 rules require a logline; Bruntwood's 2025 entry page asks for more than an hour of playing time, one entry each and UK or Irish residence; and listings for the BBC's 2025 call agree that scripts are read anonymously, run at least 30 pages and are judged first on their opening ten pages. When this year's BBC call opens (one listing says 3 November to 1 December 2026), glance at [the BBC page](https://www.bbc.co.uk/writers/opportunities/open-call) for any change.

## 3. Ask your director about the UK layout · 5 minutes
Layout A (name beside the speech) is the provisional default (D-032); the director's answer can change it before build slice 8. Send them [owner/uk-layout-choice.png](owner/uk-layout-choice.png) with this message:

> Hi [name], I'm helping design a free script-writing app. For stage scripts, which layout would you rather rehearse from: **A** (name beside the speech) or **B** (name above it)? And is there anything you'd change, such as italics for directions or how scene headings look? One line back is plenty. Thanks!

## 4. Interviews and the survey · one to two weeks
**Who:** 3 or 4 stage writers (panto and musical), 1 or 2 amateur directors or stage managers, 2 or 3 screenwriters.
**Where:** your own company and director; local amateur theatre groups; UK panto and amateur-theatre groups on Facebook; r/Screenwriting and r/Playwriting on Reddit (read each community's rules on research requests first); writing classes.
**Survey:** build it in Google Forms or Microsoft Forms from docs/research/user-research.md (14 questions, about five minutes).

Interview invitation, to send one to one:

> Hi [name], I'm designing a free app for writing scripts, for stage as well as screen, and I'd love 30 minutes of your time to hear how you write and send out your scripts. It isn't a sales call and there's nothing to prepare. Could we talk on [video/phone] in the next couple of weeks? With your permission I'd record it for my notes only, and delete the recording once I've written them up.

Group post, with the survey link:

> I'm designing a free script-writing app that handles stage plays, musicals and panto as well as screenplays, and keeps your scripts on your own device. If you write scripts of any kind, would you fill in a five-minute survey about how you work? [link] No sign-up. Your answers shape what gets built first. Thank you!

**Privacy:** names, email addresses and recordings are personal data, and you are responsible for them. Say what you collect and why, keep recordings private, delete them after the write-up, and delete anyone's details on request. Put one line at the top of the survey: "Answers are used only to design the app. Leave your email only if you're happy to be contacted, and ask any time to have it deleted." (Not legal advice.)

**After:** collect the notes and survey answers in one document, then ask Claude to run design:research-synthesis on them.

## 5. Reference files for the page-break tests · 30 minutes, before build slice 2
- **What:** two or three screenplays exported from Final Draft, Fade In or Highland as PDF, in US Letter and in A4, with their .fdx or .fountain files; one UK stage play PDF in the style your director prefers; two or three real .fdx files, including one with dual dialogue and a title page.
- **How:** export with the app's default settings, and write down the app and its version. Name the files `ref-01-letter.pdf`, `ref-01-a4.pdf`, `ref-01.fdx` and so on.
- **Where:** in `tests/private/`, which is never published (D-022). Don't put other people's scripts anywhere public.

## 6. Confirm the three scripts you'll write in OpenAct first · 2 minutes
D-007 lists your panto in progress, your musical in progress, and a 10 to 15 page screenplay. Reply "yes", or say what to change, and whether they can be private test files.

## 7. The solicitor's review · before launch, not before building
Do this once the name is chosen. Send docs/legal/legal-review.md, docs/research/names.md and the overview link with this brief:

> I'm a UK-based individual planning to release an open-source (GPL-3.0) script-writing app, free for everyone, that runs in the browser and keeps scripts on the user's own device. I'd like a fixed-fee review of: (1) the name, OpenAct, for clashes in classes 9 and 42 (my earlier name, ActOne, was found to be taken); (2) how the app and its website may refer to Final Draft, for file compatibility and in any comparison; (3) building Final Draft (.fdx) import and export from public information, without decompiling anything; (4) the About screen's licence, no-warranty and not-affiliated wording; (5) a privacy notice for a static website whose app stores scripts only on the user's device; (6) anything in the attached risk register you would rate differently. (7) whether contributors should sign an agreement. Future sharing, sync or AI features are out of scope for now.

To find one, try the Law Society's Find a Solicitor (filter for intellectual property and IT) and the British Library's Business & IP Centre, which has run free IP information sessions. Check what each offers today; these come from background knowledge, not this session's research. Ask for a fixed fee in writing first.

## 8. Submission targets: decided
All ten targets stay, with defaults by format (D-030). Interviews will show which ones writers use; tell Claude about any target you'd like added.

## 9. Version 3 defaults: decided
British spelling for A4 and UK formats, American for US formats, and grammar off in dialogue by default (D-031). Change them any time.

## 10. Your next step
OpenAct is free for everyone (D-036); the selling plan is withdrawn and nothing about payments is needed.
1. **Create an empty private GitHub repository** for OpenAct and tell Claude its name. The project skeleton is built and passes its checks here; it needs a home so the work survives between sessions and the automatic checks can run.
2. **Clear the name before launch** (section 1).

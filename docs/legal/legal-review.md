# Legal review: distributing OpenAct free

> **Reissued 2026-11-12: OpenAct is free again (D-036).** It was briefly planned for sale (D-034, 2026-11-11). The trader rows L18 to L22 are kept below as notes in case selling is ever reconsidered; they don't apply to a free app. The name (L5) and marketing claims (L13) are scored for a free app again.

**Not legal advice.** This is a structured risk assessment prepared with the legal plugin's `legal-risk-assessment` and `compliance-check` frameworks, from public sources found on 2026-11-08. It is a starting point for a qualified UK solicitor, not a substitute. Laws and rules change; check the sources before relying on them.

| | |
|---|---|
| **Date** | 2026-11-08; reissued 2026-11-11 and 2026-11-12 |
| **Assessor** | Claude (AI), for the owner; to be reviewed by a UK IP and technology solicitor |
| **Matter** | A UK-based individual distributing a local-first script editor called OpenAct, free for everyone (working title Cue until 2026-11-08) with features similar to paid products such as Final Draft |
| **Privileged** | No |

## The short answer
**You can very likely give OpenAct away, and offering features similar to paid apps is lawful in itself.** Copyright protects code, artwork and text, not features, formats, layouts writers are expected to follow, or the way a program behaves. Courts in the UK, EU and US have said so (below). Charging nothing does not protect you, though: infringement doesn't depend on payment. The risk sits in **what you copy and what you call things**, not in what you charge.

Stay on the right side by:
1. **Building everything yourself:** no code, icons, screen designs, help text, templates or sample scripts taken from Final Draft or any other app.
2. **Naming other products only to describe compatibility** ("opens Final Draft .fdx files"), in plain text, with a not-affiliated line. Avoid their feature names (Beat Board™, ScriptNotes®).
3. **Clearing your own app name** before launch. The owner chose OpenAct (D-029); run the register searches and manage the clashes listed under L5.
4. **Meeting your open-source licence duties:** notices, licence texts and a link to the source.
5. **Publishing a short privacy notice and a no-warranty notice.**
6. **Getting a solicitor's one-off review** of the name, marketing copy and Final Draft compatibility before the public launch.

## How risk is scored
The plugin's framework scores **severity × likelihood**, each from 1 to 5. Its severity bands are written for company deal values, so here they are read for an individual giving software away: 1 = a nuisance; 3 = a forced change (rename, takedown, rework) or a few thousand pounds of advice or settlement; 5 = a lawsuit threatening personal finances. Levels: 1–4 **GREEN** (accept and monitor), 5–9 **YELLOW** (mitigate and assign an owner), 10–15 **ORANGE** (solicitor before acting), 16–25 **RED**.

## Risk register
| Id | Risk | Area | Severity | Likelihood | Score | After mitigation |
|---|---|---|---|---|---|---|
| L1 | Copying protected expression from paid apps: code, icons, screen designs, manuals or help text, templates, sample scripts | Copyright | 4 High | 1 Remote | 4 GREEN | 4 GREEN |
| L2 | A claim that the look and feel, element flow or keyboard shortcuts are protected | Copyright | 3 Moderate | 1 Remote | 3 GREEN | 3 GREEN |
| L3 | Reading and writing Final Draft (.fdx) and Fountain files | Copyright, contract | 3 Moderate | 1 Remote | 3 GREEN | 3 GREEN |
| L4 | Using "Final Draft" and its feature names in the app or in marketing | Trade marks, advertising | 3 Moderate | 2 Unlikely | 6 YELLOW | 3 GREEN |
| L5 | The app's own name clashes with an existing mark | Trade marks | 3 Moderate | 3 Possible | 9 YELLOW | 4 GREEN once the registers are clear and a UK mark is filed |
| L6 | Look or name close enough to a paid app to mislead | Passing off | 3 Moderate | 1 Remote | 3 GREEN | 3 GREEN |
| L7 | A software patent covers a common feature (autocomplete, pagination) | Patents | 4 High | 1 Remote | 4 GREEN | 4 GREEN (residual) |
| L8 | Missing open-source notices, licence texts or the GPL source offer (every copy must come with the source or a way to get it) | Licences | 2 Low | 3 Possible | 6 YELLOW | 2 GREEN |
| L9 | Personal data in hosting logs without a privacy notice | Privacy | 2 Low | 3 Possible | 6 YELLOW | 2 GREEN |
| L10 | Storing data on the device (scripts, settings, offline cache) without consent | PECR | 2 Low | 1 Remote | 2 GREEN | 2 GREEN |
| L11 | Fonts loaded from Google send visitors' IP addresses to Google | Privacy (EU) | 2 Low | 3 Possible | 6 YELLOW | 1 GREEN once self-hosted |
| L12 | A writer loses work and blames OpenAct | Consumer law, negligence | 3 Moderate | 2 Unlikely | 6 YELLOW | 4 GREEN |
| L13 | Marketing claims that mislead ("never lose your work", "industry standard", comparisons); fake or undisclosed incentivised reviews | Consumer protection, advertising | 3 Moderate | 2 Unlikely | 6 YELLOW | 4 GREEN |
| L14 | The app shuts out disabled writers | Equality | 2 Low | 1 Remote | 2 GREEN | 2 GREEN |
| L15 | Submission rules in the review stage are out of date and a writer is turned away | Reliance | 2 Low | 2 Unlikely | 4 GREEN | 2 GREEN |
| L16 | Names of competitions and publishers in the review stage imply endorsement | Trade marks | 2 Low | 2 Unlikely | 4 GREEN | 2 GREEN |
| L23 | A writer imports a template they have no right to use, or a template's own licence limits how it is used | Copyright, contract | 2 Low | 2 Unlikely | 4 GREEN | 2 GREEN |
| L17 | Sharing, sync, co-writing or AI features added later | Online safety, privacy, AI | 4 High | 3 Possible (when built) | 12 ORANGE | Review before building |
| L18 | A buyer says the app is faulty or not as described, or wants a refund | Consumer rights | — | — | Not applicable while free | — |
| L19 | Checkout misses the cancellation consent or the pre-contract information | Distance selling | — | — | Not applicable while free | — |
| L20 | The site doesn't say who the seller is (name, address, email) | Trader identity | — | — | Not applicable while free | — |
| L21 | Income not declared; VAT handled wrongly | Tax | — | — | Not applicable while free | — |
| L22 | A store's terms clash with the GPL, or with contributors' rights | Licences, contract | — | — | Not applicable while free | — |

No risk is RED, and none is ORANGE except L17, which covers features not yet built. L4 and L5 need action before launch; L8, L9, L11, L12 and L13 need routine work; L17 needs a fresh review before those features are built.

## The risks in detail

### L1 and L2. Copyright: features versus expression
- **What the law protects.** In the UK, copying a substantial part of a work infringes whether or not money changes hands (CDPA 1988 s.16), and distributing infringing copies outside a business can even be a crime if it prejudices the owner (s.107(1)(e)). Free is no defence.
- **What it doesn't protect.** The EU Court of Justice held in *SAS Institute v World Programming* (C-406/10, 2012) that a program's functionality, its programming language and its data file formats are not protected by copyright; the English courts applied this and found no infringement by a clone with the same functionality ([2013] EWHC 69 (Ch); [2013] EWCA Civ 1482). In *Navitaire v easyJet* ([2004] EWHC 1725 (Ch)) the court refused to protect a program's "look and feel", its command set or individual commands; *Nova v Mazooma* followed. In the US, *Lotus v Borland* (1995) held a menu command hierarchy to be an unprotected "method of operation", and *Google v Oracle* (2021) found reimplementing an interface to be fair use.
- **Where the line is.** In *Navitaire* some graphical screens were protected as artistic works; in *SAS*, World Programming's manual infringed by reproducing the SAS manuals' wording. So: **draw your own screens and icons, and write your own help text.** OpenAct's visual direction (D-019) and Lucide icons (ISC licence) already differ from Final Draft's.
- **Keyboard flow and element names** (Scene Heading, Action, Tab to Character) are methods of operation and industry vocabulary; matching them for writers' muscle memory is low risk.
- **Mitigations:** a clean-room rule in CLAUDE.md (no decompiling, no copying other apps' text, art or templates); record where each format rule came from (format-verification.md already does); sample scripts are original (D-023).

### L3. File formats
- **FDX:** file formats are not protected as such (*SAS*). UK law lets a lawful user observe, study and test a program to find its underlying ideas (CDPA s.50BA), and a licence term that forbids this is void (s.296A). Many independent apps (Fade In, Highland, WriterDuet, Arc Studio) read and write FDX; that shows practice, not legal certainty.
- **Fountain:** an open, free syntax created by John August, Nima Yousefi and Stu Maschwitz; the reference implementation is MIT-licensed.
- **Mitigations:** build FDX support from public descriptions and files the owner creates; don't ship other people's FDX or PDF files (reference files stay private, D-022); don't decompile Final Draft.

### L4. Naming Final Draft
- **The marks.** FINAL DRAFT is a registered US mark (serial 78663387), now held by Cast & Crew Production Software, which also holds marks such as FINAL DRAFT READER, FINAL DRAFT WRITER and SCRIPTNOTES; its app listing marks Beat Board™ and Outline Editor™.
- **Describing compatibility is allowed.** UK law permits using another's mark to identify their goods, in particular to show what a product is for, if the use follows honest practices (Trade Marks Act 1994 s.11(2)(c), as amended in 2019). The EU court's *Gillette* test asks whether the use is in practice the only way to tell the public what the product is for, and whether it is fair to the owner. "Opens and saves Final Draft (.fdx) files" fits; a Final Draft logo, or "Final Draft for free", does not.
- **Comparisons in marketing** are allowed only under the conditions in the Business Protection from Misleading Marketing Regulations 2008 (reg. 4). *L'Oréal v Bellure* (C-487/07) held that presenting a product as an imitation or replica of a branded one takes unfair advantage of the mark. Avoid "a free Final Draft" and "Final Draft alternative" as headlines.
- **Mitigations:** plain-text, descriptive mentions only; a line in About: "Final Draft is a trademark of Cast & Crew Production Software, LLC. OpenAct is not affiliated with or endorsed by it."; never use their feature names for OpenAct features.

### L5 and L6. Your own name and look
- A name clash means a forced rename, possibly after launch: the costliest mid-sized risk here, and it has already happened once: ActOne (D-029) was found to be taken and the app is now **OpenAct** (D-045). OpenAct has not been searched. **Mitigations:** search the UK IPO, EUIPO and USPTO registers in classes 9 and 42, and GitHub and the app stores, before launch; always write it as one word and pair it with a descriptor ("OpenAct, the free script editor"); file a UK mark if clear; have the launch solicitor confirm.
- Passing off needs goodwill, a misrepresentation and damage (*Reckitt & Colman v Borden*, the Jif Lemon case). A distinct name, icon and colour scheme keep this remote.
- **Mitigations:** search the UK IPO, EUIPO and USPTO registers in classes 9 and 42, app stores, GitHub and domains before choosing; consider filing a UK mark once chosen (the UK IPO charges per class; check the current fee on gov.uk).

### L7. Patents
- UK law excludes programs "as such" from patents (Patents Act 1977 s.1(2)), but US software patents are broader, and text-completion patents have been asserted in court (2020 suits over automatic data-entry completion; a 2026 suit against Microsoft). Nothing specific to screenwriting software turned up.
- A full freedom-to-operate search costs more than a free project can bear. Accept the residual risk; if a letter ever arrives, stop distributing in that country and take advice. GPL-3.0's patent clause protects users from contributors' patents.

### L8. Open-source licences
- OpenAct is GPL-3.0 (ADR-0008); its packages are MIT, ISC or Apache-2.0, and its fonts are SIL OFL 1.1. Apache-2.0 code can be combined with GPL-3.0 (Apache Software Foundation). OFL fonts may be bundled and embedded with software, including PDFs, as long as the Reserved Font Name isn't used for a modified font; ship the OFL text with them.
- **Duties:** include each package's copyright and licence notice; show the GPL licence and a link to the source code in the app; keep the OFL texts with the fonts. The offline editions already ship the two OFL texts.
- **Mitigations:** a licence report generated in CI and an About screen listing licences (slices 0 and 12).

### L9 to L11. Privacy and storage
- **No scripts reach you.** Scripts stay in the writer's browser, so you are not processing them; the UK ICO's app guidance (reported in 2014) treats a developer whose code runs only on the device as unlikely to be a controller. Static hosting still logs IP addresses; you, or your host on your behalf, handle that personal data, so publish a short privacy notice saying what the host logs and why.
- **Storing on the device.** PECR regulation 6 needs consent to store or read information on a user's device unless an exception applies. Saving the script and caching the app are *strictly necessary* for the service the writer asked for. The Data (Use and Access) Act 2025 added exceptions to regulation 6, including one for a site's appearance or functionality (reported in force from 5 February 2026), which covers a remembered theme choice. With no analytics and no advertising, no consent banner is needed.
- **Google Fonts.** The hosted prototype loads fonts from Google, which passes visitors' IP addresses to Google. A Munich court awarded damages for exactly this under the EU GDPR (LG München I, 3 O 17493/20, January 2022; widely reported, contested by some commentators). The offline editions already embed the fonts; the product must self-host them (D-026).

### L12 and L13. Losing work, and promises
- Consumer law's quality rights for digital content mostly apply when it is paid for; free content is covered by the Consumer Rights Act 2015 s.46 only where a *trader* supplies it and it damages a device or other content through lack of reasonable care. Whether an individual giving software away is a trader is unclear. Negligence liability for death or personal injury can never be excluded.
- The realistic risk is a writer losing a script when a browser clears its storage. The design already answers it (ADR-0003: persistent storage, real files where the browser allows, backup prompts).
- **Mitigations:** keep the GPL's no-warranty and liability sections visible in About, in plain words ("OpenAct comes with no warranty. Keep backups: OpenAct reminds you."); avoid absolute claims in marketing ("never lose your work"); keep "free" claims true. Misleading claims to consumers are now enforced under the Digital Markets, Competition and Consumers Act 2024 (from background knowledge; not researched this session), which matters most if the project ever takes donations or sponsorship.

### L14. Accessibility
- The Equality Act 2010 applies to anyone providing a service to the public, paid or not (s.29). OpenAct targets WCAG 2.2 AA (R15), and the prototype passes automated checks. The European Accessibility Act covers listed products and services (e-books, e-commerce, banking, communications) and exempts microenterprise services; a free script editor appears to be outside it.

### L15 and L16. The review stage
- Rules change yearly, so each target shows the date it was researched, links to the current rules and asks the writer to check them. Rules are paraphrased with links rather than copied (short quotation with acknowledgement is allowed under CDPA s.30(1ZA)).
- Naming the Nicholl, BBC Writersroom, Bruntwood or Dark Horse to identify a submission target is descriptive use; add "OpenAct is not affiliated with any competition, broadcaster, theatre or publisher named here", and use no logos.

### L25. Video game exports (added 2026-11-15, D-044)
- The Ink and Yarn Spinner exporters are written from the tools' public syntax and ship none of their code; both tools are MIT licensed. OpenAct names them only to describe compatibility and says it is not affiliated with their makers. The checks use inkjs (MIT), which is not part of the package.
- The sample script, Salt Road, is original.

### L24. Fonts in exported files (added 2026-11-15, D-042)
- OpenAct embeds Courier Prime in PDFs and Word files. The SIL Open Font License allows embedding in documents and bundling with software if the licence text travels with the software and the font isn't sold on its own; both are met (licence text shipped, fonts used as they are). Atkinson Hyperlegible Next is used on screen only.

### L23. Imported templates and the finder (added 2026-11-15, D-040)
- OpenAct reads layout numbers (margins, indents, spacing) from a file the writer already has. It ships no one else's template and copies no one's text, so it stays inside the clean-room rule (D-028). A layout of margins and indents is a method of presentation, not protected expression (the same reasoning as L1 and L3). A template's own licence could still limit what its owner allows; the writer, not OpenAct, holds that file.
- The finder names organisations only to say how close OpenAct's formats are, and links to their own pages. The About screen says OpenAct isn't affiliated with or endorsed by them.
- **Mitigations:** the About line; entries that couldn't be confirmed were left out; the finder shows the month it was checked and says to read current rules; imported files are read on the device and never uploaded.

### L17. Features to review before building
- **Sharing a link or co-writing:** if writers can send content to other users through OpenAct, the Online Safety Act 2023 can apply (a "user-to-user service"; Ofcom says it covers very small services too). Sync through a relay also makes you, or the relay, a processor of scripts under the UK GDPR.
- **An AI collaborator:** sending scripts to a model provider is a new data flow, even with the writer's own API key; it needs clear consent, provider terms and a privacy-notice update. AI regulation, including the EU AI Act's transparency duties, should be checked at the time.
- **Action:** a legal review gate in plan.md before any P2 networked or AI feature.

## If OpenAct is ever sold (notes, not current risks)
Added 2026-11-11 when selling was planned, and kept after D-036 made OpenAct free again. Selling would make you a **trader**; none of this applies to a free app.

### L18 and L19. What buyers are entitled to
- Paid digital content must be of satisfactory quality, fit for purpose and as described. A buyer with a faulty copy can ask for a repair or replacement, then a price reduction, which can be the full price (Consumer Rights Act 2015). The GPL's no-warranty wording can't remove these rights, so say so beside it.
- Buyers can cancel within 14 days. A download can start at once only if the buyer expressly agrees and acknowledges losing that right, and you confirm it in writing (Consumer Contracts Regulations 2013).
- **Mitigations:** a generous refund policy (for example, 30 days, no questions) costs little at £9.99 and removes most disputes; describe the app exactly, including which browsers it supports; confirm the merchant of record's checkout takes the consent.

### L20. Saying who you are
- A commercial website must give the provider's name, the geographic address where it is established and an email address, and show prices clearly, saying whether tax is included (Electronic Commerce Regulations 2002, reg. 6).
- A sole trader using a business name must put their own name with it on invoices, receipts and letters (GOV.UK).
- For an individual this means publishing a name and an address. Ask the solicitor whether a business address can be used in place of a home address.

### L13, if sold. Claims, reviews and prices
- Since 6 April 2025 the CMA can decide breaches itself and fine up to £300,000 or 10% of worldwide turnover, whichever is higher. Banned outright: fake reviews, reviews that hide an incentive, and headline prices that leave out mandatory charges.
- **Mitigations:** show £9.99 as the total; never write or commission reviews; say plainly that the web app is free and what the paid apps add (convenience and support, not features); drop "the free script editor" as a tagline (D-034).

### L21. Tax
- Register for Self Assessment once trading income passes £1,000 in a tax year. UK VAT registration starts at £90,000 of taxable turnover. Selling digital services direct to EU consumers has no threshold, which is the main reason to use a merchant of record.
- Not tax advice. An hour with an accountant when the first sales arrive is worth it.

### L22. Stores, the GPL and contributors
- Apple's App Store terms clashed with the GPL when VLC was removed in 2011, so the plan skips the App Store. Microsoft Store and Google Play terms have not been checked.
- You can agree to store terms for code you wrote. Code from contributors comes under the GPL with a sign-off only (ADR-0008), which may not let you accept terms the GPL forbids. Ask the solicitor whether to add a contributor agreement before the first outside contribution.

## Compliance check (plugin format)
**Summary: proceed, with conditions.** No requirement blocks the release. The actions below should be done before the public launch, and those marked "before charging" before the first sale.

### Applicable law
| Law | Why it applies | What it needs |
|---|---|---|
| Copyright, Designs and Patents Act 1988 | OpenAct is software that shares features with paid apps | Copy no expression; observe the format, don't decompile |
| Trade Marks Act 1994; passing off | Naming Final Draft; choosing OpenAct's name | Descriptive mentions only; clear the name |
| Business Protection from Misleading Marketing Regulations 2008 | Any comparison with paid apps | Comparisons must meet reg. 4 |
| Patents Act 1977 (and US law for US users) | Software features | Accept residual risk |
| UK GDPR and Data Protection Act 2018; EU GDPR for EU visitors | Hosting logs; any future sync or AI | Privacy notice; no third-party requests |
| PECR reg. 6, as amended by the Data (Use and Access) Act 2025 | Local storage, IndexedDB, the offline cache | Exceptions cover it; no analytics or ads without consent |
| Consumer Rights Act 2015 | Paid digital content | Satisfactory quality, fit for purpose, as described; repair or replacement, then a price reduction |
| Consumer Contracts Regulations 2013 | Selling at a distance | Pre-contract information; 14-day cancellation unless the buyer consents to immediate supply |
| Digital Markets, Competition and Consumers Act 2024 | You are now a trader | No misleading claims or omissions, fake reviews or drip pricing; the CMA can fine directly |
| Electronic Commerce (EC Directive) Regulations 2002, reg. 6 | A commercial website | Name, geographic address and email; clear prices that say whether tax is included |
| Business names rules (GOV.UK) | Trading as "OpenAct" | Your own name with the business name on invoices, receipts and letters |
| Income tax and VAT | Sales income | Self Assessment above £1,000 a year; a merchant of record for sales tax |
| Equality Act 2010 | A service to the public | WCAG 2.2 AA (R15) |
| Online Safety Act 2023 | Not now; would apply to sharing between users | Review before building sharing |
| GPL-3.0, MIT, ISC, Apache-2.0, SIL OFL 1.1 | OpenAct's own licence and its parts | Notices, licence texts, source link |

### Requirements
| # | Requirement | Status | Action |
|---|---|---|---|
| 1 | Scripts never leave the device without the writer acting | Met | Keep it (principle 2) |
| 2 | No requests to other sites (fonts, analytics) | Met in the offline editions; not met in the hosted prototype | Self-host fonts in the product (D-026) |
| 3 | Privacy notice covering hosting logs and on-device storage | Not met | Write before launch (slice 12) |
| 4 | Storage exceptions recorded | Met | This document |
| 5 | Licence notices, GPL text and source link in the app | Not met | About screen and CI licence report |
| 6 | OFL texts shipped with the fonts | Met (offline editions) | Carry into the product |
| 7 | Not-affiliated lines for Final Draft and for review-stage names | Not met | Add to About and the review panel |
| 8 | Name cleared | Chosen (OpenAct, D-029); registers not yet searched | Owner: register searches; solicitor to confirm |
| 9 | No-warranty notice and backup advice | Partly met (backup prompts designed) | About screen wording |
| 10 | Accessibility WCAG 2.2 AA | Partly met (automated checks pass) | Manual screen-reader passes (R15) |
| 11 | Review rules dated, linked and paraphrased | Met (prototype) | Yearly update |
| 12 | Marketing copy checked for comparisons and absolute claims | Unknown | Solicitor review with the name |
| 13 | Terms of sale, refund policy and privacy notice published, naming the merchant of record | Not applicable while free (D-036) | — |
| 14 | Checkout takes the buyer's consent to immediate supply | Not applicable while free (D-036) | — |
| 15 | Seller's name, address and email on the site; prices with VAT | Not applicable while free (D-036) | — |
| 16 | Registered for Self Assessment once income passes £1,000 | Not applicable while free | — |
| 17 | ICO fee checked and paid if due | Unknown | Owner: the ICO's self-assessment |
| 18 | Store terms checked against the GPL | Unknown | Solicitor |

### Recommended actions
1. **Before launch:** search the registers for OPENACT and ACT ONE in classes 9 and 42, then file a UK mark if clear (L5).
2. Self-host fonts and keep the product free of third-party requests (L11).
3. Write the About screen: licences, source link, no-warranty, not-affiliated lines (L4, L8, L12, L16).
4. Write the privacy notice (L9, L10).
5. Add a clean-room rule to CLAUDE.md and keep provenance notes for format rules and FDX (L1, L3).
6. Book a one-off review by a UK IP and technology solicitor before launch: the name, marketing copy, the FDX approach, and whether contributors should sign an agreement. The British Library's Business & IP Centre has run free IP information sessions; check what it currently offers.
7. Add a legal review gate before sharing, sync, co-writing or AI features (L17).

### Approvals
| Who | Why | Status |
|---|---|---|
| Owner | Accept the residual risks (L1, L2, L3, L7) | Pending |
| UK IP and technology solicitor | Name, marketing, compatibility claims | Recommended before public launch |

## Sources
- CDPA 1988 [s.16](https://www.legislation.gov.uk/ukpga/1988/48/section/16), [s.50BA](https://www.legislation.gov.uk/ukpga/1988/48/section/50BA), [s.296A](https://www.legislation.gov.uk/ukpga/1988/48/section/296A), [s.107](https://www.legislation.gov.uk/ukpga/1988/48/section/107); [gov.uk: IP offences](https://www.gov.uk/government/publications/intellectual-property-offences/intellectual-property-offences).
- *SAS v WPL*: [CJEU summary (SCL)](https://www.scl.org/2436-sas-v-wpl-no-copyright-says-ecj/); [2010 High Court on the manuals (SCL)](https://www.scl.org/1921-copying-software-functionality-is-it-an-infringement/); [[2010] EWHC 1829 (Ch)](https://caselaw.nationalarchives.gov.uk/ewhc/ch/2010/1829); [[2013] EWCA Civ 1482](https://caselaw.nationalarchives.gov.uk/ewca/civ/2013/1482).
- *Navitaire v easyJet*: [[2004] EWHC 1725 (Ch)](https://caselaw.nationalarchives.gov.uk/ewhc/ch/2004/1725); [SCL: what now for look and feel?](https://www.scl.org/718-navitaire-v-easyjet-what-now-for-look-and-feel/).
- [*Lotus v Borland* (Wikipedia)](https://en.wikipedia.org/wiki/Lotus_Development_Corp._v._Borland_International,_Inc.); [*Google v Oracle* (Jones Day)](https://www.jonesday.com/en/insights/2021/04/supreme-court-google-wins-copyright-battle).
- Trade marks: [TMA 1994 s.11](https://www.legislation.gov.uk/ukpga/1994/26/section/11); [*Gillette* (CMS)](https://cms.law/en/gbr/legal-updates/use-of-third-party-trade-marks-permissible-provided-use-is-honest); [BPRs 2008 reg. 4](https://www.legislation.gov.uk/uksi/2008/1276/regulation/4); [*L'Oréal v Bellure* (IPKat)](https://ipkitten.blogspot.com/2009/06/loreal-v-bellure-at-ecj.html); [FINAL DRAFT mark (TrademarkDir)](https://trademarkdir.com/trademark/final-draft-78663387); [Cast & Crew marks (Justia)](https://trademarks.justia.com/owners/cast-crew-production-software-llc-3270213); [Final Draft 13 on the App Store](https://apps.apple.com/us/app/final-draft-13/id6450966627).
- [*Reckitt & Colman v Borden* (Wikipedia)](https://en.wikipedia.org/wiki/Reckitt_%26_Colman_Products_Ltd_v_Borden_Inc).
- Patents: [Bloomberg Law: text-completion patent suit, 2026](https://news.bloomberglaw.com/ip-law/microsoft-accused-of-infringing-text-completion-tech-patents).
- Licences: [Apache: GPL compatibility](https://www.apache.org/licenses/GPL-compatibility); [Courier Prime licence (Font Squirrel)](https://www.fontsquirrel.com/license/courier-prime); [OFL FAQ](https://www.github.com/theleagueof/licenses/blob/master/OFL-FAQ.md); [Fountain](https://fountain.io/); [Fountain reference code, MIT (Ecosyste.ms)](https://awesome.ecosyste.ms/projects/1035831).
- Privacy: [ICO app guidance, 2014 (WSGR summary)](https://www.wsgrdataadvisor.com/2014/03/uk-information-commissioners-office-issues-guidance-for-app-development/); [Chino.io: data left on the device](https://www.chino.io/post/do-we-avoid-gdpr); DUAA and PECR: [Burges Salmon](https://www.burges-salmon.com/articles/102ku73/data-use-and-access-act-2025-ico-consults-on-changes-to-support-online-adverti), [Kennedys](https://kennedyslaw.com/en/thought-leadership/article/2025/the-uk-dua-act-s-reform-pillars-divergence-from-the-eu-gdpr-cookies-and-pecr-reform), [Blake Morgan](https://www.blakemorgan.co.uk/data-use-and-access-act-2025-cookies); [LG München Google Fonts ruling (activeMind)](https://www.activemind.legal/guides/ruling-google-fonts/).
- Consumer: [CRA 2015 s.46](https://www.legislation.gov.uk/ukpga/2015/15/section/46).
- Equality and accessibility: [Equality Act 2010 s.29](https://www.legislation.gov.uk/ukpga/2010/15/section/29); [Taylor Wessing: EAA exemptions](https://www.taylorwessing.com/en/interface/2025/accessibility/key-eu-accessibility-act-exemptions-and-the-challenges-they-pose).
- Online safety: [Ofcom: overview of regulated services](https://www.ofcom.org.uk/siteassets/resources/documents/online-safety/information-for-industry/illegal-harms/overview-of-regulated-services.pdf); [Taylor Wessing: are you caught?](https://www.taylorwessing.com/en/interface/2023/the-uks-online-safety-act/online-safety-act-are-you-caught).
- Selling: [Electronic Commerce Regulations 2002, reg. 6](https://www.legislation.gov.uk/uksi/2002/2013/regulation/6); [GOV.UK: become a sole trader](https://www.gov.uk/become-sole-trader) and [HMRC Tax Confident: set up as a sole trader](https://taxconfident.campaign.gov.uk/small-businesses-and-tax/starting-out/set-up-sole-trader/); [CMA: unfair commercial practices (CMA207)](https://www.gov.uk/government/publications/unfair-commercial-practices-cma207/unfair-commercial-practices); [CMA: new consumer protection regime in force](https://www.gov.uk/government/news/cma-to-boost-consumer-and-business-confidence-as-new-consumer-protection-regime-comes-into-force); [Consumer Contracts Regulations 2013](https://www.legislation.gov.uk/uksi/2013/3134); [Trading Standards: digital content](https://www.bromley.gov.uk/leaflet/314034/15/685/d); tax and fees in docs/publishing-plan.md.

Statute links point to legislation.gov.uk; the sections were identified through search results and commentary, not read in full in this session. Case points come from published summaries; read the judgments before relying on them.

> **Note (2026-11-15):** written under the name ActOne, which has since been replaced by OpenAct (D-045). Kept for its research.

# Publishing and pricing

**Status: superseded on 2026-11-12 (D-036): ActOne is free.** Kept as research in case selling is ever reconsidered; nothing here is planned. It was accepted on 2026-11-11 (D-034). The owner replied "continue" to this recommendation. Researched 2026-11-08, with the payment-provider and trader points checked again on 2026-11-11. Not legal or tax advice: the launch solicitor and an accountant should check the legal and tax points.

## The short answer
- **Price:** £9.99, paid once, VAT included. No subscription, and every version and update included. Don't go below about £5, because payment firms take a flat fee on every sale (table below).
- **How to take payment:** through a merchant of record. **Start with Paddle:** its help pages say individuals and sole traders need only an identity check, and that your site must be live with terms, a refund policy and a privacy notice before it approves you. Lemon Squeezy's own 2026 update says it is moving its users to Stripe Managed Payments, so don't start there; Stripe Managed Payments is the alternative to compare. They become the legal seller to the buyer, so they work out and pay the VAT and sales tax, send receipts, and handle refunds and chargebacks. You are paid out as a sole trader.
- **What is really for sale:** the packaged, supported app, not exclusive access. The code is GPL-3.0 and there are no accounts, so you can't stop anyone using or sharing it, and the GPL says you can't make everyone who gets a copy pay. Plan on sales that cover costs and say thank you, not on a living.
- **What changed in the kit:** principle 1, the plan (slice 13b), the spec (R20) and the legal review (reissued). The list is at the end.

## What "for sale" can mean for an open-source, no-account app
| Model | How it works | Verdict |
|---|---|---|
| **A. Sell the packaged apps, keep the web version free** | Paid: store listings and direct downloads with updates and support. The web app stays free and the source stays open. | **Recommended.** Honest, fits principles 2, 3 and 6, and needs no licence keys. Sales will be modest. |
| B. Free app, pay what you like | Donations through Ko-fi, GitHub Sponsors or Open Collective. | The lowest legal burden; the lowest income. |
| C. Paywall the app | Accounts or licence checks, perhaps a closed-source licence. | Not recommended. It breaks "no account" and local-first, the GPL lets anyone strip a check from the code, and relicensing reverses ADR-0008. You own the copyright, so it is possible; ask the solicitor before trying. |

Source: the FSF says the GPL allows selling copies at any price, but you must supply the source, and you can't require payment from people who got a copy from someone else ([GNU: Selling Free Software](https://www.gnu.org/philosophy/selling.en.html), [GPL FAQ](https://www.gnu.org/licenses/gpl-faq.en.html)).

## The price
What rivals charge (docs/research/competitors.md, 3 November 2026, mostly from search summaries; re-check before launch):

| Tool | Price |
|---|---|
| Final Draft 13 | $249.99 once; upgrades $99.99–129.99 |
| Fade In | about $79.95 once |
| Scrivener | about $49–59 once |
| Highland Pro | $59.99 a year |
| WriterDuet Plus or Pro | about $59.99–89 a year |
| Arc Studio | about $69–99 a year |
| Celtx | about $9–15 a month |
| Beat (iPhone) | about $12.99 once |
| Trelby, Beat on Mac, Afterwriting, Page 2 Stage | free |

**£9.99 once** sits below every paid rival, including the cheapest one I found (Beat on iPhone). A no-subscription promise is also a selling point: subscriptions are the top complaint about Celtx, Highland and Arc. ActOne has no running costs, so a subscription couldn't be justified anyway.

**Why not lower:** Paddle and Lemon Squeezy both charge about 5% + 50¢ per sale, with no monthly fee, on the whole order including tax. At roughly 40p for the 50¢:

| Price (VAT included) | Fee | Fee as a share | You keep from a UK sale (after 20% VAT) |
|---|---|---|---|
| £2.99 | about £0.55 | 18% | about £1.94 |
| £4.99 | about £0.65 | 13% | about £3.51 |
| **£9.99** | **about £0.90** | **9%** | **about £7.42** |
| £14.99 | about £1.15 | 8% | about £11.34 |

A buyer outside the UK, where tax is added on top, leaves you up to about £9 of a £9.99 price. These are my estimates from the published rates; check the processor's pricing page.

**Extras, if you want them:** a student or low-income coupon at about £4.99; no paid upgrades for the review (version 2) or spelling and grammar (version 3), which is a contrast with Final Draft's upgrade fees.

## What it costs to start (year one)
| Item | Cost | Source |
|---|---|---|
| Hosting | £0 (static site, ADR-0006) | ADR-0006 |
| Domain | about £10–15 a year | my estimate, not researched |
| UK trade mark, classes 9 and 42, online | £205 plus £60 for the second class = £265; or £125 + £30 = £155 up front under "Right Start", then the balance | [GOV.UK](https://www.gov.uk/how-to-register-a-trade-mark/start-your-application), from 1 April 2026 |
| ICO data protection fee | £52 a year, tier 1 (£5 less by direct debit); likely applies once you hold buyers' details, so check the ICO's self-assessment | [ICO](https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee/) |
| Payment processing | about 5% + 50¢ per sale | see above |
| Microsoft Store | free to register as an individual (since September 2025) | [Windows Developer Blog](https://blogs.windows.com/windowsdeveloper/2025/09/10/free-developer-registration-for-individual-developers-on-microsoft-store/) |
| Google Play | $25 once, then 15% of the first $1 million a year | [AppRadar](https://appradar.com/blog/google-play-apple-app-store-fees) |
| Apple App Store | $99 a year, 15% under its Small Business Program; the GPL and Apple's terms have clashed before, so skip it for now (below) | [Windows Central](https://www.windowscentral.com/microsoft/windows-11/microsoft-store-drops-fees-for-individual-developers-apple-still-charges-usd99-per-year/), [AppRadar](https://appradar.com/blog/google-play-apple-app-store-fees) |
| Solicitor's fixed-fee review | unknown: get a quote in writing | not researched |

**Break-even:** about £332 of fixed costs (trade mark, ICO fee, domain) is about 45 UK sales at £7.42, before the solicitor. Each £100 of solicitor fees is about 14 more sales.

## What changes legally when you sell
| Area | If free (the earlier review) | If sold |
|---|---|---|
| Copyright, file formats, look and feel | Free was never a defence; the law protects code and art, not features | **Unchanged.** Keep building clean-room. |
| Consumer rights | Little applies | The Consumer Rights Act 2015 applies in full: digital content must be of satisfactory quality, fit for purpose and as described. If faulty, the buyer can ask for repair or replacement, then a price reduction; there is no right to reject digital content alone ([Trading Standards leaflets](https://www.bromley.gov.uk/leaflet/314034/15/685/d), [Act notes](https://www.legislation.gov.uk/ukpga/2015/15/notes/division/3/1/4)). The GPL's no-warranty text can't override this. Be exact in marketing. |
| 14-day cancellation | n/a | Buyers can cancel within 14 days. To start the download at once, you need their express consent, their acknowledgement that they lose the right, and written confirmation before supply ([Consumer Contracts Regulations 2013](https://www.legislation.gov.uk/uksi/2013/3134)). A merchant of record's checkout should do this; confirm it. |
| VAT | n/a | UK registration is only needed above £90,000 of taxable turnover ([GOV.UK](https://www.gov.uk/government/publications/vat-increasing-the-registration-and-deregistration-thresholds)). Selling digital services yourself to EU consumers as a non-EU business has no threshold and needs the Non-Union One Stop Shop scheme ([Your Europe](https://europa.eu/youreurope/business/taxation/vat/one-stop-shop/indexamp_hr.htm)). A merchant of record handles all of this. |
| Income tax | n/a | Register as a sole trader and for Self Assessment once gross trading income passes £1,000 in a tax year, by 5 October after it ends ([GOV.UK](https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income)). |
| The name | Costly if you must rename | **Higher stakes:** a clash in a commercial product can mean damages or an account of profits. Search the registers and file the mark before charging (legal review L5). |
| Comparisons with Final Draft | Descriptive mentions | Stricter as a commercial rival: no "a cheaper Final Draft" headlines (Business Protection from Misleading Marketing Regulations 2008, reg. 4). |
| Privacy | A privacy notice for hosting logs | Also cover buyers' details and the ICO fee; the processor is a separate controller for card data. |
| Who you are | n/a | A commercial site must show your name, a geographic address and an email, and clear prices that say whether tax is included ([Electronic Commerce Regulations 2002, reg. 6](https://www.legislation.gov.uk/uksi/2002/2013/regulation/6)). A sole trader puts their own name beside the business name on receipts and letters ([GOV.UK](https://www.gov.uk/become-sole-trader)). |
| Claims, reviews and prices | Honest claims | The CMA can now fine traders directly, up to £300,000 or 10% of turnover, for misleading claims, fake reviews and prices that hide mandatory charges ([CMA guidance](https://www.gov.uk/government/publications/unfair-commercial-practices-cma207/unfair-commercial-practices)). |
| App stores | n/a | Apple's App Store terms clashed with the GPL when VLC was removed in 2011 ([Engadget](https://www.engadget.com/2011-01-09-the-gpl-the-app-store-and-you.html)); you hold the copyright, but contributors' code complicates it. iPhone and iPad users can install the web app from Safari. Check Microsoft Store and Google Play terms with the solicitor. |

## Remaining steps, in order
**1. You, now (nothing needs building)**
- [x] Say yes or no to selling at £9.99. Accepted (D-034).
- [ ] Search the UK IPO, EUIPO and USPTO registers for ACTONE and ACT ONE in classes 9 and 42; check domains; file the UK mark if clear.
- [ ] Send the layout sheet to your director; run the interviews and survey; collect reference PDFs and Final Draft files; confirm your three first scripts (docs/owner-tasks.md).
- [ ] Book the solicitor. Add to the brief: terms of sale, the refund and cancellation wording, the GPL position when selling, store terms, and the consumer-rights point above.
- [ ] Create a Paddle account and read its seller terms. Approval comes later: Paddle reviews the live site and wants terms, a refund policy and a privacy notice that name it as the seller (slice 13b).
- [ ] Decide which name, address and email the site will show (legal review L20).
- [ ] Create an empty private GitHub repository for ActOne, so the build has a home and CI can run.

**2. Build (Claude Code, one slice per session; docs/plan.md)**
- [ ] Slices 0–8: the repository, the model and Fountain, the layout engine, the editor, the page view, storage, PDF, the outline and cast tools, stage and panto. Milestone 1 is you writing your panto in ActOne.
- [ ] Slices 9–13: the format library, counts and paste, Word and Final Draft, offline and install, and first run, accessibility and release. This is version 1.
- [ ] Slice 14: "Ready to submit?" review (version 2).
- [ ] Slices 15–18: spelling and grammar (version 3).

**3. Selling set-up (slice 13b)**
- [ ] A "Get ActOne" page: price, what you get, the buy button through the merchant of record, a download for the web app.
- [ ] Terms of sale, a refund policy, the privacy notice and a support email.
- [ ] Microsoft Store and Google Play listings (a web-app wrapper), with store text and screenshots.
- [ ] The launch actions from the legal review (About screen with licences, source link, no-warranty and not-affiliated lines).

**4. Launch and afterwards**
- [ ] Soft launch to your own contacts, amateur theatre groups and writing communities; collect feedback.
- [ ] Review the price after three months.
- [ ] Update the submission rules every year (docs/research/submission-checks.md).
- [ ] Register for Self Assessment when income passes £1,000; keep records; watch the £90,000 VAT line.
- [ ] Take a fresh legal review before adding sharing, sync, co-writing or AI.

## What changed in the kit (2026-11-11)
- **Principle 1** now reads: "Fair to writers: free on the web, and one low price, paid once, for the packaged apps. No subscription, no caps on scripts, every export, no watermark, no account, no nags. The source stays open." The other six principles stand.
- **docs/plan.md:** slice 13b, selling set-up.
- **docs/prd.md:** R20, getting and buying ActOne.
- **docs/legal/legal-review.md:** reissued with the trader duties (L18 to L22); the name (L5) and marketing claims (L13) score higher.
- **The tagline** is "the script editor for stage and screen"; "free" is no longer part of it.

## What I could not check
- The price of domains and of a solicitor's fixed fee.
- Paddle's current fees (third-party sites, not its own pricing page), and whether Lemon Squeezy still takes new sellers.
- Microsoft Store and Google Play terms for GPL apps.
- Whether the Microsoft Store's commission is 15% or 0% when you use your own checkout (the sources conflict).

## Sources
- GPL and selling: [GNU: Selling Free Software](https://www.gnu.org/philosophy/selling.en.html), [GPL FAQ](https://www.gnu.org/licenses/gpl-faq.en.html).
- Payment providers: [Paddle: business verification](https://www.paddle.com/help/start/account-verification/what-is-business-verification), [Paddle: minimum seller terms](https://developer.paddle.com/partners/embed-billing/seller-go-live/minimum-seller-terms), [Lemon Squeezy: 2026 update](https://www.lemonsqueezy.com/blog/2026-update).
- Fees: [Paddle fee guide (dev.to comparison)](https://dev.to/jettfu/stripe-vs-paddle-vs-lemon-squeezy-fee-comparison-2026-2c77), [Lemon Squeezy 2026 review](https://dev.to/onsen/lemon-squeezy-review-2026-pros-cons-pricing-1k4a), [Windows Developer Blog: free registration](https://blogs.windows.com/windowsdeveloper/2025/09/10/free-developer-registration-for-individual-developers-on-microsoft-store/), [AppRadar: Apple and Google fees](https://appradar.com/blog/google-play-apple-app-store-fees).
- Tax and registration: [GOV.UK: VAT threshold](https://www.gov.uk/government/publications/vat-increasing-the-registration-and-deregistration-thresholds), [GOV.UK: trading allowance](https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income), [Your Europe: One Stop Shop](https://europa.eu/youreurope/business/taxation/vat/one-stop-shop/indexamp_hr.htm), [ICO: data protection fee](https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee/), [GOV.UK: trade mark fees](https://www.gov.uk/how-to-register-a-trade-mark/start-your-application).
- Consumer law: [Consumer Contracts Regulations 2013](https://www.legislation.gov.uk/uksi/2013/3134), [Consumer Rights Act 2015 explanatory notes](https://www.legislation.gov.uk/ukpga/2015/15/notes/division/3/1/4), [Trading Standards: digital content](https://www.bromley.gov.uk/leaflet/314034/15/685/d).
- App stores and the GPL: [Engadget: The GPL, the App Store, and you](https://www.engadget.com/2011-01-09-the-gpl-the-app-store-and-you.html).
- Competitor prices: docs/research/competitors.md.

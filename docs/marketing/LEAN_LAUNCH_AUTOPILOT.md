# PropertyCheck — Lean Launch + Autopilot Plan (Track 1)

> **What this is.** A minimum-effort launch and a near-passive operating routine for a
> mobile-only, transaction-first app. This is **not** the founder's main horse. The
> goal is to ship, seed the built-in organic loops, and then keep the thing alive on
> ~30–60 min/week while your real energy goes to validating the next idea. Read
> `docs/PRODUCT_OVERVIEW.md` and `docs/PIVOT_TRANSACTION_FIRST.md` first — everything
> here assumes the pay-per-move model (Moving Bundle $24.99 hero, Report Unlock $9.99).

---

## 0. Honest framing (read this before you build anything)

PropertyCheck is a real product solving a real pain, but as a solo, near-zero-budget,
minimum-maintenance launch, the realistic revenue ceiling is **low three figures/month,
maybe touching four figures in a good move-out season** — not the $20K MRR the pivot doc
describes. That $20K number requires either a full-time growth push or the B2B landlord
pivot; both are separate bets. Treat this track as a **cheap, standing option**: it costs
you a launch week plus an hour a week, and it either quietly compounds or it doesn't.

**The ONE metric that justifies investing more:** **paid moves per month, growing month
over month without you touching it.** If organic paid moves climb on autopilot (say 5 →
10 → 20 across three months with zero new effort), you've found a compounding loop and it's
worth coming back to. If it flatlines at near-zero after the launch bump, leave it passive
and move on — that's a valid, cheap answer.

---

## 1. Pre-launch checklist (minimum to be store-ready)

Do **only** these. Everything else is scope creep.

### Blocker — must clear before submission
- [ ] **Native In-App Purchase (StoreKit / Play Billing).** *(Prerequisite, not solved
      here.)* A digital unlock consumed in-app **must** use native IAP — the current
      Stripe-web-checkout flow will get the app rejected (Apple Guideline 3.1.1). Wire
      `expo-in-app-purchases` / `react-native-iap` for the consumable Report Unlock +
      Moving Bundle and the subscription; validate receipts server-side. Keep Stripe
      webhook for the future web/landlord path only. Enroll in the **App Store Small
      Business Program** (15% fee). Scope: its own milestone, own EAS build. **Nothing
      below matters until this is done.**

### Store readiness (once IAP is in)
- [ ] Apple Developer + Google Play Console accounts active; SBP enrolled.
- [ ] Production EAS build passing QA on the full flow: purchase → entitlement (receipt
      validation) → **clean, watermark-free PDF** delivered.
- [ ] Privacy: App Privacy nutrition label (iOS) + Data Safety form (Play) filled — you
      collect photos, email, location/timestamp metadata. Link the existing privacy page.
- [ ] Account deletion path reachable in-app (Apple requires it; you already have PIPEDA
      export/delete — surface it).
- [ ] Support email + a one-line support URL (the presentation site's contact page is fine).

### ASO assets (see §4 for the exact copy)
- [ ] App name, subtitle, iOS keyword field (EN + FR-CA).
- [ ] 3 screenshots telling the document → report → send story (EN + FR-CA).
- [ ] Short description (Play) + full description (both), leading with the $2,000 deposit.
- [ ] App icon, and a 15–30s app preview video (optional — reuse one of your short-form clips).

### The transactional nudge at the value moment (do NOT skip — it's your cheapest revenue)
- [ ] A **transactional** email/push fired when the free user finishes documenting and
      hits the send-to-landlord gate: *"Your move-in report is ready."* This is the
      output-gated paywall moment — the conversion trigger.
- [ ] **CASL note:** report-ready, purchase receipt, and trial/expiry reminders are
      **transactional** — no opt-in needed. Anything promotional (tips, seasonal nudges,
      "come back next move") requires an **explicit opt-in checkbox** at signup, unchecked
      by default. Keep the two streams strictly separate.

---

## 2. Launch week (free channels only, hour-budgeted)

One week, ~8–10 focused hours total. No paid ads. Dates are placeholders — anchor to a
move-out-heavy window (**Aug/Sep** back-to-school and **spring** are peak renter moves in
Canada; launch *just before* the wave).

| Day | Time | Do this | Skip |
|---|---|---|---|
| **Mon** | 90 min | Record 5–10 short-form clips in one sitting (see hooks below). Batch now, drip later. | Fancy editing. Shoot on the phone. |
| **Tue** | 60 min | Schedule Product Hunt launch for Thu. Prep tagline, gallery (reuse screenshots), first comment. | Hunting for a "hunter." Just self-launch. |
| **Wed** | 45 min | Post 2 clips (TikTok + Instagram Reels + YouTube Shorts, same file). Reply to comments. | Cross-posting to 6 networks. Pick the 2–3 you'll actually check. |
| **Thu** | 90 min | **Product Hunt launch at 12:01am PT.** Check in 3× during the day, reply to every comment. Post 1 clip. | Begging for upvotes. Let it ride. |
| **Fri** | 60 min | Reddit: 1 genuinely helpful post per allowed sub (rules below). Post 1 clip. | Dropping links in strict subs — instant ban. |
| **Sat** | 30 min | Post 1 clip. Reply to any Reddit/PH threads. | Anything new. |
| **Sun** | 30 min | Read your numbers (§7). Note what got traction. Queue next week's 2 clips. | Rebuilding anything based on week-1 noise. |

### Product Hunt (Thu)
- **Tagline:** "Get your rental deposit back — proof in 10 minutes."
- **First comment (you):** short founder story — "I'm a solo dev in Canada. I built this
  after [/ because] renters lose their deposit to 'pre-existing damage' they can't
  disprove. It's pay-per-move: $24.99 for a full move-in + move-out with photo evidence
  and a professional PDF. No subscription trap. Happy to answer anything."
- **Metric:** upvotes + install referrals from PH. Kill/scale: it's a one-day event —
  don't over-invest, just harvest the traffic.

### Reddit — respect each sub's self-promo rules (verify live before posting)
Reddit doesn't ban self-promotion; it bans *bad* self-promotion. The default norm is the
**90/10 rule** (≤10% of activity promotional), but each sub sets its own — and the legal
subs are strict.

- **r/legaladvicecanada — NO self-promotion. Do not post the app.** Participate honestly
  by answering deposit questions; if genuinely relevant and a mod allows, mention the
  *category* of tool ("timestamped photo documentation"), not your link. Safest: skip it.
- **r/PersonalFinanceCanada, r/canadahousing, r/ontario, r/vancouver, r/askTO, r/Calgary,
  r/Montreal** — value-first only. Post a **helpful guide**, not an ad: *"Moving out this
  month? Here's the move-out photo checklist that saved my deposit."* Put the app in a
  soft mention at the bottom or in comments *if asked*. Read each sidebar first; some ban
  links outright.
- **Format that works:** text post, real advice, screenshots of a sample report as the
  "here's what good documentation looks like." Answer questions in comments — that's where
  installs come from, not the post link.
- **Metric:** upvotes + install spikes the next day. Kill: if a post gets removed or
  downvoted, don't repost — that sub isn't for you.

### Short-form video — 5–10 clips, batch-shot
Hooks (pick from these; each is a 15–30s clip, phone-shot, text-on-screen):
- "Your landlord is counting on you NOT doing this before you move in."
- "How I got my full $2,000 deposit back in Ontario."
- "The 60-second move-in walkthrough that protects your deposit."
- "Landlord tried to charge me for damage that was already there. Here's what saved me."
- "Renters in Canada: do this the day you get the keys."
- "Move-out day checklist so they can't keep your deposit."
- Per-province cuts: "If you rent in BC / Alberta / Toronto, watch this."
- **CTA every time:** "Link in bio — it's pay-per-move, no subscription." Point bio link
  to the App Store / Play listing (or the presentation site's download section).
- **Metric:** views → profile taps → install. Kill/scale: if nothing clears ~1–2k views
  after ~8 clips, stop making them — your reach loop isn't here. If one clip pops (>20k),
  make 3 more in that exact format.

### Province SEO pages (already built)
- You already ship `/[locale]/legal/[province]` for every province code. **Do not build
  new pages this week** — just make sure they're indexed: submit the sitemap to Google
  Search Console, confirm titles/descriptions render (they do: "{Province} Rental
  Inspection Guide"). These are your evergreen SEO surface (§3).

---

## 3. Evergreen acquisition channels (set up once, let run)

Pick **these three**. Set them and forget them — that's the whole point of Track 1.

### 3.1 Programmatic province SEO + two content pillars
- **Already live:** the province guide pages. Make them earn their keep by targeting the
  two searches your buyers actually make:
  - "move-in inspection checklist {province}"
  - "how to get your deposit back {province}"
- **One-time effort:** on each province page, add a short "Move-in / move-out checklist"
  section and a "How to get your deposit back in {Province}" block, each ending in a
  download CTA. Write once, it templates across all provinces.
- **Then leave it.** SEO compounds on its own timeline (3–6 months). No ongoing blogging.
- **Metric:** Search Console impressions → clicks → installs on province pages.
  Scale signal: a province page cracks page 1 for its checklist term → write one deeper
  guide for that province only.

### 3.2 The built-in share-link / watermark loop (your best passive channel)
- Every free report is **watermarked "Powered by PropertyCheck,"** and every emailed PDF /
  share page is branded and lands in a **landlord's** inbox. That's acquisition you already
  paid for in code. Two zero-effort amplifiers:
  - Make the watermark and email footer a **clear, tasteful CTA** ("Documented with
    PropertyCheck — propertycheck.app"), not just a logo. Design it as marketing, not
    punishment.
  - The share page already has a "Sign up free" CTA — confirm it points to the store.
- **Then leave it.** It runs every time anyone uses the app.
- **Metric:** installs attributed to share-page visits / branded-link clicks. This is the
  loop that tells you if the product spreads itself.

### 3.3 Move-out-season timing (calendar, not labor)
- Canadian renter moves spike **spring (Apr–Jun)** and **late summer (Aug–Sep)**; Quebec's
  July 1 "Moving Day" is a concentrated spike. You don't create demand — you show up when
  it already exists.
- **One-time setup:** two calendar reminders (mid-March, mid-July) that say "post the
  seasonal clip + refresh the province pages' promo text." That's the entire seasonal plan.
- **Metric:** install/paid-move lift in those windows vs. baseline.

---

## 4. App Store / Play ASO

Budget: **160 indexed characters on iOS** (name 30 + subtitle 30 + keyword field 100).
Use singular keywords, no spaces after commas in the keyword field, no repeats across
fields, no competitor trademarks.

### iOS
- **App name (≤30):** `PropertyCheck: Rental Report` *(28)*
- **Subtitle (≤30):** `Get your deposit back` *(21)* — or keyword-denser:
  `Move-in inspection & photos` *(27)*
- **Keyword field (≤100 bytes, no repeats of words above):**
  `deposit,tenant,rental,inspection,checklist,move,landlord,damage,lease,apartment,evidence,pdf,condition`

### Google Play
- **Title (≤30):** `PropertyCheck: Rental Report`
- **Short description (≤80):** `Photo-document your rental & get your deposit back. Pro PDF report in minutes.`
- **Long description:** front-load the deposit stakes + the pay-per-move price in the first
  two lines (Play indexes the full description), then the document → report → send story,
  then provincial coverage (ON/BC/AB/QC), then "no subscription required — one-time Moving
  Bundle $24.99."

### The 3-screenshot story (caption on each)
1. **Document** — room-by-room camera view. Caption: *"Photograph every room in minutes —
   timestamped, room by room."*
2. **Report** — the finished PDF. Caption: *"Get a professional PDF with a province-specific
   legal disclaimer."*
3. **Send** — one-tap send to landlord. Caption: *"Send it to your landlord in one tap.
   Proof they can't argue with."*

*(Optional 4th: price anchor — "$24.99 to protect a $2,000 deposit. No subscription.")*

### EN + FR-CA localization note
Ship **both English and Canadian French** listings — it's a genuine moat (competitors don't)
and half your market (Quebec) searches in French. Localize name/subtitle/keywords/screenshots.
FR keyword seeds: `dépôt,locataire,logement,inspection,bail,état des lieux,déménagement,
propriétaire,dommages,preuve`. Match the FR value line: "Récupérez votre dépôt de garantie."

---

## 5. Instrumentation (3–4 numbers, cheap tools)

Watch the funnel, not vanity. Where to see it, free:

| # | Metric | Where (free) | Kill / Scale threshold |
|---|---|---|---|
| 1 | **Installs** (by source) | App Store Connect Analytics + Play Console; source via TikTok/PH referrals | Just context for the rest — don't optimize installs in isolation |
| 2 | **Activation = % of installs that complete a first inspection** | One event in your analytics (PostHog free tier or Supabase query on `inspections`) | **Scale** if >40%. **Fix onboarding** if <20% (product problem, not marketing). |
| 3 | **Paid moves / month** (the north star) | App Store/Play sales + your entitlement table | **Scale a channel** if paid moves grow MoM with no new effort. **Go fully passive** if flat near-zero for 2 months. |
| 4 | **CAC by channel** | Time-cost per channel ÷ paid moves it drove (near-zero $ CAC; measure in *hours*) | Kill any channel costing >2 hrs/paid-move. Double down on the cheapest. |

ARPU/economics reality check: net ~$22/Moving Bundle (post-SBP 15%). Because CAC is
organic (hours, not dollars), a single autopilot paid move/week already covers infra.
There's no paid-ad payback math to run here — if you ever consider ads, require them to
return a paid move for **under ~$18 spend** before scaling, and don't start until organic
paid moves are already climbing.

---

## 6. Autopilot operating cadence (the most important section)

The whole point: keep it alive on the least effort that still works.

### Weekly — ~30–60 min, one sitting (e.g. Sunday)
1. **Read the 4 numbers** (§5). 5 min. Note direction, not noise.
2. **Post 1–2 batched short-form clips** (from a queue you refill monthly). 10 min.
3. **Reply to store reviews + any Reddit/PH/social comments.** 15 min. Reviews affect
   ranking and are cheap goodwill.
4. **Reply to support email.** 10 min. If a question repeats 3×, add it to the FAQ once.
5. Stop. Do not start new experiments most weeks.

### Monthly — ~60–90 min
1. **Batch-shoot 4–8 clips** to refill the weekly queue. 45 min.
2. **Skim Search Console:** which province/checklist terms are gaining? 10 min.
3. **Check for store-breakers:** OS update, IAP receipt errors, crash spikes, expired
   certs/provisioning. 15 min. This is the one thing that can silently kill you — a broken
   build earns $0.
4. **Seasonal check (Mar + Jul only):** post the move-season clip, refresh province promo
   text. 15 min.

### Deliberately IGNORE
- Web dashboard/auth (presentation-only by design — don't touch).
- **B2B / landlord features** — that's Track 2, a separate bet (see §8).
- New platforms, new content formats, new "growth hacks," influencer outreach, email
  newsletters, a blog, community-building, A/B testing copy.
- Metrics that aren't the 4 above (DAU, session length, followers).
- Feature requests that aren't "the purchase or PDF is broken."
- Any month where numbers are flat: that's fine. Autopilot means it's allowed to just idle.

**Minimum viable pulse:** if life gets busy, the *only* non-negotiable is the **monthly
store-breaker check** (§6 monthly #3). Everything else can lapse for a month without
killing the app. A broken build is the only true emergency.

---

## 7. "If it works" trigger — when to come back and invest

Come back and put real time in **only** if you see this specific signal:

> **Paid moves/month grow for 3 consecutive months on autopilot** (roughly doubling off a
> non-trivial base, e.g. ~10 → ~20 → ~40), driven by SEO + the share-link loop rather than
> your launch-week push.

That's proof of a compounding organic loop — the rarest, most valuable thing a solo app can
have. When it fires, the highest-ceiling move is **not** grinding more consumer marketing;
it's the **B2B landlord pivot** (`docs/PIVOT_TRANSACTION_FIRST.md` §5): reactivate the
built-but-deactivated web admin for small landlords / independent PMs (1–20 units).
Recurring inspections give a subscription that actually earns its name, and per-unit pricing
is the direct route to the $20K MRR the consumer model can't reach alone. Until that trigger
fires, keep this on autopilot and spend your energy validating the next idea.

---

## Summary (5 lines)
1. **Ship lean, then autopilot** — clear the native-IAP blocker first (nothing ships without it), launch in one ~8-hr week on free channels only, then run on ~30–60 min/week.
2. **Free launch channels:** Product Hunt (self-launch), value-first Reddit posts (respect each sub's rules — skip r/legaladvicecanada), 5–10 batched short-form clips, and the already-built province SEO pages.
3. **Set-and-forget growth:** province SEO ("move-in checklist / get deposit back {province}"), the branded watermark + share-link loop (passive, runs itself), and move-season timing (spring + Aug/Sep, Quebec Jul 1).
4. **Watch 4 numbers:** installs → activation (first inspection) → **paid moves/month (north star)** → CAC in hours; the one true emergency is a broken build (monthly store-breaker check).
5. **Come back only if** paid moves grow 3 months straight on autopilot — then invest in the higher-ceiling **B2B landlord pivot**, not more consumer marketing.

---

*File: `docs/marketing/LEAN_LAUNCH_AUTOPILOT.md`. Sources for external claims:
[App Store metadata 30/30/100](https://appscreenshotstudio.com/blog/app-store-metadata-for-indie-devs-title-subtitle-keywords-2026),
[iOS/Play character limits 2026](https://www.appstyle.dev/blog/app-store-character-limits/),
[Reddit self-promotion rules 2026](https://redship.io/blog/reddit-self-promotion-rules),
[r/legaladvicecanada community rules](https://whereshouldipost.com/community/r-legaladvicecanada).*

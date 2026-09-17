# PropertyCheck — GTM Readiness for a First Test Launch (v1/MVP)

_Assessment date: 2026-09-16. Reviewer: growth-marketer agent. Lens: "is this good
enough to get the first real testers and validate demand?" — NOT "is this a polished
1.0?" Anything that isn't needed to get a first cohort is tagged **Evolution later**._

---

## 1. Verdict

**GO for a scrappy first test launch — conditional on ~half a day of copy/config fixes
before you hit "Submit for Review."**

**Confidence: high (≈80%).**

The reason this is a GO and not a No-Go: the *hard* things that usually block a first
launch are already built and coherent. The things that are broken are all **text and
constants** — cheap to fix, and none require new engineering.

What's actually shipped and working (verified in the repo):
- **The transaction-first conversion gate is real and coherent.** `apps/mobile/app/inspection/[id].tsx`
  gates the clean PDF at export time and opens `ExportOptionsSheet` offering the Moving
  Bundle ($24.99), single Report Unlock ($14.99), and Premium — the exact "output-gated
  paywall at the value moment" a freemium app should have.
- **Native IAP is done.** `apps/mobile/lib/revenuecat.ts` + `supabase/functions/revenuecat-webhook/index.ts`
  + `supabase/migrations/20260913_revenuecat_iap.sql` implement StoreKit/Play Billing via
  RevenueCat with the webhook as source of truth for entitlements. The pivot doc calls
  native IAP "#1 launch blocker" — **that blocker is resolved in code.**
- **The domain rule is DB-enforced** (`20260916_inspection_completion_rules.sql`): 2
  completed inspections/property, bundle finalization = read-only, via triggers no client
  can bypass. This is the correct place for it.
- **Landing page pricing is correct and on-model** — `apps/web/messages/en.json` leads with
  "Pay per move" and the $24.99 Moving Bundle.
- Bilingual EN/FR, province-specific legal pages, share page, PIPEDA export/delete, and
  the watermark/branded-share acquisition loop all exist.

So the product can do the job. It's the shop window and a couple of contradictory paywall
screens that aren't ready.

### The 3-5 reasons driving the verdict
1. **The money path works end to end** (document → watermarked PDF → export gate → IAP →
   clean PDF). That's the one thing that must exist for a paid test. It does.
2. **The blockers are copy, not capability** — wrong price in the store listing, stale
   free-tier description, and two paywall screens telling different stories. Fixable in an
   afternoon.
3. **The wedge is sharp and the market is real** — "get your deposit back" against a
   $1,500–$3,000 stake is a genuine, felt pain with legal grounding per province.
4. **Built-in organic loops exist** (watermark + branded emailed PDF + share page), so a
   first test can run at near-zero CAC — appropriate for a solo founder validating demand.
5. **The only true unknown is willingness-to-pay up front** — and a first test is exactly
   how you buy that answer cheaply. Nothing about the current state prevents running it.

---

## 2. Launch-blockers vs. deferrable

### 🔴 Launch-blockers (fix before store submission — all copy/config, ~half a day)

**B1. Store-listing price is wrong and the copy is off-model.**
`store-assets/ios/en-CA/description.txt` and `store-assets/android/en-CA/full-description.txt`
both say **"MOVING BUNDLE — $19.99"** while the code, landing page, and pivot doc all say
**$24.99** (`PAY_PER_USE.bundle` in `packages/shared/src/constants.ts`). Worse, both store
descriptions still lead with the **old subscription-first model**: "FREE — 1 property",
and list "Email reports directly to your landlord" and "watermark-free" as *Premium*
features. That is not the product you're shipping. This is the single highest-priority fix:
it's what the App Store/Play reviewer reads (price mismatch with the actual IAP product =
possible rejection or refund complaints) and it's what every prospect reads first. Rewrite
both listings to match the transaction-first model: unlimited free properties, 2
inspections/property, watermarked free PDF, **Moving Bundle $24.99** as the hero, Report
Unlock $14.99, Premium as the "or subscribe" option. Keep the keyword field
(`keywords.txt`) — it's fine.

**B2. The in-app upgrade modal contradicts the model you're launching.**
`apps/mobile/components/UpgradeModal.tsx` still sells only the subscription and:
  - Says **"Start 7-Day Free Trial"** (line 245/256) while everything else — docs,
    marketing, the App Store subscription product — is **14-day**. A wrong trial-length
    claim is a billing/legal representation, not a nitpick. Fix the number.
  - Leads its premium feature list with **"Shareable secure links landlords trust"** and
    frames upgrade reasons around **"manage multiple properties"** (lines 43-53, 83-90) —
    directly contradicting the new model where properties are unlimited on free and the
    conversion gate is the *clean PDF at export*, not sharing or property count.
  - Never surfaces the **Moving Bundle**, your supposed hero product.
  The real conversion gate (`ExportOptionsSheet`) is correct, so this isn't fatal — but two
  screens telling two different stories will confuse first users and muddy your conversion
  read. Minimum fix for launch: correct the trial days, and change the `properties_limit`/
  `inspections_limit` reason copy so it doesn't promise "multiple properties" as the paid
  unlock. Fuller fix (evolution): retire or repoint this modal to the transaction options.

**B3. "Property Limit Reached — Free plan allows 1 property" is a false limitation shown
to users.** `packages/shared/src/constants.ts` still has `FREE_TIER_LIMITS.maxProperties: 1`,
and `apps/mobile/locales/en.json` (lines 111-112, 358) + `settings.tsx` render "Free plan
allows 1 property." But the DB migration removed the property cap ("unlimited for every
tier") and `apps/mobile/app/property/new.tsx` enforces **no** property cap — so a user can
create a 2nd property and *also* be told they can't. That's a trust-eroding contradiction on
a product whose entire pitch is trustworthiness. Fix the constant and the strings.

> All three blockers are text/constants. None require new features. Budget an afternoon.

### 🟡 Should-fix-soon but NOT blockers (ship the test, patch in week 1)
- **Documentation drift across three model generations.** `docs/PRODUCT_OVERVIEW.md`,
  `docs/technical/BUSINESS_FEATURES.md`, and `docs/PRE_LAUNCH_CHECKLIST.md` all still
  describe the old subscription-first model (free = 1 property, email/share as the premium
  gate, 3 PDFs/month, "Pro plan", Stripe-checkout QA steps). Internal-only, so not a
  user-facing blocker — but it *is* how you or a future contractor will misbuild the next
  change. Reconcile to the pivot after launch.
- **Screenshots.** `store-assets/` contains only text files — no screenshot images were
  found. You cannot list without screenshots, but generating 3 (document → report → send,
  per `LEAN_LAUNCH_AUTOPILOT.md` §4) is a launch-week task, not an analysis blocker. Just
  don't forget them.
- **Analytics are "planned," not wired.** `BUSINESS_FEATURES.md` lists the funnel events as
  planned. For a *validation* launch you genuinely need at least: install → first
  inspection completed → export tapped → paid. Without those four you can't answer the only
  question the test exists to answer. A Supabase query on `inspections`/entitlement tables
  covers it for free — do this before you drive traffic.

### 🟢 Explicitly fine for v1 — do NOT treat as blockers
- Web PDF generation missing (mobile-only by design).
- Comparison report on web (mobile-only).
- No landlord-side accounts / B2B tier.
- No AI damage detection, no RTB filing integration.
- No polished onboarding, no push-notification nudge yet (the transactional "report ready"
  nudge in `LEAN_LAUNCH_AUTOPILOT.md` is nice-to-have for v1; the export gate already
  captures intent in-session).

---

## 3. Value proposition & positioning

**The wedge — "protect your damage deposit" — is the right one. Keep it.** It's concrete,
loss-framed (people fight harder to avoid losing $2,000 than to gain it), province-grounded,
and it maps to a specific, dateable moment (you get the keys / you hand them back). The
store subtitle "Get your deposit back" and the landing hero are on target.

One honesty caveat baked into the product correctly: in **Ontario and Quebec damage
deposits are not legal**, so "get your deposit back" is literally weaker there — the real ON
value is disputing **NEW damage charges / N-series claims at the LTB**, and in QC it's
defending against repair deductions at the TAL. The province pages seem aware of this. For
ad copy, lead with "deposit" in BC/AB and "don't get charged for damage that was already
there" in ON/QC. This is a messaging refinement, not a blocker.

**Is transaction-first legible to a first-time user?** Mostly yes, because the decision is
deferred to the moment of need (export), where `ExportOptionsSheet` presents Bundle vs.
single Report vs. Premium with the bundle anchored as best value. That's the right UX. The
risk to legibility is **not** the pricing structure — it's the **contradictory second
paywall** (UpgradeModal, blocker B2) that pops for other reasons and only pitches a
subscription. A user who sees "subscribe $9.99/mo" in one place and "$24.99 one-time" in
another will hesitate. Collapsing the story to one model fixes this.

---

## 4. Pricing reality check

**$24.99 / $14.99 / $9.99 are defensible for this audience.** Anchored against a
$1,500–$3,000 deposit, $24.99 is ~1% of the stake — an easy ROI sentence ("$25 to protect
$2,000"). The bundle-over-two-singles math is sound ($24.99 < 2×$14.99 and includes the
comparison), which is why `ExportOptionsSheet` correctly leads with it.

Friction points to watch (none are launch-blockers, but instrument them):
- **"Finalize = read-only" can ambush a paying customer.** Buying the Moving Bundle locks
  the property's inspections/photos (`property_is_locked` trigger). A user who buys at
  *move-in* and later wants to add move-out photos to the same property will hit a wall —
  and they paid for it. The bundle is explicitly "move-in + move-out for one property, 18
  months," so the intent is that both inspections happen *before* finalizing. **Make sure
  the purchase screen states plainly: "Buy this after both inspections are done — it locks
  the property." ** If the lock fires before the user has done move-out, that's a refund and
  a 1-star review. Verify the timing/copy in QA. (Flagging as a UX-copy risk, not a code
  bug.)
- **Watermark as marketing vs. punishment.** Correct instinct in the docs: make the
  watermark a tasteful "Documented with PropertyCheck — propertycheck.app" CTA, not a
  defacing bar. It's your best passive channel; design it to sell, not to annoy.
- **The upfront-payment timing is the real pricing risk** — see §5.

---

## 5. The single riskiest assumption

**That a renter will pay $24.99 *up front, at move-in* — before any dispute has happened —
to insure against a harm they don't yet feel.** The demand for *documentation* is well
established; the leap is **pre-emptive willingness to pay at the chaotic moving moment**,
when money is already flying out the door (deposit, movers, first month). Everything else in
the plan rides on this. (Note: the move-*out* buyer is easier — they can feel the deposit
about to be withheld — but the bundle's value assumes capture at move-*in*.)

**Cheapest test — no new build required, in this order:**
1. **Zero-dollar funnel read (best, uses what you have):** seed 50–100 real movers into the
   free tier and measure the in-app funnel: of users who complete one inspection, what % tap
   **Export**, and of those, what % **pay at the gate**? You do not need scale to learn this
   — 30 genuine movers hitting the export sheet tells you if the gate converts at all.
   Prerequisite: wire the four funnel events (§2 🟡).
2. **Even cheaper, pre-traffic "fake door":** the landing page already has the $24.99 Bundle
   in copy — put a live **Buy** button on it and measure click-through to checkout intent
   from a single value-first Reddit post. Intent clicks validate WTP before you spend an
   hour on ASO.
3. If both say "people document but won't pre-pay," the fix is **shift the ask to move-out**
   (sell the clean PDF when the deposit is actively threatened) — a pricing/messaging pivot,
   not a rebuild.

Do this **before** any acquisition spend or heavy ASO effort.

---

## 6. Minimum viable GTM motion (solo founder, first cohort)

Pick **two** channels. Both are near-zero CAC and match `LEAN_LAUNCH_AUTOPILOT.md`.

**Channel 1 (primary): value-first Reddit in Canadian tenant/city subs.**
- Where: **r/PersonalFinanceCanada, r/canadahousing, r/ontario, r/askTO, r/vancouver,
  r/Calgary**. **Skip r/legaladvicecanada** (no self-promo — you'll get banned).
- What: a genuinely useful **move-out photo checklist** text post + an image of a sample
  PDF report ("here's what documentation that actually holds up looks like"). App gets a
  soft mention at the bottom or in comments when asked. **Installs come from the comments,
  not the link.** Verify each sub's self-promo rule live before posting (90/10 norm).
- CASL note: none of this is email, so CASL doesn't bite here. Keep any future email
  strictly transactional (receipt, report-ready) unless you have an explicit opt-in.
- Metric: **install spike in the 24h after a post.** Kill a sub if the post is removed or
  downvoted; don't repost there.

**Channel 2 (passive, always-on): the built-in watermark + branded-share loop.**
- Every free watermarked PDF and every emailed/shared report lands in a **landlord's**
  inbox with your brand. This runs itself once the app is live. Make the watermark/footer a
  clean CTA and confirm the share page's "Sign up free" points to the store.
- Metric: **installs attributed to share-page visits.** This is the number that tells you
  whether the product spreads without you.

Time-box the launch to one ~8-hour week (per the autopilot plan). Skip Product Hunt if
you're short on time — it's a one-day spike, not a compounding channel; Reddit + the share
loop are the ones that keep giving.

**What "success" for this first test looks like (concrete, ~first move-season month):**
- **≥100 installs** from the first cohort (context number, don't optimize in isolation).
- **≥40% activation** = completed a first inspection. **If <20%, stop marketing — it's a
  product/onboarding problem, not a reach problem.**
- **The export gate converts at all:** of users who complete an inspection and tap export,
  **≥15–25% choose to pay** (bundle or single). This is the real validation signal.
- **≥5–10 paid moves** in the month. Small on purpose — you're validating a loop, not
  chasing revenue. The decision rule that matters (from the autopilot doc): **do paid moves
  grow month-over-month without new effort?** If yes, you found a compounding loop worth
  investing in. If it flatlines near zero for two months, keep it passive and move on —
  that's a valid, cheap answer.

---

## 7. Store-listing / first-impression readiness

**Not ready to list *today*, but the gap is small and non-technical.**
- ✅ Keyword field, subtitle, name copy exist and are reasonable (`keywords.txt`,
  `subtitle.txt` = "Rental Inspection Reports").
- 🔴 **Descriptions have the wrong price ($19.99) and the wrong (old) free-tier model** —
  blocker B1. Rewrite before submission.
- 🟡 **No screenshot images in `store-assets/`.** Required to list. Produce 3 (document →
  report → send) in EN + FR-CA during launch week.
- 🟡 **App Privacy nutrition label (iOS) + Data Safety form (Play)** must be filled — you
  collect photos, email, and location/timestamp metadata. Not in the repo (it's a console
  task); don't forget it.
- ✅ Account deletion + data export exist (PIPEDA) — Apple requires an in-app deletion path;
  surface it in Settings (it's there).

Bottom line: fix the description, shoot 3 screenshots, fill the privacy forms — then you can
list. That's launch-week work, not a re-scope.

---

## 8. Explicitly punt to "Evolution later"

Do **not** build these for the first test — they add nothing to answering "will people pay?":
- Web PDF generation and web comparison reports (stay mobile-only).
- Landlord-side accounts / B2B / per-unit pricing (the real venture path — but only after
  the consumer loop proves it compounds; see pivot doc §5).
- AI damage detection, condition scoring, RTB e-filing, white-label.
- Photo annotations, voice notes, custom checklists (V2 polish).
- Push-notification nudges, email newsletters, a blog, influencer outreach, A/B testing.
- Product Hunt as a must-do (optional, low-leverage for a compounding loop).
- Reconciling every historical doc to perfection — reconcile the three the *next dev* will
  read, ignore the rest.

---

## Appendix — evidence map (where each finding lives)
- Transaction-first gate + bundle/report/premium options: `apps/mobile/app/inspection/[id].tsx`
  (lines ~342, 372-388, 409-445), `apps/mobile/components/ExportOptionsSheet.tsx`.
- Native IAP implemented: `apps/mobile/lib/revenuecat.ts`,
  `supabase/functions/revenuecat-webhook/index.ts`, `supabase/migrations/20260913_revenuecat_iap.sql`.
- DB domain rule + bundle finalization lock: `supabase/migrations/20260916_inspection_completion_rules.sql`.
- Price mismatch: `store-assets/{ios,android}/en-CA/*description.txt` ($19.99) vs
  `packages/shared/src/constants.ts` `PAY_PER_USE.bundle` ($24.99) vs `apps/web/messages/en.json` ($24.99).
- Paywall contradiction / 7-day trial / share-link framing: `apps/mobile/components/UpgradeModal.tsx`
  (lines 34, 43-90, 245-256).
- False property cap: `packages/shared/src/constants.ts` (`maxProperties: 1`),
  `apps/mobile/locales/en.json` (111-112, 358), `apps/mobile/app/(tabs)/settings.tsx` (347);
  no cap enforced in `apps/mobile/app/property/new.tsx`.
- Doc drift (old model): `docs/PRODUCT_OVERVIEW.md`, `docs/technical/BUSINESS_FEATURES.md`,
  `docs/PRE_LAUNCH_CHECKLIST.md`.
</content>
</invoke>

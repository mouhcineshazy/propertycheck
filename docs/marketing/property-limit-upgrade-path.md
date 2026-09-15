# Property-Limit & Upgrade-Path Decision (Transaction-First)

**Funnel stage:** CONVERT (with a RETAIN tail via repeat purchase).
**Question:** At the "add 2nd/Nth property" friction point, what's the upgrade path —
subscription, another $24.99 bundle, both, or per-property one-time? And does keeping
the monthly subscription visible there help or cannibalize transaction revenue?

Ground truth in code (verified 2026-09-15):
- Free = 1 property, 2 inspections total (lifetime), watermarked PDFs.
- Report unlock $14.99 one-time; Moving Bundle $24.99 one-time (1 property, 18 mo) = hero.
- Subscription $9.99/mo · $95.88/yr, secondary.
- Store cut ~15% (Small Business Program). Net: bundle ≈ **$21.24**, report ≈ **$12.74**,
  sub monthly ≈ **$8.49**, sub annual ≈ **$81.50/yr (~$6.79/mo)**.
- **The leak:** `(tabs)/index.tsx` fires `UpgradeModal reason="properties_limit"`, which
  sells *only* the subscription and leads with **"Start 7-Day Free Trial."** A single-move
  user can start the trial, document their place, and cancel = **$0 net**. That path
  converts intent worth $21.24 into $0–$8.49.

---

## 1. Recommendation: property-limit + upgrade-path structure

**Keep free = 1 property. Yes.** It's the correct gate: the core renter has exactly one
home during a move, so the cap never bites them — it only bites the secondary audience
(frequent movers, multi-home, roommate/household coordinators, small landlords), which is
precisely who we want to route to money.

**Make "one property" mean "one move," and make each Moving Bundle a license for one
property's move cycle.** Buying a $24.99 bundle should raise the concurrent-property
allowance by 1. Then the model reads cleanly in one sentence: *you pay per place you're
documenting.* No new "per-property fee" SKU needed — the bundle **is** the per-property
fee, and it already carries move-in + move-out + comparison + 18-month validity.

**At the "add Nth property" moment, present a CHOICE sheet, routed by intent, not a
feature wall:**

- **HERO — "Moving into a new place? — $24.99"** → new bundle for that property.
  This is the most common real case (someone moved) and matches the transaction-first
  message. Repeat transaction = your best revenue.
- **SECONDARY — "I manage several places — Subscribe"** → subscription surface
  (annual-first). For genuine recurring need only.
- Cancel.

Do **not** default to "another $14.99 report" here — that's a report-level SKU, not a
property-level one. Property = bundle.

**Decision table**

| At "add Nth property"… | Offer | Why |
|---|---|---|
| Another $24.99 bundle (HERO) | ✅ default | Matches "I moved" intent; nets ~$21.24 |
| Subscription (secondary, intent-routed) | ✅ keep | Captures the true multi-property minority |
| Per-property one-time fee (new SKU) | ❌ | Redundant — the bundle already is this |
| Free-trial-first CTA at this gate | ❌ remove | 100% cannibalization on single-move users |

---

## 2. Does keeping the subscription here cannibalize?

**The subscription doesn't cannibalize — the free-trial-first CTA does.** Two different
things, and the current modal conflates them.

Per-conversion economics at a single-move gate:

| Path chosen | Net to you | vs. bundle |
|---|---|---|
| $24.99 bundle | **$21.24** | — |
| Sub, 1 month then churn | $8.49 | −60% |
| Sub via 7-day trial, then cancel | **$0** | −100% |

Canadian renters move ~once every 1–3 years, so for the *typical* person hitting this
gate the honest math is: one-time nets you 2.5× a churned monthly sub and ∞× a
trial-and-cancel. Leading with a free trial at a transactional gate is actively
value-destroying — it teaches your highest-intent users to extract the value for free.

**So:** keep the subscription *visible* but demoted and intent-gated ("I manage several
places"), and **strip the free-trial CTA from the property/PDF gates.** Reserve the trial
for the Settings/"Manage multiple properties" surface where a genuine multi-property user
is actually evaluating recurring use. There, the annual plan ($81.50/yr net) is additive
ARR you'd otherwise never capture.

Net effect: the subscription stops competing with the bundle for the same person and
starts serving a different person.

---

## 3. Who the subscription is actually FOR — and how to position it

**Not** "the premium version of the app." That framing fights transaction-first and
confuses the buyer. Position it **by job**, for people whose need is genuinely recurring:

- **Frequent movers** — students, contract/seasonal workers, anyone moving yearly+.
- **Household / roommate coordinators** documenting multiple shared units.
- **Multi-home individuals** — snowbirds, a parent + a student's rental.
- **Small landlords / independent PMs (V2)** — the real recurring audience; different
  funnel, landlord-side accounts (see PIVOT roadmap phase 5).

Positioning line, everywhere the sub appears:
> **Just moving? Pay once — $24.99.**
> **Documenting several places, or moving often? Subscribe.**

Push **annual over monthly** for this audience — monthly is a churn trap for everyone and
you don't want it as the headline. Monthly stays available as an option, not the anchor.

---

## 4. Risk: does 1-property + pay-per-PDF frustrate the core single-move user?

**The property cap does not** — a single mover only ever has one home. But there are two
real traps in the *report* pricing that can frustrate the core user and depress conversion:

**Trap A — the à-la-carte path costs more than the hero.** Free gives 2 inspections
(move-in + move-out). Two clean reports at $14.99 = **$29.98**, which is *more* than the
$24.99 bundle that includes both PLUS the comparison. If a user buys one $14.99 report at
move-in, then hits another $14.99 wall at move-out, they'll feel nickel-and-dimed — and
they overpaid.
**Fix:** at the *first* report-unlock moment (when the user is mid-move), surface the
bundle as the smart default. **Never let someone buy a second $14.99 report without first
being shown the $24.99 bundle.** This protects the user and lifts AOV.

**Trap B — the returning mover a year later.** Free's "2 inspections" is lifetime, so a
happy user who moves again hits a wall immediately. That's fine to monetize (they've had
the product) — but the *tone* must be "new place? document it — $24.99," never "you're out
of free stuff, subscribe." Intent-matched, not guilt-based. A user who already loved it
will happily pay $24.99 for a new move; don't sour it.

**What to skip:** don't widen the free tier to soften these — the gate is correct. Fix
them with *framing and sequencing* (show the bundle at the right moment), not by giving
away more.

---

## 5. Concrete copy/UX (CASL-compliant)

All prompts below are **in-app purchase UI** — no marketing-email consent is involved, so
CASL doesn't bite here. The one place it does: any "remind me at move-out" nudge. Copy for
that is included with an explicit opt-in.

### A. "Add Nth property" choice sheet
> **Add another place?**
> Your account covers one property. How do you want to document this one?
>
> ▸ **Moving into a new place — $24.99**
>   Move-in + move-out + comparison. Watermark-free. Kept 18 months.  *(hero button)*
> ▸ **I manage several places — Subscribe**
>   Unlimited properties and reports. From $7.99/mo billed annually.  *(secondary)*
> ▸ Cancel

Remove the `reason="properties_limit"` → subscription-only modal for free users; route
this event to the sheet above instead. (Strategy note only — no code change in this task.)

### B. PDF paywall moment (first report of a move)
> **Send a clean report**
> Free reports carry a "Sample Copy" watermark. Unlock a professional, watermark-free PDF
> your landlord will take seriously.
>
> ▸ **Moving? Get both reports + comparison — $24.99**  *(hero — the bundle)*
> ▸ Just this report — $14.99
> ▸ Export watermarked copy (free)
> ▸ Cancel

### C. Guardrail before a SECOND $14.99 report
> **You've already unlocked one report.**
> The Moving Bundle covers move-in, move-out, and the comparison for $24.99 — less than
> two single reports.
>
> ▸ **Upgrade to the bundle — $24.99**
> ▸ Unlock just this report — $14.99
> ▸ Cancel

### D. Optional move-out reminder (CASL — requires explicit opt-in)
Checkbox, unticked by default, shown after a bundle purchase:
> ☐ Email me a reminder to document my move-out. You can unsubscribe anytime.

Only send if ticked. A reminder tied to *the specific bundle they bought* is defensible as
transactional, but the opt-in keeps you clean and out of any grey area. Never pre-tick.

---

## 6. Measurement — one metric + kill/scale per play

| Play | Watch this | Kill / Scale |
|---|---|---|
| Bundle-as-hero at add-Nth-property sheet | % of add-property events → bundle purchase | Scale if ≥8% buy; kill/rework the sheet if <3% after 200 events |
| Remove trial CTA from transactional gates | Net revenue per property-gate hit | Keep if net/hit rises vs. the old trial modal; revert only if it *drops* |
| Bundle cross-sell at first PDF unlock | Bundle share of all first unlocks | Scale wording if bundle ≥40% of first paid unlocks; rework if <20% |
| Second-report guardrail (C) | Bundle upgrades ÷ second-report attempts | Working if ≥30% take the bundle; else soften copy |
| Subscription (intent-gated, annual-first) | Annual sub share + 90-day retention | Scale channel to power users if 90-day retention ≥60%; if monthly churns >40%/mo, hide monthly |

**North-star for this decision:** *net revenue per property-limit event*. Today that number
is near $0 (trial-and-cancel). Anything that lifts it toward the ~$21 bundle net is the win.

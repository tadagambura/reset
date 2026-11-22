# Reset: Spec

**Household routines that actually happen** · #19 of 32 · Wave 2: Recurring keepers · Used: Daily/weekly · Harder · Revenue potential: Medium · Home & Household · Source: ChatGPT + Perplexity

## One-liner

Short, repeatable cleaning and household routines: a daily 10-minute reset, a Sunday reset, laundry, bins and seasonal tasks, room by room. Share the household's tasks and assign them.

## Problem / audience

- **Who it's for:** Renters, parents, couples, students, anyone overwhelmed by housework.
- **The problem it solves:** Cleaning piles up without a routine, and splitting it in a household causes friction.
- **Example:** A parent opens Reset on Sunday, does a 20-minute kitchen reset and assigns the bins to their partner.

## MVP features (ship with only these)

1. Room-by-room checklists
2. Daily 10-minute and weekly reset routines
3. Laundry, bins and seasonal reminders
4. Tick off and see progress per room
5. Optional before/after photos kept on the device

## Not in MVP

- Shared household and task assignment (needs sync)
- Household packs: move-in, deep clean, spring clean
- Custom routines

## Monetisation

| Model | Detail |
|---|---|
| Free | Routines, with ads |
| Premium | £3.99/month: shared household, custom routines, packs, history |
| Ads | Light |

Prices are starting points; test before committing. **Portfolio premium promise:** free has ads; the moment you pay you get no ads, cloud backup and storage, and sync across your devices, plus this app's extras.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Daily and Sunday reset reminders |
| Tiny win | Tick a task |
| Progress | Home status by room; weekly streak |
| Share | Before/after photos and reset checklists |
| Next step | Next week's routine; seasonal packs |
| Cadence | Daily/weekly |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Animation and tone: five signature animations

**Playful.** Celebrations, confetti, cute characters, satisfying sounds and mild comic reactions. Nothing tragic.

- Task ticked: the room sparkles
- Sunday reset: the stickman sweeps in cartoon fast-forward
- Laundry done: the socks pair up and hold hands
- Room spotless: the stickman slides across the floor in socks
- Chore shared: a paper plane delivers it to a housemate


## AI

**None.** Not needed. Plain code does everything this app does. (Portfolio rule: plain code first, code does the maths,
cheapest model, shared budget cap, premium-gated.)

## Platform & data

- **Platform:** Expo app; sharing needs Supabase.
- **Data:** On the device for solo use; Supabase sync for households.
- **Backend:** Device only; shared data once household sharing is added. Premium backup and sync use the shared portfolio backend (see the master repo's HOSTING.md).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Cleaning routines; Sunday reset; Small-space hacks; Chore splitting
- **Shareable output:** Before/after photos and reset checklists

## Risks

The solo version is easy. Shared households is the first feature that needs accounts and sync, which is why it sits in the harder tier.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to the Growth & Maintenance Engine as an app config

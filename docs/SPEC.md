# Reset: Spec

**Rank in portfolio:** #12 of 15 (easiest → hardest) · **Difficulty:** Easy → Medium (sharing)

## One-liner

Cleaning routines, room-by-room tasks and weekly household resets.

## Problem / audience

- **Who it's for:** Busy households, people who feel behind on cleaning, house-sharers.
- **The problem it solves:** Cleaning piles up without a routine; splitting it in a household causes friction.

## MVP features (ship with only these)

1. Room-by-room task lists
2. Daily and weekly routines ("Sunday reset")
3. Laundry and chore reminders
4. Tick off, progress per room

## Not in MVP

- Household packs (move-in, deep clean, spring clean)
- Shared household with task assignment (needs sync)

## Monetisation

| Model | Detail |
|---|---|
| Free | Routines, with ads |
| Paid | £2.99/month: packs + shared household |
| Ads | Light |

Prices are starting points from the portfolio brief; test before committing.

## Platform & stack

- **Platform:** Expo. Shared household needs a backend (Supabase).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob). See the portfolio roadmap.
- **Data:** Device only for solo; Supabase sync for shared households.

## Growth engine hooks

- **Shareable output:** Before/after and "Sunday reset" checklists.
- **Content pillars:** Cleaning routines; Sunday reset; Small-space hacks; Chore splitting

## Notes

Solo version is easy. The shared-household premium is the first feature on the list that needs user accounts + sync.

## Launch checklist

- [ ] Name checked on App Store / Play Store / trademark search
- [ ] MVP features done and tested
- [ ] Privacy policy + terms
- [ ] Landing page
- [ ] Analytics wired
- [ ] Payments / ads wired
- [ ] Added to growth-engine as an app config

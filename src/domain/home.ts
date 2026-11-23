// Reset: chores and fairness, household renewals, the Family Bank (virtual money only) and check-ins.
import { addDays, addMonths, diffDays, weekday, type DayKey } from '@/kit/dates';
import type { Pence } from '@/kit/money';

export type Member = { id: string; name: string; emoji: string; kind: 'adult' | 'kid' };

export type Schedule = { type: 'daily' } | { type: 'weekly'; day: number } | { type: 'every'; days: number };
export type Chore = { id: string; name: string; emoji: string; effort: 1 | 2 | 3; schedule: Schedule; assignee: string | null; reward: Pence };
export type Done = { choreId: string; memberId: string; day: DayKey };

export function lastDone(choreId: string, log: Done[]): DayKey | null {
  let d: DayKey | null = null;
  for (const x of log) if (x.choreId === choreId && (!d || x.day > d)) d = x.day;
  return d;
}

/** Is the chore on today's list? Done-today chores stay listed (ticked). */
export function isDue(c: Chore, day: DayKey, log: Done[]): boolean {
  switch (c.schedule.type) {
    case 'daily':
      return true;
    case 'weekly':
      return weekday(day) === c.schedule.day;
    case 'every': {
      const last = lastDone(c.id, log.filter((x) => x.day < day));
      return !last || diffDays(last, day) >= c.schedule.days;
    }
  }
}

export const doneOn = (choreId: string, day: DayKey, log: Done[]) => log.find((x) => x.choreId === choreId && x.day === day);

export type Share = { member: Member; points: number; share: number };

/** Who's carrying the load: effort points done by each adult in the range. Kids are counted separately. */
export function fairness(members: Member[], chores: Chore[], log: Done[], from: DayKey, to: DayKey): Share[] {
  const effort = new Map(chores.map((c) => [c.id, c.effort]));
  const adults = members.filter((m) => m.kind === 'adult');
  const pts = new Map<string, number>(adults.map((m) => [m.id, 0]));
  for (const d of log) {
    if (diffDays(from, d.day) < 0 || diffDays(d.day, to) < 0 || !pts.has(d.memberId)) continue;
    pts.set(d.memberId, pts.get(d.memberId)! + (effort.get(d.choreId) ?? 1));
  }
  const total = [...pts.values()].reduce((a, b) => a + b, 0);
  return adults.map((m) => ({ member: m, points: pts.get(m.id)!, share: total ? pts.get(m.id)! / total : 0 }));
}

/** A gentle read of the split. Never names a 'winner' or 'loser'. */
export function fairnessNote(shares: Share[]): string {
  if (shares.length < 2) return 'Add another adult to see how the load is shared.';
  const total = shares.reduce((a, s) => a + s.points, 0);
  if (total < 4) return 'Not much logged yet this week.';
  const top = [...shares].sort((a, b) => b.share - a.share)[0];
  if (top.share <= 0.6) return 'Nicely balanced this week.';
  return `${top.member.name} is carrying ${Math.round(top.share * 100)}% this week. Could anything move next week?`;
}

// ---------- Renewals ----------

export type Repeat = 'yearly' | 'monthly' | 'weekly' | 'once';
export type Renewal = { id: string; name: string; emoji: string; due: DayKey; repeat: Repeat };

export const RENEWAL_PRESETS: { name: string; emoji: string; repeat: Repeat }[] = [
  { name: 'MOT', emoji: '🚗', repeat: 'yearly' },
  { name: 'Car tax', emoji: '🧾', repeat: 'yearly' },
  { name: 'Car insurance', emoji: '🛡️', repeat: 'yearly' },
  { name: 'Home insurance', emoji: '🏠', repeat: 'yearly' },
  { name: 'TV licence', emoji: '📺', repeat: 'yearly' },
  { name: 'Passport', emoji: '🛂', repeat: 'once' },
  { name: 'Bin day', emoji: '🗑️', repeat: 'weekly' },
  { name: 'Boiler service', emoji: '🔥', repeat: 'yearly' },
];

export function nextDue(r: Renewal): DayKey | null {
  if (r.repeat === 'yearly') return addMonths(r.due, 12);
  if (r.repeat === 'monthly') return addMonths(r.due, 1);
  if (r.repeat === 'weekly') return addDays(r.due, 7);
  return null;
}

/** Weekly items roll forward on their own so bin day is always the next one. */
export function currentDue(r: Renewal, today: DayKey): DayKey {
  if (r.repeat !== 'weekly') return r.due;
  let d = r.due;
  while (diffDays(d, today) > 0) d = addDays(d, 7);
  return d;
}

// ---------- Family Bank (virtual money, never real) ----------

export type BankEntry = { id: string; kidId: string; day: DayKey; amount: Pence; note: string };

export function balance(kidId: string, entries: BankEntry[]): Pence {
  return entries.filter((e) => e.kidId === kidId).reduce((s, e) => s + e.amount, 0);
}

/** Weekly savings interest (a teaching tool): rate in % a week on a positive balance, rounded to the penny. */
export function interest(bal: Pence, ratePct: number): Pence {
  return bal > 0 && ratePct > 0 ? Math.round((bal * ratePct) / 100) : 0;
}

export function spendError(bal: Pence, amount: Pence | null): string | null {
  if (!amount || amount <= 0) return 'Enter an amount.';
  if (amount > bal) return "That's more than the balance. Saving up is part of the fun!";
  return null;
}

// ---------- Check-ins ----------

export type CheckIn = { id: string; memberId: string; day: DayKey; mood: number; energy: number; battery: number; shared: boolean };

export const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

export function batteryLine(name: string, battery: number): string {
  if (battery <= 20) return `${name}'s social battery is at ${battery}% today. Tea and quiet, maybe? ☕`;
  if (battery >= 80) return `${name}'s social battery is at ${battery}% today. Up for plans!`;
  return `${name}'s social battery is at ${battery}% today.`;
}

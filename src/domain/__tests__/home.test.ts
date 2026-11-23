import { balance, batteryLine, currentDue, fairness, fairnessNote, interest, isDue, nextDue, spendError, type Chore, type Done, type Member } from '../home';

const sam: Member = { id: 's', name: 'Sam', emoji: '🧔', kind: 'adult' };
const alex: Member = { id: 'a', name: 'Alex', emoji: '👩', kind: 'adult' };
const kid: Member = { id: 'k', name: 'Mo', emoji: '🧒', kind: 'kid' };
const chore = (o: Partial<Chore>): Chore => ({ id: 'c', name: 'Dishes', emoji: '🍽️', effort: 2, schedule: { type: 'daily' }, assignee: null, reward: 0, ...o });

test('schedules: daily, weekly and every N days since last done', () => {
  expect(isDue(chore({}), '2026-11-23', [])).toBe(true);
  expect(isDue(chore({ schedule: { type: 'weekly', day: 1 } }), '2026-11-23', [])).toBe(true); // Monday
  expect(isDue(chore({ schedule: { type: 'weekly', day: 0 } }), '2026-11-23', [])).toBe(false);
  const every3 = chore({ schedule: { type: 'every', days: 3 } });
  const log: Done[] = [{ choreId: 'c', memberId: 's', day: '2026-11-21' }];
  expect(isDue(every3, '2026-11-23', log)).toBe(false);
  expect(isDue(every3, '2026-11-24', log)).toBe(true);
  // done today stays on today's list
  expect(isDue(every3, '2026-11-21', log)).toBe(true);
});

test('fairness counts effort points per adult; kids are separate', () => {
  const chores = [chore({ id: 'd', effort: 2 }), chore({ id: 'l', effort: 3 })];
  const log: Done[] = [
    { choreId: 'd', memberId: 's', day: '2026-11-23' },
    { choreId: 'l', memberId: 's', day: '2026-11-24' },
    { choreId: 'd', memberId: 'a', day: '2026-11-24' },
    { choreId: 'l', memberId: 'k', day: '2026-11-24' },
    { choreId: 'l', memberId: 'a', day: '2026-11-10' }, // outside the week
  ];
  const f = fairness([sam, alex, kid], chores, log, '2026-11-23', '2026-11-29');
  expect(f.map((x) => [x.member.name, x.points])).toEqual([['Sam', 5], ['Alex', 2]]);
  expect(fairnessNote(f)).toBe('Sam is carrying 71% this week. Could anything move next week?');
  expect(fairnessNote([{ member: sam, points: 3, share: 0.5 }, { member: alex, points: 3, share: 0.5 }])).toBe('Nicely balanced this week.');
});

test('renewals roll on correctly', () => {
  expect(nextDue({ id: 'r', name: 'MOT', emoji: '', due: '2026-02-28', repeat: 'yearly' })).toBe('2027-02-28');
  expect(nextDue({ id: 'r', name: 'Passport', emoji: '', due: '2030-01-01', repeat: 'once' })).toBeNull();
  expect(currentDue({ id: 'b', name: 'Bin day', emoji: '', due: '2026-11-03', repeat: 'weekly' }, '2026-11-23')).toBe('2026-11-24');
});

test('Family Bank balances, interest and spending', () => {
  const e = [
    { id: '1', kidId: 'k', day: '2026-11-20', amount: 200, note: 'Tidy room' },
    { id: '2', kidId: 'k', day: '2026-11-21', amount: -50, note: 'Sweets' },
    { id: '3', kidId: 'x', day: '2026-11-21', amount: 999, note: '' },
  ];
  expect(balance('k', e)).toBe(150);
  expect(interest(150, 2)).toBe(3);
  expect(interest(-10, 2)).toBe(0);
  expect(spendError(150, 200)).toMatch(/more than the balance/);
  expect(spendError(150, 100)).toBeNull();
});

test('social battery lines are kind', () => {
  expect(batteryLine('Sam', 20)).toContain('Tea and quiet');
  expect(batteryLine('Sam', 50)).toBe("Sam's social battery is at 50% today.");
});

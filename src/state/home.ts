import { todayKey, type DayKey } from '@/kit/dates';
import type { Pence } from '@/kit/money';
import { persisted, uid } from '@/kit/store';
import { nextDue, type BankEntry, type CheckIn, type Chore, type Done, type Member, type Renewal } from '@/domain/home';

type HomeState = {
  members: Member[];
  chores: Chore[];
  log: Done[];
  renewals: Renewal[];
  bank: BankEntry[];
  bankRate: number; // % a week
  lastInterest: DayKey | null;
  checkIns: CheckIn[];
  addMember: (m: Omit<Member, 'id'>) => string;
  removeMember: (id: string) => void;
  saveChore: (c: Omit<Chore, 'id'> & { id?: string }) => string;
  removeChore: (id: string) => void;
  markDone: (choreId: string, memberId: string) => Done;
  undoDone: (d: Done) => void;
  addRenewal: (r: Omit<Renewal, 'id'>) => void;
  renewed: (id: string) => void;
  removeRenewal: (id: string) => void;
  bankAdd: (kidId: string, amount: Pence, note: string) => void;
  setBankRate: (r: number) => void;
  payInterest: (amounts: { kidId: string; amount: Pence }[]) => void;
  checkIn: (c: Omit<CheckIn, 'id' | 'day'>) => void;
};

export const useHome = persisted<HomeState>('reset.home', 1, (set, get) => ({
  members: [],
  chores: [],
  log: [],
  renewals: [],
  bank: [],
  bankRate: 0,
  lastInterest: null,
  checkIns: [],
  addMember: (m) => {
    const id = uid('m');
    set((s) => ({ members: [...s.members, { ...m, id }] }));
    return id;
  },
  removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
  saveChore: (c) => {
    const id = c.id ?? uid('c');
    set((s) => ({ chores: s.chores.some((x) => x.id === id) ? s.chores.map((x) => (x.id === id ? { ...c, id } : x)) : [...s.chores, { ...c, id }] }));
    return id;
  },
  removeChore: (id) => set((s) => ({ chores: s.chores.filter((c) => c.id !== id) })),
  markDone: (choreId, memberId) => {
    const d: Done = { choreId, memberId, day: todayKey() };
    const s = get();
    const chore = s.chores.find((c) => c.id === choreId);
    const kid = s.members.find((m) => m.id === memberId && m.kind === 'kid');
    const pay = kid && chore && chore.reward > 0 ? [{ id: uid('b'), kidId: kid.id, day: d.day, amount: chore.reward, note: chore.name }] : [];
    set({ log: [...s.log, d], bank: [...s.bank, ...pay] });
    return d;
  },
  undoDone: (d) =>
    set((s) => {
      const chore = s.chores.find((c) => c.id === d.choreId);
      const i = s.log.findIndex((x) => x.choreId === d.choreId && x.memberId === d.memberId && x.day === d.day);
      const j = chore ? s.bank.findIndex((b) => b.kidId === d.memberId && b.day === d.day && b.note === chore.name && b.amount === chore.reward) : -1;
      return { log: s.log.filter((_, k) => k !== i), bank: j >= 0 ? s.bank.filter((_, k) => k !== j) : s.bank };
    }),
  addRenewal: (r) => set((s) => ({ renewals: [...s.renewals, { ...r, id: uid('r') }] })),
  renewed: (id) =>
    set((s) => ({
      renewals: s.renewals.flatMap((r) => {
        if (r.id !== id) return [r];
        const n = nextDue(r);
        return n ? [{ ...r, due: n }] : [];
      }),
    })),
  removeRenewal: (id) => set((s) => ({ renewals: s.renewals.filter((r) => r.id !== id) })),
  bankAdd: (kidId, amount, note) => set((s) => ({ bank: [...s.bank, { id: uid('b'), kidId, day: todayKey(), amount, note }] })),
  setBankRate: (bankRate) => set({ bankRate }),
  payInterest: (amounts) =>
    set((s) => ({
      lastInterest: todayKey(),
      bank: [...s.bank, ...amounts.filter((a) => a.amount > 0).map((a) => ({ id: uid('b'), kidId: a.kidId, day: todayKey(), amount: a.amount, note: 'Savings interest' }))],
    })),
  checkIn: (c) => set((s) => ({ checkIns: [...s.checkIns, { ...c, id: uid('ci'), day: todayKey() }].slice(-500) })),
}));

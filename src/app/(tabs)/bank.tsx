import { useState } from 'react';
import { diffDays, formatDay, todayKey } from '@/kit/dates';
import { MoneyField } from '@/kit/inputs';
import { formatGBP, type Pence } from '@/kit/money';
import { PaywallSheet } from '@/kit/Paywall';
import { usePremium } from '@/kit/premium';
import { Body, Button, Card, EmptyState, Field, H1, H2, Muted, Note, Row, Screen, Sheet, Stack, Strong } from '@/kit/ui';
import { balance, interest, spendError, type Member } from '@/domain/home';
import { useHome } from '@/state/home';

export default function Bank() {
  const h = useHome();
  const { isPremium } = usePremium();
  const [paywall, setPaywall] = useState(false);
  const [kid, setKid] = useState<{ m: Member; mode: 'add' | 'spend' } | null>(null);
  const [amount, setAmount] = useState<Pence | null>(null);
  const [note, setNote] = useState('');
  const today = todayKey();
  const kids = h.members.filter((m) => m.kind === 'kid');

  if (!isPremium) {
    return (
      <Screen testID="bank">
        <H1>Family Bank</H1>
        <EmptyState icon="wallet-outline" title="Pocket money, the fun way" body="Kids earn virtual pocket money for chores, save it, earn 'interest' and spend it in the family shop. No real money ever moves." action={<Button title="See Premium" onPress={() => setPaywall(true)} testID="bank-premium" />} />
        <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} reason="The Family Bank is part of Reset Premium, for the whole household." />
      </Screen>
    );
  }
  const canPayInterest = h.bankRate > 0 && (!h.lastInterest || diffDays(h.lastInterest, today) >= 7);
  return (
    <Screen testID="bank">
      <H1>Family Bank</H1>
      <Note>Virtual money only. Nothing is paid in or out of any real account.</Note>
      {kids.length === 0 ? <EmptyState icon="happy-outline" title="No children added" body="Add a child in Settings, then give chores a reward." /> : null}
      {kids.map((m) => {
        const bal = balance(m.id, h.bank);
        const recent = h.bank.filter((e) => e.kidId === m.id).slice(-4).reverse();
        return (
          <Card key={m.id} testID={`kid-${m.name}`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <H2>{`${m.emoji} ${m.name}`}</H2>
              <Strong testID={`balance-${m.name}`}>{formatGBP(bal)}</Strong>
            </Row>
            {recent.map((e) => (
              <Muted key={e.id}>{`${formatDay(e.day)} · ${e.note} · ${formatGBP(e.amount, { sign: e.amount > 0 })}`}</Muted>
            ))}
            <Row gap={8}>
              <Button small title="Add" icon="add" onPress={() => { setAmount(null); setNote(''); setKid({ m, mode: 'add' }); }} testID={`add-${m.name}`} />
              <Button small variant="secondary" title="Spend" icon="cart-outline" onPress={() => { setAmount(null); setNote(''); setKid({ m, mode: 'spend' }); }} testID={`spend-${m.name}`} />
            </Row>
          </Card>
        );
      })}
      {kids.length ? (
        <Card>
          <Strong>{`Savings interest: ${h.bankRate}% a week`}</Strong>
          <Muted>A way to show how saving grows. Set the rate in Settings.</Muted>
          {canPayInterest ? <Button small title="Pay this week's interest" onPress={() => h.payInterest(kids.map((k) => ({ kidId: k.id, amount: interest(balance(k.id, h.bank), h.bankRate) })))} /> : null}
        </Card>
      ) : null}
      <Sheet visible={!!kid} onClose={() => setKid(null)} title={kid ? `${kid.mode === 'add' ? 'Add to' : 'Spend from'} ${kid.m.name}'s jar` : ''}>
        <Stack>
          <MoneyField label="Amount" value={amount} onChange={setAmount} testID="bank-amount" />
          <Field label={kid?.mode === 'add' ? 'What for?' : 'What are they buying?'} value={note} onChangeText={setNote} maxLength={30} testID="bank-note" />
          {kid?.mode === 'spend' && amount ? <Body>{spendError(balance(kid.m.id, h.bank), amount) ?? ''}</Body> : null}
          <Button
            title="Save"
            testID="bank-save"
            disabled={!amount || (kid?.mode === 'spend' && !!spendError(balance(kid.m.id, h.bank), amount))}
            onPress={() => {
              if (!kid || !amount) return;
              h.bankAdd(kid.m.id, kid.mode === 'add' ? amount : -amount, note.trim() || (kid.mode === 'add' ? 'Bonus' : 'Spent'));
              setKid(null);
            }}
          />
        </Stack>
      </Sheet>
    </Screen>
  );
}

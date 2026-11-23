import { useState } from 'react';
import { Text } from 'react-native';
import { addDays, formatDay, relativeDay, todayKey } from '@/kit/dates';
import { DateStepper } from '@/kit/inputs';
import { PaywallSheet } from '@/kit/Paywall';
import { usePremium } from '@/kit/premium';
import { Button, Card, Chip, EmptyState, H1, IconButton, Muted, Row, Screen, Section, Sheet, Stack, Strong } from '@/kit/ui';
import { currentDue, RENEWAL_PRESETS } from '@/domain/home';
import { useHome } from '@/state/home';

export default function Admin() {
  const h = useHome();
  const { isPremium } = usePremium();
  const [paywall, setPaywall] = useState(false);
  const [preset, setPreset] = useState<(typeof RENEWAL_PRESETS)[number] | null>(null);
  const today = todayKey();
  const [due, setDue] = useState(addDays(today, 30));

  if (!isPremium) {
    return (
      <Screen testID="admin">
        <H1>Household admin</H1>
        <EmptyState icon="calendar-outline" title="Never miss a renewal" body="MOT, car tax, insurance, TV licence, passports and bin day in one calendar, with a reminder before each." action={<Button title="See Premium" onPress={() => setPaywall(true)} testID="admin-premium" />} />
        <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} reason="The admin calendar is part of Reset Premium, for the whole household." />
      </Screen>
    );
  }
  const sorted = [...h.renewals].sort((a, b) => (currentDue(a, today) < currentDue(b, today) ? -1 : 1));
  return (
    <Screen testID="admin">
      <H1>Household admin</H1>
      <Section title="Add">
        <Row wrap gap={8}>
          {RENEWAL_PRESETS.map((p) => (
            <Chip key={p.name} label={`${p.emoji} ${p.name}`} onPress={() => { setPreset(p); setDue(addDays(today, p.repeat === 'weekly' ? 1 : 30)); }} testID={`preset-${p.name}`} />
          ))}
        </Row>
      </Section>
      {sorted.length === 0 ? <EmptyState icon="checkmark-done-outline" title="Nothing tracked yet" body="Tap one of the above to add it." /> : null}
      {sorted.map((r) => {
        const d = currentDue(r, today);
        return (
          <Card key={r.id} testID={`renewal-${r.name}`}>
            <Row gap={10}>
              <Text style={{ fontSize: 24 }}>{r.emoji}</Text>
              <Stack gap={2} style={{ flex: 1 }}>
                <Strong>{r.name}</Strong>
                <Muted>{`${formatDay(d)} · ${relativeDay(d, today)}`}</Muted>
              </Stack>
              {r.repeat !== 'weekly' ? <Button small variant="secondary" title="Renewed" onPress={() => h.renewed(r.id)} testID={`renewed-${r.name}`} /> : null}
              <IconButton icon="trash-outline" label={`Remove ${r.name}`} onPress={() => h.removeRenewal(r.id)} />
            </Row>
          </Card>
        );
      })}
      <Sheet visible={!!preset} onClose={() => setPreset(null)} title={preset ? `${preset.emoji} ${preset.name}` : ''}>
        <Stack>
          <DateStepper label={preset?.repeat === 'weekly' ? 'Next collection' : 'Due on'} value={due} onChange={setDue} min={today} testID="renewal-due" />
          <Row wrap gap={8}>
            {[7, 30, 90, 365].map((n) => (
              <Chip key={n} label={n === 365 ? 'In a year' : `In ${n} days`} onPress={() => setDue(addDays(today, n))} />
            ))}
          </Row>
          <Button title="Add" testID="renewal-save" onPress={() => { if (preset) h.addRenewal({ name: preset.name, emoji: preset.emoji, repeat: preset.repeat, due }); setPreset(null); }} />
        </Stack>
      </Sheet>
    </Screen>
  );
}

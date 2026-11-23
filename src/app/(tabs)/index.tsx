import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { formatDay, relativeDay, todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { Body, Button, Card, Chip, H1, H2, Label, Muted, Row, Screen, Section, Sheet, Stack, Strong, Toggle } from '@/kit/ui';
import { batteryLine, currentDue, doneOn, isDue, MOODS, type Chore } from '@/domain/home';
import { AddMember } from '@/components/AddMember';
import { useHome } from '@/state/home';

const BATTERY = [0, 20, 40, 60, 80, 100];

export default function Home() {
  const h = useHome();
  const { toast } = useFeedback();
  const celebrate = useCelebrate();
  const today = todayKey();
  const [who, setWho] = useState<Chore | null>(null);
  const [checking, setChecking] = useState(false);
  const [ci, setCi] = useState({ memberId: '', mood: 3, energy: 3, battery: 60, shared: false });

  if (!h.members.length) {
    return (
      <Screen testID="home">
        <H1>Welcome home</H1>
        <Body>{"Let's start with you. You can add everyone else after."}</Body>
        <Card>
          <AddMember firstRun />
        </Card>
      </Screen>
    );
  }

  const due = h.chores.filter((ch) => isDue(ch, today, h.log));
  const shared = h.checkIns.filter((x) => x.day === today && x.shared);
  const nextRenewal = [...h.renewals].sort((a, b) => (currentDue(a, today) < currentDue(b, today) ? -1 : 1))[0];
  const done = (ch: Chore, memberId: string) => {
    const d = h.markDone(ch.id, memberId);
    const m = h.members.find((x) => x.id === memberId)!;
    track('core_action_completed', { what: 'chore', kid: m.kind === 'kid' });
    if (m.kind === 'kid' && ch.reward > 0) celebrate({ scene: 'bank', emoji: '🪙', title: 'Pay day!', body: `${m.name}'s card taps and coins rain into the jar.` });
    else toast(`${ch.emoji} ${ch.name}: done by ${m.name}.`, { actionLabel: 'Undo', onAction: () => useHome.getState().undoDone(d) });
    setWho(null);
  };

  return (
    <Screen testID="home">
      <Stack gap={2}>
        <Muted>{formatDay(today, 'long')}</Muted>
        <H1>Today at home</H1>
      </Stack>

      <Card tone="alt" testID="checkin-card">
        <Strong>How are you today?</Strong>
        <Muted>20 seconds. Private unless you share it with the household.</Muted>
        <Button small title="Check in" icon="pulse-outline" onPress={() => { setCi({ ...ci, memberId: h.members[0].id }); setChecking(true); }} testID="checkin-open" />
        {shared.map((x) => {
          const m = h.members.find((mm) => mm.id === x.memberId);
          return m ? <Body key={x.id}>{`${MOODS[x.mood - 1]} ${batteryLine(m.name, x.battery)}`}</Body> : null;
        })}
      </Card>

      <Section title={`Chores today (${due.filter((ch) => doneOn(ch.id, today, h.log)).length}/${due.length})`}>
        {due.length === 0 ? <Muted>Nothing due today. Add chores on the Chores tab.</Muted> : null}
        {due.map((ch) => {
          const d = doneOn(ch.id, today, h.log);
          const by = d ? h.members.find((m) => m.id === d.memberId) : null;
          const assignee = h.members.find((m) => m.id === ch.assignee);
          return (
            <Card key={ch.id} testID={`chore-${ch.name}`}>
              <Row gap={10}>
                <Text style={{ fontSize: 26 }}>{ch.emoji}</Text>
                <Stack gap={2} style={{ flex: 1 }}>
                  <Strong>{ch.name}</Strong>
                  <Muted>{d ? `Done by ${by?.name ?? 'someone'} ✓` : assignee ? `${assignee.name}'s turn` : 'Anyone'}</Muted>
                </Stack>
                {d ? (
                  <Button small variant="ghost" title="Undo" onPress={() => h.undoDone(d)} />
                ) : (
                  <Button small title="Done" onPress={() => (h.members.length === 1 ? done(ch, h.members[0].id) : setWho(ch))} testID={`done-${ch.name}`} />
                )}
              </Row>
            </Card>
          );
        })}
      </Section>

      {nextRenewal ? (
        <Card onPress={() => router.push('/admin')} accessibilityLabel={`Next up: ${nextRenewal.name}, ${relativeDay(currentDue(nextRenewal, today), today)}`}>
          <Label>Next up</Label>
          <Strong>{`${nextRenewal.emoji} ${nextRenewal.name} · ${relativeDay(currentDue(nextRenewal, today), today)}`}</Strong>
        </Card>
      ) : null}

      <Sheet visible={!!who} onClose={() => setWho(null)} title={`Who did ${who?.name ?? ''}?`}>
        <Row wrap gap={8}>
          {h.members.map((m) => (
            <Chip key={m.id} label={`${m.emoji} ${m.name}`} onPress={() => who && done(who, m.id)} testID={`who-${m.name}`} />
          ))}
        </Row>
      </Sheet>

      <Sheet visible={checking} onClose={() => setChecking(false)} title="Check in">
        <Stack>
          {h.members.length > 1 ? (
            <Row wrap gap={8}>
              {h.members.map((m) => (
                <Chip key={m.id} label={`${m.emoji} ${m.name}`} selected={ci.memberId === m.id} onPress={() => setCi({ ...ci, memberId: m.id })} />
              ))}
            </Row>
          ) : null}
          <H2>Mood</H2>
          <Row gap={6} style={{ justifyContent: 'space-between' }}>
            {MOODS.map((e, i) => (
              <Chip key={e} label={e} selected={ci.mood === i + 1} onPress={() => setCi({ ...ci, mood: i + 1 })} testID={`mood-${i + 1}`} />
            ))}
          </Row>
          <H2>Social battery</H2>
          <Row wrap gap={6}>
            {BATTERY.map((b) => (
              <Chip key={b} label={`${b}%`} selected={ci.battery === b} onPress={() => setCi({ ...ci, battery: b })} testID={`battery-${b}`} />
            ))}
          </Row>
          <Toggle label="Share with my household" hint="Shows on this phone's home screen today." value={ci.shared} onChange={(v) => setCi({ ...ci, shared: v })} testID="checkin-share" />
          <Button
            title="Save check-in"
            testID="checkin-save"
            onPress={() => {
              h.checkIn(ci);
              track('core_action_completed', { what: 'check_in', shared: ci.shared });
              setChecking(false);
              if (ci.battery <= 20) celebrate({ scene: 'battery-low', emoji: '☕', title: 'Low battery', body: 'A rain cloud, an umbrella and a cup of tea. Go gently today.' });
              else celebrate({ scene: 'checkin', emoji: '🧘', title: 'Checked in', body: 'The stickman floats up and a bird lands on his head.' });
            }}
          />
        </Stack>
      </Sheet>
      <Muted center>Everything stays on this phone. Syncing between phones is coming.</Muted>
    </Screen>
  );
}

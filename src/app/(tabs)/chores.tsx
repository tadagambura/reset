import { useState } from 'react';
import { Text } from 'react-native';
import { AdBanner } from '@/kit/ads';
import { addDays, startOfWeek, todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { MoneyField } from '@/kit/inputs';
import { formatGBP, type Pence } from '@/kit/money';
import { useTheme } from '@/kit/theme';
import { Button, Card, Chip, Field, H1, IconButton, Muted, ProgressBar, Row, Screen, Section, Segmented, Sheet, Stack, Strong } from '@/kit/ui';
import { fairness, fairnessNote, type Chore, type Schedule } from '@/domain/home';
import { useHome } from '@/state/home';

const EMOJIS = ['🍽️', '🧺', '🧹', '🗑️', '🛏️', '🛒', '🐶', '🪴', '🚿', '🍳'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const describe = (s: Schedule) => (s.type === 'daily' ? 'Every day' : s.type === 'weekly' ? `Every ${DAYS[s.day]}` : `Every ${s.days} days`);

export default function Chores() {
  const { c } = useTheme();
  const h = useHome();
  const { toast } = useFeedback();
  const today = todayKey();
  const mon = startOfWeek(today);
  const shares = fairness(h.members, h.chores, h.log, mon, addDays(mon, 6));
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [effort, setEffort] = useState<'1' | '2' | '3'>('2');
  const [kind, setKind] = useState<'daily' | 'weekly' | 'every'>('daily');
  const [day, setDay] = useState(6);
  const [every, setEvery] = useState('3');
  const [assignee, setAssignee] = useState<string | null>(null);
  const [reward, setReward] = useState<Pence | null>(0);
  const kids = h.members.filter((m) => m.kind === 'kid');

  const save = () => {
    if (!name.trim()) return;
    const schedule: Schedule = kind === 'daily' ? { type: 'daily' } : kind === 'weekly' ? { type: 'weekly', day } : { type: 'every', days: Math.max(2, Math.min(60, Number(every) || 3)) };
    h.saveChore({ name: name.trim(), emoji, effort: Number(effort) as Chore['effort'], schedule, assignee, reward: reward ?? 0 });
    setOpen(false);
    setName('');
    toast('Chore added.');
  };

  return (
    <Screen testID="chores" banner={<AdBanner placement="chores_banner" />}>
      <H1>Chores</H1>
      <Section title="Who's carrying the load this week">
        <Card testID="fairness">
          {shares.map((s) => (
            <Stack key={s.member.id} gap={4}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Strong>{`${s.member.emoji} ${s.member.name}`}</Strong>
                <Muted>{`${s.points} pts · ${Math.round(s.share * 100)}%`}</Muted>
              </Row>
              <ProgressBar value={s.share} label={`${s.member.name}'s share`} color={c.accent} />
            </Stack>
          ))}
          <Muted testID="fairness-note">{fairnessNote(shares)}</Muted>
        </Card>
      </Section>
      <Button title="Add a chore" icon="add" onPress={() => setOpen(true)} testID="chore-add" />
      {h.chores.map((ch) => {
        const who = h.members.find((m) => m.id === ch.assignee);
        return (
          <Card key={ch.id}>
            <Row gap={10}>
              <Text style={{ fontSize: 24 }}>{ch.emoji}</Text>
              <Stack gap={2} style={{ flex: 1 }}>
                <Strong>{ch.name}</Strong>
                <Muted>{`${describe(ch.schedule)} · ${'●'.repeat(ch.effort)} effort${who ? ` · ${who.name}` : ''}${ch.reward ? ` · earns ${formatGBP(ch.reward)}` : ''}`}</Muted>
              </Stack>
              <IconButton icon="trash-outline" label={`Delete ${ch.name}`} onPress={() => h.removeChore(ch.id)} />
            </Row>
          </Card>
        );
      })}
      <Sheet visible={open} onClose={() => setOpen(false)} title="New chore">
        <Stack>
          <Field label="Chore" value={name} onChangeText={setName} placeholder="e.g. Empty the dishwasher" maxLength={30} testID="chore-name" />
          <Row wrap gap={6}>
            {EMOJIS.map((e) => (
              <Chip key={e} label={e} selected={emoji === e} onPress={() => setEmoji(e)} />
            ))}
          </Row>
          <Segmented label="How often" options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'every', label: 'Every few days' }]} value={kind} onChange={setKind} />
          {kind === 'weekly' ? (
            <Row wrap gap={6}>
              {DAYS.map((d, i) => (
                <Chip key={d} label={d} selected={day === i} onPress={() => setDay(i)} />
              ))}
            </Row>
          ) : null}
          {kind === 'every' ? <Field label="Every how many days?" value={every} onChangeText={setEvery} inputMode="numeric" keyboardType="number-pad" maxLength={2} /> : null}
          <Segmented label="Effort" options={[{ value: '1', label: 'Quick' }, { value: '2', label: 'Medium' }, { value: '3', label: 'Big job' }]} value={effort} onChange={setEffort} />
          <Muted>Whose job?</Muted>
          <Row wrap gap={6}>
            <Chip label="Anyone" selected={assignee == null} onPress={() => setAssignee(null)} />
            {h.members.map((m) => (
              <Chip key={m.id} label={`${m.emoji} ${m.name}`} selected={assignee === m.id} onPress={() => setAssignee(m.id)} />
            ))}
          </Row>
          {kids.length ? <MoneyField label="Family Bank reward when a child does it (virtual)" value={reward} onChange={setReward} testID="chore-reward" /> : null}
          <Button title="Save chore" disabled={!name.trim()} onPress={save} testID="chore-save" />
        </Stack>
      </Sheet>
    </Screen>
  );
}

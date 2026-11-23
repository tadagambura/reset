import { useState } from 'react';
import { KitSettings } from '@/kit/Settings';
import { Card, Chip, ListRow, Muted, Row, Section, Sheet } from '@/kit/ui';
import { AddMember } from '@/components/AddMember';
import { useHome } from '@/state/home';

export default function Settings() {
  const h = useHome();
  const [adding, setAdding] = useState(false);
  return (
    <KitSettings reminder={{ title: 'Reset', body: "A 20-second check-in, and today's chores are waiting.", explain: 'One gentle reminder a day. Never more.' }}>
      <Section title="Household">
        <Card>
          {h.members.map((m) => (
            <ListRow key={m.id} title={`${m.emoji} ${m.name}`} subtitle={m.kind === 'kid' ? 'Child' : 'Adult'} right={h.members.length > 1 ? <Chip label="Remove" onPress={() => h.removeMember(m.id)} /> : undefined} />
          ))}
          <ListRow icon="person-add-outline" title="Add someone" onPress={() => setAdding(true)} testID="settings-add-member" />
          <Muted>Everyone shares this phone for now. Sharing between phones is coming with sync.</Muted>
        </Card>
      </Section>
      <Section title="Family Bank interest">
        <Row wrap gap={8}>
          {[0, 1, 2, 5].map((r) => (
            <Chip key={r} label={r === 0 ? 'Off' : `${r}% a week`} selected={h.bankRate === r} onPress={() => h.setBankRate(r)} />
          ))}
        </Row>
      </Section>
      <Sheet visible={adding} onClose={() => setAdding(false)} title="Add to household">
        <AddMember onDone={() => setAdding(false)} />
      </Sheet>
    </KitSettings>
  );
}

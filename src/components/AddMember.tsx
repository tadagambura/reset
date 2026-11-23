import { useState } from 'react';
import { Button, Chip, Field, Muted, Row, Segmented, Stack } from '@/kit/ui';
import { useHome } from '@/state/home';

const EMOJIS = ['🧔', '👩', '🧑', '👨', '👵', '👴', '🧒', '👧', '👦', '🐶'];

export function AddMember({ onDone, firstRun }: { onDone?: () => void; firstRun?: boolean }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [kind, setKind] = useState<'adult' | 'kid'>('adult');
  const save = () => {
    if (!name.trim()) return;
    useHome.getState().addMember({ name: name.trim(), emoji, kind });
    setName('');
    onDone?.();
  };
  return (
    <Stack>
      <Field label={firstRun ? 'Your first name or nickname' : 'Name or nickname'} value={name} onChangeText={setName} maxLength={16} testID="member-name" />
      <Segmented label="Adult or child" options={[{ value: 'adult', label: 'Adult' }, { value: 'kid', label: 'Child' }]} value={kind} onChange={setKind} testID="member-kind" />
      {kind === 'kid' ? <Muted>For children we only keep a first name or nickname. Their screens never show ads.</Muted> : null}
      <Row wrap gap={6}>
        {EMOJIS.map((e) => (
          <Chip key={e} label={e} selected={emoji === e} onPress={() => setEmoji(e)} />
        ))}
      </Row>
      <Button title={firstRun ? "That's me" : 'Add to household'} disabled={!name.trim()} onPress={save} testID="member-save" />
    </Stack>
  );
}

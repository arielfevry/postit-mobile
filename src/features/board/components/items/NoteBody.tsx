import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { NoteContent } from '@/features/board/types';
import { PB, shadow } from '@/constants/postit';
import Tape from '../Tape';

interface Props {
  content: NoteContent;
  editing: boolean;
  onText: (text: string) => void;
  onDone: () => void;
}

export default function NoteBody({ content, editing, onText, onDone }: Props) {
    // check if its a sticky or paper
    const sticky  = content.variant === 'sticky';
    return (
        <View
            style={[
                styles.note,
                sticky ? styles.sticky : styles.paper,
                sticky && { backgroundColor: content.color },
            ]}
        >
            <Tape/>
            {!sticky && <Tape corner/>}
            <View style={styles.clip}>
                {editing ? (
                <TextInput
                    style={[styles.text, styles.input]}
                    value={content.text}
                    onChangeText={onText}
                    onBlur={onDone}
                    placeholder="Write something…"
                    placeholderTextColor="rgba(42, 36, 32, 0.4)"
                    multiline
                    autoFocus
                    scrollEnabled={false}
                />
                ) : (
                <Text style={[styles.text, !content.text && styles.placeholder]}>
                    {content.text || 'Double-tap to write'}
                </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  note: { flex: 1, ...shadow },
  sticky: { paddingTop: 22, paddingHorizontal: 16, paddingBottom: 14 },
  paper: { paddingTop: 26, paddingHorizontal: 20, paddingBottom: 18, backgroundColor: '#f7f5f0' },
  clip: { flex: 1, overflow: 'hidden' },
  text: { fontFamily: PB.hand, fontSize: 19, lineHeight: 24, color: PB.noteInk },
  input: { flex: 1, padding: 0, textAlignVertical: 'top' },
  placeholder: { color: 'rgba(42, 36, 32, 0.4)' },
});
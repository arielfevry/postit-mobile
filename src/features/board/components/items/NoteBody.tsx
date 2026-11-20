import { View, Text, StyleSheet } from 'react-native';
import type { NoteContent } from '@/features/board/types';
import { PB, shadow } from '@/constants/postit';
import Tape from '../Tape';

export default function NoteBody({ content }: { content: NoteContent }) {
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
                <Text style={[styles.text, !content.text && styles.placeholder]}>
                    {content.text || 'Double-tap to write'}
                </Text>
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
  placeholder: { color: 'rgba(42, 36, 32, 0.4)' },
});
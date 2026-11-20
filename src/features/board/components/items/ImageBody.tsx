import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { ImageContent } from '@/features/board/types';
import { PB, shadow } from '@/constants/postit';
import Tape from '../Tape';

export default function ImageBody({ content }: { content: ImageContent}){
    // if loading image fails setFailed will trigger a redraw
    const [failed, setFailed] = useState(false);
    return (
        <View style={styles.photo}>
            <Tape />
            {/* If image load fails display grey box */}
            { failed ? (
                <View style={styles.broken}>
                    <Text style={styles.brokenText}>Image could not be loaded</Text>
                </View>
            ) : (
                <Image
                    source={{ uri: content.src}}
                    style={styles.img}
                    resizeMode="cover"
                    onError={() => setFailed(true)}
                />
            )}
            {!!content.caption && (
                <Text style={styles.caption} numberOfLines={1}>{content.caption}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  photo: { flex: 1, padding: 10, backgroundColor: '#fbfaf7', ...shadow },
  img: { flex: 1, width: '100%', backgroundColor: '#ddd' },
  broken: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee9e2' },
  brokenText: { color: PB.muted, fontSize: 12 },
  caption: { paddingTop: 6, fontFamily: PB.hand, fontSize: 17, textAlign: 'center', color: PB.noteInk },
});
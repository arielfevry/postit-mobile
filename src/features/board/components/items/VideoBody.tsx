import { View, Text, Image, Pressable, Linking, StyleSheet } from 'react-native';
import type { VideoContent } from '@/features/board/types';
import { PB, shadow } from '@/constants/postit';
import { platformApiLevel } from 'expo-device';

export default function VideoBody({ content }: { content: VideoContent}) {
    return (
        <View style={styles.card}>
            <Pressable style={styles.player} onPress={() => Linking.openURL(content.url)}>
                <Image 
                    source={{ uri: `https://img.youtube.com/vi/${content.videoId}/hqdefault.jpg` }}
                    style={styles.thumb}
                    resizeMode='cover'
                />
            </Pressable>
            <View style={styles.meta}>
                <View style={styles.urlRow}>
                    <View style={styles.dot} />
                    <Text style={styles.url} numberOfLines={1}>youtu.be/{content.videoId}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{content.title || 'YouTube video'}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#fff', overflow: 'hidden', ...shadow },
  player: { flex: 1, backgroundColor: '#000' },
  thumb: { flex: 1, width: '100%' },
  meta: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 14, height: 10, borderRadius: 3, backgroundColor: '#ff0000' },
  url: { flex: 1, color: PB.muted, fontSize: 11 },
  title: { marginTop: 2, color: '#d6302a', fontWeight: '600', fontSize: 12 },
});
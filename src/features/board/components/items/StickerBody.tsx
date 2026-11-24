import { View, Text } from 'react-native';
import type { StickerContent } from '@/features/board/types';

export default function StickerBody({ content }: { content: StickerContent }) {
  const size = Math.min(content.w, content.h) * 0.74;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size, lineHeight: size * 1.2 }}>{content.emoji}</Text>
    </View>
  );
}
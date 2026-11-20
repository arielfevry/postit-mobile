import { View } from 'react-native';
import type { CanvasItem } from '@/features/board/types';
import NoteBody from './items/NoteBody';
import ImageBody from './items/ImageBody';
import VideoBody from './items/VideoBody';
import StickerBody from './items/StickerBody';

export default function CanvasElement({ item }: { item: CanvasItem }) {
  const { x, y, w, h, rotation, z } = item.content;

  let body;
  switch (item.type) {
    case 'text': body = <NoteBody content={item.content} />; break;
    case 'image': body = <ImageBody content={item.content} />; break;
    case 'link': body = <VideoBody content={item.content} />; break;
    case 'sticker': body = <StickerBody content={item.content} />; break;
  }

  return (
    <View
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z,
        transform: [{ rotate: `${rotation}deg` }],
      }}
    >
      {body}
    </View>
  );
}
import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { CanvasItem } from '@/features/board/types';
import NoteBody from './items/NoteBody';
import ImageBody from './items/ImageBody';
import VideoBody from './items/VideoBody';
import StickerBody from './items/StickerBody';
import SelectionBox from './SelectionBox';

interface Props {
  item: CanvasItem;
  selected: boolean;
  editing: boolean;
  zoom: SharedValue<number>;
  onText: (text: string) => void;
  onDone: () => void;
}

export default function CanvasElement({ item, selected, editing, zoom, onText, onDone }: Props ) {
  const { x, y, w, h, rotation, z } = item.content;

  let body;
  switch (item.type) {
    case 'text': body = <NoteBody content={item.content} editing={editing} onText={onText} onDone={onDone} />; break;
    case 'image': body = <ImageBody content={item.content} />; break;
    case 'link': body = <VideoBody content={item.content} />; break;
    case 'sticker': body = <StickerBody content={item.content} />; break;
  }

  return (
    <View
      pointerEvents={editing ? 'auto' : 'none'}
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z,
        transform: [{ rotate: `${rotation}deg` }],
      }}
    >
      {body}
      {selected && !editing && <SelectionBox w={w} h={h} zoom={zoom} />}
    </View>
  );
}
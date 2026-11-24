/**
 * Resize and rotation for canvas elements allowing users to arrange and edit board items 
 */

import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { HANDLES } from '../utils';
import type { Handle } from '../utils';
import { PB } from '@/constants/postit';

const HANDLE = 14; // screen points
const KNOB = 22;
export const ROT = 44; // how far the rotate knob sits above the top edge (screen points)

export default function SelectionBox({ w, h, zoom }: { w: number; h: number; zoom: SharedValue<number> }) {
  // everything below is divided by the zoom so it stays the same size on screen
  const outline = useAnimatedStyle(() => ({ borderWidth: 1.5 / zoom.value }));
  const counter = useAnimatedStyle(() => ({ transform: [{ scale: 1 / zoom.value }] }));
  const knob = useAnimatedStyle(() => ({ transform: [{ scale: 1 / zoom.value }, { translateY: -ROT }] }));
  const stem = useAnimatedStyle(() => ({ transform: [{ scale: 1 / zoom.value }, { translateY: -ROT / 2 }] }));

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.outline, outline]} />
      {(Object.keys(HANDLES) as Handle[]).map((hd) => {
        const [hx, hy] = HANDLES[hd];
        return (
          <View key={hd} style={[styles.anchor, { left: ((hx + 1) / 2) * w, top: ((hy + 1) / 2) * h }]}>
            <Animated.View style={[styles.handle, counter]} />
          </View>
        );
      })}
      <View style={[styles.anchor, { left: w / 2, top: 0 }]}>
        <Animated.View style={[styles.stem, stem]} />
        <Animated.View style={[styles.knob, knob]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outline: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderColor: PB.select },
  anchor: { position: 'absolute', width: 0, height: 0 },
  handle: {
    position: 'absolute', left: -HANDLE / 2, top: -HANDLE / 2, width: HANDLE, height: HANDLE,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: PB.select, borderRadius: 3,
  },
  stem: { position: 'absolute', left: -0.75, top: -ROT / 2, width: 1.5, height: ROT, backgroundColor: PB.select },
  knob: {
    position: 'absolute', left: -KNOB / 2, top: -KNOB / 2, width: KNOB, height: KNOB,
    borderRadius: KNOB / 2, backgroundColor: PB.select, borderWidth: 2, borderColor: '#fff',
  },
});
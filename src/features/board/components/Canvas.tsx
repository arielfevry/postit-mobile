import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { CanvasItem, Viewport } from '../types';
import { clamp, MAX_ZOOM, MIN_ZOOM } from '../utils';
import CanvasElement from './CanvasElement';
import { PB } from '@/constants/postit';

// gesture depreciated my god 
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
} from 'react-native-gesture-handler';

interface Props {
    items: CanvasItem[];
    initialViewport: Viewport;
    onViewport: (vp: Viewport) => void; // called after gesture to save
}

export default function Canvas({ items, initialViewport, onViewport }: Props) {
  const x = useSharedValue(initialViewport.x);
  const y = useSharedValue(initialViewport.y);
  const zoom = useSharedValue(initialViewport.zoom);
  const start = useRef({ x: 0, y: 0, zoom: 1, fx: 0, fy: 0 });

  const commit = () => onViewport({ x: x.value, y: y.value, zoom: zoom.value });

  const pan = usePanGesture({
  runOnJS: true,
  maxPointers: 1,
  onActivate: () => {
    start.current.x = x.value;
    start.current.y = y.value;
  },
  onUpdate: (e) => {
    x.value = start.current.x + e.translationX;
    y.value = start.current.y + e.translationY;
  },
  onDeactivate: commit,
});

const pinch = usePinchGesture({
  runOnJS: true,
  onActivate: (e) => {
    start.current = { x: x.value, y: y.value, zoom: zoom.value, fx: e.focalX, fy: e.focalY };
  },
  onUpdate: (e) => {
    // when one finger lifts stop updating to prevent snapping effect
    if (e.numberOfPointers < 2) return;

    const z = clamp(start.current.zoom * e.scale, MIN_ZOOM, MAX_ZOOM);
    const k = z / start.current.zoom;
    zoom.value = z;
    x.value = e.focalX - (start.current.fx - start.current.x) * k;
    y.value = e.focalY - (start.current.fy - start.current.y) * k;

  },
  onDeactivate: () => commit(),
});

const gesture = useSimultaneousGestures(pan, pinch);

  const worldStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: zoom.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.surface}>
        <Animated.View style={[styles.world, worldStyle]}>
          {items.map((item) => (
            <CanvasElement key={item._id} item={item} />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1, backgroundColor: PB.page, overflow: 'hidden' },
  world: { position: 'absolute', top: 0, left: 0, width: 0, height: 0 },
});
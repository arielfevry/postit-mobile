import { useEffect, useRef } from 'react';
import { Linking, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { CanvasItem, ContentPatch, Frame, Viewport } from '../types';
import { clamp, HANDLES, normaliseAngle, resizeFrame, MAX_ZOOM, MIN_ZOOM } from '../utils';
import type { Handle } from '../utils';
import CanvasElement from './CanvasElement';
import { ROT } from './SelectionBox';
import { PB } from '@/constants/postit';

// gesture depreciated my god 
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';

const HIT = 26; // how close (screen points) a finger must be to grab a handle
const RAD = Math.PI / 180;

// Images and stickers keep their proportions; notes and videos don't.
const KEEPS_ASPECT: Record<CanvasItem['type'], boolean> = { text: false, image: true, link: false, sticker: true };
const MIN_SIZE: Record<CanvasItem['type'], number> = { text: 80, image: 40, link: 200, sticker: 32 };

type Drag =
  | { kind: 'pan' }
  | { kind: 'move'; item: CanvasItem; frame: Frame }
  | { kind: 'resize'; item: CanvasItem; frame: Frame; handle: Handle }
  | { kind: 'rotate'; item: CanvasItem; frame: Frame; cx: number; cy: number; startAngle: number };

const frameOf = (it: CanvasItem): Frame => {
  const { x, y, w, h, rotation, z } = it.content;
  return { x, y, w, h, rotation, z };
};

// screen point -> board point
const toBoard = (v: Viewport, sx: number, sy: number) => ({ x: (sx - v.x) / v.zoom, y: (sy - v.y) / v.zoom });

// is a board point inside the (rotated) item?
function hits(it: CanvasItem, bx: number, by: number) {
  const { x, y, w, h, rotation } = it.content;
  const t = rotation * RAD;
  const dx = bx - (x + w / 2);
  const dy = by - (y + h / 2);
  const lx = dx * Math.cos(t) + dy * Math.sin(t);
  const ly = -dx * Math.sin(t) + dy * Math.cos(t);
  return Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2;
}

// topmost item under a board point
function pickItem(items: CanvasItem[], bx: number, by: number) {
  let best: CanvasItem | null = null;
  for (const it of items) {
    if (hits(it, bx, by) && (!best || it.content.z >= best.content.z)) best = it;
  }
  return best;
}

// where a point (given in the item's own axes, as an offset from its centre) lands on screen
function toScreen(v: Viewport, it: CanvasItem, lx: number, ly: number) {
  const { x, y, w, h, rotation } = it.content;
  const t = rotation * RAD;
  const bx = x + w / 2 + lx * Math.cos(t) - ly * Math.sin(t);
  const by = y + h / 2 + lx * Math.sin(t) + ly * Math.cos(t);
  return { x: v.x + bx * v.zoom, y: v.y + by * v.zoom };
}

// did the finger land on the rotate knob or a resize handle of this item?
function pickControl(v: Viewport, it: CanvasItem, sx: number, sy: number): 'rotate' | Handle | null {
  const { w, h } = it.content;
  const near = (lx: number, ly: number) => {
    const p = toScreen(v, it, lx, ly);
    return Math.hypot(p.x - sx, p.y - sy) <= HIT;
  };
  if (near(0, -h / 2 - ROT / v.zoom)) return 'rotate';
  for (const hd of Object.keys(HANDLES) as Handle[]) {
    const [hx, hy] = HANDLES[hd];
    if (near((hx * w) / 2, (hy * h) / 2)) return hd;
  }
  return null;
}

interface Props {
  items: CanvasItem[];
  selectedId: string | null;
  initialViewport: Viewport;
  onViewport: (vp: Viewport) => void; // called when a gesture ends (used to save)
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: ContentPatch) => void;
  onBringToFront: (id: string) => void;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
}

export default function Canvas({
  items, selectedId, editingId, initialViewport, onViewport, onSelect, onChange, onBringToFront, onStartEdit, onStopEdit,
}: Props) {
  const x = useSharedValue(initialViewport.x);
  const y = useSharedValue(initialViewport.y);
  const zoom = useSharedValue(initialViewport.zoom);
  const start = useRef({ x: 0, y: 0, zoom: 1, fx: 0, fy: 0 });
  const drag = useRef<Drag | null>(null);

  // gesture callbacks can hold on to old props, so they read the latest from here
  const live = useRef({ items, selectedId, editingId, onSelect, onChange, onBringToFront, onStartEdit });
  live.current = { items, selectedId, editingId, onSelect, onChange, onBringToFront, onStartEdit };

  const view = (): Viewport => ({ x: x.value, y: y.value, zoom: zoom.value });
  const commit = () => onViewport({ x: x.value, y: y.value, zoom: zoom.value });

  /* ---------- tap: select / deselect ---------- */
  const tap = useTapGesture({
    runOnJS: true,
    onActivate: (e) => {
      const v = view();
      const { items: its, selectedId: sid, editingId: eid, onSelect: select } = live.current;
      const sel = its.find((i) => i._id === sid);
      if (sel && !eid && pickControl(v, sel, e.x, e.y)) return; // tapped a handle, not the board
      const b = toBoard(v, e.x, e.y);
      const hit = pickItem(its, b.x, b.y);
      if (!hit) select(null);
      else if (hit._id === sid && hit.type === 'link') Linking.openURL(hit.content.url);
      else select(hit._id);
    },
  });

  const doubleTap = useTapGesture({
    runOnJS: true,
    numberOfTaps: 2,
    onActivate: (e) => {
      const { items: its, onStartEdit: startEdit } = live.current;
      const b = toBoard(view(), e.x, e.y);
      const hit = pickItem(its, b.x, b.y);
      if (hit?.type === 'text') startEdit(hit._id);
    },
  });

  /* ---------- one-finger drag: handle, item, or empty space ---------- */
  const pan = usePanGesture({
    runOnJS: true,
    enabled: editingId === null,
    maxPointers: 1,
    onBegin: (e) => {
      const v = view();
      const { items: its, selectedId: sid } = live.current;
      const sel = its.find((i) => i._id === sid);

      // 1. a handle or the rotate knob of the selected item
      if (sel) {
        const c = pickControl(v, sel, e.x, e.y);
        if (c === 'rotate') {
          const cx = v.x + (sel.content.x + sel.content.w / 2) * v.zoom;
          const cy = v.y + (sel.content.y + sel.content.h / 2) * v.zoom;
          drag.current = {
            kind: 'rotate', item: sel, frame: frameOf(sel), cx, cy,
            startAngle: Math.atan2(e.y - cy, e.x - cx) / RAD,
          };
          return;
        }
        if (c) {
          drag.current = { kind: 'resize', item: sel, frame: frameOf(sel), handle: c };
          return;
        }
      }

      // 2. an item under the finger
      const b = toBoard(v, e.x, e.y);
      const hit = pickItem(its, b.x, b.y);
      if (hit) {
        drag.current = { kind: 'move', item: hit, frame: frameOf(hit) };
        return;
      }

      // 3. empty space: pan the board
      drag.current = { kind: 'pan' };
    },
    onActivate: () => {
      const d = drag.current;
      if (!d) return;
      if (d.kind === 'pan') {
        start.current.x = x.value;
        start.current.y = y.value;
      } else if (d.kind === 'move') {
        live.current.onSelect(d.item._id);
        live.current.onBringToFront(d.item._id);
      }
    },
    onUpdate: (e) => {
      const d = drag.current;
      if (!d || e.numberOfPointers > 1) return; // a second finger means the pinch is in charge
      const z = zoom.value;
      const change = live.current.onChange;
      if (d.kind === 'pan') {
        x.value = start.current.x + e.translationX;
        y.value = start.current.y + e.translationY;
      } else if (d.kind === 'move') {
        change(d.item._id, {
          x: Math.round(d.frame.x + e.translationX / z),
          y: Math.round(d.frame.y + e.translationY / z),
        });
      } else if (d.kind === 'resize') {
        const next = resizeFrame(
          d.frame, d.handle, e.translationX / z, e.translationY / z,
          KEEPS_ASPECT[d.item.type], MIN_SIZE[d.item.type],
        );
        change(d.item._id, {
          x: Math.round(next.x), y: Math.round(next.y), w: Math.round(next.w), h: Math.round(next.h),
        });
      } else {
        const angle = Math.atan2(e.y - d.cy, e.x - d.cx) / RAD;
        let next = normaliseAngle(d.frame.rotation + angle - d.startAngle);
        if (Math.abs(next) < 3) next = 0; // gentle snap back to straight
        change(d.item._id, { rotation: next });
      }
    },
    onDeactivate: () => {
      if (drag.current?.kind === 'pan') commit();
    },
    onFinalize: () => {
      drag.current = null;
    },
  });

  /* ---------- two-finger pinch (unchanged) ---------- */
  const pinch = usePinchGesture({
    runOnJS: true,
    onActivate: (e) => {
      start.current = { x: x.value, y: y.value, zoom: zoom.value, fx: e.focalX, fy: e.focalY };
    },
    onUpdate: (e) => {
      if (e.numberOfPointers < 2) return; // one finger lifted: the midpoint is meaningless
      const z = clamp(start.current.zoom * e.scale, MIN_ZOOM, MAX_ZOOM);
      const k = z / start.current.zoom;
      zoom.value = z;
      x.value = e.focalX - (start.current.fx - start.current.x) * k;
      y.value = e.focalY - (start.current.fy - start.current.y) * k;
    },
    onDeactivate: commit,
  });

  const gesture = useSimultaneousGestures(tap, doubleTap, pan, pinch);

  const { width, height } = useWindowDimensions();

useEffect(() => {
  const it = items.find((i) => i._id === editingId);
  if (!it) return;
  const z = Math.max(zoom.value, 0.8); // zoom in a bit if it's too small to read
  const cx = it.content.x + it.content.w / 2;
  const cy = it.content.y + it.content.h / 2;
  zoom.value = withTiming(z);
  x.value = withTiming(width / 2 - cx * z);
  y.value = withTiming(height * 0.28 - cy * z);
}, [editingId]);

  const worldStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: zoom.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.surface}>
        <Animated.View pointerEvents="box-none" style={[styles.world, worldStyle]}>
          {items.map((item) => (
            <CanvasElement
              key={item._id}
              item={item}
              selected={item._id === selectedId}
              editing={item._id === editingId}
              zoom={zoom}
              onText={(text) => onChange(item._id, { text })}
              onDone={onStopEdit}
            />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1, backgroundColor: PB.page, overflow: 'hidden' },
  world: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transformOrigin: 'top left' },
});
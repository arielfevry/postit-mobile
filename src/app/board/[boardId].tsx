import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, useWindowDimensions, Keyboard } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBoard } from '@/features/board/useBoard';
import Canvas from '@/features/board/components/Canvas';
import { fitViewport } from '@/features/board/utils';
import type { Viewport } from '@/features/board/types';
import { clearSession } from '@/services/session';
import { PB } from '@/constants/postit';

export default function BoardScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { width, height } = useWindowDimensions();
  const vpKey = `viewport:${boardId}`;
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [savedChecked, setSavedChecked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const stopEditing = () => {
    setEditingId(null);
    Keyboard.dismiss();
  };

  const { board, canvasItems, loadState, error, maxZ, updateItem } = useBoard(boardId, async () => {
    await clearSession();
    router.replace('/auth/login');
  });

  const bringToFront = (id: string) => {
  const it = canvasItems.find((i) => i._id === id);
  if (!it) return;
  const atTop = canvasItems.filter((i) => i.content.z === maxZ).length;
  if (it.content.z < maxZ || atTop > 1) updateItem(id, { z: maxZ + 1 });
};

  // with saved viewport get from async storage 
  useEffect(() => {
    AsyncStorage.getItem(vpKey)
      .then((raw) => {
        if (!raw) return;
        const v = JSON.parse(raw) as Viewport;
        if (Number.isFinite(v.x) && Number.isFinite(v.y) && v.zoom > 0) setViewport(v);
      })
      .catch(() => {})
      .finally(() => setSavedChecked(true));
  }, [vpKey]);

  // nothing saved add canvas items to view port using window dimensions
  useEffect(() => {
    if (savedChecked && !viewport && loadState === 'ready') {
      setViewport(fitViewport(canvasItems, width, height));
    }
  }, [savedChecked, viewport, loadState]);

  if (loadState === 'loading' || !viewport) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator/>
      </View>
    );
  }

  if (loadState !== 'ready') {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>{error ?? 'Could not load this board'}</Text>
      </View>
    );
  }

  // display board
  return (
    <View style={{ flex: 1, backgroundColor: PB.page }}>
      <Canvas
        items={canvasItems}
        selectedId={selectedId}
        editingId={editingId}
        initialViewport={viewport}
        onViewport={(v) => AsyncStorage.setItem(vpKey, JSON.stringify(v)).catch(() => {})}
        onSelect={(id) => {
          setSelectedId(id);
          if (id !== editingId) stopEditing();
        }}
        onChange={updateItem}
        onBringToFront={bringToFront}
        onStartEdit={(id) => {
          setSelectedId(id);
          setEditingId(id);
        }}
        onStopEdit={stopEditing}
      />
      <Text pointerEvents="none" style={{ position: 'absolute', top: 50, left: 16, color: 'white' }}>
        {board?.title}
      </Text>
    </View>
  );
}
import { View, StyleSheet } from 'react-native';
import { PB } from "@/constants/postit";

export default function Tape({ corner }: { corner?: boolean}) {
    return <View pointerEvents="none" style={corner ? styles.corner : styles.top} />;
}

const base = { position: 'absolute', height: 22, borderRadius: 2, backgroundColor: PB.tape, zIndex: 2 } as const;

const styles = StyleSheet.create({
    top: { ...base, top: -11, left: '50%', marginLeft: -39, width: 78, transform: [{ rotate: '-3deg' }] },
    corner : { ...base, bottom: -6, right: -18, width: 64, transform: [{ rotate: '-38deg' }] },
});
import { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, AuthError } from '@/features/board/api';
import { clearSession } from '@/services/session';

const LAST_BOARD = 'boardId';

export default function LoadBoard(){
    const [error, setError] = useState<string | null>(null); //replaces spinner with error msg 
    const [attempt, setAttempt] = useState(0); // reruns useeffect on failed load 
    const running = useRef(false);

    useEffect(() => {
        if(running.current) return;
        running.current = true;

        async function LoadBoard() {
            try {
                const lastId = await AsyncStorage.getItem(LAST_BOARD);

                // if there was a board previously created load from API
                if(lastId) {
                    try {
                        await api.getBoard(lastId);
                        router.replace(`/board/${lastId}`);
                        return;
                    } catch(e) {if (e instanceof AuthError) throw e;}
                }

                // otherwise, create new baord 
                const { board } = await api.createBoard('Untitled Board');
                await AsyncStorage.setItem(LAST_BOARD, board._id);
                router.replace(`/board/${board._id}`);
            } catch (e) {
                if( e instanceof AuthError){
                    await clearSession();
                    router.replace('/auth/login'); 
                }
                else {
                    setError((e as Error).message);
                }
            }
            finally {
                running.current = false;
            }
        }

        LoadBoard();
    }, [attempt]); //board loader dependent on attempt to redraw in case of failure 

    // triggers rerun of useEffect
    if (error) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>Could not open a board </Text>
                <Text>{error}</Text>
                <Button title="Try again" onPress={() => {setError(null); setAttempt((n) => n + 1)}} />
            </View>
        )
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator/>
            <Text>Setting up your board</Text>
        </View>
    )
}
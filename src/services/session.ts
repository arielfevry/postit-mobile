import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'user_data';

export interface Session{
    token: string;
    id: string;
    name: string;
}

//save the session token, id, and username:
export async function saveSession(session: Session)
{
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

//retrieve session
export async function getSession(): Promise<Session | null>
{
    try{ 
        // check if user is logged in ie, has session stored
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if(!stored) return null; 

        // if logged in parse the session and return is valid
        const session = JSON.parse(stored) as Session;
        return session ?? null;
    } catch {
        return null;
    }
}

export async function getToken()
{
    return (await getSession())?.token ?? null;
}

//delete token:
export async function clearSession()
{
    await SecureStore.deleteItemAsync(SESSION_KEY);
}
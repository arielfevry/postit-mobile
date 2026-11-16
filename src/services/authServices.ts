import { jwtDecode } from 'jwt-decode';
import { apiRequest } from './api';
import { clearSession, getToken, saveSession } from './session';

type LoginInput = {
    email: string;
    password: string;
}

type LoginResponse = {
    message?: string;
    error?: string;
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    }
}

export async function login(input: LoginInput) {
    const response = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify(input)
    });

    const json = (await response.json()) as LoginResponse;
    
    if(!response.ok)
    {
        throw new Error(json.error || json.message || 'Login failed');
    }

    await saveSession({token: json.token, id: json.user.id, name: json.user.name});

    return json;
}

export async function logout()
{
    await clearSession();
    //call this using await logout();
}

export async function getCurrentSession()
{
    const token = await getToken();

    if(!token) return null;

    let userId: string;

    try
    {
        const decoded = jwtDecode<{sub?: string}>(token);
        if(!decoded.sub)
        {
            await clearSession();
            return null;
        }

        userId = decoded.sub;
    } catch
    {
        await clearSession();
        return null;
    }

    const response = await apiRequest(`/users/${userId}`, {
        method: 'GET',
    });

    if(response.status == 401)
    {
        await clearSession();
        return null;
    }

    if (!response.ok) 
    {
        throw new Error(`Session verification failed: ${response.status}`);
    }

    return await response.json();
}
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

//save the jwt token:
export async function saveToken(token: string)
{
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

//retrieve token:
export async function getToken()
{
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

//delete token:
export async function deleteToken()
{
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}
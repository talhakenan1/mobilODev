import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@focus_sessions';
const CATEGORIES_KEY = '@focus_categories';

export const saveSession = async (session) => {
    try {
        const existingSessions = await getSessions();
        const newSession = {
            ...session,
            id: session.id || Date.now().toString() // Ensure ID
        };
        const updatedSessions = [...existingSessions, newSession];
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
        console.error('Failed to save session', e);
    }
};

export const getSessions = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(SESSIONS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Failed to fetch sessions', e);
        return [];
    }
};

export const deleteSession = async (sessionId) => {
    try {
        const existingSessions = await getSessions();
        const updatedSessions = existingSessions.filter(s => s.id !== sessionId);
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
        return updatedSessions;
    } catch (e) {
        console.error('Failed to delete session', e);
        return [];
    }
};

export const clearSessions = async () => {
    try {
        await AsyncStorage.removeItem(SESSIONS_KEY);
    } catch (e) {
        console.error('Failed to clear sessions', e);
    }
};

// Category Management
const DEFAULT_CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

export const getCategories = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_CATEGORIES;
    } catch (e) {
        console.error('Failed to fetch categories', e);
        return DEFAULT_CATEGORIES;
    }
};

export const saveCategories = async (categories) => {
    try {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error('Failed to save categories', e);
    }
};

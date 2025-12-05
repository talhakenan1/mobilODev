/**
 * @fileoverview AsyncStorage ile oturum ve kategori verilerini yöneten yardımcı fonksiyonlar.
 * Bu modül, odak oturumlarının ve kullanıcı kategorilerinin kalıcı olarak saklanmasını sağlar.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/** @constant {string} SESSIONS_KEY - Oturumların saklandığı AsyncStorage anahtarı */
const SESSIONS_KEY = '@focus_sessions';

/** @constant {string} CATEGORIES_KEY - Kategorilerin saklandığı AsyncStorage anahtarı */
const CATEGORIES_KEY = '@focus_categories';

/**
 * Yeni bir odak oturumunu AsyncStorage'a kaydeder.
 * @async
 * @param {Object} session - Kaydedilecek oturum nesnesi
 * @param {string} [session.id] - Oturum ID'si (otomatik oluşturulur)
 * @param {string} session.date - Oturum tarihi (ISO formatı)
 * @param {number} session.duration - Planlanan süre (saniye)
 * @param {number} session.elapsed - Gerçekleşen süre (saniye)
 * @param {string} session.category - Seçili kategori
 * @param {number} session.distractions - Dikkat dağınıklığı sayısı
 * @returns {Promise<void>}
 */
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

/**
 * Tüm kayıtlı oturumları AsyncStorage'dan getirir.
 * @async
 * @returns {Promise<Array<Object>>} Oturum nesnelerinin listesi, hata durumunda boş dizi
 */
export const getSessions = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(SESSIONS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Failed to fetch sessions', e);
        return [];
    }
};

/**
 * Belirtilen ID'ye sahip oturumu siler.
 * @async
 * @param {string} sessionId - Silinecek oturumun ID'si
 * @returns {Promise<Array<Object>>} Güncellenmiş oturum listesi
 */
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

/**
 * Tüm oturumları AsyncStorage'dan temizler.
 * @async
 * @returns {Promise<void>}
 */
export const clearSessions = async () => {
    try {
        await AsyncStorage.removeItem(SESSIONS_KEY);
    } catch (e) {
        console.error('Failed to clear sessions', e);
    }
};

/* ==================== KATEGORİ YÖNETİMİ ==================== */

/** @constant {Array<string>} DEFAULT_CATEGORIES - Varsayılan kategori listesi */
const DEFAULT_CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"];

/**
 * Kayıtlı kategorileri getirir, yoksa varsayılan kategorileri döndürür.
 * @async
 * @returns {Promise<Array<string>>} Kategori listesi
 */
export const getCategories = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_CATEGORIES;
    } catch (e) {
        console.error('Failed to fetch categories', e);
        return DEFAULT_CATEGORIES;
    }
};

/**
 * Kategori listesini AsyncStorage'a kaydeder.
 * @async
 * @param {Array<string>} categories - Kaydedilecek kategori listesi
 * @returns {Promise<void>}
 */
export const saveCategories = async (categories) => {
    try {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error('Failed to save categories', e);
    }
};

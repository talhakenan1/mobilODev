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

/** @constant {Array<Object>} DEFAULT_CATEGORIES - Varsayılan kategori listesi (isim ve renk ile) */
const DEFAULT_CATEGORIES = [
    { name: "Ders Çalışma", color: "#FF6384" },
    { name: "Kodlama", color: "#36A2EB" },
    { name: "Proje", color: "#FFCE56" },
    { name: "Kitap Okuma", color: "#4BC0C0" }
];

/**
 * Eski string formatındaki kategorileri yeni object formatına dönüştürür.
 * @param {Array<string|Object>} categories - Eski veya yeni format kategori listesi
 * @returns {Array<Object>} Yeni formatta kategori listesi
 */
const migrateCategories = (categories) => {
    const defaultColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
    return categories.map((cat, index) => {
        if (typeof cat === 'string') {
            return { name: cat, color: defaultColors[index % defaultColors.length] };
        }
        return cat;
    });
};

/**
 * Kayıtlı kategorileri getirir, yoksa varsayılan kategorileri döndürür.
 * @async
 * @returns {Promise<Array<Object>>} Kategori listesi (her kategori { name, color } formatında)
 */
export const getCategories = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
        if (jsonValue != null) {
            const parsed = JSON.parse(jsonValue);
            // Eski string formatını yeni formata migrate et
            const migrated = migrateCategories(parsed);
            // Eğer migration olduysa, kaydet
            if (parsed.some(cat => typeof cat === 'string')) {
                await saveCategories(migrated);
            }
            return migrated;
        }
        return DEFAULT_CATEGORIES;
    } catch (e) {
        console.error('Failed to fetch categories', e);
        return DEFAULT_CATEGORIES;
    }
};

/**
 * Kategori listesini AsyncStorage'a kaydeder.
 * @async
 * @param {Array<Object>} categories - Kaydedilecek kategori listesi (her kategori { name, color } formatında)
 * @returns {Promise<void>}
 */
export const saveCategories = async (categories) => {
    try {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error('Failed to save categories', e);
    }
};

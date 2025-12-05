/**
 * @fileoverview Odaklanma zamanlayıcısı için özel React hook.
 * Sayaç durumu, mod yönetimi, arka plan davranışı ve titreşim özelliklerini içerir.
 */

import { useState, useEffect, useRef } from 'react';
import { AppState, Vibration } from 'react-native';
import { Audio } from 'expo-av';

/**
 * Odaklanma zamanlayıcısı hook'u.
 * Zamanlayıcı durumunu, mod geçişlerini ve arka plan davranışını yönetir.
 * 
 * @param {number} [initialDuration=1500] - Başlangıç süresi (saniye, varsayılan: 25 dakika)
 * @returns {Object} Zamanlayıcı durumu ve kontrol fonksiyonları
 * @returns {number} returns.timeLeft - Kalan süre (saniye)
 * @returns {number} returns.duration - Toplam süre (saniye)
 * @returns {boolean} returns.isActive - Zamanlayıcı aktif mi
 * @returns {boolean} returns.isPaused - Zamanlayıcı duraklatıldı mı
 * @returns {number} returns.distractions - Dikkat dağınıklığı sayısı
 * @returns {string} returns.mode - Mevcut mod ('focus' | 'break')
 * @returns {Function} returns.startTimer - Zamanlayıcıyı başlatır
 * @returns {Function} returns.pauseTimer - Zamanlayıcıyı duraklatır
 * @returns {Function} returns.resetTimer - Zamanlayıcıyı sıfırlar
 * @returns {Function} returns.changeMode - Mod değiştirir (odak/mola)
 */
export const useFocusTimer = (initialDuration = 25 * 60) => {
    const [duration, setDuration] = useState(initialDuration);
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [distractions, setDistractions] = useState(0);
    const [mode, setMode] = useState('focus'); // 'focus' | 'break'
    
    /** @type {React.MutableRefObject} Uygulama durumunu takip eden referans */
    const appState = useRef(AppState.currentState);
    
    /** @type {React.MutableRefObject} Ses dosyası referansı (gelecek kullanım için) */
    const soundRef = useRef(null);

    useEffect(() => {
        // Sync timeLeft if duration changes and timer is not running
        if (!isActive && !isPaused) {
            setTimeLeft(duration);
        }
    }, [duration]);

    useEffect(() => {
        let interval = null;
        if (isActive && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        handleTimerComplete();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isPaused, timeLeft]);

    /**
     * Arka plan durumu yönetimi.
     * Uygulama arka plana atıldığında zamanlayıcıyı duraklatır
     * ve dikkat dağınıklığı sayacını artırır.
     */
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState.match(/inactive|background/)) {
                // Uygulama arka plana atıldığında:
                // Eğer sayaç çalışıyorsa duraklat ve dikkat dağınıklığı sayısını artır.
                if (isActive && !isPaused) {
                    setIsPaused(true);
                    setDistractions(prev => prev + 1);
                    Vibration.vibrate([100, 200]); // Kullanıcıya uyarı titreşimi
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isActive, isPaused]);

    /**
     * Zamanlayıcı tamamlandığında çağrılır.
     * Titreşim ile kullanıcıyı bilgilendirir.
     * @async
     */
    const handleTimerComplete = async () => {
        setIsActive(false);
        setIsPaused(false);
        Vibration.vibrate([500, 500, 500]);
        
        // Play sound if available
        try {
             // In a real app, import a local file. 
             // For now, we just use Vibration.
             // const { sound } = await Audio.Sound.createAsync(require('./notification.mp3'));
             // await sound.playAsync();
        } catch (error) {
            console.log('Error playing sound', error);
        }
    };

    /**
     * Zamanlayıcıyı başlatır veya devam ettirir.
     * Süre sıfırsa, belirlenen süreye sıfırlar.
     */
    const startTimer = () => {
        setIsActive(true);
        setIsPaused(false);
        if (timeLeft === 0) {
            setTimeLeft(duration);
        }
    };

    /**
     * Zamanlayıcıyı duraklatır.
     */
    const pauseTimer = () => {
        setIsPaused(true);
    };

    /**
     * Zamanlayıcıyı sıfırlar.
     * Tüm durumu başlangıç değerlerine döndürür.
     */
    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(duration);
        setDistractions(0);
    };

    /**
     * Zamanlayıcı modunu değiştirir (Odak/Mola).
     * Mod değiştiğinde süre otomatik olarak ayarlanır:
     * - Odak modu: 25 dakika
     * - Mola modu: 5 dakika
     * @param {string} newMode - Yeni mod ('focus' | 'break')
     */
    const changeMode = (newMode) => {
        setMode(newMode);
        const newDuration = newMode === 'focus' ? 25 * 60 : 5 * 60; // Default defaults
        setDuration(newDuration);
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(newDuration);
        setDistractions(0);
    };

    return {
        timeLeft,
        duration,
        isActive,
        isPaused,
        distractions,
        mode,
        startTimer,
        pauseTimer,
        resetTimer,
        setDistractions,
        setDuration,
        changeMode,
        setMode // in case we need manual override
    };
};

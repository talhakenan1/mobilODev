import { useState, useEffect, useRef } from 'react';
import { AppState, Vibration } from 'react-native';
import { Audio } from 'expo-av';

export const useFocusTimer = (initialDuration = 25 * 60) => {
    const [duration, setDuration] = useState(initialDuration);
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [distractions, setDistractions] = useState(0);
    const [mode, setMode] = useState('focus'); // 'focus' | 'break'
    
    const appState = useRef(AppState.currentState);
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

    // Background handling
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

    const startTimer = () => {
        setIsActive(true);
        setIsPaused(false);
        if (timeLeft === 0) {
            setTimeLeft(duration);
        }
    };

    const pauseTimer = () => {
        setIsPaused(true);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(duration);
        setDistractions(0);
    };

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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, TextInput, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { saveSession, getCategories, saveCategories } from '../utils/storage';
import Svg, { Circle } from 'react-native-svg';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';

const ProgressRing = ({ radius, stroke, progress, color }) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View style={styles.ringContainer}>
            <Svg height={radius * 2} width={radius * 2}>
                <Circle
                    stroke="#e6e6e6"
                    strokeWidth={stroke}
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="transparent"
                />
                <Circle
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="transparent"
                    transform={`rotate(-90 ${radius} ${radius})`}
                />
            </Svg>
        </View>
    );
};

export default function HomeScreen() {
    useKeepAwake(); // Keep screen on
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const {
        timeLeft,
        duration,
        isActive,
        isPaused,
        distractions,
        mode,
        startTimer,
        pauseTimer,
        resetTimer,
        setDuration,
        changeMode
    } = useFocusTimer(25 * 60);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [selectedColor, setSelectedColor] = useState("#FF6384");

    // Renk paleti
    const colorOptions = [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
        "#9966FF", "#FF9F40", "#E91E63", "#00BCD4",
        "#8BC34A", "#FF5722", "#607D8B", "#795548"
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0].name);
    };

    const addCategory = async () => {
        const categoryExists = categories.some(cat => cat.name === newCategory.trim());
        if (newCategory.trim().length > 0 && !categoryExists) {
            const newCategoryObj = { name: newCategory.trim(), color: selectedColor };
            const newCats = [...categories, newCategoryObj];
            setCategories(newCats);
            await saveCategories(newCats);
            setSelectedCategory(newCategory.trim());
            setNewCategory("");
            setSelectedColor("#FF6384");
            setShowCategoryModal(false);
        }
    };

    const deleteCategory = async () => {
        if (categories.length <= 1) {
             Alert.alert("Uyarı", "En az bir kategori kalmalıdır.");
             return;
        }
        Alert.alert("Kategori Sil", `${selectedCategory} kategorisini silmek istediğinize emin misiniz?`, [
            { text: "İptal", style: "cancel" },
            { text: "Sil", style: "destructive", onPress: async () => {
                const newCats = categories.filter(c => c.name !== selectedCategory);
                setCategories(newCats);
                await saveCategories(newCats);
                setSelectedCategory(newCats[0].name);
            }}
        ]);
    };

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (timeLeft === 0 && isActive === false) {
            handleSessionEnd();
        }
    }, [timeLeft, isActive]);

    const handleSessionEnd = async () => {
        // Only save if it was a Focus session
        if (mode === 'focus') {
            const elapsed = duration - timeLeft;
             // Don't save very short sessions (< 1 min) unless completed? 
             // Let's save if completed (timeLeft === 0) or stopped manually with significant time.
             // Here we assume it's called when finished or stopped manually.
            const session = {
                date: new Date().toISOString(),
                duration: elapsed, 
                elapsed: elapsed,
                category: selectedCategory,
                distractions: distractions,
            };

            setSessionData(session);
            await saveSession(session);
            setModalVisible(true);
        } else {
             Alert.alert("Mola Bitti!", "Hadi tekrar odaklanalım.");
             changeMode('focus');
        }
        resetTimer();
    };

    const handleStop = () => {
        Alert.alert(
            "Seansı Bitir",
            "Seansı şimdi bitirmek istiyor musunuz?",
            [
                { text: "İptal", style: "cancel" },
                { text: "Evet", onPress: () => handleSessionEnd() }
            ]
        );
    };

    const progress = ((duration - timeLeft) / duration) * 100;
    const timerColor = mode === 'focus' ? '#E91E63' : '#009688';

    const renderTimer = () => (
        <View style={styles.timerWrapper}>
            <ProgressRing radius={isLandscape ? 100 : 140} stroke={15} progress={100 - progress} color={timerColor} />
            <View style={styles.timerTextContainer}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.modeText}>{mode === 'focus' ? 'Odaklanma' : 'Mola'}</Text>
            </View>
        </View>
    );

    const renderControls = () => (
        <View style={styles.controls}>
            {!isActive && !isPaused ? (
                <TouchableOpacity style={[styles.buttonStart, { backgroundColor: timerColor }]} onPress={startTimer}>
                    <Text style={styles.buttonText}>Başlat</Text>
                </TouchableOpacity>
            ) : (
                <>
                    {isPaused ? (
                        <TouchableOpacity style={[styles.buttonStart, { backgroundColor: timerColor }]} onPress={startTimer}>
                            <Text style={styles.buttonText}>Devam Et</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.buttonPause} onPress={pauseTimer}>
                            <Text style={styles.buttonText}>Duraklat</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.buttonReset} onPress={handleStop}>
                        <Text style={styles.buttonText}>Bitir</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    const renderSettings = () => (
        <View style={styles.settingsContainer}>
             {!isActive && (
                <>
                     <Text style={styles.sectionTitle}>Süre Seçimi (dk)</Text>
                     <View style={styles.durationButtons}>
                         {[15, 25, 30, 45, 60].map(min => (
                             <TouchableOpacity 
                                 key={min} 
                                 style={[styles.durationButton, duration === min * 60 && { backgroundColor: timerColor }]}
                                 onPress={() => {
                                     setDuration(min * 60);
                                     // If currently in break mode and user picks a duration, assume they want to set focus duration? 
                                     // Or break duration? Usually we configure current mode.
                                     // But let's keep it simple: these buttons set current duration.
                                 }}
                             >
                                 <Text style={[styles.durationButtonText, duration === min * 60 && { color: 'white' }]}>{min}</Text>
                             </TouchableOpacity>
                         ))}
                     </View>

                     <View style={styles.modeSwitch}>
                         <TouchableOpacity 
                             style={[styles.modeButton, mode === 'focus' && styles.modeActive]} 
                             onPress={() => changeMode('focus')}
                         >
                             <Text style={[styles.modeButtonText, mode === 'focus' && styles.modeActiveText]}>Odak</Text>
                         </TouchableOpacity>
                         <TouchableOpacity 
                             style={[styles.modeButton, mode === 'break' && styles.modeActive]} 
                             onPress={() => changeMode('break')}
                         >
                             <Text style={[styles.modeButtonText, mode === 'break' && styles.modeActiveText]}>Mola</Text>
                         </TouchableOpacity>
                     </View>

                     {mode === 'focus' && (
                         <View style={styles.categorySection}>
                             <View style={styles.categoryHeader}>
                                 <Text style={styles.label}>Kategori:</Text>
                                 <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
                                     <Ionicons name="add-circle" size={24} color="#E91E63" />
                                 </TouchableOpacity>
                                 <TouchableOpacity onPress={deleteCategory} style={{ marginLeft: 10 }}>
                                     <Ionicons name="trash" size={24} color="#666" />
                                 </TouchableOpacity>
                             </View>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedCategory}
                                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                                >
                                    {categories.map((cat) => (
                                        <Picker.Item key={cat.name} label={cat.name} value={cat.name} />
                                    ))}
                                </Picker>
                            </View>
                         </View>
                     )}
                </>
             )}
             
             {isActive && (
                 <View style={styles.distractionContainer}>
                      <Text style={styles.distractionText}>Dikkat Dağınıklığı: {distractions}</Text>
                 </View>
             )}
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.container, isLandscape && styles.landscapeContainer]}>
                <View style={[styles.timerSection, isLandscape && styles.landscapeTimerSection]}>
                    {renderTimer()}
                </View>
                
                <View style={[styles.controlSection, isLandscape && styles.landscapeControlSection]}>
                    {renderControls()}
                    {renderSettings()}
                </View>
            </View>

            {/* Session Summary Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Seans Özeti</Text>
                        {sessionData && (
                            <>
                                <Text style={styles.modalText}>Kategori: {sessionData.category}</Text>
                                <Text style={styles.modalText}>Süre: {formatTime(sessionData.elapsed)}</Text>
                                <Text style={styles.modalText}>Dikkat Dağınıklığı: {sessionData.distractions}</Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.textStyle}>Kapat</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Category Modal */}
            <Modal
                 animationType="fade"
                 transparent={true}
                 visible={showCategoryModal}
                 onRequestClose={() => setShowCategoryModal(false)}
            >
                 <View style={styles.centeredView}>
                     <View style={styles.modalView}>
                         <Text style={styles.modalTitle}>Yeni Kategori</Text>
                         <TextInput 
                             style={styles.input}
                             placeholder="Kategori Adı"
                             value={newCategory}
                             onChangeText={setNewCategory}
                         />
                         <Text style={styles.colorLabel}>Renk Seçin:</Text>
                         <View style={styles.colorGrid}>
                             {colorOptions.map((color) => (
                                 <TouchableOpacity
                                     key={color}
                                     style={[
                                         styles.colorOption,
                                         { backgroundColor: color },
                                         selectedColor === color && styles.colorOptionSelected
                                     ]}
                                     onPress={() => setSelectedColor(color)}
                                 >
                                     {selectedColor === color && (
                                         <Ionicons name="checkmark" size={20} color="white" />
                                     )}
                                 </TouchableOpacity>
                             ))}
                         </View>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                             <TouchableOpacity style={[styles.button, { backgroundColor: '#ccc' }]} onPress={() => { setShowCategoryModal(false); setSelectedColor("#FF6384"); setNewCategory(""); }}>
                                 <Text style={styles.textStyle}>İptal</Text>
                             </TouchableOpacity>
                             <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={addCategory}>
                                 <Text style={styles.textStyle}>Ekle</Text>
                             </TouchableOpacity>
                         </View>
                     </View>
                 </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
    },
    landscapeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
    timerSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    landscapeTimerSection: {
        marginRight: 40,
        marginBottom: 0,
    },
    controlSection: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    landscapeControlSection: {
        flex: 1,
        maxWidth: 400,
    },
    timerWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
    },
    modeText: {
        fontSize: 18,
        color: '#666',
        marginTop: 5,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
        gap: 20,
    },
    settingsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    buttonStart: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonPause: {
        backgroundColor: '#FF9800',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonReset: {
        backgroundColor: '#D32F2F',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    durationButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    durationButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    durationButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    modeSwitch: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        padding: 5,
        marginBottom: 20,
    },
    modeButton: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 20,
    },
    modeActive: {
        backgroundColor: '#fff',
        elevation: 2,
    },
    modeButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    modeActiveText: {
        color: '#333',
    },
    categorySection: {
        width: '100%',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginRight: 10,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fafafa',
    },
    distractionText: {
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: "white",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    input: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: "#673AB7",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    ringContainer: {
        transform: [{ rotate: '-90deg' }] // This rotation was actually applied in the circle transform, but keeping container clean is good.
        // Actually, my Circle transform `rotate(-90 ...)` does the job. I don't need to rotate the container.
        // Let's remove this container style or keep it empty.
    },
    colorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
        width: '100%',
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: '#333',
        borderWidth: 3,
    }
});

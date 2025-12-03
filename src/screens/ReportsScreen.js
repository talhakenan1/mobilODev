import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getSessions, deleteSession } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({
        todayTotal: 0,
        allTimeTotal: 0,
        totalDistractions: 0,
    });
    const [chartData, setChartData] = useState({
        bar: { labels: [], datasets: [{ data: [] }] },
        pie: [],
    });

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const data = await getSessions();
        // Sort by date descending
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSessions(sortedData);
        calculateStats(sortedData);
    };

    const handleDelete = (id) => {
        Alert.alert("Sil", "Bu kaydı silmek istiyor musunuz?", [
            { text: "İptal", style: "cancel" },
            { text: "Sil", style: "destructive", onPress: async () => {
                const newSessions = await deleteSession(id);
                const sortedData = newSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
                setSessions(sortedData);
                calculateStats(sortedData);
            }}
        ]);
    };

    const calculateStats = (data) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        let todayTotal = 0;
        let allTimeTotal = 0;
        let totalDistractions = 0;
        const categoryMap = {};
        const last7DaysMap = {};

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7DaysMap[dateStr] = 0;
        }

        data.forEach(session => {
            const sessionDate = session.date.split('T')[0];
            const duration = session.elapsed || 0; // in seconds

            allTimeTotal += duration;
            totalDistractions += session.distractions || 0;

            if (sessionDate === today) {
                todayTotal += duration;
            }

            // Category stats
            if (categoryMap[session.category]) {
                categoryMap[session.category] += duration;
            } else {
                categoryMap[session.category] = duration;
            }

            // Bar chart stats (Last 7 days)
            if (last7DaysMap.hasOwnProperty(sessionDate)) {
                last7DaysMap[sessionDate] += duration / 60; // Convert to minutes
            }
        });

        setStats({
            todayTotal: Math.round(todayTotal / 60), // minutes
            allTimeTotal: Math.round(allTimeTotal / 60), // minutes
            totalDistractions,
        });

        // Prepare Bar Chart Data
        const barLabels = Object.keys(last7DaysMap).map(date => date.slice(5)); // MM-DD
        const barValues = Object.values(last7DaysMap);

        setChartData(prev => ({
            ...prev,
            bar: {
                labels: barLabels,
                datasets: [{ data: barValues }]
            },
            pie: Object.keys(categoryMap).map((cat, index) => ({
                name: cat,
                population: Math.round(categoryMap[cat] / 60),
                color: getRandomColor(index),
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            }))
        }));
    };

    const getRandomColor = (index) => {
        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
        return colors[index % colors.length];
    };

    const renderHeader = () => {
        if (sessions.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>Henüz veri yok, odaklanmaya başla!</Text>
                </View>
            );
        }

        return (
            <View>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.todayTotal} dk</Text>
                        <Text style={styles.statLabel}>Bugün</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.allTimeTotal} dk</Text>
                        <Text style={styles.statLabel}>Toplam</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.totalDistractions}</Text>
                        <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
                    </View>
                </View>

                <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
                <BarChart
                    data={chartData.bar}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="dk"
                    chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    style={styles.chart}
                />

                <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
                <PieChart
                    data={chartData.pie}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    absolute
                />
                
                <Text style={styles.chartTitle}>Geçmiş Oturumlar</Text>
            </View>
        );
    };

    const renderSessionItem = ({ item }) => (
        <View style={styles.sessionItem}>
            <View style={{ flex: 1 }}>
                <Text style={styles.sessionCategory}>{item.category}</Text>
                <Text style={styles.sessionDate}>
                    {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <Text style={styles.sessionDuration}>{Math.round((item.elapsed || 0) / 60)} dk</Text>
                 <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                     <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                 </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Raporlar</Text>
            <FlatList
                data={sessions}
                renderItem={renderSessionItem}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        marginTop: 10,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E91E63',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    sessionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sessionCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    sessionDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    sessionDuration: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#009688',
        marginRight: 10,
    },
    deleteButton: {
        padding: 5,
    }
});

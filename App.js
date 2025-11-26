import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { Ionicons } from '@expo/vector-icons';
import Logo from './src/components/Logo';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;

                            if (route.name === 'Zamanlayıcı') {
                                iconName = focused ? 'timer' : 'timer-outline';
                            } else if (route.name === 'Raporlar') {
                                iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                            }

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: 'tomato',
                        tabBarInactiveTintColor: 'gray',
                    })}
                >
                    <Tab.Screen 
                        name="Zamanlayıcı" 
                        component={HomeScreen} 
                        options={{
                            headerTitle: () => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Logo width={30} height={30} />
                                    <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 18 }}>Zamanlayıcı</Text>
                                </View>
                            )
                        }}
                    />
                    <Tab.Screen name="Raporlar" component={ReportsScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

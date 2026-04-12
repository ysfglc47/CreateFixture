import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen'; 
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen'; 
import { DarkModeProvider } from './DarkModeContext';
import EditProfileScreen from './screens/EditProfileScreen';
import CreateTournamentScreen from './screens/CreateTournamentScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import LeagueCreateScreen from './screens/LeagueCreateScreen';
import TeamAddScreen from './screens/TeamAddScreen';
import TournamentDashboardScreen from './managements/TournamentDashboardScreen';
import GroupCreateScreen from './screens/GroupCreateScreen';
import GroupSetupScreen from './screens/GroupSetupScreen';
import MatchesScreen from './managements/MatchesScreen';
import TableScreen from './managements/TableScreen';
import TeamEditScreen from './managements/TeamEditScreen';
import BottomBar from './components/BottomBar';
import MatchDetailScreen from './managements/MatchDetailScreen';
import ManualMatchCreateScreen from './managements/ManualMatchCreateScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DarkModeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="LeagueCreate" component={LeagueCreateScreen} />
            <Stack.Screen name="TeamAdd" component={TeamAddScreen} />
            <Stack.Screen name="TournamentDashboard" component={TournamentDashboardScreen}
            options={{ headerShown: false }} />
            <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
            <Stack.Screen name="GroupSetup" component={GroupSetupScreen} />
            <Stack.Screen name="MatchesScreen" component={MatchesScreen}
            options={{ headerShown: false }} />
            <Stack.Screen name="TableScreen" component={TableScreen} 
            options={{ headerShown: false }} />
            <Stack.Screen name="TeamEditScreen" component={TeamEditScreen}
            options={{ headerShown: false }} />
            <Stack.Screen name="BottomBar" component={BottomBar} options={{ headerShown: true }} />
            <Stack.Screen name="MatchDetailScreen" component={MatchDetailScreen} />
            <Stack.Screen name="ManualMatchCreateScreen" component={ManualMatchCreateScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DarkModeProvider>
    </GestureHandlerRootView>
  );
}

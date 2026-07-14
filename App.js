import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen'; 
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen'; 
import { DarkModeProvider } from './DarkModeContext';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import { installRuntimeTranslationPatch } from './src/i18n/installRuntimeTranslationPatch';
import EditProfileScreen from './screens/EditProfileScreen';
import CreateTournamentScreen from './screens/CreateTournamentScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
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
import ManualMatchDetailScreen from './managements/ManualMatchDetailScreen';
import GroupDashboardScreen from './managements/GroupDashboardScreen';
import GroupTeamEditScreen from './managements/GroupTeamEditScreen';
import GroupMatchScreen from './managements/GroupMatchScreen';
import ManualGroupMatchCreateScreen from './managements/ManualGroupMatchCreateScreen';
import GroupManualMatchDetailScreen from './managements/GroupManualMatchDetailScreen';
import GroupTableScreen from './managements/GroupTableScreen';
import EliminationCreateScreen from './screens/EliminationCreateScreen';
import EliminationDashboardScreen from './managements/EliminationDashboardScreen';
import EliminationMatchesScreen from './managements/EliminationMatchesScreen';
import EliminationBracketScreen from './managements/EliminationBracketScreen';
import EliminationTeamEditScreen from './managements/EliminationTeamEditScreen';
import { initializeAdMob } from './src/services/admobService';
import { loadInterstitialAd } from './utils/ads';

installRuntimeTranslationPatch();

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    async function prepareAds() {
      try {
        const initialized = await initializeAdMob();
        if (initialized) {
          await loadInterstitialAd();
        }
      } catch (error) {
        // Ads must never block the app flow.
      }
    }

    prepareAds();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DarkModeProvider>
        <LanguageProvider>
          <AppNavigator />
        </LanguageProvider>
      </DarkModeProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  useLanguage();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="LeagueCreate" component={LeagueCreateScreen} />
        <Stack.Screen name="TeamAdd" component={TeamAddScreen} />
        <Stack.Screen name="TournamentDashboard" component={TournamentDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
        <Stack.Screen name="GroupSetup" component={GroupSetupScreen} />
        <Stack.Screen name="MatchesScreen" component={MatchesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TableScreen" component={TableScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TeamEditScreen" component={TeamEditScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BottomBar" component={BottomBar} options={{ headerShown: true }} />
        <Stack.Screen name="MatchDetailScreen" component={MatchDetailScreen} />
        <Stack.Screen name="ManualMatchCreateScreen" component={ManualMatchCreateScreen} />
        <Stack.Screen name="ManualMatchDetailScreen" component={ManualMatchDetailScreen} />
        <Stack.Screen name="GroupDashboard" component={GroupDashboardScreen} />
        <Stack.Screen name="GroupTeamEditScreen" component={GroupTeamEditScreen} />
        <Stack.Screen name="GroupMatchScreen" component={GroupMatchScreen} />
        <Stack.Screen name="ManualGroupMatchCreateScreen" component={ManualGroupMatchCreateScreen} />
        <Stack.Screen name="GroupManualMatchDetailScreen" component={GroupManualMatchDetailScreen} />
        <Stack.Screen name="GroupTableScreen" component={GroupTableScreen} />
        <Stack.Screen name="EliminationCreate" component={EliminationCreateScreen} />
        <Stack.Screen name="EliminationDashboard" component={EliminationDashboardScreen} />
        <Stack.Screen name="EliminationMatchesScreen" component={EliminationMatchesScreen} />
        <Stack.Screen name="EliminationBracketScreen" component={EliminationBracketScreen} />
        <Stack.Screen name="EliminationTeamEditScreen" component={EliminationTeamEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



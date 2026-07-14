import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';

import { Text } from '../components/I18nPrimitives';

function BottomBar({ activeTab, setActiveTab, navigation, tournament }) {
  const { isDarkMode } = useDarkMode();

  const isElimination = tournament.mode === 'ELEME';
  const tabs = [
    { label: 'Panel', icon: <MaterialCommunityIcons name="view-dashboard-outline" size={34} /> },
    { label: 'Maçlar', icon: <MaterialCommunityIcons name="soccer" size={34} /> },
    {
      label: 'Tablo',
      icon: <MaterialCommunityIcons name={isElimination ? 'tournament' : 'soccer-field'} size={34} />,
    },
    ...(!isElimination
      ? [{ label: 'Takım', icon: <MaterialCommunityIcons name="account-cog-outline" size={34} /> }]
      : []),
  ];

  const tabColors = (idx) => ({
    backgroundColor: activeTab === idx ? '#FFD700' : 'transparent',
  });
  const iconColors = (idx) =>
    activeTab === idx
      ? (isDarkMode ? '#222' : '#222')
      : (isDarkMode ? '#fff' : '#222');
  const labelColors = (idx) => ({
    color: activeTab === idx
      ? '#222'
      : (isDarkMode ? '#fff' : '#222'),
    fontWeight: activeTab === idx ? 'bold' : 'normal',
    fontSize: 13,
    marginTop: 2,
  });

  const handleTabPress = (idx) => {
    if (activeTab === idx) return;
    setActiveTab(idx);

    if (tournament.mode === 'ELEME') {
      if (idx === 0) navigation.replace('EliminationDashboard', { tournament });
      if (idx === 1) navigation.replace('EliminationMatchesScreen', { tournament });
      if (idx === 2) navigation.replace('EliminationBracketScreen', { tournament });
    } else if (tournament.mode === 'GRUP') {
      if (idx === 0) navigation.replace('GroupDashboard', { tournament });
      if (idx === 3) navigation.replace('GroupTeamEditScreen', { tournament });
      if (idx === 1) navigation.replace('GroupMatchScreen', { tournament });
      if (idx === 2) navigation.replace('GroupTableScreen', { tournament });
    } else {
      if (idx === 0) navigation.replace('TournamentDashboard', { tournament });
      if (idx === 3) navigation.replace('TeamEditScreen', { tournament });
      if (idx === 1) navigation.replace('MatchesScreen', { tournament });
      if (idx === 2) navigation.replace('TableScreen', { tournament });
    }
  };

  return (
    <View style={[
      styles.bottomBar,
      isDarkMode && { backgroundColor: '#222', borderColor: '#444', shadowColor: '#000' }
    ]}>
      {tabs.map((tab, idx) => (
        <TouchableOpacity
          key={tab.label}
          style={[styles.iconButton, tabColors(idx)]}
          onPress={() => handleTabPress(idx)}
          activeOpacity={1}
        >
          {React.cloneElement(tab.icon, { color: iconColors(idx) })}
          <Text style={labelColors(idx)}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default React.memo(BottomBar);

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 62,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    paddingBottom: 2,
    paddingTop: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 8,
    marginBottom: 12,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 60,
    paddingTop: 2,
    paddingBottom: 2,
  },
});


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BottomBar({ activeTab, setActiveTab, navigation, tournament }) {
  const tabs = [
    { label: 'Panel', icon: <MaterialCommunityIcons name="view-dashboard-outline" size={34} /> },
    { label: 'Maçlar', icon: <MaterialCommunityIcons name="soccer" size={34} /> },
    { label: 'Tablo', icon: <MaterialCommunityIcons name="soccer-field" size={34} /> },
    { label: 'Takım', icon: <MaterialCommunityIcons name="account-cog-outline" size={34} /> },
  ];

  const tabColors = (idx) => ({
    backgroundColor: activeTab === idx ? '#FFD700' : 'transparent',
  });
  const iconColors = (idx) => (activeTab === idx ? '#222' : '#222');
  const labelColors = (idx) => ({
    color: activeTab === idx ? '#ffffffff' : '#222',
    fontWeight: activeTab === idx ? 'bold' : 'normal',
    fontSize: 13,
    marginTop: 2,
  });

  const handleTabPress = (idx) => {
    if (activeTab === idx) return; // Aynı sekmeye tekrar gitme
    setActiveTab(idx);
    if (idx === 0) navigation.replace('TournamentDashboard', { tournament });
    if (idx === 1) navigation.replace('MatchesScreen', { tournament });
    if (idx === 2) navigation.replace('TableScreen', { tournament });
    if (idx === 3) navigation.replace('TeamEditScreen', { tournament });
  };

  return (
    <View style={styles.bottomBar}>
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
    marginBottom: 20,
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
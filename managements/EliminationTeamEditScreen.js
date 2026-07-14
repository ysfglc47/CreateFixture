import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import LocalStore from '../utils/localStore';
import { FontAwesome as Icon } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import { useDarkMode } from '../DarkModeContext';
import { getEliminationRoundTitle } from '../utils/eliminationRounds';

import { Text, TextInput } from '../components/I18nPrimitives';

function createMatchesFromTeams(teams, roundNumber = 1) {
  const matches = [];
  for (let index = 0; index < teams.length; index += 2) {
    const home = teams[index];
    const away = teams[index + 1] || 'BAY';
    matches.push({
      id: `${roundNumber}_${index}_${Date.now()}`,
      home,
      away,
      homeScore: away === 'BAY' ? '1' : '',
      awayScore: away === 'BAY' ? '0' : '',
      winner: away === 'BAY' ? home : '',
    });
  }
  return matches;
}

export default function EliminationTeamEditScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const { tournament } = route.params;
  const [teams, setTeams] = useState(tournament.teams || []);
  const [newTeam, setNewTeam] = useState('');
  const [activeTab, setActiveTab] = useState(3);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [warning, setWarning] = useState('');

  const persistTournament = async updatedTeams => {
    const nextTournament = {
      ...tournament,
      teams: updatedTeams,
      rounds: [
        {
          roundNumber: 1,
          title: getEliminationRoundTitle(updatedTeams.length, 0),
          matches: createMatchesFromTeams(updatedTeams, 1),
        },
      ],
    };

    const stored = await LocalStore.getItem('tournaments');
    const tournaments = stored ? JSON.parse(stored) : [];
    const updated = tournaments.map(item => (item.id === tournament.id ? nextTournament : item));
    await LocalStore.setItem('tournaments', JSON.stringify(updated));
    return nextTournament;
  };

  const addTeam = () => {
    const name = newTeam.trim();
    if (!name) {
      setWarning('Takım adı boş olamaz!');
      return;
    }
    if (teams.some(team => team.toLowerCase() === name.toLowerCase())) {
      setWarning('Bu isimde bir takım zaten var!');
      return;
    }
    setWarning('');
    setTeams([...teams, name]);
    setNewTeam('');
  };

  const removeTeam = index => {
    setTeams(teams.filter((_, itemIndex) => itemIndex !== index));
    setWarning('');
  };

  const startEditTeam = index => {
    setEditIndex(index);
    setEditValue(teams[index]);
  };

  const saveEditTeam = () => {
    const name = editValue.trim();
    if (!name) {
      setWarning('Takım adı boş olamaz!');
      return;
    }
    if (teams.some((team, index) => team.toLowerCase() === name.toLowerCase() && index !== editIndex)) {
      setWarning('Bu isimde bir takım zaten var!');
      return;
    }
    setTeams(teams.map((team, index) => (index === editIndex ? name : team)));
    setEditIndex(null);
    setEditValue('');
    setWarning('');
  };

  const saveTeams = async () => {
    if (teams.length < 2) {
      setWarning('Eleme turnuvası için en az iki takım gerekir.');
      return;
    }

    Alert.alert(
      'Eleme tablosu yenilenecek',
      'Takım listesini kaydederseniz eleme tablosu ilk turdan yeniden oluşturulur.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaydet',
          onPress: async () => {
            const nextTournament = await persistTournament(teams);
            navigation.replace('EliminationMatchesScreen', { tournament: nextTournament });
          },
        },
      ]
    );
  };

  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={styles.header}>{tournament.ad || tournament.tournamentName || 'Eleme'} - Takımlar</Text>
      </View>

      {warning ? <Text style={styles.warning}>{warning}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Takım adı ekle"
          placeholderTextColor={isDarkMode ? '#888' : '#222'}
          value={newTeam}
          onChangeText={setNewTeam}
          onSubmitEditing={addTeam}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTeam}>
          <Icon name="plus" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item, index) => `${item}_${index}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.teamBox}>
            {editIndex === index ? (
              <>
                <TextInput
                  style={styles.teamInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  autoFocus
                  placeholderTextColor={isDarkMode ? '#888' : '#222'}
                />
                <TouchableOpacity onPress={saveEditTeam}>
                  <Icon name="check" size={22} color="#0a0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditIndex(null); setEditValue(''); }}>
                  <Icon name="close" size={22} color="#d00" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.teamName}>{item}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => startEditTeam(index)} style={{ marginRight: 8 }}>
                    <Icon name="pencil" size={22} color="#FFD700" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTeam(index)}>
                    <Icon name="trash" size={22} color="#d00" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Takım yok</Text>}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveTeams}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>

      <BottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigation={navigation}
        tournament={tournament}
      />
    </View>
  );
}

function getStyles(isDarkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#181818' : '#f7f7fa',
      padding: 5,
      paddingTop: 40,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18,
      marginTop: 8,
      paddingHorizontal: 24,
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFD700' : '#222',
    },
    warning: {
      color: '#d00',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 18,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      color: isDarkMode ? '#FFD700' : '#222',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#FFD700' : '#ccc',
    },
    addButton: {
      marginLeft: 8,
      backgroundColor: '#FFD700',
      borderRadius: 8,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingBottom: 18,
    },
    teamBox: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      borderRadius: 10,
      padding: 16,
      marginHorizontal: 18,
      marginVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    teamName: {
      flex: 1,
      fontSize: 17,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFD700' : '#222',
    },
    teamInput: {
      flex: 1,
      backgroundColor: isDarkMode ? '#333' : '#eee',
      color: isDarkMode ? '#FFD700' : '#222',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginRight: 8,
      fontWeight: 'bold',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: '#FFD700',
      borderRadius: 10,
      paddingVertical: 14,
      marginHorizontal: 40,
      marginTop: 10,
      marginBottom: 10,
      alignItems: 'center',
      elevation: 2,
    },
    saveButtonText: {
      color: '#222',
      fontWeight: 'bold',
      fontSize: 17,
      letterSpacing: 1,
    },
    emptyText: {
      textAlign: 'center',
      color: isDarkMode ? '#FFD700' : '#888',
      marginTop: 40,
    },
  });
}

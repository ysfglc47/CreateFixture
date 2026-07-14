import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';
import { getEliminationRoundTitle } from '../utils/eliminationRounds';
import { saveTournamentToDatabase } from '../database';
import { showExportInterstitialAd } from '../utils/ads';

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

export default function EliminationCreateScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const { tournamentName = 'Eleme Turnuvasi', email = '' } = route.params || {};
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState([]);
  const [warning, setWarning] = useState('');

  const colors = {
    background: isDarkMode ? '#222' : '#fff',
    text: isDarkMode ? '#fff' : '#222',
    muted: isDarkMode ? '#aaa' : '#666',
    input: isDarkMode ? '#444' : '#ddd',
    card: isDarkMode ? '#333' : '#f4f4f4',
  };

  const addTeam = () => {
    const name = teamName.trim();
    if (!name) {
      setWarning('Takım adı boş olamaz.');
      return;
    }
    if (teams.some(team => team.toLowerCase() === name.toLowerCase())) {
      setWarning('Bu takım zaten eklendi.');
      return;
    }
    setTeams([...teams, name]);
    setTeamName('');
    setWarning('');
  };

  const removeTeam = index => {
    setTeams(teams.filter((_, itemIndex) => itemIndex !== index));
    setWarning('');
  };

  const createTournament = async () => {
    if (teams.length < 2) {
      setWarning('Eleme turnuvası için en az iki takım gerekir.');
      return;
    }

    const newTournament = {
      id: Date.now().toString(),
      ad: tournamentName,
      tournamentName,
      email,
      ownerEmail: email,
      mode: 'ELEME',
      teams,
      rounds: [
        {
          roundNumber: 1,
          title: getEliminationRoundTitle(teams.length, 0),
          matches: createMatchesFromTeams(teams, 1),
        },
      ],
      createdAt: new Date().toISOString(),
    };
    await saveTournamentToDatabase(newTournament);
    await showExportInterstitialAd();
    navigation.replace('Home', { email });
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={32} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ELEME OLUŞTUR</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { email })}>
          <Icon name="home" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.tournamentName}>{tournamentName}</Text>
        <Text style={styles.description}>
          Takımları sırayla ekleyin. Tek sayıda takım varsa son takım ilk turu bay geçer.
        </Text>
      </View>

      {warning ? <Text style={styles.warning}>{warning}</Text> : null}

      <Text style={styles.label}>Takım adı</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Takım adı"
          placeholderTextColor={colors.muted}
          value={teamName}
          onChangeText={setTeamName}
          onSubmitEditing={addTeam}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTeam}>
          <Icon name="plus" size={20} color="#222" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item, index) => `${item}_${index}`}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <View style={styles.teamRow}>
            <Text style={styles.teamIndex}>{index + 1}</Text>
            <Text style={styles.teamName}>{item}</Text>
            <TouchableOpacity onPress={() => removeTeam(index)}>
              <Icon name="trash" size={20} color="#d33" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz takım eklenmedi.</Text>}
      />

      <TouchableOpacity
        style={[styles.createButton, teams.length < 2 && styles.disabledButton]}
        onPress={createTournament}
        disabled={teams.length < 2}
      >
        <Text style={[styles.createButtonText, teams.length < 2 && styles.disabledText]}>ELEMEYİ BAŞLAT</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
      paddingTop: 60,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 22,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    infoCard: {
      backgroundColor: '#FFD700',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    tournamentName: {
      color: '#222',
      fontSize: 18,
      fontWeight: 'bold',
    },
    description: {
      color: '#222',
      marginTop: 6,
      lineHeight: 18,
      fontWeight: '600',
    },
    warning: {
      color: '#d00',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    label: {
      color: colors.text,
      fontWeight: 'bold',
      marginBottom: 8,
      fontSize: 16,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      backgroundColor: colors.input,
      color: colors.text,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.muted,
    },
    addButton: {
      width: 48,
      borderRadius: 8,
      backgroundColor: '#FFD700',
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingBottom: 18,
    },
    list: {
      flex: 1,
    },
    teamRow: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    teamIndex: {
      width: 30,
      color: '#FFD700',
      fontWeight: 'bold',
      fontSize: 16,
    },
    teamName: {
      flex: 1,
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 16,
    },
    emptyText: {
      color: colors.muted,
      textAlign: 'center',
      marginTop: 28,
      fontWeight: '600',
    },
    createButton: {
      backgroundColor: '#222',
      borderRadius: 8,
      paddingVertical: 15,
      alignItems: 'center',
      marginBottom: 12,
    },
    disabledButton: {
      backgroundColor: colors.card,
    },
    createButtonText: {
      color: '#FFD700',
      fontWeight: 'bold',
      fontSize: 16,
    },
    disabledText: {
      color: colors.muted,
    },
  });
}



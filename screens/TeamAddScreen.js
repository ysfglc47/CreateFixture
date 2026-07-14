import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';
import { saveTournamentToDatabase } from '../database';
import { showExportInterstitialAd } from '../utils/ads';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function TeamAddScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const iconColor = isDarkMode ? '#fff' : '#222';

  const { teams = [], tournamentId = null, ...otherParams } = route.params || {};

  const [teamName, setTeamName] = useState('');
  const [warning, setWarning] = useState('');

  const tournament = route.params?.tournament || {};
  const ownerEmail = tournament.ownerEmail || tournament.email || route.params?.email || '';
  const [teamsState, setTeams] = useState(tournament.teams || []);

  const handleAddTeam = () => {
    const newName = teamName.trim();
    if (!newName) {
      setWarning('Takım adı boş olamaz!');
      return;
    }
    if (teamsState.some(t => t.toLowerCase() === newName.toLowerCase())) {
      setWarning('Bu isimde bir takım zaten var!');
      return;
    }
    setWarning('');
    setTeams([...teamsState, newName]);
    setTeamName('');
  };

  const handleContinue = async () => {
    if (teamsState.length < 2) {
      setWarning('En az iki takım eklemelisiniz!');
      return;
    }
    try {
      const newTournament = {
        id: Date.now().toString(),
        ad: tournament.tournamentName || tournament.leagueName || 'Turnuva',
        email: ownerEmail,
        ownerEmail,
        mode: 'LIG',
        leagueName: tournament.leagueName || tournament.tournamentName || 'Lig',
        matchType: tournament.matchType,
        points: tournament.points,
        teamSelectType: tournament.teamSelectType,
        orderRules: tournament.orderRules,
        teams: teamsState,
      };
      await saveTournamentToDatabase(newTournament);
      await showExportInterstitialAd();

      setWarning('');
      navigation.navigate('Home', { email: ownerEmail });
    } catch (e) {
      setWarning('Takımlar kaydedilemedi!');
    }
  };

  const handleDeleteTeam = (index) => {
    const updatedTeams = teamsState.filter((_, i) => i !== index);
    setTeams(updatedTeams);
    setWarning('');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#222' : '#fff',
      padding: 24,
    },
    header: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      paddingTop: 30,
      paddingHorizontal: 4,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : 'black',
      letterSpacing: 1,
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    input: {
      flex: 1,
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#888',
      marginRight: 8,
    },
    addButton: {
      backgroundColor: 'black',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    teamList: {
      flex: 1,
      marginBottom: 24,
    },
    teamListContent: {
      paddingBottom: 12,
    },
    teamItem: {
      backgroundColor: isDarkMode ? '#444' : '#eee',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    teamText: {
      color: isDarkMode ? '#fff' : '#222',
      fontSize: 16,
      fontWeight: 'bold',
    },
    deleteButton: {
      marginLeft: 12,
    },
    createButton: {
      backgroundColor: isDarkMode ? '#eee' : '#222',
      borderRadius: 6,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 12,
    },
    createButtonDisabled: {
      backgroundColor: isDarkMode ? '#333' : '#eee',
    },
    createButtonText: {
      color: teamsState.length < 2 ? '#aaa' : '#fff' && isDarkMode ? '#333' : '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 1,
    },
    createButtonTextDisabled: {
      color: '#aaa',
    },
    warningText: {
      color: '#d00',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      fontSize: 15,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TAKIM EKLE</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { email: ownerEmail })}>
          <Icon name="home" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>

      {warning ? (
        <Text style={styles.warningText}>{warning}</Text>
      ) : null}

      <Text style={[styles.label, { marginTop: 20 }]}>
        Turnuva Adı: {tournament.tournamentName || 'Belirtilmedi'}
      </Text>
      <Text style={[styles.label, { marginTop: 10 }]}>
        Lig Adı: {tournament.leagueName || 'Belirtilmedi'}
      </Text>

      <Text style={[styles.label, { marginTop: 20 }]}>Takım Adı</Text>
      <View style={[styles.inputRow, { marginTop: 1 }]}>
        <TextInput
          style={styles.input}
          placeholder="Takım Adı"
          value={teamName}
          onChangeText={setTeamName}
          placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTeam}>
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={teamsState}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.teamItem}>
            <Text style={styles.teamText}>{item}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTeam(index)}
            >
              <Icon name="trash" size={22} color={iconColor} />
            </TouchableOpacity>
          </View>
        )}
        fadingEdgeLength={250}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="handled"
        persistentScrollbar={true}
        style={styles.teamList}
        contentContainerStyle={styles.teamListContent}
      />

      <TouchableOpacity
        style={[
          styles.createButton,
          teamsState.length < 2 && styles.createButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={teamsState.length < 2}
      >
        <Text
          style={[
            styles.createButtonText,
            teamsState.length < 2 && styles.createButtonTextDisabled,
          ]}
        >
          OLUŞTUR
        </Text>
      </TouchableOpacity>
    </View>
  );
}


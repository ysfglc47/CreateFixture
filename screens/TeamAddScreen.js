import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDarkMode } from '../DarkModeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TeamAddScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const iconColor = isDarkMode ? '#fff' : '#222';

  const { teams = [], tournamentId = null, ...otherParams } = route.params || {};

  const [teamName, setTeamName] = useState('');
  

  // Turnuva bilgisini parametrelerden al
  const tournament = route.params?.tournament || {};
  const [teamsState, setTeams] = useState(tournament.teams || []);

  const handleAddTeam = () => {
    const newName = teamName.trim();
    if (!newName) {
      Alert.alert('Hata', 'Takım adı boş olamaz!');
      return;
    }
    if (teamsState.some(t => t.toLowerCase() === newName.toLowerCase())) {
      Alert.alert('Hata', 'Bu isimde bir takım zaten var!');
      return;
    }
    setTeams([...teamsState, newName]);
    setTeamName('');
  };

  const handleContinue = async () => {
    if (teamsState.length < 2) {
      Alert.alert('Hata', 'En az iki takım eklemelisiniz!');
      return;
    }
    const stored = await AsyncStorage.getItem('tournaments');
    let tournaments = stored ? JSON.parse(stored) : [];

    // Aynı isimdeki turnuvayı sil
    tournaments = tournaments.filter(
      t => t.leagueName !== (tournament.leagueName || tournament.tournamentName)
    );

    const newTournament = {
      id: Date.now().toString(),
      ad: tournament.tournamentName || tournament.leagueName || 'Turnuva',
      leagueName: tournament.leagueName || tournament.tournamentName || 'Lig',
      matchType: tournament.matchType,
      points: tournament.points,
      teamSelectType: tournament.teamSelectType,
      orderRules: tournament.orderRules,
      teams: teamsState,
    };
    const updated = [...tournaments, newTournament];
    await AsyncStorage.setItem('tournaments', JSON.stringify(updated));

    navigation.navigate('Home');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#222' : '#fff',
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      paddingTop: 60,
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
      marginBottom: 24,
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
    },
    createButtonDisabled: {
      backgroundColor: isDarkMode ? '#333' : '#eee',
    },
    createButtonText: {
      color: teamsState.length < 2 ? '#aaa' : '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 1,
    },
    createButtonTextDisabled: {
      color: '#aaa',
    },
  });

  const handleDeleteTeam = (index) => {
    const updatedTeams = teamsState.filter((_, i) => i !== index);
    setTeams(updatedTeams);
  };

  return (
    <View style={styles.container}>
      {/* Üst Menü */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TAKIM EKLE</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Turnuva Adı */}
      <Text style={[styles.label, { marginTop: 20 }]}>
        Turnuva Adı: {tournament.tournamentName || 'Belirtilmedi'}
      </Text>
      <Text style={[styles.label, { marginTop: 10 }]}>
        Lig Adı: {tournament.leagueName || 'Belirtilmedi'}
      </Text>

      {/* Takım Adı Input ve Ekle Butonu */}
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

      {/* Takım Listesi */}
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
      persistentScrollbar={true}
        style={styles.teamList}
      />

      {/* Devam Butonu */}
      {/* Butonlar seçime göre */}
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
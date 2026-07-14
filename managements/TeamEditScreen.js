import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import LocalStore from '../utils/localStore';
import { useDarkMode } from '../DarkModeContext';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function TeamEditScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  const { tournament } = route.params;
  const [teams, setTeams] = useState(tournament.teams || []);
  const [newTeam, setNewTeam] = useState('');
  const [activeTab, setActiveTab] = useState(3);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [warning, setWarning] = useState('');

  const saveTeamsToStorage = async (updatedTeams, removedTeam = null) => {
    try {
      const stored = await LocalStore.getItem('tournaments');
      let tournaments = stored ? JSON.parse(stored) : [];
      tournaments = tournaments.map(t =>
        t.id === tournament.id ? { ...t, teams: updatedTeams } : t
      );
      await LocalStore.setItem('tournaments', JSON.stringify(tournaments));

      if (removedTeam) {
        const matchesKey = `matches_${tournament.id}`;
        const resultsKey = `matchResults_${tournament.id}`;

        try {
          const savedMatches = await LocalStore.getItem(matchesKey);
          let matches = savedMatches ? JSON.parse(savedMatches) : [];
          let flatMatches = Array.isArray(matches[0]) ? matches.flat() : matches;
          flatMatches = flatMatches.filter(
            m => m.home !== removedTeam && m.away !== removedTeam
          );
          const totalWeeks = tournament.matchType === 'CIFT'
            ? (updatedTeams.length - 1) * 2
            : updatedTeams.length - 1;
          const grouped = Array.from({ length: totalWeeks }, (_, i) =>
            flatMatches.filter(m => Number(m.week) === i + 1)
          );
          await LocalStore.setItem(matchesKey, JSON.stringify(grouped));
        } catch (e) {
          setWarning('Maçlar güncellenemedi!');
        }

        try {
          const savedResults = await LocalStore.getItem(resultsKey);
          let results = savedResults ? JSON.parse(savedResults) : {};
          Object.keys(results).forEach(matchId => {
            const match = results[matchId];
            if (match.home === removedTeam || match.away === removedTeam) {
              delete results[matchId];
            }
          });
          await LocalStore.setItem(resultsKey, JSON.stringify(results));
        } catch (e) {
          setWarning('Sonuçlar güncellenemedi!');
        }
      }
    } catch (e) {
      setWarning('Takımlar kaydedilemedi!');
    }
  };

  const saveTeams = async () => {
    await saveTeamsToStorage(teams);
    navigation.navigate('MatchesScreen', { tournament: { ...tournament, teams } });
  };

  const addTeam = async () => {
    const newName = newTeam.trim();
    if (!newName) {
      setWarning('Takım adı boş olamaz!');
      return;
    }
    if (teams.some(t => t.toLowerCase() === newName.toLowerCase())) {
      setWarning('Bu isimde bir takım zaten var!');
      return;
    }
    setWarning('');
    const updatedTeams = [...teams, newName];
    setTeams(updatedTeams);
    setNewTeam('');
    await saveTeamsToStorage(updatedTeams);

    if (tournament.teamSelectType === 'MANUEL') {
      const matchesKey = `matches_${tournament.id}`;
      const totalWeeks =
        tournament.matchType === 'CIFT'
          ? (updatedTeams.length - 1) * 2
          : updatedTeams.length - 1;

      const savedMatches = await LocalStore.getItem(matchesKey);
      let matches = savedMatches ? JSON.parse(savedMatches) : [];
      let flatMatches = Array.isArray(matches[0]) ? matches.flat() : matches;
      const grouped = Array.from({ length: totalWeeks }, (_, i) =>
        flatMatches.filter(m => Number(m.week) === i + 1)
      );
      await LocalStore.setItem(matchesKey, JSON.stringify(grouped));
    }

  };

  const removeTeam = async (idx) => {
    const removedTeam = teams[idx];
    const updatedTeams = teams.filter((_, i) => i !== idx);
    setTeams(updatedTeams);
    await saveTeamsToStorage(updatedTeams, removedTeam);
  };

  const startEditTeam = (idx) => {
    setEditIndex(idx);
    setEditValue(teams[idx]);
  };

  const saveEditTeam = async () => {
    const newName = editValue.trim();
    if (!newName) {
      setWarning('Takım adı boş olamaz!');
      return;
    }
    if (teams.some((t, i) => t.toLowerCase() === newName.toLowerCase() && i !== editIndex)) {
      setWarning('Bu isimde bir takım zaten var!');
      return;
    }
    setWarning('');
    const oldName = teams[editIndex];
    const updatedTeams = teams.map((t, i) => (i === editIndex ? newName : t));
    setTeams(updatedTeams);
    setEditIndex(null);
    setEditValue('');
    await saveTeamsToStorage(updatedTeams);

    const matchesKey = `matches_${tournament.id}`;
    const resultsKey = `matchResults_${tournament.id}`;

    try {
      const savedMatches = await LocalStore.getItem(matchesKey);
      if (savedMatches) {
        let matches = JSON.parse(savedMatches);
        let flatMatches = Array.isArray(matches[0]) ? matches.flat() : matches;
        flatMatches = flatMatches.map(m => ({
          ...m,
          home: m.home === oldName ? newName : m.home,
          away: m.away === oldName ? newName : m.away,
        }));
        const totalWeeks = tournament.matchType === 'CIFT'
          ? (updatedTeams.length - 1) * 2
          : updatedTeams.length - 1;
        const grouped = Array.from({ length: totalWeeks }, (_, i) =>
          flatMatches.filter(m => Number(m.week) === i + 1)
        );
        await LocalStore.setItem(matchesKey, JSON.stringify(grouped));
      }
    } catch (e) {
      setWarning('Maçlar güncellenemedi!');
    }

    try {
      const savedResults = await LocalStore.getItem(resultsKey);
      if (savedResults) {
        let results = JSON.parse(savedResults);
        Object.keys(results).forEach(matchId => {
          const match = results[matchId];
          if (match.home === oldName) match.home = newName;
          if (match.away === oldName) match.away = newName;
        });
        await LocalStore.setItem(resultsKey, JSON.stringify(results));
      }
    } catch (e) {
      setWarning('Sonuçlar güncellenemedi!');
    }
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: '#181818' }
    ]}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={[
          styles.header,
          isDarkMode && { color: '#FFD700' }
        ]}>{tournament.leagueName || 'Lig'} - Takımlar</Text>
      </View>

      {warning ? (
        <Text style={{ 
          color: '#d00', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: 8 
        }}
        >{warning}</Text>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            isDarkMode && { backgroundColor: '#232323', color: '#FFD700', borderColor: '#FFD700' }
          ]}
          placeholder="Takım adı ekle"
          placeholderTextColor={isDarkMode ? "#888" : "#222"}
          value={newTeam}
          onChangeText={setNewTeam}
        />
        <TouchableOpacity style={[
          styles.addButton,
          isDarkMode && { backgroundColor: '#FFD700' }
        ]} onPress={addTeam}>
          <Icon name="plus" size={24} color={isDarkMode ? "#222" : "#222"} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={[
            styles.teamBox,
            isDarkMode && { backgroundColor: '#232323' }
          ]}>
            {editIndex === index ? (
              <>
                <TextInput
                  style={[
                    styles.teamName,
                    { backgroundColor: isDarkMode ? '#333' : '#eee', borderRadius: 6, paddingHorizontal: 6, color: isDarkMode ? '#FFD700' : '#222' }
                  ]}
                  value={editValue}
                  onChangeText={setEditValue}
                  autoFocus
                  placeholderTextColor={isDarkMode ? "#888" : "#222"}
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
                <Text style={[
                  styles.teamName,
                  isDarkMode && { color: '#FFD700' }
                ]}>{item}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {tournament.teamSelectType !== 'RASTGELE' && (
                    <TouchableOpacity onPress={() => startEditTeam(index)} style={{ marginRight: 8 }}>
                      <Icon name="pencil" size={22} color="#FFD700" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => removeTeam(index)}>
                    <Icon name="trash" size={22} color="#d00" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: isDarkMode ? '#FFD700' : '#888', marginTop: 40 }}>
            Takım yok
          </Text>
        }
      />

      <TouchableOpacity style={[
        styles.saveButton,
        isDarkMode && { backgroundColor: '#FFD700' }
      ]} onPress={saveTeams}>
        <Text style={[
          styles.saveButtonText,
          isDarkMode && { color: '#222' }
        ]}>Kaydet</Text>
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7fa', 
    padding: 5, 
    paddingTop: 40 
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 18,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBox: {
    backgroundColor: '#fff',
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
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 40,
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
  },
  saveButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
});


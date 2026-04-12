import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../components/BottomBar'; // <-- Eklendi
import AsyncStorage from '@react-native-async-storage/async-storage'; // ekle

export default function TeamEditScreen({ route, navigation }) {
  const { tournament } = route.params;
  const [teams, setTeams] = useState(tournament.teams || []);
  const [newTeam, setNewTeam] = useState('');
  const [activeTab, setActiveTab] = useState(3);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  // KAYDET fonksiyonu
  const saveTeamsToStorage = async (updatedTeams) => {
    try {
      const stored = await AsyncStorage.getItem('tournaments');
      let tournaments = stored ? JSON.parse(stored) : [];
      tournaments = tournaments.map(t =>
        t.id === tournament.id ? { ...t, teams: updatedTeams } : t
      );
      await AsyncStorage.setItem('tournaments', JSON.stringify(tournaments));
      // Eşleşmeleri temizle
      await AsyncStorage.removeItem(`matches_${tournament.id}`);
      
    } catch (e) {
      alert('Takımlar kaydedilemedi!');
    }
  };

  const saveTeams = async () => {
    await saveTeamsToStorage(teams);
    navigation.goBack();
  };

  const addTeam = () => {
    const newName = newTeam.trim();
    if (!newName) {
      alert('Takım adı boş olamaz!');
      return;
    }
    if (teams.some(t => t.toLowerCase() === newName.toLowerCase())) {
      alert('Bu isimde bir takım zaten var!');
      return;
    }
    const updatedTeams = [...teams, newName];
    setTeams(updatedTeams);
    setNewTeam('');
    saveTeamsToStorage(updatedTeams);
  };

  const removeTeam = async (idx) => {
    const removedTeam = teams[idx];
    const updatedTeams = teams.filter((_, i) => i !== idx);
    setTeams(updatedTeams);
    await saveTeamsToStorage(updatedTeams);

    // Sadece ilgili takımın oynadığı maç sonuçlarını sil
    const resultsKey = `matchResults_${tournament.id}`;
    try {
      const savedResults = await AsyncStorage.getItem(resultsKey);
      let results = savedResults ? JSON.parse(savedResults) : {};
      // Takımın oynadığı maçları bul ve sil
      Object.keys(results).forEach(matchId => {
        const match = results[matchId];
        if (match.home === removedTeam || match.away === removedTeam) {
          delete results[matchId];
        }
      });
      await AsyncStorage.setItem(resultsKey, JSON.stringify(results));
    } catch (e) {
      // Hata durumunda sessizce geç
    }
  };

  const startEditTeam = (idx) => {
    setEditIndex(idx);
    setEditValue(teams[idx]);
  };

  const saveEditTeam = async () => {
    const newName = editValue.trim();
    if (!newName) {
      alert('Takım adı boş olamaz!');
      return;
    }
    if (teams.some((t, i) => t.toLowerCase() === newName.toLowerCase() && i !== editIndex)) {
      alert('Bu isimde bir takım zaten var!');
      return;
    }
    const oldName = teams[editIndex];
    const updatedTeams = teams.map((t, i) => (i === editIndex ? newName : t));
    setTeams(updatedTeams);
    setEditIndex(null);
    setEditValue('');
    await saveTeamsToStorage(updatedTeams);

    // Sadece ilgili takımın oynadığı maç sonuçlarını sil
    const resultsKey = `matchResults_${tournament.id}`;
    try {
      const savedResults = await AsyncStorage.getItem(resultsKey);
      let results = savedResults ? JSON.parse(savedResults) : {};
      Object.keys(results).forEach(matchId => {
        const match = results[matchId];
        if (match.home === oldName || match.away === oldName) {
          delete results[matchId];
        }
      });
      await AsyncStorage.setItem(resultsKey, JSON.stringify(results));
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.header}>{tournament.leagueName || 'Lig'} - Takımlar</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Takım adı ekle"
          value={newTeam}
          onChangeText={setNewTeam}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTeam}>
          <MaterialCommunityIcons name="plus" size={24} color="#222" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.teamBox}>
            {editIndex === index ? (
              <>
                <TextInput
                  style={[styles.teamName, { backgroundColor: '#eee', borderRadius: 6, paddingHorizontal: 6 }]}
                  value={editValue}
                  onChangeText={setEditValue}
                  autoFocus
                />
                <TouchableOpacity onPress={saveEditTeam}>
                  <MaterialCommunityIcons name="check" size={22} color="#0a0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditIndex(null); setEditValue(''); }}>
                  <MaterialCommunityIcons name="close" size={22} color="#d00" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.teamName}>{item}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => startEditTeam(index)} style={{ marginRight: 8 }}>
                    <MaterialCommunityIcons name="pencil" size={22} color="#FFD700" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTeam(index)}>
                    <MaterialCommunityIcons name="delete" size={22} color="#d00" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Takım yok</Text>}
      />

      {/* Kaydet Butonu */}
      <TouchableOpacity style={styles.saveButton} onPress={saveTeams}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>

      {/* Alt ikon menüsü */}
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
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 5, paddingTop: 40 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
    paddingHorizontal: 24,
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
});
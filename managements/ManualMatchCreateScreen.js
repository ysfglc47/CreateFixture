import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Doğru picker importu
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManualMatchCreateScreen({ route, navigation }) {
  const { tournament } = route.params;
  const teams = tournament.teams || [];
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [date, setDate] = useState('');
  const [week, setWeek] = useState('');
  const [matches, setMatches] = useState([]);

  // Maç ekle
  const handleAddMatch = () => {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) return;
    setMatches([
      ...matches,
      { home: homeTeam, away: awayTeam, date, week }
    ]);
    setHomeTeam('');
    setAwayTeam('');
    setDate('');
    setWeek('');
  };

  // Maçları kaydet ve geri dön
  const handleSave = async () => {
    const matchesKey = `matches_${tournament.id}`;
    // Önce eski maçları oku
    const oldMatchesRaw = await AsyncStorage.getItem(matchesKey);
    let oldMatches = oldMatchesRaw ? JSON.parse(oldMatchesRaw) : [];
    // Yeni eklenenleri ekle
    const allMatches = [...oldMatches, ...matches];
    await AsyncStorage.setItem(matchesKey, JSON.stringify(allMatches));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manuel Maç Ekle</Text>
      <ScrollView>
        <View style={styles.selectRow}>
          <Text style={styles.label}>Ev Sahibi Takım:</Text>
          <Picker
            selectedValue={homeTeam}
            style={styles.picker}
            onValueChange={setHomeTeam}
          >
            <Picker.Item label="Seçiniz" value="" />
            {teams.map(team => (
              <Picker.Item key={team} label={team} value={team} />
            ))}
          </Picker>
        </View>
        <View style={styles.selectRow}>
          <Text style={styles.label}>Deplasman Takım:</Text>
          <Picker
            selectedValue={awayTeam}
            style={styles.picker}
            onValueChange={setAwayTeam}
          >
            <Picker.Item label="Seçiniz" value="" />
            {teams.map(team => (
              <Picker.Item key={team} label={team} value={team} />
            ))}
          </Picker>
        </View>
        <View style={styles.selectRow}>
          <Text style={styles.label}>Hafta:</Text>
          <TextInput
            style={styles.input}
            value={week}
            onChangeText={setWeek}
            placeholder="Hafta numarası"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.selectRow}>
          <Text style={styles.label}>Tarih:</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="GG.AA.YYYY"
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMatch}
        >
          <Text style={styles.addButtonText}>Maçı Ekle</Text>
        </TouchableOpacity>

        {/* Eklenen maçlar listesi */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.subHeader}>Eklenen Maçlar:</Text>
          {matches.length === 0 ? (
            <Text style={{ color: '#888', marginTop: 8 }}>Henüz maç eklenmedi.</Text>
          ) : (
            matches.map((m, idx) => (
              <View key={idx} style={styles.matchRow}>
                <Text style={styles.matchText}>
                  {m.week ? `${m.week}. Hafta - ` : ''}{m.home} vs {m.away} {m.date ? `(${m.date})` : ''}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Kaydet ve Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 16, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 18, textAlign: 'center' },
  subHeader: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  selectRow: { marginBottom: 14 },
  label: { fontSize: 15, color: '#444', marginBottom: 4 },
  picker: { backgroundColor: '#fff', borderRadius: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 8, fontSize: 15 },
  addButton: {
    backgroundColor: '#FFD700',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignSelf: 'center',
    marginTop: 8,
    elevation: 2,
  },
  addButtonText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  matchRow: { backgroundColor: '#fff', borderRadius: 8, padding: 8, marginVertical: 4 },
  matchText: { color: '#222', fontSize: 15 },
  saveButton: {
    backgroundColor: '#222',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: 'center',
    marginVertical: 16,
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
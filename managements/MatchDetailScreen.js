import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Gün bulma fonksiyonu
function getDayName(date) {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}

export default function MatchDetailScreen({ route, navigation }) {
  const { match, onSave } = route.params;
  const [homeScore, setHomeScore] = useState(match.homeScore ?? '');
  const [awayScore, setAwayScore] = useState(match.awayScore ?? '');
  const [date, setDate] = useState(match.date ? new Date(match.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    const updatedMatch = {
      ...match,
      homeScore,
      awayScore,
      date: date.toISOString().split('T')[0],
    };

    const resultsKey = `matchResults_${match.tournamentId}`;
    let results = {};
    try {
      const savedResults = await AsyncStorage.getItem(resultsKey);
      results = savedResults ? JSON.parse(savedResults) : {};
    } catch (e) {}

    results[updatedMatch.id] = updatedMatch;
    await AsyncStorage.setItem(resultsKey, JSON.stringify(results));

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Geri Butonu */}
      <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={32} color="#222" />
      </TouchableOpacity>

      {/* Maç Bilgisi */}
      <Text style={styles.matchTeams}>{match.home} - {match.away}</Text>

      {/* Skor Girişi */}
      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          keyboardType="numeric"
          value={homeScore.toString()}
          onChangeText={setHomeScore}
          placeholder="Ev"
        />
        <Text style={styles.colon}>-</Text>
        <TextInput
          style={styles.scoreInput}
          keyboardType="numeric"
          value={awayScore.toString()}
          onChangeText={setAwayScore}
          placeholder="Deplasman"
        />
      </View>

      {/* Tarih Seçici */}
      <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
        <Icon name="calendar" size={22} color="#FFD700" />
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {/* Seçilen tarihe denk gelen gün */}
      <Text style={styles.dayText}>{getDayName(date)}</Text>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Kaydet Butonu */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 24, justifyContent: 'center' },
  goBack: { position: 'absolute', top: 36, left: 16, zIndex: 10 },
  matchTeams: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: '#222' },
  scoreRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  scoreInput: { width: 60, fontSize: 22, borderBottomWidth: 2, borderColor: '#FFD700', textAlign: 'center', marginHorizontal: 12, color: '#222' },
  colon: { fontSize: 28, color: '#222' },
  datePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  dateText: { marginLeft: 8, fontSize: 16, color: '#222' },
  dayText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFD700',
    fontSize: 18,
    marginBottom: 12,
  },
  saveButton: { position: 'absolute', right: 24, bottom: 32, backgroundColor: '#FFD700', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32, elevation: 2 },
  saveButtonText: { color: '#222', fontWeight: 'bold', fontSize: 17, letterSpacing: 1 },
});
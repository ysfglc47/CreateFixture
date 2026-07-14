import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import LocalStore from '../utils/localStore';
import { useDarkMode } from '../DarkModeContext';

import { Text, TextInput } from '../components/I18nPrimitives';

// Gün bulma fonksiyonu
function getDayName(date) {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}

export default function MatchDetailScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  const { match } = route.params;
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
      const savedResults = await LocalStore.getItem(resultsKey);
      results = savedResults ? JSON.parse(savedResults) : {};
    } catch (e) {}

    results[updatedMatch.id] = updatedMatch;
    await LocalStore.setItem(resultsKey, JSON.stringify(results));

    navigation.goBack();
  };

  const handleDelete = async () => {
    const resultsKey = `matchResults_${match.tournamentId}`;
    try {
      const savedResults = await LocalStore.getItem(resultsKey);
      let results = savedResults ? JSON.parse(savedResults) : {};
      delete results[match.id];
      await LocalStore.setItem(resultsKey, JSON.stringify(results));
    } catch (e) {}

    const matchesKey = `matches_${match.tournamentId}`;
    try {
      const savedMatches = await LocalStore.getItem(matchesKey);
      if (savedMatches) {
        let matches = JSON.parse(savedMatches);
        let flatMatches = Array.isArray(matches[0]) ? matches.flat() : matches;
        flatMatches = flatMatches.filter(m => m.id !== match.id);
        const totalWeeks = match.matchType === 'CIFT'
          ? (match.teams.length - 1) * 2
          : match.teams.length - 1;
        const grouped = Array.from({ length: totalWeeks }, (_, i) =>
          flatMatches.filter(m => Number(m.week) === i + 1)
        );
        await LocalStore.setItem(matchesKey, JSON.stringify(grouped));
      }
    } catch (e) {}

    navigation.goBack();
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: '#181818' }
    ]}>
      <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={32} color={isDarkMode ? "#FFD700" : "#222"} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.deleteButton, isDarkMode && { backgroundColor: '#333' }]} onPress={handleDelete}>
        <Icon name="trash-can-outline" size={32} color={isDarkMode ? "#FFD700" : "darkblue"} />
      </TouchableOpacity>

      <Text style={[styles.matchTeams, isDarkMode && { color: '#FFD700' }]}>{match.home} - {match.away}</Text>

      <View style={styles.scoreRow}>
        <TextInput
          style={[styles.scoreInput, isDarkMode && { color: '#FFD700', borderColor: '#FFD700' }]}
          keyboardType="numeric"
          value={homeScore.toString()}
          onChangeText={setHomeScore}
          placeholder="Ev"
          placeholderTextColor={isDarkMode ? "#888" : "#222"}
        />
        <Text style={[styles.colon, isDarkMode && { color: '#FFD700' }]}>-</Text>
        <TextInput
          style={[styles.scoreInput, isDarkMode && { color: '#FFD700', borderColor: '#FFD700' }]}
          keyboardType="numeric"
          value={awayScore.toString()}
          onChangeText={setAwayScore}
          placeholder="Deplasman"
          placeholderTextColor={isDarkMode ? "#888" : "#222"}
        />
      </View>

      <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
        <Icon name="calendar" size={22} color="#FFD700" />
        <Text style={[styles.dateText, isDarkMode && { color: '#FFD700' }]}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <Text style={[styles.dayText, isDarkMode && { color: '#FFD700' }]}>{getDayName(date)}</Text>
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

      <TouchableOpacity style={[styles.saveButton, isDarkMode && { backgroundColor: '#FFD700' }]} onPress={handleSave}>
        <Text style={[styles.saveButtonText, isDarkMode && { color: '#222' }]}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7fa', 
    padding: 24, 
    justifyContent: 'center' 
  },
  goBack: { 
    position: 'absolute', 
    top: 36, 
    left: 16, zIndex: 10 
  },
  deleteButton: { 
    backgroundColor: '#FFD700', 
    position: 'absolute', 
    top: 72, right: 16, zIndex: 10, 
    borderRadius: 24, padding: 8 
  },
  matchTeams: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 32, 
    color: '#222' 
  },
  scoreRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 32 
  },
  scoreInput: { 
    width: 60, 
    fontSize: 22, 
    borderBottomWidth: 2, 
    borderColor: '#FFD700', 
    textAlign: 'center', 
    marginHorizontal: 12, 
    color: '#222' 
  },
  colon: { 
    fontSize: 28, 
    color: '#222' 
  },
  datePicker: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 40 
  },
  dateText: { 
    marginLeft: 8, 
    fontSize: 16, 
    color: '#222' 
  },
  dayText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FFD700',
    fontSize: 18,
    marginBottom: 12,
  },
  saveButton: { 
    position: 'absolute', 
    right: 24, 
    bottom: 32, 
    backgroundColor: '#FFD700', 
    borderRadius: 24, 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    elevation: 2 
  },
  saveButtonText: { 
    color: '#222', 
    fontWeight: 'bold', 
    fontSize: 17, 
    letterSpacing: 1 
  },
});


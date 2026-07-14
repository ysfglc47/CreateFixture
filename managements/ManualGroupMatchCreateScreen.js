import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import LocalStore from '../utils/localStore';
import { useDarkMode } from '../DarkModeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { translateRuntimeText } from '../src/i18n/runtimeTranslator';

import { Text } from '../components/I18nPrimitives';

function getDayName(date) {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}

export default function ManualGroupMatchCreateScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  useLanguage();
  const { tournament, groupIdx } = route.params;
  const groups = tournament.groups || [];
  const group = groups[groupIdx];
  const teams = group?.teams || [];

  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [warning, setWarning] = useState('');

  const handleAddMatch = async () => {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
      setWarning('Farklı iki takım seçmelisiniz!');
      return;
    }
    setWarning('');
    const newMatch = {
      id: `${groupIdx}_${homeTeam}_${awayTeam}_${Date.now()}`,
      home: homeTeam,
      away: awayTeam,
      date: date.toISOString().split('T')[0],
      groupIdx,
      groupName: group.name,
      tournamentId: tournament.id,
      matchType: tournament.matchType,
      teams: teams,
    };

    const updatedGroups = groups.map((g, idx) =>
      idx === groupIdx
        ? { ...g, matches: [...(g.matches || []), newMatch] }
        : g
    );

    try {
      await LocalStore.setItem(`groups_${tournament.id}`, JSON.stringify(updatedGroups));
      await LocalStore.setItem(`tournament_${tournament.id}`, JSON.stringify({ ...tournament, groups: updatedGroups }));
      const stored = await LocalStore.getItem('tournaments');
      let tournaments = stored ? JSON.parse(stored) : [];
      tournaments = tournaments.map(t =>
        t.id === tournament.id ? { ...t, groups: updatedGroups } : t
      );
      await LocalStore.setItem('tournaments', JSON.stringify(tournaments));
      navigation.replace('GroupMatchScreen', { tournament: { ...tournament, groups: updatedGroups } });
    } catch (e) {
      setWarning('Maç kaydedilemedi!');
    }
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: '#181818' }
    ]}>
      <Text style={[
        styles.header,
        isDarkMode && { color: '#FFD700' }
      ]}>
        Manuel Maç Ekle ({group?.name || `Grup ${groupIdx + 1}`})
      </Text>
      {warning ? <Text style={styles.warningText}>{warning}</Text> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, isDarkMode && { color: '#FFD700' }]}>Ev Sahibi Takım</Text>
        <Picker
          selectedValue={homeTeam}
          style={[
            styles.picker,
            isDarkMode && { backgroundColor: '#232323', color: '#FFD700' }
          ]}
          onValueChange={setHomeTeam}
          dropdownIconColor={isDarkMode ? "#FFD700" : "#222"}
        >
          <Picker.Item label={translateRuntimeText('Takım seçin')} value="" color={isDarkMode ? "#888" : "#222"} />
          {teams.map((team, idx) => (
            <Picker.Item key={team} label={team} value={team} color={isDarkMode ? "#FFD700" : "#222"} />
          ))}
        </Picker>
        <Text style={[styles.label, isDarkMode && { color: '#FFD700' }]}>Deplasman Takımı</Text>
        <Picker
          selectedValue={awayTeam}
          style={[
            styles.picker,
            isDarkMode && { backgroundColor: '#232323', color: '#FFD700' }
          ]}
          onValueChange={setAwayTeam}
          dropdownIconColor={isDarkMode ? "#FFD700" : "#222"}
        >
          <Picker.Item label={translateRuntimeText('Takım seçin')} value="" color={isDarkMode ? "#888" : "#222"} />
          {teams.map((team, idx) => (
            <Picker.Item key={team} label={team} value={team} color={isDarkMode ? "#FFD700" : "#222"} />
          ))}
        </Picker>
        <Text style={[styles.label, isDarkMode && { color: '#FFD700' }]}>Tarih</Text>
        <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
          <Icon name="calendar" size={22} color="#FFD700" />
          <Text style={[styles.dateText, isDarkMode && { color: '#FFD700' }]}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <Text style={[
          styles.dayText,
          isDarkMode && { color: '#FFD700' }
        ]}>{getDayName(date)}</Text>
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
        <TouchableOpacity
          style={[
            styles.saveButton,
            isDarkMode && { backgroundColor: '#FFD700' }
          ]}
          onPress={handleAddMatch}
        >
          <Text style={[
            styles.saveButtonText,
            isDarkMode && { color: '#222' }
          ]}>Kaydet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.cancelButton,
            isDarkMode && { backgroundColor: '#333' }
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[
            styles.cancelButtonText,
            isDarkMode && { color: '#FFD700' }
          ]}>İptal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7fa', 
    padding: 24, 
    paddingTop: 40 
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  warningText: {
    color: '#d00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 15,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginTop: 12,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  datePicker: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12 
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
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: 'center',
    elevation: 2,
  },
  saveButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: 'center',
    elevation: 1,
  },
  cancelButtonText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
  },
});



import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome as Icon } from '@expo/vector-icons';
import LocalStore from '../utils/localStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDarkMode } from '../DarkModeContext';
import { useLanguage } from '../src/i18n/LanguageContext';
import { translateRuntimeText } from '../src/i18n/runtimeTranslator';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function ManualMatchCreateScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  useLanguage();
  const { tournament, totalWeeks } = route.params;
  const teams = tournament.teams || [];
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [date, setDate] = useState('');
  const [week, setWeek] = useState('');
  const [matches, setMatches] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [warning, setWarning] = useState('');

  const handleAddMatch = () => {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam || !week) {
      setWarning('Ev sahibi, deplasman ve hafta seçmelisiniz!');
      return;
    }

    const isDuplicate = matches.some(
      m =>
        m.home === homeTeam &&
        m.away === awayTeam &&
        m.week === Number(week)
    );

    if (isDuplicate) {
      setWarning('Aynı takımlar aynı hafta ve devrede tekrar karşılaşamaz!');
      return;
    }

    if (tournament.matchType === 'TEK') {
      const alreadyExists = matches.some(
        m =>
          ((m.home === homeTeam && m.away === awayTeam) ||
            (m.home === awayTeam && m.away === homeTeam))
      );
      if (alreadyExists) {
        setWarning('Tek devrede aynı takımlar birden fazla karşılaşamaz!');
        return;
      }
    }

    setWarning('');
    setMatches([
      ...matches,
      {
        id: `${week}_${homeTeam}_${awayTeam}_${Date.now()}`,
        home: homeTeam,
        away: awayTeam,
        week: Number(week),
        date 
      }
    ]);
    setHomeTeam('');
    setAwayTeam('');
    setDate('');
    setWeek('');
  };

  const handleSave = async () => {
    const matchesKey = `matches_${tournament.id}`;
    const totalWeeks = Number(route.params.totalWeeks) || 1;

    let oldGrouped = [];
    try {
      const saved = await LocalStore.getItem(matchesKey);
      oldGrouped = saved ? JSON.parse(saved) : [];
    } catch (e) {
      setWarning('Kayıt okunamadı!');
    }

    // Eski kayıtları düzleştir
    let oldMatches = Array.isArray(oldGrouped[0]) ? oldGrouped.flat() : oldGrouped;

    // Yeni eklenenleri ekle
    const allMatches = [...oldMatches, ...matches];

    // Haftalara göre tekrar grupla
    const grouped = Array.from({ length: totalWeeks }, (_, i) =>
      allMatches.filter(m => Number(m.week) === i + 1)
    );

    try {
      await LocalStore.setItem(matchesKey, JSON.stringify(grouped));
      navigation.navigate('MatchesScreen', { tournament });
    } catch (e) {
      setWarning('Maçlar kaydedilemedi!');
    }
  };

  // Ev sahibi seçilince, deplasman seçeneklerinden çıkar
  const awayTeamOptions = teams.filter(team => team !== homeTeam);

  // Haftalar için seçenekler oluştur (ör: 1'den takım sayısına kadar)
  const weekOptions = Array.from({ length: Number(totalWeeks) }, (_, i) => (i + 1).toString());

  // Tarih seçildiğinde
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
      setDate(formatted);
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
      ]}>Manuel Maç Ekle</Text>
      {warning ? (
        <Text style={{ color: '#d00', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>{warning}</Text>
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.selectRow}>
          <Text style={[styles.label, isDarkMode && { color: '#FFD700' }]}>Ev Sahibi Takım:</Text>
          <Picker
            selectedValue={homeTeam}
            style={[styles.picker, isDarkMode && { backgroundColor: '#232323', color: '#FFD700' }]}
            onValueChange={setHomeTeam}
            dropdownIconColor={isDarkMode ? "#FFD700" : "#222"}
          >
            <Picker.Item label={translateRuntimeText('Seçiniz')} value="" color={isDarkMode ? "#888" : "#222"} />
            {teams.map(team => (
              <Picker.Item key={team} label={team} value={team} color={isDarkMode ? "#FFD700" : "#222"} />
            ))}
          </Picker>
        </View>
        <View style={styles.selectRow}>
          <Text style={[styles.label, isDarkMode && { color: '#FFD700' }]}>Deplasman Takım:</Text>
          <Picker
            selectedValue={awayTeam}
            style={[styles.picker, isDarkMode && { backgroundColor: '#232323', color: '#FFD700' }]}
            onValueChange={setAwayTeam}
            dropdownIconColor={isDarkMode ? "#FFD700" : "#222"}
          >
            <Picker.Item label={translateRuntimeText('Seçiniz')} value="" color={isDarkMode ? "#888" : "#222"} />
            {awayTeamOptions.map(team => (
              <Picker.Item key={team} label={team} value={team} color={isDarkMode ? "#FFD700" : "#222"} />
            ))}
          </Picker>
        </View>
        <View style={styles.selectRow}>
          <Text style={[styles.label, isDarkMode && { color: '#FFD700' }]}>Hafta:</Text>
          <Picker
            selectedValue={week}
            style={[styles.picker, isDarkMode && { backgroundColor: '#232323', color: '#FFD700' }]}
            onValueChange={setWeek}
            dropdownIconColor={isDarkMode ? "#FFD700" : "#222"}
          >
            <Picker.Item label={translateRuntimeText('Seçiniz')} value="" color={isDarkMode ? "#888" : "#222"} />
            {weekOptions.map(w => (
              <Picker.Item key={w} label={`${w}. ${translateRuntimeText('Hafta')}`} value={w} color={isDarkMode ? "#FFD700" : "#222"} />
            ))}
          </Picker>
        </View>
        <View style={styles.selectRow}>
          <Text style={[styles.label, isDarkMode && { color: '#FFD700' }]}>Tarih:</Text>
          <TouchableOpacity
            style={[styles.input, isDarkMode && { backgroundColor: '#232323' }, { justifyContent: 'center' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: date ? (isDarkMode ? '#FFD700' : '#222') : '#888', fontSize: 15 }}>
              {date || 'GG.AA.YYYY'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date ? new Date(date.split('.').reverse().join('-')) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        <TouchableOpacity
          style={[styles.addButton, isDarkMode && { backgroundColor: '#FFD700' }]}
          onPress={handleAddMatch}
        >
          <Text style={[styles.addButtonText, isDarkMode && { color: '#222' }]}>Maçı Ekle</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 18 }}>
          <Text style={[styles.subHeader, isDarkMode && { color: '#FFD700' }]}>Eklenen Maçlar:</Text>
          {matches.length === 0 ? (
            <Text style={{ color: isDarkMode ? '#FFD700' : '#888', marginTop: 8 }}>Henüz maç eklenmedi.</Text>
          ) : (
            matches.map((m, idx) => (
              <View key={idx} style={[styles.matchRow, isDarkMode && { backgroundColor: '#232323' }]}>
                <Text style={[styles.matchText, isDarkMode && { color: '#FFD700' }]}>
                  {m.week ? `${m.week}. Hafta - ` : ''}{m.home} vs {m.away} {m.date ? `\n(${m.date})` : ''}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#FFD700',
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    marginLeft: 8,
                    alignSelf: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setMatches(matches.filter((_, i) => i !== idx));
                  }}
                >
                  <Icon name="trash" size={16} color="#222" style={{ marginRight: 0 }} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.saveButton, isDarkMode && { backgroundColor: '#FFD700' }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, isDarkMode && { color: '#222' }]}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7fa', 
    padding: 16, 
    paddingTop: 40 
  },
  header: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#222', 
    marginBottom: 18, 
    textAlign: 'center' 
  },
  subHeader: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#222', 
    marginBottom: 8 
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  selectRow: { 
    marginBottom: 14 
  },
  label: { 
    fontSize: 15, 
    color: '#444', 
    marginBottom: 4 
  },
  picker: { 
    backgroundColor: '#fff', 
    borderRadius: 8 
  },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 8, 
    fontSize: 15 
  },
  addButton: {
    backgroundColor: '#FFD700',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignSelf: 'center',
    marginTop: 8,
    elevation: 2,
  },
  addButtonText: { 
    color: '#222', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  matchRow: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 8, 
    marginVertical: 4 
  },
  matchText: { 
    color: '#222', 
    fontSize: 15 
  },
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




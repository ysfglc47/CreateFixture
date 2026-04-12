import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clean(str) {
  return str.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
}

// Haftalık round-robin fikstür üretici
function generateLeagueFixtures(teams, matchType) {
  const teamList = [...teams];
  if (teamList.length % 2 !== 0) teamList.push('Bay');
  const n = teamList.length;
  const weeks = n - 1;
  const half = n / 2;
  const fixtures = [];

  // Tek devre: Her takım rakipleriyle 1 kez oynar
  for (let week = 0; week < weeks; week++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const home = teamList[i];
      const away = teamList[n - 1 - i];
      if (home !== 'Bay' && away !== 'Bay') {
        matches.push({
          id: `${week + 1}_${clean(home)}_${clean(away)}`,
          home,
          away,
          week: week + 1,
          date: '',
        });
      }
    }
    fixtures.push(matches);
    teamList.splice(1, 0, teamList.pop());
  }

  // Çift devre: Aynı fikstür bir kez daha, ev-deplasman yer değiştirerek eklenir
  if (matchType === 'CIFT') {
    const secondHalf = fixtures.map((weekMatches, weekIdx) =>
      weekMatches.map(match => ({
        id: `2_${weeks + weekIdx + 1}_${match.away}_${match.home}`,
        home: match.away,
        away: match.home,
        week: weeks + weekIdx + 1,
        date: '',
      }))
    );
    return [...fixtures, ...secondHalf];
  }

  return fixtures; // [ [hafta1 maçları], [hafta2 maçları], ... ]
}

export default function MatchesScreen({ route, navigation }) {
  const { tournament } = route.params;
  const [activeTab, setActiveTab] = useState(1);
  const [matchResults, setMatchResults] = useState({});
  const [fixtures, setFixtures] = useState([]); // Haftalık maçlar
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const teams = tournament.teams || [];
  const matchesKey = `matches_${tournament.id}`;
  const resultsKey = `matchResults_${tournament.id}`;

  // Haftalık fikstür oluştur ve kaydet
  useEffect(() => {
    const loadOrCreateFixtures = async () => {
      const saved = await AsyncStorage.getItem(matchesKey);
      if (saved) {
        setFixtures(JSON.parse(saved));
      } else if (teams.length >= 2) {
        const weeklyFixtures = generateLeagueFixtures(teams, tournament.matchType);
        setFixtures(weeklyFixtures);
        await AsyncStorage.setItem(matchesKey, JSON.stringify(weeklyFixtures));
      } else {
        setFixtures([]);
      }
    };
    loadOrCreateFixtures();
  }, [tournament.id, teams]);

  // Takımlar değiştiğinde yeni fikstür oluştur ve kaydet
  useEffect(() => {
    // Takımlar değiştiğinde yeni fikstür oluştur ve kaydet
    const fixtures = generateLeagueFixtures(teams, tournament.matchType);
    setFixtures(fixtures);

    // AsyncStorage'a da kaydet
    AsyncStorage.setItem(matchesKey, JSON.stringify(fixtures));
  }, [teams, tournament.matchType, tournament.id]);

  // Maç sonuçlarını yükle (her ekrana dönüldüğünde)
  useFocusEffect(
    React.useCallback(() => {
      const loadResults = async () => {
        const savedResults = await AsyncStorage.getItem(resultsKey);
        if (savedResults) setMatchResults(JSON.parse(savedResults));
      };
      loadResults();
    }, [tournament.id])
  );

  // Maç sonucu kaydet
  const handleMatchSave = async (updatedMatch) => {
    const updated = { ...matchResults, [updatedMatch.id]: updatedMatch };
    setMatchResults(updated);
    await AsyncStorage.setItem(resultsKey, JSON.stringify(updated));
  };

  // Seçili haftanın maçları veya tüm maçlar
  const weekMatches = showAll
    ? fixtures.flat()
    : fixtures[selectedWeek - 1] || [];

  // Haftalar arası geçiş fonksiyonu
  const goPrevWeek = () => setSelectedWeek(w => Math.max(1, w - 1));
  const goNextWeek = () => setSelectedWeek(w => Math.min(fixtures.length, w + 1));

  // Manuel seçim ise ekleme butonunu göster
  const isManual = tournament.teamSelectType === 'MANUEL';

  return (
    <View style={styles.container}>
      {/* Üst başlık */}
      <View style={styles.topRow}>
        <Text style={styles.header}>{tournament.leagueName || 'Lig'}</Text>
      </View>

      {/* Hafta seçici ve tüm haftalar */}
      <View style={styles.weekNavRow}>
        <TouchableOpacity onPress={goPrevWeek} disabled={selectedWeek === 1 || showAll}>
          <Text style={[styles.arrow, (selectedWeek === 1 || showAll) && styles.arrowDisabled]}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.weekLabel, showAll && styles.weekLabelInactive]}
          onPress={() => setShowAll(false)}
          disabled={showAll}
        >
          <Text style={styles.weekLabelText}>
            {showAll ? 'Hafta' : `${selectedWeek}. Hafta`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNextWeek} disabled={selectedWeek === fixtures.length || showAll}>
          <Text style={[styles.arrow, (selectedWeek === fixtures.length || showAll) && styles.arrowDisabled]}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.allWeeksButton, showAll && styles.allWeeksButtonActive]}
          onPress={() => setShowAll(s => !s)}
        >
          <Text style={showAll ? styles.allWeeksTextActive : styles.allWeeksText}>Tüm Haftalar</Text>
        </TouchableOpacity>
      </View>
      {/* Maçlar listesi */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={weekMatches}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const matchResult = matchResults[item.id] || {};
            // Tarih stringini Date objesine çevir
            let dayName = '';
            if (matchResult.date || item.date) {
              const dateObj = new Date(matchResult.date || item.date);
              const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
              dayName = days[dateObj.getDay()];
            }
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MatchDetailScreen', {
                    match: { ...item, ...matchResult, tournamentId: tournament.id },
                    onSave: handleMatchSave,
                  })
                }
              >
                <View style={styles.matchBox}>
                  <View style={{ alignItems: 'center', marginBottom: 8 }}>
                    <Text style={styles.matchDate}>
                      {matchResult.date || item.date || ''}
                    </Text>
                    {/* Gün ismi sarı ve kalın */}
                    {dayName ? (
                      <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 15 }}>
                        {dayName}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.matchTeams}>{item.home}</Text>
                    <Text style={styles.matchScoreMid}>
                      {matchResult.homeScore !== undefined && matchResult.awayScore !== undefined
                        ? `  ${matchResult.homeScore} - ${matchResult.awayScore}  `
                        : '   -   '}
                    </Text>
                    <Text style={styles.matchTeams}>{item.away}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
              Henüz maç yok
            </Text>
          }
        />
      </View>

      {/* Manuel ise ekleme butonu en altta BottomBar'ın üstünde */}
      {isManual && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 70, alignItems: 'center', zIndex: 10 }}>
          <TouchableOpacity
            style={styles.addMatchButton}
            onPress={() => navigation.navigate('ManualMatchCreateScreen', { tournament })}
          >
            <Text style={styles.addMatchButtonText}>Maç Ekle</Text>
          </TouchableOpacity>
        </View>
      )}

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
  matchBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginHorizontal: 18,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  matchTeams: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  matchDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 4,
  },
  matchScoreMid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 8,
  },
  weekNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginHorizontal: 8,
  },
  arrow: {
    fontSize: 28,
    color: '#FFD700',
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  arrowDisabled: {
    color: '#ccc',
  },
  weekLabel: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginHorizontal: 8,
  },
  weekLabelInactive: {
    backgroundColor: '#eee',
  },
  weekLabelText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  allWeeksButton: {
    marginLeft: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  allWeeksButtonActive: {
    backgroundColor: '#FFD700',
  },
  allWeeksText: {
    color: '#888',
    fontWeight: 'bold',
  },
  allWeeksTextActive: {
    color: '#222',
    fontWeight: 'bold',
  },
  addMatchButton: {
    backgroundColor: '#FFD700',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 4,
    elevation: 2,
  },
  addMatchButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
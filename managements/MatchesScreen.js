import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import LocalStore from '../utils/localStore';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../DarkModeContext';
import AutoMarqueeText from '../components/AutoMarqueeText';
import AdBanner from '../components/AdBanner';

import { Text } from '../components/I18nPrimitives';

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

function generateLeagueFixtures(teams, matchType) {
  const teamList = [...teams];
  if (teamList.length % 2 !== 0) teamList.push('Bay');
  const n = teamList.length;
  const weeks = n - 1;
  const half = n / 2;
  const fixtures = [];

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

  return fixtures;
}

export default function MatchesScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  const { tournament } = route.params;
  const [activeTab, setActiveTab] = useState(1);
  const [matchResults, setMatchResults] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [results, setResults] = useState({});

  const teams = tournament.teams || [];
  const matchesKey = `matches_${tournament.id}`;
  const resultsKey = `matchResults_${tournament.id}`;

  const isManual = tournament.teamSelectType === 'MANUEL';

  useEffect(() => {
    const loadFixtures = async () => {
      const saved = await LocalStore.getItem(matchesKey);
      if (saved) {
        let loaded = JSON.parse(saved);
        if (isManual) {
          // Haftalara göre grupla
          const totalWeeks = getManualTotalWeeks();
          const grouped = Array.from({ length: totalWeeks }, (_, i) =>
            loaded.filter(m => Number(m.week) === i + 1)
          );
          setFixtures(grouped);
        } else {
          setFixtures(loaded);
        }
      } else {
        setFixtures([]);
      }
    };
    loadFixtures();
  }, [tournament.id, teams, isManual, tournament.matchType]);

  useEffect(() => {
    if (!isManual && teams.length >= 2) {
      const fixtures = generateLeagueFixtures(teams, tournament.matchType);
      setFixtures(fixtures);
      LocalStore.setItem(matchesKey, JSON.stringify(fixtures));
    }
  }, [teams, tournament.matchType, tournament.id, isManual]);

  useFocusEffect(
    React.useCallback(() => {
      const loadFixtures = async () => {
        const saved = await LocalStore.getItem(matchesKey);
        if (saved) {
          let loaded = JSON.parse(saved);
          if (isManual) {
            setFixtures(loaded);
          } else {
            setFixtures(loaded);
          }
        } else {
          setFixtures([]);
        }
      };

      const loadResults = async () => {
        const savedResults = await LocalStore.getItem(resultsKey);
        if (savedResults) setMatchResults(JSON.parse(savedResults));
      };

      loadFixtures();
      loadResults();
    }, [tournament.id, teams, isManual, tournament.matchType])
  );

  const handleMatchSave = async (updatedMatch) => {
    const updated = { ...matchResults, [updatedMatch.id]: updatedMatch };
    setMatchResults(updated);
    await LocalStore.setItem(resultsKey, JSON.stringify(updated));
  };

  const weekMatches = showAll
    ? fixtures.flat()
    : fixtures[selectedWeek - 1] || [];

  const goPrevWeek = () => setSelectedWeek(w => Math.max(1, w - 1));
  const goNextWeek = () => setSelectedWeek(w => Math.min(fixtures.length, w + 1));

  const getManualTotalWeeks = () => {
    if (tournament.matchType === 'CIFT') {
      return (teams.length - 1) * 2;
    }
    return teams.length - 1;
  };

  const goToMatchDetail = (item) => {
    if (tournament.teamSelectType === 'MANUEL') {
      navigation.navigate('ManualMatchDetailScreen', { match: item, tournament });
    } else {
      navigation.navigate('MatchDetailScreen', { match: item });
    }
  };

  useEffect(() => {
    const loadResults = async () => {
      const resultsKey = `matchResults_${tournament.id}`;
      try {
        const savedResults = await LocalStore.getItem(resultsKey);
        setResults(savedResults ? JSON.parse(savedResults) : {});
      } catch (e) {
        setResults({});
      }
    };
    loadResults();
  }, [tournament.id]);

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: '#181818' }
    ]}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={[styles.header, isDarkMode && { color: '#FFD700' }]}>
          {tournament.leagueName || 'Lig'}
        </Text>
      </View>

      {isManual ? (
        <>
          <View style={styles.weekNavRow}>
            <TouchableOpacity onPress={goPrevWeek} disabled={selectedWeek === 1 || showAll}>
              <Text style={[
                styles.arrow,
                (selectedWeek === 1 || showAll) && styles.arrowDisabled,
                isDarkMode && { color: '#FFD700' }
              ]}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.weekLabel,
                showAll && styles.weekLabelInactive,
                isDarkMode && { backgroundColor: showAll ? '#eee' : '#FFD700' }
              ]}
              onPress={() => setShowAll(false)}
              disabled={showAll}
            >
              <Text style={[
                styles.weekLabelText,
                isDarkMode && { color: '#222' }
              ]}>
                {showAll ? 'Hafta' : `${selectedWeek}. Hafta`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNextWeek} disabled={selectedWeek === fixtures.length || showAll}>
              <Text style={[
                styles.arrow,
                (selectedWeek === fixtures.length || showAll) && styles.arrowDisabled,
                isDarkMode && { color: '#FFD700' }
              ]}>{'>'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.allWeeksButton,
                showAll && styles.allWeeksButtonActive,
                isDarkMode && { backgroundColor: showAll ? '#FFD700' : '#333' }
              ]}
              onPress={() => setShowAll(s => !s)}
            >
              <Text style={[
                showAll ? styles.allWeeksTextActive : styles.allWeeksText,
                isDarkMode && { color: showAll ? '#222' : '#FFD700' }
              ]}>Tüm Haftalar</Text>
            </TouchableOpacity>
          </View>
          {(fixtures.length === 0 || !fixtures[selectedWeek - 1] || fixtures[selectedWeek - 1].length === 0) && (
            <View style={styles.infoCenter}>
              <Text style={[
                styles.infoText,
                isDarkMode && { color: '#FFD700' }
              ]}>
                Karşılaşma eklemek için sağ alttaki sarı "+" butonunu kullanın.
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <FlatList
              data={weekMatches}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const matchResult = matchResults[item.id] || {};
                let dayName = '';
                if (matchResult.date || item.date) {
                  const dateObj = new Date(matchResult.date || item.date);
                  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                  dayName = days[dateObj.getDay()];
                }
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                    <View style={[
                      styles.matchBox,
                      { flex: 1, marginVertical: 0 },
                      isDarkMode && { backgroundColor: '#232323' }
                    ]}>
                      <TouchableOpacity
                        onPress={() => goToMatchDetail({ ...item, ...matchResult })}
                        style={{ flex: 1 }}
                      >
                        <View style={{ alignItems: 'center', marginBottom: 8 }}>
                          <Text style={[
                            styles.matchDate,
                            isDarkMode && { color: '#FFD700' }
                          ]}>
                            {matchResult.date || item.date || ''}
                          </Text>
                          {dayName ? (
                            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 15 }}>
                              {dayName}
                            </Text>
                          ) : null}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                          <AutoMarqueeText
                            style={styles.matchTeamWrap}
                            textStyle={[styles.matchTeams, isDarkMode && { color: '#FFD700' }]}
                          >
                            {item.home}
                          </AutoMarqueeText>
                          <Text style={[
                            styles.matchScoreMid,
                            isDarkMode && { color: '#FFD700' }
                          ]}>
                            {matchResult.homeScore !== undefined && matchResult.awayScore !== undefined
                              ? `  ${matchResult.homeScore} - ${matchResult.awayScore}  `
                              : '   -   '}
                          </Text>
                          <AutoMarqueeText
                            style={styles.matchTeamWrap}
                            textStyle={[styles.matchTeams, isDarkMode && { color: '#FFD700' }]}
                          >
                            {item.away}
                          </AutoMarqueeText>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: isDarkMode ? '#FFD700' : '#888', marginTop: 40 }}>
                  Henüz maç yok
                </Text>
              }
            />
          </View>
          <View style={{
            position: 'absolute',
            right: 24,
            bottom: 80,
            zIndex: 10,
          }}>
            <TouchableOpacity
              style={[
                styles.addMatchButton,
                isDarkMode && { backgroundColor: '#FFD700' }
              ]}
              onPress={() => navigation.navigate('ManualMatchCreateScreen', { tournament, totalWeeks: getManualTotalWeeks() })}
            >
              <Text style={[
                styles.addMatchButtonText,
                isDarkMode && { color: '#222' }
              ]}>+</Text>
            </TouchableOpacity>
          </View>
          <AdBanner isDarkMode={isDarkMode} label="Maçlar Reklam Alanı" compact />
          <BottomBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigation={navigation}
            tournament={tournament}
          />
        </>
      ) : (
        <>
          <View style={styles.weekNavRow}>
            <TouchableOpacity onPress={goPrevWeek} disabled={selectedWeek === 1 || showAll}>
              <Text style={[
                styles.arrow,
                (selectedWeek === 1 || showAll) && styles.arrowDisabled,
                isDarkMode && { color: '#FFD700' }
              ]}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.weekLabel,
                showAll && styles.weekLabelInactive,
                isDarkMode && { backgroundColor: showAll ? '#eee' : '#FFD700' }
              ]}
              onPress={() => setShowAll(false)}
              disabled={showAll}
            >
              <Text style={[
                styles.weekLabelText,
                isDarkMode && { color: '#222' }
              ]}>
                {showAll ? 'Hafta' : `${selectedWeek}. Hafta`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNextWeek} disabled={selectedWeek === fixtures.length || showAll}>
              <Text style={[
                styles.arrow,
                (selectedWeek === fixtures.length || showAll) && styles.arrowDisabled,
                isDarkMode && { color: '#FFD700' }
              ]}>{'>'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.allWeeksButton,
                showAll && styles.allWeeksButtonActive,
                isDarkMode && { backgroundColor: showAll ? '#FFD700' : '#333' }
              ]}
              onPress={() => setShowAll(s => !s)}
            >
              <Text style={[
                showAll ? styles.allWeeksTextActive : styles.allWeeksText,
                isDarkMode && { color: showAll ? '#222' : '#FFD700' }
              ]}>Tüm Haftalar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              data={weekMatches}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const matchResult = matchResults[item.id] || {};
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
                    <View style={[
                      styles.matchBox,
                      isDarkMode && { backgroundColor: '#232323' }
                    ]}>
                      <View style={{ alignItems: 'center', marginBottom: 8 }}>
                        <Text style={[
                          styles.matchDate,
                          isDarkMode && { color: '#FFD700' }
                        ]}>
                          {matchResult.date || item.date || ''}
                        </Text>
                        {dayName ? (
                          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 15 }}>
                            {dayName}
                          </Text>
                        ) : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <AutoMarqueeText
                          style={styles.matchTeamWrap}
                          textStyle={[styles.matchTeams, isDarkMode && { color: '#FFD700' }]}
                        >
                          {item.home}
                        </AutoMarqueeText>
                        <Text style={[
                          styles.matchScoreMid,
                          isDarkMode && { color: '#FFD700' }
                        ]}>
                          {matchResult.homeScore !== undefined && matchResult.awayScore !== undefined
                            ? `  ${matchResult.homeScore} - ${matchResult.awayScore}  `
                            : '   -   '}
                        </Text>
                        <AutoMarqueeText
                          style={styles.matchTeamWrap}
                          textStyle={[styles.matchTeams, isDarkMode && { color: '#FFD700' }]}
                        >
                          {item.away}
                        </AutoMarqueeText>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: isDarkMode ? '#FFD700' : '#888', marginTop: 40 }}>
                  Henüz maç yok
                </Text>
              }
            />
          </View>
          <AdBanner isDarkMode={isDarkMode} label="Maçlar Reklam Alanı" compact />
          <BottomBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigation={navigation}
            tournament={tournament}
          />
        </>
      )}
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
    paddingBottom: 24,
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
  matchTeamWrap: {
    flex: 1,
    maxWidth: 120,
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
  infoCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});


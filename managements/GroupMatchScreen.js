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

export default function GroupMatchesScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();

  const { tournament } = route.params;
  const [activeTab, setActiveTab] = useState(1);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [groups, setGroups] = useState(tournament.groups || []);
  const [matchResults, setMatchResults] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      const fetchGroups = async () => {
        try {
          const storedGroups = await LocalStore.getItem(`groups_${tournament.id}`);
          if (storedGroups) {
            setGroups(JSON.parse(storedGroups));
          } else {
            setGroups(tournament.groups || []);
          }
        } catch (e) {
          setGroups(tournament.groups || []);
        }
      };
      const loadResults = async () => {
        const resultsKey = `matchResults_${tournament.id}`;
        try {
          const savedResults = await LocalStore.getItem(resultsKey);
          setMatchResults(savedResults ? JSON.parse(savedResults) : {});
        } catch (e) {
          setMatchResults({});
        }
      };
      fetchGroups();
      loadResults();
    }, [tournament.id])
  );

  const groupMatches = groups[selectedGroupIdx]?.matches || [];

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: '#181818' }
    ]}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={[styles.header, isDarkMode && { color: '#FFD700' }]}>
          {groups[selectedGroupIdx]?.name || `Grup ${selectedGroupIdx + 1}`} - Maçlar
        </Text>
      </View>

      <View style={styles.groupBarRow}>
        <TouchableOpacity
          onPress={() => setSelectedGroupIdx(idx => Math.max(0, idx - 1))}
          disabled={selectedGroupIdx === 0}
        >
          <Text style={[styles.arrow, selectedGroupIdx === 0 && styles.arrowDisabled, isDarkMode && { color: '#FFD700' }]}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.groupLabel, styles.groupButtonActive, isDarkMode && { backgroundColor: '#333' }]}
          disabled
        >
          <Text style={[styles.groupLabelText, isDarkMode && { color: '#FFD700' }]}>
            {groups[selectedGroupIdx]?.name || `Grup ${selectedGroupIdx + 1}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedGroupIdx(idx => Math.min(groups.length - 1, idx + 1))}
          disabled={selectedGroupIdx === groups.length - 1}
        >
          <Text style={[styles.arrow, selectedGroupIdx === groups.length - 1 && styles.arrowDisabled, isDarkMode && { color: '#FFD700' }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={groupMatches}
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
                  navigation.navigate('GroupManualMatchDetailScreen', {
                    match: { ...item, ...matchResult, tournamentId: tournament.id },
                    tournament: { ...tournament, groups },
                    groupIdx: selectedGroupIdx,
                  })
                }
              >
                <View style={[styles.matchBox, isDarkMode && { backgroundColor: '#232323' }]}>
                  <View style={{ alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.matchDate, isDarkMode && { color: '#FFD700' }]}>
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
                    <Text style={[styles.matchScoreMid, isDarkMode && { color: '#FFD700' }]}>
                      {(matchResult.homeScore !== undefined && matchResult.awayScore !== undefined && matchResult.homeScore !== '' && matchResult.awayScore !== '')
                        ? `  ${matchResult.homeScore} - ${matchResult.awayScore}  `
                        : (item.homeScore !== undefined && item.awayScore !== undefined && item.homeScore !== '' && item.awayScore !== '')
                          ? `  ${item.homeScore} - ${item.awayScore}  `
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

      <View style={{
        position: 'absolute',
        right: 24,
        bottom: 80,
        zIndex: 10,
      }}>
        <TouchableOpacity
          style={[styles.addMatchButton, isDarkMode && { backgroundColor: '#333' }]}
          onPress={() => navigation.navigate('ManualGroupMatchCreateScreen', {
            tournament: { ...tournament, groups },
            groupIdx: selectedGroupIdx,
            group: groups[selectedGroupIdx],
          })}
        >
          <MaterialCommunityIcons name="plus" size={32} color={isDarkMode ? "#FFD700" : "#222"} />
        </TouchableOpacity>
      </View>

      <AdBanner isDarkMode={isDarkMode} label="Maçlar Reklam Alanı" compact />
      <BottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigation={navigation}
        tournament={{ ...tournament, groups }}
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
    paddingBottom: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  groupBarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    marginHorizontal: 8,
  },
  groupButton: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 6,
  },
  groupButtonActive: {
    backgroundColor: '#FFD700',
  },
  groupButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
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
  matchScoreMid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 8,
  },
  addMatchButton: {
    backgroundColor: '#FFD700',
    borderRadius: 32,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginVertical: 18,
    elevation: 3,
  },
  arrow: {
    fontSize: 24,
    color: '#222',
    paddingHorizontal: 12,
  },
  arrowDisabled: {
    color: '#ccc',
  },
  groupLabel: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 6,
  },
  groupLabelText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
});


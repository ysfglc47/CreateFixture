import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import LocalStore from '../utils/localStore';
import { useFocusEffect } from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import { useDarkMode } from '../DarkModeContext';
import { getEliminationRoundTitle } from '../utils/eliminationRounds';
import AutoMarqueeText from '../components/AutoMarqueeText';
import AdBanner from '../components/AdBanner';

import { Text, TextInput } from '../components/I18nPrimitives';

function createMatchesFromWinners(winners, roundNumber) {
  const matches = [];
  for (let index = 0; index < winners.length; index += 2) {
    const home = winners[index];
    const away = winners[index + 1] || 'BAY';
    matches.push({
      id: `${roundNumber}_${index}_${Date.now()}`,
      home,
      away,
      homeScore: away === 'BAY' ? '1' : '',
      awayScore: away === 'BAY' ? '0' : '',
      winner: away === 'BAY' ? home : '',
    });
  }
  return matches;
}

function syncNextRounds(rounds, teamCount) {
  const nextRounds = rounds.map(round => ({
    ...round,
    matches: (round.matches || []).map(match => ({ ...match })),
  }));

  for (let index = 0; index < nextRounds.length; index += 1) {
    const winners = nextRounds[index].matches.map(match => match.winner).filter(Boolean);
    const allFinished = winners.length === nextRounds[index].matches.length;

    if (!allFinished || winners.length <= 1 || nextRounds[index + 1]) continue;

    const roundNumber = index + 2;
    nextRounds.push({
      roundNumber,
      title: getEliminationRoundTitle(teamCount, roundNumber - 1),
      matches: createMatchesFromWinners(winners, roundNumber),
    });
  }

  return nextRounds;
}

export default function EliminationMatchesScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const [tournament, setTournament] = useState(route.params?.tournament || {});
  const [activeTab, setActiveTab] = useState(1);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0);
  const [warning, setWarning] = useState('');

  const rounds = tournament.rounds || [];
  const selectedRound = rounds[selectedRoundIndex] || rounds[0] || { matches: [] };

  useFocusEffect(
    React.useCallback(() => {
      const loadTournament = async () => {
        const stored = await LocalStore.getItem('tournaments');
        const tournaments = stored ? JSON.parse(stored) : [];
        const freshTournament = tournaments.find(item => item.id === tournament.id);
        if (freshTournament) setTournament(freshTournament);
      };
      loadTournament();
    }, [tournament.id])
  );

  useEffect(() => {
    if (selectedRoundIndex > Math.max(0, rounds.length - 1)) {
      setSelectedRoundIndex(Math.max(0, rounds.length - 1));
    }
  }, [rounds.length, selectedRoundIndex]);

  const saveTournament = async nextTournament => {
    setTournament(nextTournament);
    const stored = await LocalStore.getItem('tournaments');
    const tournaments = stored ? JSON.parse(stored) : [];
    const updated = tournaments.map(item => (item.id === nextTournament.id ? nextTournament : item));
    await LocalStore.setItem('tournaments', JSON.stringify(updated));
  };

  const updateScore = (roundIndex, matchIndex, field, value) => {
    const updatedRounds = rounds.map((round, rIndex) => ({
      ...round,
      matches: (round.matches || []).map((match, mIndex) =>
        rIndex === roundIndex && mIndex === matchIndex
          ? { ...match, [field]: value, winner: '' }
          : match
      ),
    }));
    setTournament({ ...tournament, rounds: updatedRounds });
    setWarning('');
  };

  const finishMatch = async (roundIndex, matchIndex) => {
    const match = rounds[roundIndex]?.matches?.[matchIndex];
    if (!match || match.away === 'BAY') return;

    const homeScore = Number(match.homeScore);
    const awayScore = Number(match.awayScore);
    if (Number.isNaN(homeScore) || Number.isNaN(awayScore) || match.homeScore === '' || match.awayScore === '') {
      setWarning('Skoru tamamlamadan maçı bitiremezsiniz.');
      return;
    }
    if (homeScore === awayScore) {
      setWarning('Eleme maçında beraberlik olamaz. Uzatma veya penaltı sonucunu girin.');
      return;
    }

    const winner = homeScore > awayScore ? match.home : match.away;
    const updatedRounds = rounds.map((round, rIndex) => ({
      ...round,
      matches: (round.matches || []).map((item, mIndex) =>
        rIndex === roundIndex && mIndex === matchIndex ? { ...item, winner } : item
      ),
    }));

    const nextTournament = { ...tournament, rounds: syncNextRounds(updatedRounds, tournament.teams?.length || 2) };
    setWarning('');
    await saveTournament(nextTournament);
  };

  const goPrevRound = () => setSelectedRoundIndex(index => Math.max(0, index - 1));
  const goNextRound = () => setSelectedRoundIndex(index => Math.min(rounds.length - 1, index + 1));
  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={styles.header}>{tournament.ad || tournament.tournamentName || 'Eleme'} - Maçlar</Text>
      </View>

      <View style={styles.roundNavRow}>
        <TouchableOpacity onPress={goPrevRound} disabled={selectedRoundIndex === 0}>
          <Text style={[styles.arrow, selectedRoundIndex === 0 && styles.arrowDisabled]}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.roundLabel}>
          <Text style={styles.roundLabelText}>
            {getEliminationRoundTitle(tournament.teams?.length || 2, selectedRoundIndex)}
          </Text>
        </View>
        <TouchableOpacity onPress={goNextRound} disabled={selectedRoundIndex >= rounds.length - 1}>
          <Text style={[styles.arrow, selectedRoundIndex >= rounds.length - 1 && styles.arrowDisabled]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {warning ? <Text style={styles.warning}>{warning}</Text> : null}

      <FlatList
        data={selectedRound.matches || []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <View style={styles.matchBox}>
            <View style={styles.teamLine}>
              <AutoMarqueeText style={styles.teamNameWrap} textStyle={styles.teamName}>
                {item.home}
              </AutoMarqueeText>
              <TextInput
                style={styles.scoreInput}
                keyboardType="numeric"
                value={String(item.homeScore)}
                editable={item.away !== 'BAY' && !item.winner}
                onChangeText={value => updateScore(selectedRoundIndex, index, 'homeScore', value)}
              />
            </View>
            <View style={styles.teamLine}>
              <AutoMarqueeText style={styles.teamNameWrap} textStyle={styles.teamName}>
                {item.away}
              </AutoMarqueeText>
              <TextInput
                style={styles.scoreInput}
                keyboardType="numeric"
                value={String(item.awayScore)}
                editable={item.away !== 'BAY' && !item.winner}
                onChangeText={value => updateScore(selectedRoundIndex, index, 'awayScore', value)}
              />
            </View>
            <View style={styles.matchFooter}>
              <Text style={styles.winnerText}>
                {item.winner ? `Kazanan: ${item.winner}` : 'Kazanan bekleniyor'}
              </Text>
              {!item.winner && item.away !== 'BAY' ? (
                <TouchableOpacity style={styles.finishButton} onPress={() => finishMatch(selectedRoundIndex, index)}>
                  <Text style={styles.finishButtonText}>Bitir</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz maç yok</Text>}
      />

      <AdBanner isDarkMode={isDarkMode} label="Maçlar Reklam Alanı" compact />
      <BottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigation={navigation}
        tournament={tournament}
      />
    </View>
  );
}

function getStyles(isDarkMode) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#181818' : '#f7f7fa',
      padding: 5,
      paddingTop: 40,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18,
      marginTop: 8,
      paddingHorizontal: 24,
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFD700' : '#222',
    },
    roundNavRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    arrow: {
      fontSize: 28,
      color: '#FFD700',
      paddingHorizontal: 12,
      fontWeight: 'bold',
    },
    arrowDisabled: {
      color: '#ccc',
    },
    roundLabel: {
      backgroundColor: '#FFD700',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 7,
    },
    roundLabelText: {
      color: '#222',
      fontWeight: 'bold',
      fontSize: 16,
    },
    warning: {
      color: '#d00',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    listContent: {
      paddingBottom: 24,
    },
    matchBox: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      borderRadius: 10,
      padding: 16,
      marginHorizontal: 18,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    teamLine: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 10,
    },
    teamName: {
      color: isDarkMode ? '#FFD700' : '#222',
      fontWeight: 'bold',
      fontSize: 16,
    },
    teamNameWrap: {
      flex: 1,
      justifyContent: 'center',
    },
    scoreInput: {
      width: 56,
      borderWidth: 1,
      borderColor: '#FFD700',
      borderRadius: 8,
      paddingVertical: 8,
      textAlign: 'center',
      color: isDarkMode ? '#FFD700' : '#222',
      backgroundColor: isDarkMode ? '#333' : '#fff',
      fontWeight: 'bold',
    },
    matchFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    winnerText: {
      flex: 1,
      color: isDarkMode ? '#fff' : '#666',
      fontWeight: '600',
    },
    finishButton: {
      backgroundColor: '#FFD700',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 9,
    },
    finishButtonText: {
      color: '#222',
      fontWeight: 'bold',
    },
    emptyText: {
      textAlign: 'center',
      color: isDarkMode ? '#FFD700' : '#888',
      marginTop: 40,
    },
  });
}

import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import LocalStore from '../utils/localStore';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import AutoMarqueeText from '../components/AutoMarqueeText';
import TableExportCard from '../components/TableExportCard';
import ExportCaptureModal from '../components/ExportCaptureModal';
import { useDarkMode } from '../DarkModeContext';
import { getEliminationRoundTitle } from '../utils/eliminationRounds';
import AdBanner from '../components/AdBanner';

import { Text } from '../components/I18nPrimitives';

function getChampion(tournament) {
  const rounds = tournament.rounds || [];
  const finalRound = rounds[rounds.length - 1];
  if (!finalRound || finalRound.matches?.length !== 1) return '';
  return finalRound.matches[0].winner || '';
}

export default function EliminationBracketScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const [tournament, setTournament] = useState(route.params?.tournament || {});
  const [activeTab, setActiveTab] = useState(2);
  const [exportVisible, setExportVisible] = useState(false);

  useEffect(() => {
    const loadTournament = async () => {
      const stored = await LocalStore.getItem('tournaments');
      const tournaments = stored ? JSON.parse(stored) : [];
      const freshTournament = tournaments.find(item => item.id === tournament.id);
      if (freshTournament) setTournament(freshTournament);
    };

    loadTournament();
    const unsubscribe = navigation.addListener('focus', loadTournament);
    return unsubscribe;
  }, [navigation, tournament.id]);

  const champion = getChampion(tournament);
  const exportHeaders = useMemo(() => [
    { key: 'match', label: '#', flex: 0.45 },
    { key: 'home', label: 'Ev Sahibi', flex: 1.5 },
    { key: 'score', label: 'Skor', flex: 0.8 },
    { key: 'away', label: 'Rakip', flex: 1.5 },
    { key: 'winner', label: 'Kazanan', flex: 1.5 },
  ], []);
  const exportTables = useMemo(() => (
    (tournament.rounds || []).map((round, roundIndex) => ({
      title: getEliminationRoundTitle(tournament.teams?.length || 2, roundIndex),
      headers: exportHeaders,
      rows: (round.matches || []).map((match, matchIndex) => ({
        match: matchIndex + 1,
        home: match.home,
        score: `${match.homeScore !== '' ? match.homeScore : '-'} - ${match.awayScore !== '' ? match.awayScore : '-'}`,
        away: match.away,
        winner: match.winner || 'Bekliyor',
      })),
    }))
  ), [exportHeaders, tournament.rounds, tournament.teams]);
  const handleExport = () => {
    setExportVisible(true);
  };
  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={styles.header}>{tournament.ad || tournament.tournamentName || 'Eleme'} - Eleme Tablosu</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>PNG</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={styles.horizontalContent}
      >
        <View style={styles.roundsRow}>
          {(tournament.rounds || []).map((round, roundIndex) => (
            <View key={round.roundNumber} style={styles.roundColumn}>
              <Text style={styles.roundTitle}>
                {getEliminationRoundTitle(tournament.teams?.length || 2, roundIndex)}
              </Text>
              {(round.matches || []).map(match => (
                <View key={match.id} style={styles.matchCard}>
                  <Text style={styles.matchMeta}>{match.date || match.time || 'Tarih bekleniyor'}</Text>
                  <View style={[styles.teamRow, match.winner === match.home && styles.winnerRow]}>
                    <View style={styles.teamIcon}>
                      <Text style={styles.teamIconText}>{String(match.home || '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <AutoMarqueeText style={styles.teamNameWrap} textStyle={styles.teamName}>
                      {match.home}
                    </AutoMarqueeText>
                    <Text style={styles.scoreText}>{match.homeScore !== '' ? match.homeScore : '-'}</Text>
                  </View>
                  <View style={[styles.teamRow, match.winner === match.away && styles.winnerRow]}>
                    <View style={styles.teamIcon}>
                      <Text style={styles.teamIconText}>{String(match.away || '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <AutoMarqueeText style={styles.teamNameWrap} textStyle={styles.teamName}>
                      {match.away}
                    </AutoMarqueeText>
                    <Text style={styles.scoreText}>{match.awayScore !== '' ? match.awayScore : '-'}</Text>
                  </View>
                  <Text style={styles.statusText}>
                    {match.winner ? `Kazanan: ${match.winner}` : 'Bekliyor'}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Durum</Text>
        <Text style={styles.infoText}>
          {champion ? `Şampiyon: ${champion}` : 'Eleme tablosu maç sonuçlarına göre otomatik ilerler.'}
        </Text>
      </View>

      <ExportCaptureModal
        visible={exportVisible}
        fileName={`${tournament.ad || tournament.tournamentName || 'createfixture'}-eleme-tablosu.png`}
        onDone={() => setExportVisible(false)}
      >
        <TableExportCard
          title={tournament.ad || tournament.tournamentName || 'Eleme Turnuvası'}
          subtitle="Eleme Tablosu"
          metaItems={[
            { label: 'Turnuva Formatı', value: 'Eleme' },
            { label: 'Takım Sayısı', value: tournament.teams?.length || 0 },
            { label: 'Tur Sayısı', value: tournament.rounds?.length || 0 },
            { label: 'Şampiyon', value: champion || 'Belirlenmedi' },
          ]}
          tables={exportTables}
          ruleLines={[
            'Eleme maçlarında beraberlik olmaz.',
            'Kazanan takım otomatik olarak sonraki tura aktarılır.',
            'Tek sayıda takım varsa eşleşmeyen takım turu bay geçebilir.',
            'Skor girilmemiş maçlar Bekliyor olarak gösterilir.',
          ]}
        />
      </ExportCaptureModal>

      <AdBanner isDarkMode={isDarkMode} label="Eleme Tablosu Reklam Alanı" compact />
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
      flex: 1,
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFD700' : '#222',
    },
    exportButton: {
      backgroundColor: '#FFD700',
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 13,
    },
    exportButtonText: {
      color: '#222',
      fontSize: 12,
      fontWeight: '900',
    },
    horizontalContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    roundsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    roundColumn: {
      width: 220,
    },
    roundTitle: {
      color: isDarkMode ? '#FFD700' : '#222',
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    matchCard: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      borderRadius: 10,
      padding: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#eee',
    },
    matchMeta: {
      color: isDarkMode ? '#aaa' : '#777',
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 5,
      textAlign: 'center',
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 6,
      borderRadius: 6,
      gap: 6,
    },
    winnerRow: {
      backgroundColor: '#FFD700',
    },
    teamIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: isDarkMode ? '#333' : '#eee',
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamIconText: {
      color: '#FFD700',
      fontSize: 11,
      fontWeight: 'bold',
    },
    teamNameWrap: {
      flex: 1,
      justifyContent: 'center',
    },
    teamName: {
      color: isDarkMode ? '#FFD700' : '#222',
      fontWeight: 'bold',
      fontSize: 13,
    },
    scoreText: {
      color: isDarkMode ? '#FFD700' : '#222',
      fontWeight: 'bold',
      minWidth: 24,
      textAlign: 'right',
    },
    statusText: {
      color: isDarkMode ? '#fff' : '#666',
      fontSize: 13,
      marginTop: 8,
      fontWeight: '600',
    },
    infoBox: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      borderRadius: 10,
      padding: 12,
      marginHorizontal: 12,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: '#FFD700',
    },
    infoTitle: {
      color: '#FFD700',
      fontWeight: 'bold',
      marginBottom: 4,
    },
    infoText: {
      color: isDarkMode ? '#fff' : '#666',
      fontWeight: '600',
    },
  });
}

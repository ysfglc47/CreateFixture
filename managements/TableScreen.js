import React, { memo, useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import LocalStore from '../utils/localStore';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import AutoMarqueeText from '../components/AutoMarqueeText';
import TableExportCard from '../components/TableExportCard';
import ExportCaptureModal from '../components/ExportCaptureModal';
import { useDarkMode } from '../DarkModeContext';
import AdBanner from '../components/AdBanner';

import { Text } from '../components/I18nPrimitives';

const TableRow = memo(function TableRow({ item, index, headers, isDarkMode }) {
  const diff = item.goalsFor - item.goalsAgainst;
  const values = {
    pos: index + 1,
    played: item.played,
    win: item.win,
    draw: item.draw,
    lose: item.lose,
    gf: item.goalsFor,
    ga: item.goalsAgainst,
    avg: `${diff > 0 ? '+' : ''}${diff}`,
    points: item.points,
  };

  return (
    <View style={[styles.tableRow, isDarkMode && styles.tableRowDark]}>
      {headers.map(header => (
        header.key === 'team' ? (
          <AutoMarqueeText
            key={header.key}
            style={[styles.td, styles.teamCell, { width: header.width }]}
            textStyle={[styles.teamCellText, isDarkMode && styles.cellDark]}
          >
            {item.team}
          </AutoMarqueeText>
        ) : (
          <Text key={header.key} style={[styles.td, { width: header.width }, isDarkMode && styles.cellDark]}>
            {values[header.key]}
          </Text>
        )
      ))}
    </View>
  );
});

export default function TableScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  const { tournament } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(2);
  const [tableData, setTableData] = useState([]);
  const [matchResults, setMatchResults] = useState({});
  const [viewMode, setViewMode] = useState('short');
  const [exportVisible, setExportVisible] = useState(false);

  const matchesKey = `matches_${tournament.id}`;
  const resultsKey = `matchResults_${tournament.id}`;
  const teams = tournament.teams || [];

  useEffect(() => {
    const loadResults = async () => {
      const savedResults = await LocalStore.getItem(resultsKey);
      setMatchResults(savedResults ? JSON.parse(savedResults) : {});
    };
    loadResults();
    const unsubscribe = navigation.addListener('focus', loadResults);
    return unsubscribe;
  }, [navigation, resultsKey]);

  useEffect(() => {
    const loadTable = async () => {
      const matchesRaw = await LocalStore.getItem(matchesKey);
      let matches = matchesRaw ? JSON.parse(matchesRaw) : [];
      if (Array.isArray(matches[0])) matches = matches.flat();

      const stats = {};
      teams.forEach(team => {
        stats[team] = {
          team,
          played: 0,
          win: 0,
          draw: 0,
          lose: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
      });

      matches.forEach(match => {
        const result = matchResults[match.id];
        if (
          !result ||
          result.homeScore === undefined ||
          result.awayScore === undefined ||
          result.homeScore === '' ||
          result.awayScore === '' ||
          match.home === 'Bay' ||
          match.away === 'Bay'
        ) {
          return;
        }

        const home = match.home;
        const away = match.away;
        const homeScore = parseInt(result.homeScore, 10);
        const awayScore = parseInt(result.awayScore, 10);
        if (!stats[home] || !stats[away] || Number.isNaN(homeScore) || Number.isNaN(awayScore)) return;
        stats[home].played += 1;
        stats[away].played += 1;
        stats[home].goalsFor += homeScore;
        stats[home].goalsAgainst += awayScore;
        stats[away].goalsFor += awayScore;
        stats[away].goalsAgainst += homeScore;

        if (homeScore > awayScore) {
          stats[home].win += 1;
          stats[away].lose += 1;
          stats[home].points += tournament.points?.win ?? 3;
          stats[away].points += tournament.points?.lose ?? 0;
        } else if (homeScore < awayScore) {
          stats[away].win += 1;
          stats[home].lose += 1;
          stats[away].points += tournament.points?.win ?? 3;
          stats[home].points += tournament.points?.lose ?? 0;
        } else {
          stats[home].draw += 1;
          stats[away].draw += 1;
          stats[home].points += tournament.points?.draw ?? 1;
          stats[away].points += tournament.points?.draw ?? 1;
        }
      });

      const tableArr = Object.values(stats).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const diffA = a.goalsFor - a.goalsAgainst;
        const diffB = b.goalsFor - b.goalsAgainst;
        if (diffB !== diffA) return diffB - diffA;
        return b.goalsFor - a.goalsFor;
      });

      setTableData(tableArr);
      await LocalStore.setItem(`tableData_${tournament.id}`, JSON.stringify(tableArr));
    };

    loadTable();
  }, [matchesKey, matchResults, teams, tournament.id, tournament.points]);

  const tableMetrics = useMemo(() => {
    const sideMargins = 16;
    const shortTableWidth = Math.max(screenWidth - sideMargins, 344);
    const pos = 40;
    const played = 42;
    const win = 42;
    const draw = 42;
    const avg = 52;
    const points = 42;
    const team = Math.max(shortTableWidth - (pos + played + win + draw + avg + points), 104);

    if (viewMode === 'short') {
      return {
        tableWidth: shortTableWidth,
        headers: [
          { key: 'pos', label: '#', width: pos },
          { key: 'team', label: 'Tak?m', width: team },
          { key: 'played', label: 'O', width: played },
          { key: 'win', label: 'G', width: win },
          { key: 'draw', label: 'B', width: draw },
          { key: 'avg', label: 'Av.', width: avg },
          { key: 'points', label: 'P', width: points },
        ],
      };
    }

    return {
      tableWidth: 646,
      headers: [
        { key: 'pos', label: '#', width: 40 },
        { key: 'team', label: 'Tak?m', width: 168 },
        { key: 'played', label: 'O', width: 42 },
        { key: 'win', label: 'G', width: 42 },
        { key: 'draw', label: 'B', width: 42 },
        { key: 'lose', label: 'M', width: 42 },
        { key: 'gf', label: 'A', width: 42 },
        { key: 'ga', label: 'Y', width: 42 },
        { key: 'avg', label: 'Av.', width: 52 },
        { key: 'points', label: 'P', width: 42 },
      ],
    };
  }, [screenWidth, viewMode]);

  const headers = tableMetrics.headers;

  const exportRows = useMemo(() => (
    tableData.map((item, index) => {
      const diff = item.goalsFor - item.goalsAgainst;
      return {
        pos: index + 1,
        team: item.team,
        played: item.played,
        win: item.win,
        draw: item.draw,
        lose: item.lose,
        gf: item.goalsFor,
        ga: item.goalsAgainst,
        avg: `${diff > 0 ? '+' : ''}${diff}`,
        points: item.points,
      };
    })
  ), [tableData]);

  const exportRules = useMemo(() => {
    const rules = [
      `Galibiyet: ${tournament.points?.win ?? 3} puan`,
      `Beraberlik: ${tournament.points?.draw ?? 1} puan`,
      `Mağlubiyet: ${tournament.points?.lose ?? 0} puan`,
      'O: Oynanan maç, G: Galibiyet, B: Beraberlik, M: Mağlubiyet',
      'A: Attığı gol, Y: Yediği gol, Av.: Averaj, P: Puan',
      'Sıralama: Puan, averaj ve atılan gole göre yapılır.',
    ];
    return viewMode === 'short' ? rules.filter(line => !line.includes('M:')) : rules;
  }, [tournament.points, viewMode]);

  const handleExport = () => {
    setExportVisible(true);
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#181818' }]}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={[styles.header, isDarkMode && { color: '#FFD700' }]}>
          {tournament.leagueName || 'Lig'} - Puan Tablosu
        </Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>KAYDET</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableWrapper}>
        <View style={styles.modeRow}>
          <TouchableOpacity style={[styles.modeButton, viewMode === 'short' && styles.modeButtonActive]} onPress={() => setViewMode('short')}>
            <Text style={[styles.modeButtonText, viewMode === 'short' && styles.modeButtonTextActive]}>Kısa Bakış</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, viewMode === 'detail' && styles.modeButtonActive]} onPress={() => setViewMode('detail')}>
            <Text style={[styles.modeButtonText, viewMode === 'detail' && styles.modeButtonTextActive]}>Detaylı Bakış</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.horizontalContent}>
          <View style={[styles.tableContent, { width: tableMetrics.tableWidth }]}> 
            <View style={styles.tableHeader}>
              {headers.map(header => (
                <Text key={header.key} style={[styles.th, { width: header.width }]}>{header.label}</Text>
              ))}
            </View>
            <FlatList
              data={tableData}
              keyExtractor={(item, index) => `${item.team}_${index}`}
              renderItem={({ item, index }) => <TableRow item={item} index={index} headers={headers} isDarkMode={isDarkMode} />}
              contentContainerStyle={styles.tableListContent}
              initialNumToRender={14}
              windowSize={7}
              removeClippedSubviews
              ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode && { color: '#FFD700' }]}>Tablo yok</Text>}
            />
          </View>
        </ScrollView>
      </View>

      <View style={[styles.infoBox, isDarkMode && { backgroundColor: '#232323', borderLeftColor: '#FFD700' }]}>
        <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>O - Oynanan maç</Text>
        <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>G - Galibiyet</Text>
        <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>B - Beraberlik</Text>
        {viewMode === 'detail' ? (
          <>
            <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>M - Mağlubiyet</Text>
            <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>A - Attığı gol</Text>
            <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>Y - Yediği gol</Text>
          </>
        ) : null}
        <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>Av. - Averaj</Text>
        <Text style={[styles.infoDesc, isDarkMode && { color: '#FFD700' }]}>P - Puan</Text>
      </View>

      <ExportCaptureModal
        visible={exportVisible}
        fileName={`${tournament.leagueName || tournament.tournamentName || 'createfixture'}-tablo.png`}
        onDone={() => setExportVisible(false)}
      >
        <TableExportCard
          title={tournament.leagueName || tournament.tournamentName || 'Lig Tablosu'}
          subtitle="Puan Tablosu"
          metaItems={[
            { label: 'Turnuva Formatı', value: 'Lig' },
            { label: 'Takım Sayısı', value: teams.length },
            { label: 'Maç Tipi', value: tournament.matchType || '-' },
            { label: 'Görünüm', value: viewMode === 'short' ? 'Kısa Bakış' : 'Detaylı Bakış' },
          ]}
          tables={[
            {
              title: 'Puan Tablosu',
              headers,
              rows: exportRows,
            },
          ]}
          ruleLines={exportRules}
        />
      </ExportCaptureModal>

      <AdBanner isDarkMode={isDarkMode} label="Tablo Reklam Alanı" compact />
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation} tournament={tournament} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', padding: 5, paddingTop: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 8, paddingHorizontal: 24 },
  header: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#222' },
  exportButton: { backgroundColor: '#FFD700', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 13 },
  exportButtonText: { color: '#222', fontSize: 12, fontWeight: '900' },
  tableWrapper: { flex: 1 },
  modeRow: { flexDirection: 'row', gap: 8, marginHorizontal: 8, marginBottom: 8 },
  modeButton: { flex: 1, borderRadius: 14, paddingVertical: 7, backgroundColor: '#eee', alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#FFD700' },
  modeButtonText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
  modeButtonTextActive: { color: '#222' },
  horizontalContent: { paddingBottom: 8 },
  tableContent: { flexShrink: 0 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#FFD700', paddingVertical: 6, paddingHorizontal: 0, borderRadius: 8, marginHorizontal: 8, marginBottom: 3, alignItems: 'center', minHeight: 32, overflow: 'hidden' },
  th: { fontWeight: 'bold', color: '#222', textAlign: 'center', fontSize: 13, paddingHorizontal: 2 },
  tableListContent: { paddingBottom: 8 },
  tableRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 7, paddingHorizontal: 0, marginHorizontal: 8, marginBottom: 2, borderRadius: 8, alignItems: 'center', minHeight: 34, overflow: 'hidden' },
  tableRowDark: { backgroundColor: '#232323' },
  td: { color: '#222', textAlign: 'center', fontSize: 13, fontWeight: 'bold', paddingHorizontal: 2 },
  teamCell: { alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 4, paddingRight: 4 },
  teamCellText: { color: '#222', fontSize: 13, fontWeight: 'bold' },
  cellDark: { color: '#FFD700' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 28 },
  infoBox: { backgroundColor: '#fff', borderRadius: 8, padding: 8, marginTop: 8, marginHorizontal: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  infoDesc: { color: '#888', fontSize: 12, marginBottom: 1 },
});

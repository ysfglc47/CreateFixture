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

const GroupTableRow = memo(function GroupTableRow({ item, index, headers, isDarkMode }) {
  const diff = item.gf - item.ga;
  const values = {
    pos: index + 1,
    played: item.played,
    win: item.win,
    draw: item.draw,
    lose: item.lose,
    gf: item.gf,
    ga: item.ga,
    avg: `${diff > 0 ? '+' : ''}${diff}`,
    points: item.points,
  };

  return (
    <View style={[styles.tableRow, isDarkMode && styles.tableRowDark]}>
      {headers.map(header => (
        header.key === 'team' ? (
          <AutoMarqueeText
            key={header.key}
            style={[styles.cell, styles.teamCell, { width: header.width }]}
            textStyle={[styles.teamCellText, isDarkMode && styles.cellDark]}
          >
            {item.team}
          </AutoMarqueeText>
        ) : (
          <Text key={header.key} style={[styles.cell, { width: header.width }, isDarkMode && styles.cellDark]}>
            {values[header.key]}
          </Text>
        )
      ))}
    </View>
  );
});

export default function GroupTableScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  const { tournament } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState(2);
  const [viewMode, setViewMode] = useState('short');
  const [exportVisible, setExportVisible] = useState(false);

  useEffect(() => {
    const loadTables = async () => {
      const groupsKey = `groups_${tournament.id}`;
      const resultsKey = `matchResults_${tournament.id}`;
      try {
        const savedGroups = await LocalStore.getItem(groupsKey);
        const groupsArr = savedGroups ? JSON.parse(savedGroups) : (tournament.groups || []);
        const savedResults = await LocalStore.getItem(resultsKey);
        const results = savedResults ? JSON.parse(savedResults) : {};

        const allTables = groupsArr.map((group, groupIdx) => {
          const table = (group.teams || []).map(team => ({
            team,
            played: 0,
            win: 0,
            draw: 0,
            lose: 0,
            gf: 0,
            ga: 0,
            points: 0,
          }));

          (group.matches || []).forEach(match => {
            const result = results[match.id] || match;
            if (
              !result ||
              result.homeScore === '' ||
              result.awayScore === '' ||
              Number.isNaN(Number(result.homeScore)) ||
              Number.isNaN(Number(result.awayScore))
            ) {
              return;
            }

            const homeIdx = table.findIndex(team => team.team === match.home);
            const awayIdx = table.findIndex(team => team.team === match.away);
            if (homeIdx === -1 || awayIdx === -1) return;

            const homeScore = Number(result.homeScore);
            const awayScore = Number(result.awayScore);
            table[homeIdx].played += 1;
            table[awayIdx].played += 1;
            table[homeIdx].gf += homeScore;
            table[homeIdx].ga += awayScore;
            table[awayIdx].gf += awayScore;
            table[awayIdx].ga += homeScore;

            if (homeScore > awayScore) {
              table[homeIdx].win += 1;
              table[awayIdx].lose += 1;
              table[homeIdx].points += tournament.points?.win ?? 3;
              table[awayIdx].points += tournament.points?.lose ?? 0;
            } else if (homeScore < awayScore) {
              table[awayIdx].win += 1;
              table[homeIdx].lose += 1;
              table[awayIdx].points += tournament.points?.win ?? 3;
              table[homeIdx].points += tournament.points?.lose ?? 0;
            } else {
              table[homeIdx].draw += 1;
              table[awayIdx].draw += 1;
              table[homeIdx].points += tournament.points?.draw ?? 1;
              table[awayIdx].points += tournament.points?.draw ?? 1;
            }
          });

          table.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const diff = (b.gf - b.ga) - (a.gf - a.ga);
            if (diff !== 0) return diff;
            return b.gf - a.gf;
          });

          return {
            groupName: group.name || `Grup ${groupIdx + 1}`,
            table,
          };
        });

        setTables(allTables);
      } catch (e) {
        setTables([]);
      }
    };

    loadTables();
  }, [tournament.id, tournament.groups, tournament.points]);

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

  const exportTables = useMemo(() => (
    tables.map(groupTable => ({
      title: groupTable.groupName,
      headers,
      rows: groupTable.table.map((item, index) => {
        const diff = item.gf - item.ga;
        return {
          pos: index + 1,
          team: item.team,
          played: item.played,
          win: item.win,
          draw: item.draw,
          lose: item.lose,
          gf: item.gf,
          ga: item.ga,
          avg: `${diff > 0 ? '+' : ''}${diff}`,
          points: item.points,
        };
      }),
    }))
  ), [headers, tables]);

  const exportRules = useMemo(() => {
    const rules = [
      `Galibiyet: ${tournament.points?.win ?? 3} puan`,
      `Beraberlik: ${tournament.points?.draw ?? 1} puan`,
      `Mağlubiyet: ${tournament.points?.lose ?? 0} puan`,
      'O: Oynanan maç, G: Galibiyet, B: Beraberlik, M: Mağlubiyet',
      'A: Attığı gol, Y: Yediği gol, Av.: Averaj, P: Puan',
      'Grup sıralaması puan, averaj ve atılan gole göre yapılır.',
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
        <Text style={[styles.tournamentName, isDarkMode && { color: '#FFD700' }]}>
          {tournament.name || tournament.ad || 'Grup Tablosu'}
        </Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>PNG</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity style={[styles.modeButton, viewMode === 'short' && styles.modeButtonActive]} onPress={() => setViewMode('short')}>
          <Text style={[styles.modeButtonText, viewMode === 'short' && styles.modeButtonTextActive]}>Kısa Bakış</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeButton, viewMode === 'detail' && styles.modeButtonActive]} onPress={() => setViewMode('detail')}>
          <Text style={[styles.modeButtonText, viewMode === 'detail' && styles.modeButtonTextActive]}>Detaylı Bakış</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tables.map((groupTable, idx) => (
          <View key={`${groupTable.groupName}_${idx}`} style={[styles.groupBox, isDarkMode && { backgroundColor: '#232323' }]}>
            <Text style={styles.groupName}>{groupTable.groupName}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.horizontalContent}>
              <View style={[styles.tableContent, { width: tableMetrics.tableWidth }]}> 
                <View style={styles.tableHeader}>
                  {headers.map(header => (
                    <Text key={header.key} style={[styles.cellHeader, { width: header.width }]}>{header.label}</Text>
                  ))}
                </View>
                <FlatList
                  data={groupTable.table}
                  keyExtractor={(item, index) => `${groupTable.groupName}_${item.team}_${index}`}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => <GroupTableRow item={item} index={index} headers={headers} isDarkMode={isDarkMode} />}
                  ListEmptyComponent={<Text style={[styles.emptyText, isDarkMode && { color: '#FFD700' }]}>Henüz takım yok</Text>}
                />
              </View>
            </ScrollView>
          </View>
        ))}
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
      </ScrollView>

      <ExportCaptureModal
        visible={exportVisible}
        fileName={`${tournament.name || tournament.ad || 'createfixture'}-grup-tablosu.png`}
        onDone={() => setExportVisible(false)}
      >
        <TableExportCard
          title={tournament.name || tournament.ad || tournament.tournamentName || 'Grup Turnuvası'}
          subtitle="Grup Puan Tabloları"
          metaItems={[
            { label: 'Turnuva Formatı', value: 'Grup' },
            { label: 'Grup Sayısı', value: tables.length },
            { label: 'Takım Sayısı', value: tables.reduce((total, group) => total + group.table.length, 0) },
            { label: 'Görünüm', value: viewMode === 'short' ? 'Kısa Bakış' : 'Detaylı Bakış' },
          ]}
          tables={exportTables}
          ruleLines={exportRules}
        />
      </ExportCaptureModal>

      <AdBanner isDarkMode={isDarkMode} label="Tablo Reklam Alanı" compact />
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation} tournament={tournament} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7fa', paddingTop: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, marginTop: 8, paddingHorizontal: 16 },
  tournamentName: { flex: 1, fontSize: 18, color: '#222', fontWeight: 'bold' },
  exportButton: { backgroundColor: '#FFD700', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 13 },
  exportButtonText: { color: '#222', fontSize: 12, fontWeight: '900' },
  modeRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  modeButton: { flex: 1, borderRadius: 14, paddingVertical: 7, backgroundColor: '#eee', alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#FFD700' },
  modeButtonText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
  modeButtonTextActive: { color: '#222' },
  content: { paddingBottom: 24 },
  groupBox: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 12, marginBottom: 12, paddingVertical: 8, paddingHorizontal: 6, elevation: 1 },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 7, textAlign: 'center', backgroundColor: '#FFD700', paddingVertical: 5, borderRadius: 8 },
  horizontalContent: { paddingBottom: 4 },
  tableContent: { flexShrink: 0 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#FFD700', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 0, marginBottom: 3, minHeight: 32, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 0, marginBottom: 2, minHeight: 34, overflow: 'hidden' },
  tableRowDark: { backgroundColor: '#181818' },
  cellHeader: { fontSize: 13, color: '#222', fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 2 },
  cell: { fontSize: 13, color: '#444', textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 2 },
  teamCell: { alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 4, paddingRight: 4 },
  teamCellText: { color: '#222', fontSize: 13, fontWeight: 'bold' },
  cellDark: { color: '#FFD700' },
  emptyText: { textAlign: 'center', color: '#888', marginVertical: 8 },
  infoBox: { backgroundColor: '#fff', borderRadius: 8, padding: 8, marginTop: 4, marginHorizontal: 12, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  infoDesc: { color: '#888', fontSize: 12, marginBottom: 1 },
});

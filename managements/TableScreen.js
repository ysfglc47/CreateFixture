import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import BottomBar from '../components/BottomBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TableScreen({ route, navigation }) {
  const { tournament } = route.params;
  const [activeTab, setActiveTab] = useState(2);
  const [tableData, setTableData] = useState([]);
  const [matchResults, setMatchResults] = useState({});

  const matchesKey = `matches_${tournament.id}`;
  const resultsKey = `matchResults_${tournament.id}`;
  const teams = tournament.teams || [];

  // Maç sonuçlarını oku
  useEffect(() => {
    const loadResults = async () => {
      const savedResults = await AsyncStorage.getItem(resultsKey);
      setMatchResults(savedResults ? JSON.parse(savedResults) : {});
    };
    loadResults();
    // TableScreen'e her dönüşte güncelle
    const unsubscribe = navigation.addListener('focus', loadResults);
    return unsubscribe;
  }, [tournament.id, navigation]);

  // Tabloyu güncelle
  useEffect(() => {
    const loadTable = async () => {
      const matchesRaw = await AsyncStorage.getItem(matchesKey);
      let matches = matchesRaw ? JSON.parse(matchesRaw) : [];

      // Eğer matches çok boyutlu ise düzleştir:
      if (Array.isArray(matches[0])) {
        matches = matches.flat();
      }

      // id karşılaştırma logları
      const matchIds = matches.map(m => m.id);
      const resultIds = Object.keys(matchResults);

      // Eşleşmeyen id'leri bul
      const missingInResults = matchIds.filter(id => !resultIds.includes(id));
      const missingInMatches = resultIds.filter(id => !matchIds.includes(id));

      // Takım bazlı istatistikleri hesapla
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
          result &&
          result.homeScore !== undefined &&
          result.awayScore !== undefined &&
          result.homeScore !== "" &&
          result.awayScore !== "" &&
          match.home !== 'Bay' &&
          match.away !== 'Bay'
        ) {
          const home = match.home;
          const away = match.away;
          const homeScore = parseInt(result.homeScore, 10);
          const awayScore = parseInt(result.awayScore, 10);

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
        }
      });

      // Sıralama: puan, averaj, atılan gol
      const tableArr = Object.values(stats).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const avgA = a.goalsFor - a.goalsAgainst;
        const avgB = b.goalsFor - b.goalsAgainst;
        if (avgB !== avgA) return avgB - avgA;
        return b.goalsFor - a.goalsFor;
      });

      // Sadece veri değiştiyse tabloyu güncelle
      if (JSON.stringify(tableArr) !== JSON.stringify(tableData)) {
        setTableData(tableArr);
        await AsyncStorage.setItem(`tableData_${tournament.id}`, JSON.stringify(tableArr)); // tabloyu kaydet
      }
    };

    loadTable();
  }, [tournament.id, tournament.teams, matchResults]);

  // Tablo başlıkları
  const headers = [
    { key: 'pos', label: 'Sıra', flex: 0.7 },
    { key: 'team', label: 'Takım', flex: 2 },
    { key: 'played', label: 'O', flex: 0.9 },
    { key: 'win', label: 'G', flex: 0.9 },
    { key: 'draw', label: 'B', flex: 0.9 },
    { key: 'lose', label: 'M', flex: 0.9 },
    { key: 'gfga', label: 'A/Y', flex: 1.2 },
    { key: 'avg', label: 'Av.', flex: 1 }, // Averaj sütunu eklendi
    { key: 'points', label: 'P', flex: 1 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.header}>{tournament.leagueName || 'Lig'} - Lig Puan Tablosu</Text>
      </View>

      {/* Tablo */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          {headers.map(h => (
            <Text key={h.key} style={[styles.th, { flex: h.flex }]}>{h.label}</Text>
          ))}
        </View>
        <FlatList
          data={tableData}
          keyExtractor={(item, idx) => item.team + '_' + idx}
          renderItem={({ item, index }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { flex: headers[0].flex }]}>{index + 1}</Text>
              <Text
                style={[styles.td, styles.teamCell, { flex: headers[1].flex }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.team}
              </Text>
              <Text style={[styles.td, { flex: headers[2].flex }]}>{item.played}</Text>
              <Text style={[styles.td, { flex: headers[3].flex }]}>{item.win}</Text>
              <Text style={[styles.td, { flex: headers[4].flex }]}>{item.draw}</Text>
              <Text style={[styles.td, { flex: headers[5].flex }]}>{item.lose}</Text>
              <Text style={[styles.td, { flex: headers[6].flex }]}>{item.goalsFor}:{item.goalsAgainst}</Text>
              <Text style={[styles.td, { flex: headers[7].flex }]}>
                {item.goalsFor - item.goalsAgainst > 0 ? '+' : ''}
                {item.goalsFor - item.goalsAgainst}
              </Text>
              <Text style={[styles.td, { flex: headers[8].flex }]}>{item.points}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Tablo yok</Text>}
        />
      </View>

      {/* Açıklama kutusu hemen altına, boşluksuz */}
      <View style={styles.infoBox}>
        <Text style={styles.infoDesc}>O - Oynanan maç</Text>
        <Text style={styles.infoDesc}>G - Galibiyet</Text>
        <Text style={styles.infoDesc}>B - Beraberlik</Text>
        <Text style={styles.infoDesc}>M - Mağlubiyet</Text>
        <Text style={styles.infoDesc}>A - Attığı gol</Text>
        <Text style={styles.infoDesc}>Y - Yediği gol</Text>
        <Text style={styles.infoDesc}>Av. - Averaj (Attığı - Yediği)</Text>
        <Text style={styles.infoDesc}>P - Puan</Text>
      </View>
      
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
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  tableWrapper: {
    flex: 3,
    marginBottom: 0, // boşluk olmasın
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  th: {
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    fontSize: 15,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    marginBottom: 2,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  td: {
    color: '#222',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  teamCell: {
    fontSize: 13, // Takım ismi kutusunda fontu küçült
    maxWidth: 90, // Gerekirse genişliği sınırla
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginTop: 10, // üstte boşluk olmasın
    marginHorizontal: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  infoTitle: {
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 6,
    fontSize: 15,
  },
  infoDesc: {
    color: '#888',
    fontSize: 13,
    marginBottom: 1,
  },
});
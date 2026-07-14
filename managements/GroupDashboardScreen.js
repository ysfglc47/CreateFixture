import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import LocalStore from '../utils/localStore';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import LottieView from '../components/LottieView';
import { useDarkMode } from '../DarkModeContext';
import AdBanner from '../components/AdBanner';

import { Text } from '../components/I18nPrimitives';

export default function GroupDashboardScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();

  const { tournament } = route.params;
  const [groups, setGroups] = useState(tournament.groups || []);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showFullAnimation, setShowFullAnimation] = useState(false);

  const [winnerTeams, setWinnerTeams] = useState([]);

  const calculateWinners = async () => {
    const groupsKey = `groups_${tournament.id}`;
    const resultsKey = `matchResults_${tournament.id}`;
    try {
      const savedGroups = await LocalStore.getItem(groupsKey);
      const groupsArr = savedGroups ? JSON.parse(savedGroups) : (tournament.groups || []);
      const savedResults = await LocalStore.getItem(resultsKey);
      const results = savedResults ? JSON.parse(savedResults) : {};

      const winners = groupsArr.map((group, idx) => {
        const teams = group.teams || [];
        const matches = group.matches || [];
        const table = teams.map(team => ({
          team,
          played: 0,
          win: 0,
          draw: 0,
          lose: 0,
          gf: 0,
          ga: 0,
          points: 0,
        }));

        matches.forEach(match => {
          const result = results[match.id] || match;
          if (
            result &&
            result.homeScore !== '' &&
            result.awayScore !== '' &&
            !isNaN(result.homeScore) &&
            !isNaN(result.awayScore)
          ) {
            const homeIdx = table.findIndex(t => t.team === match.home);
            const awayIdx = table.findIndex(t => t.team === match.away);
            if (homeIdx === -1 || awayIdx === -1) return;

            table[homeIdx].played += 1;
            table[awayIdx].played += 1;
            table[homeIdx].gf += Number(result.homeScore);
            table[homeIdx].ga += Number(result.awayScore);
            table[awayIdx].gf += Number(result.awayScore);
            table[awayIdx].ga += Number(result.homeScore);

            if (Number(result.homeScore) > Number(result.awayScore)) {
              table[homeIdx].win += 1;
              table[awayIdx].lose += 1;
              table[homeIdx].points += 3;
            } else if (Number(result.homeScore) < Number(result.awayScore)) {
              table[awayIdx].win += 1;
              table[homeIdx].lose += 1;
              table[awayIdx].points += 3;
            } else {
              table[homeIdx].draw += 1;
              table[awayIdx].draw += 1;
              table[homeIdx].points += 1;
              table[awayIdx].points += 1;
            }
          }
        });

        table.sort((a, b) =>
          b.points - a.points ||
          (b.gf - b.ga) - (a.gf - a.ga) ||
          b.gf - a.gf
        );

        return {
          team: table.length > 0 ? table[0].team.toUpperCase() : '-',
          groupName: group.name || `Grup ${idx + 1}`,
        };
      });
      setWinnerTeams(winners);
    } catch (error) {
      console.error('Error calculating winners:', error);
    }
  };

  useEffect(() => {
    calculateWinners();
  }, [groups]);

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: '#181818' }
    ]}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Kutulu bilgiler */}
          <View style={[styles.infoBox, isDarkMode && styles.infoBoxDark]}>
            <Text style={[styles.infoLabel, isDarkMode && styles.infoLabelDark]}>Turnuva adı</Text>
            <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{tournament.ad || tournament.tournamentName || '-'}</Text>
          </View>
          <View style={[styles.infoBox, isDarkMode && styles.infoBoxDark]}>
            <Text style={[styles.infoLabel, isDarkMode && styles.infoLabelDark]}>Grup adı</Text>
            <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{tournament.groupName || '-'}</Text>
          </View>
          <View style={[styles.infoBox, isDarkMode && styles.infoBoxDark]}>
            <Text style={[styles.infoLabel, isDarkMode && styles.infoLabelDark]}>Aşama tipi</Text>
            <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{tournament.mode === 'GRUP' ? 'Grup' : tournament.mode || '-'}</Text>
          </View>
          <View style={[styles.infoBox, isDarkMode && styles.infoBoxDark]}>
            <Text style={[styles.infoLabel, isDarkMode && styles.infoLabelDark]}>Maç tipi</Text>
            <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>
              {tournament.matchType === 'TEK'
                ? 'Tek Devre'
                : tournament.matchType === 'CIFT'
                ? 'Çift Devre'
                : '-'}
            </Text>
          </View>
          {/* Aşama durumu ve animasyon */}
          <View style={[styles.infoBox, isDarkMode && styles.infoBoxDark]}>
            <Text style={[styles.infoLabel, isDarkMode && styles.infoLabelDark]}>Aşama durumu</Text>
            {showAnimation ? (
              <>
                <Text style={[styles.infoValue, { color: '#0a0' }]}>AŞAMA TAMAMLANDI</Text>
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  {winnerTeams.map((winner, idx) => (
                    <View key={idx} style={{ alignItems: 'center', marginBottom: 12 }}>
                      <LottieView
                        source={require('../assets/FirstPlace.json')}
                        autoPlay
                        loop={false}
                        style={{ width: 120, height: 120 }}
                      />
                      <Text style={[styles.winnerText, isDarkMode && { color: '#FFD700' }]}>
                        {winner.team} ({winner.groupName})
                      </Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    backgroundColor: '#FFD700',
                    borderRadius: 22,
                    padding: 10,
                    alignSelf: 'center',
                    elevation: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setShowFullAnimation(true)}
                >
                  <MaterialCommunityIcons name="fullscreen" size={28} color="#222" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    backgroundColor: '#FFD700',
                    borderRadius: 18,
                    paddingHorizontal: 24,
                    paddingVertical: 10,
                    alignSelf: 'center',
                    elevation: 2,
                  }}
                  onPress={() => setShowAnimation(false)}
                >
                  <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>Geri Dön</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>Devam ediyor</Text>
            )}
          </View>
          {/* Kurallar kutusu */}
          <TouchableOpacity style={[styles.infoBox, isDarkMode && styles.infoBoxDark]} onPress={() => setRulesOpen(!rulesOpen)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.infoLabel, { fontWeight: 'bold', fontSize: 17 }, isDarkMode && styles.infoLabelDark]}>Kurallar</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={rulesOpen ? 'angle-up' : 'angle-down'} size={26} color="#FFD600" />
              </View>
            </View>
            {rulesOpen && (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.rulesText, isDarkMode && styles.rulesTextDark]}>
                  Galibiyet puanı: {tournament.points?.win ?? '-'}
                </Text>
                <Text style={[styles.rulesText, isDarkMode && styles.rulesTextDark]}>
                  Beraberlik puanı: {tournament.points?.draw ?? '-'}
                </Text>
                <Text style={[styles.rulesText, isDarkMode && styles.rulesTextDark]}>
                  Mağlubiyet puanı: {tournament.points?.lose ?? '-'}
                </Text>
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.rulesText, { fontWeight: 'bold', marginBottom: 4 }, isDarkMode && { color: '#FFD700' }]}>Sıralama Önceliği:</Text>
                  {Array.isArray(tournament.orderRules) && tournament.orderRules.length > 0 ? (
                    tournament.orderRules.map((rule, idx) => (
                      <Text key={rule.key || idx} style={[styles.rulesText, isDarkMode && styles.rulesTextDark]}>
                        {idx + 1}. {rule.label}
                      </Text>
                    ))
                  ) : (
                    <Text style={[styles.rulesText, isDarkMode && styles.rulesTextDark]}>-</Text>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
          <AdBanner isDarkMode={isDarkMode} label="Panel Reklam Alanı" compact />
          {/* Aşamayı Bitir butonu */}
          {!showAnimation && (
            <View style={{ alignItems: 'flex-end', marginRight: 18, marginTop: 10, marginBottom: 90 }}>
              <TouchableOpacity style={styles.finishButton} onPress={() => setShowAnimation(true)}>
                <Text style={styles.finishButtonText}>Aşamayı Bitir</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
      {/* Tam ekran animasyon modalı */}
      <Modal visible={showFullAnimation} transparent animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <LottieView
            source={require('../assets/FirstPlace.json')}
            autoPlay
            loop={false}
            style={{ width: 320, height: 320 }}
          />
          {winnerTeams.map((winner, idx) => (
            <Text key={idx} style={[styles.winnerText, { color: '#fff', fontSize: 36 }]}>
              {winner.team} ({winner.groupName})
            </Text>
          ))}
          <TouchableOpacity
            style={{
              marginTop: 24,
              backgroundColor: '#FFD700',
              borderRadius: 18,
              paddingHorizontal: 32,
              paddingVertical: 14,
              alignSelf: 'center',
              elevation: 2,
            }}
            onPress={() => setShowFullAnimation(false)}
          >
            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Alt ikon menüsü */}
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 18,
    marginTop: 24,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subHeader: {
    fontSize: 15,
    color: '#888',
    marginBottom: 3,
    fontWeight: '600',
  },
  finishButtonWrapper: {
    position: 'absolute',
    right: 18,
    bottom: 80,
    zIndex: 10,
  },
  finishButton: {
    backgroundColor: '#FFD700',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 10,
    elevation: 2,
  },
  finishButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#f3f3f7',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  infoBoxDark: {
    backgroundColor: '#232323',
    shadowColor: '#000',
  },
  infoLabel: {
    color: '#888',
    fontSize: 15,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoLabelDark: {
    color: '#FFD700',
  },
  infoValue: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoValueDark: {
    color: '#fff',
  },
  rulesText: {
    color: '#444',
    fontSize: 15,
    marginBottom: 2,
  },
  rulesTextDark: {
    color: '#fff',
  },
  winnerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  groupBox: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  groupTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 15,
    color: '#222',
    marginLeft: 12,
    marginBottom: 2,
  },
});



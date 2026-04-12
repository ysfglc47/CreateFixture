import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../components/BottomBar';
import LottieView from 'lottie-react-native';

export default function TournamentDashboardScreen({ route, navigation }) {
  const { tournament } = route.params;
  const [tableData, setTableData] = useState([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  // Animasyon state'ini kalıcı tut
  useEffect(() => {
    const fetchTable = async () => {
      const savedTable = await AsyncStorage.getItem(`tableData_${tournament.id}`);
      setTableData(savedTable ? JSON.parse(savedTable) : []);
      const savedAnim = await AsyncStorage.getItem(`showAnimation_${tournament.id}`);
      setShowAnimation(savedAnim === 'true');
    };
    fetchTable();
    const unsubscribe = navigation.addListener('focus', fetchTable);
    return unsubscribe;
  }, [tournament.id, navigation]);

  // Animasyon state'i değişince kaydet
  useEffect(() => {
    AsyncStorage.setItem(`showAnimation_${tournament.id}`, showAnimation ? 'true' : 'false');
  }, [showAnimation, tournament.id]);

  // Tablo güncellenirse animasyonu kapat
  useEffect(() => {
    if (showAnimation) {
      setShowAnimation(false);
    }
  }, [tableData]);

  const winnerTeam =
    Array.isArray(tableData) && tableData.length > 0
      ? tableData[0].team.toUpperCase()
      : '-';

  return (
    <View style={styles.container}>
      {/* Üst bar: Sadece sağda Home butonu */}
      <View style={styles.topRow}>
        <View /> 
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          <Icon name="home" size={40} color="#222" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Kutulu bilgiler */}
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Turnuva adı</Text>
            <Text style={styles.infoValue}>{tournament.ad || '-'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Lig adı</Text>
            <Text style={styles.infoValue}>{tournament.leagueName || '-'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Aşama tipi</Text>
            <Text style={styles.infoValue}>Lig</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Aşama durumu</Text>
            {showAnimation ? (
              <>
                <Text style={[styles.infoValue, { color: '#0a0' }]}>AŞAMA BİTTİ</Text>
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  <LottieView
                    source={require('../assets/FirstPlace.json')}
                    autoPlay
                    loop={false}
                    style={{ width: 140, height: 140 }}
                  />
                  <Text style={styles.winnerText}>{winnerTeam}</Text>
                  {/* Geri git butonu */}
                  <TouchableOpacity
                    style={{
                      marginTop: 18,
                      backgroundColor: '#FFD700',
                      borderRadius: 18,
                      paddingHorizontal: 24,
                      paddingVertical: 10,
                      alignSelf: 'center',
                      elevation: 2,
                    }}
                    onPress={() => setShowAnimation(false)}
                  >
                    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>Geri Git</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.infoValue}>Devam ediyor</Text>
            )}
          </View>
          {/* Kurallar kutusu */}
          <TouchableOpacity style={styles.infoBox} onPress={() => setRulesOpen(!rulesOpen)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.infoLabel, { fontWeight: 'bold', fontSize: 17 }]}>Kurallar</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('LeagueCreate', {
                    tournamentName: tournament.ad,
                    leagueName: tournament.leagueName,
                    matchType: tournament.matchType,
                    points: tournament.points,
                    teamSelectType: tournament.teamSelectType,
                    orderRules: tournament.orderRules, // Tek parametre!
                    teams: tournament.teams,
                    tournamentId: tournament.id,
                  })}
                  style={{ marginRight: 10 }}
                >
                  <Icon name="pencil" size={20} color="#FFD600" />
                </TouchableOpacity>
                <Icon name={rulesOpen ? 'angle-up' : 'angle-down'} size={26} color="#FFD600" />
              </View>
            </View>
            {rulesOpen && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.rulesText}>
                  Galibiyet puanı: {tournament.points?.win ?? '-'}
                </Text>
                <Text style={styles.rulesText}>
                  Beraberlik puanı: {tournament.points?.draw ?? '-'}
                </Text>
                <Text style={styles.rulesText}>
                  Mağlubiyet puanı: {tournament.points?.lose ?? '-'}
                </Text>
                <Text style={styles.rulesText}>
                  Takım eşleşme yöntemi: {tournament.teamSelectType === 'RASTGELE' ? 'Rastgele' : tournament.teamSelectType === 'MANUEL' ? 'Manuel' : '-'}
                </Text>
                {/* Sıralama Önceliği başlığı ve maddeleri */}
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.rulesText, { fontWeight: 'bold', marginBottom: 4 }]}>Sıralama Önceliği:</Text>
                  {Array.isArray(tournament.orderRules) && tournament.orderRules.length > 0 ? (
                    tournament.orderRules.map((rule, idx) => (
                      <Text key={rule.key || idx} style={styles.rulesText}>
                        {idx + 1}. {rule.label}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.rulesText}>-</Text>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>

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
    justifyContent: 'space-between',
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
    bottom: 80, // BottomBar'ın üstünde dursun diye
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
  infoLabel: {
    color: '#888',
    fontSize: 15,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rulesText: {
    color: '#444',
    fontSize: 15,
    marginBottom: 2,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
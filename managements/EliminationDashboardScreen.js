import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import LocalStore from '../utils/localStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import LottieView from '../components/LottieView';
import { useDarkMode } from '../DarkModeContext';
import AdBanner from '../components/AdBanner';

import { Text } from '../components/I18nPrimitives';

function getChampion(tournament) {
  const rounds = tournament.rounds || [];
  const finalRound = rounds[rounds.length - 1];
  if (!finalRound || finalRound.matches?.length !== 1) return '';
  return finalRound.matches[0].winner || '';
}

function getMatchCounts(tournament) {
  const rounds = tournament.rounds || [];
  const matches = rounds.flatMap(round => round.matches || []);
  return {
    total: matches.length,
    completed: matches.filter(match => match.winner).length,
  };
}

export default function EliminationDashboardScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const [tournament, setTournament] = useState(route.params?.tournament || {});
  const [activeTab, setActiveTab] = useState(0);
  const [showFullAnimation, setShowFullAnimation] = useState(false);

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
  const counts = getMatchCounts(tournament);
  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Turnuva adı</Text>
            <Text style={styles.infoValue}>{tournament.ad || tournament.tournamentName || '-'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Aşama tipi</Text>
            <Text style={styles.infoValue}>Eleme</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Takım sayısı</Text>
            <Text style={styles.infoValue}>{tournament.teams?.length || 0}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Maç durumu</Text>
            <Text style={styles.infoValue}>{counts.completed} / {counts.total} maç tamamlandı</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Aşama durumu</Text>
            {champion ? (
              <>
                <Text style={[styles.infoValue, { color: '#0a0' }]}>AŞAMA TAMAMLANDI</Text>
                <View style={styles.winnerBox}>
                  <LottieView
                    source={require('../assets/FirstPlace.json')}
                    autoPlay
                    loop={false}
                    style={{ width: 130, height: 130 }}
                  />
                  <Text style={styles.winnerText}>{champion.toUpperCase()}</Text>
                  <TouchableOpacity style={styles.fullscreenButton} onPress={() => setShowFullAnimation(true)}>
                    <MaterialCommunityIcons name="fullscreen" size={28} color="#222" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.infoValue}>Devam ediyor</Text>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.infoLabel, styles.rulesTitle]}>Kurallar</Text>
            <Text style={styles.rulesText}>Beraberlik kabul edilmez.</Text>
            <Text style={styles.rulesText}>Beraberlik durumunda uzatma veya penaltı sonucunu skor alanına girin.</Text>
            <Text style={styles.rulesText}>Kazanan takım otomatik olarak sonraki tura aktarılır.</Text>
            <Text style={styles.rulesText}>Tek sayıda takım varsa eşleşmeyen takım ilk turu bay geçer.</Text>
          </View>

          <AdBanner isDarkMode={isDarkMode} label="Panel Reklam Alanı" compact />
        </ScrollView>
      </View>

      <Modal visible={showFullAnimation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LottieView
            source={require('../assets/FirstPlace.json')}
            autoPlay
            loop={false}
            style={{ width: 320, height: 320 }}
          />
          <Text style={[styles.winnerText, { color: '#fff', fontSize: 36 }]}>{champion.toUpperCase()}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowFullAnimation(false)}>
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      marginBottom: 18,
      marginTop: 24,
    },
    content: {
      paddingBottom: 90,
    },
    infoBox: {
      backgroundColor: isDarkMode ? '#232323' : '#f3f3f7',
      borderRadius: 12,
      padding: 18,
      marginBottom: 16,
      marginHorizontal: 12,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    infoLabel: {
      color: isDarkMode ? '#FFD700' : '#888',
      fontSize: 15,
      marginBottom: 4,
      fontWeight: '500',
    },
    infoValue: {
      color: isDarkMode ? '#FFD700' : '#222',
      fontSize: 18,
      fontWeight: 'bold',
    },
    rulesTitle: {
      fontWeight: 'bold',
      fontSize: 17,
    },
    rulesText: {
      color: isDarkMode ? '#fff' : '#444',
      fontSize: 15,
      marginBottom: 4,
    },
    winnerBox: {
      alignItems: 'center',
      marginVertical: 16,
    },
    winnerText: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#FFD700',
      marginTop: 8,
      textAlign: 'center',
      letterSpacing: 1,
    },
    fullscreenButton: {
      marginTop: 12,
      backgroundColor: '#FFD700',
      borderRadius: 22,
      padding: 10,
      elevation: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      marginTop: 24,
      backgroundColor: '#FFD700',
      borderRadius: 18,
      paddingHorizontal: 32,
      paddingVertical: 14,
      elevation: 2,
    },
    closeButtonText: {
      color: '#222',
      fontWeight: 'bold',
      fontSize: 18,
    },
  });
}

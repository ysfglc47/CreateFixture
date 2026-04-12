import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDarkMode } from '../DarkModeContext';
import DraggableFlatList from 'react-native-draggable-flatlist';

const defaultOrderRules = [

  { key: 'points', label: 'Puan' },
  { key: 'goalAvg', label: 'İkili Averaj' },
  { key: 'goalDiff', label: 'Averaj' },
  { key: 'goalsFor', label: 'Attığı Gol' },
  { key: 'win', label: 'Galibiyet' },
  
];

export default function LeagueCreateScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const iconColor = isDarkMode ? '#fff' : '#222';

  const {
    tournamentName = '',
    leagueName = '',
    matchType = '',
    points = { win: 3, draw: 1, lose: 0 },
    teamSelectType = '',
    orderRules = [],
    teams = [],
    tournamentId = null,
  } = route.params || {};

  const [leagueNameState, setLeagueName] = useState(leagueName);
  const [matchTypeState, setMatchType] = useState(matchType);
  const [pointsState, setPoints] = useState(points);
  const [teamSelectTypeState, setTeamSelectType] = useState(teamSelectType);
  const [orderRulesState, setOrderRulesState] = useState(
    orderRules && orderRules.length > 0 ? orderRules : defaultOrderRules
  );
  const [teamsState, setTeams] = useState(teams);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#222' : '#fff',
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      paddingTop: 60,
      paddingHorizontal: 4,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : 'black',
      letterSpacing: 1,
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
    },
    input: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 24,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#888',
    },
    matchTypeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 32,
    },
    matchTypeButton: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 8,
      paddingVertical: 18,
      paddingHorizontal: 32,
      marginHorizontal: 10,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    matchTypeButtonSelected: {
      borderColor: 'black',
      backgroundColor: '#FFD700',
    },
    matchTypeText: {
      fontWeight: 'bold',
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#222',
    },
    modesInfo: {
      fontSize: 16,
      color: isDarkMode ? '#aaa' : '#666',
      textAlign: 'left',
      marginBottom: 16,
    },
    pointsContainer: {
      marginBottom: 32,
    },
    pointsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      color: isDarkMode ? '#fff' : '#000',
      textDecorationLine: 'underline',
        textAlign: 'center',
    },
    pointsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    pointBox: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 8,
      padding: 16,
      marginHorizontal: 8,
      alignItems: 'center',
      minWidth: 70,
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#888',
    },
    pointLabel: {
      fontWeight: 'bold',
      fontSize: 14,
      color: isDarkMode ? '#fff' : '#222',
      marginBottom: 4,
      
    },
    pointValue: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#222',
    },
    teamSelectContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 32,
    },
    teamSelectButton: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 8,
      paddingVertical: 18,
      paddingHorizontal: 18,
      marginHorizontal: 10,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    teamSelectButtonSelected: {
      borderColor: 'black',
      backgroundColor: '#FFD700', // Seçili butonun arka planı sarı
    },
    teamSelectText: {
      fontWeight: 'bold',
      fontSize: 14,
      color: isDarkMode ? '#fff' : '#222',
    },
    createButton: {
      backgroundColor: isDarkMode ? '#eee' : '#222',
      borderRadius: 6,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 24,
    },
    createButtonDisabled: {
      backgroundColor: isDarkMode ? '#333' : '#eee',
    },
    createButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      letterSpacing: 1,
    },
    createButtonTextDisabled: {
      color: '#aaa',
    },
  });

  const handleContinue = () => {
    if (!leagueNameState.trim()) {
      alert('Lig adı boş olamaz!');
      return;
    }
    if (!matchTypeState) {
      alert('Tek veya Çift devre seçmelisiniz!');
      return;
    }
    if (!teamSelectTypeState) {
      alert('Takım seçme türünü belirtmalısınız!');
      return;
    }
    // Turnuva adı ve lig adı ile birlikte gönder
    const tournament = {
      tournamentName,
      leagueName: leagueNameState.trim(),
      matchType: matchTypeState,
      points: pointsState,
      teamSelectType: teamSelectTypeState,
      orderRules: orderRulesState, // Sadece orderRules!
      teams: teamsState,
      tournamentId,
    };
    navigation.navigate('TeamAdd', { tournament });
  };

  return (
    <View style={styles.container}>
      {/* Üst Menü */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LİG OLUŞTUR</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Lig Adı */}
        <Text style={styles.label}>Lig Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Lig Adı"
          value={leagueNameState}
          onChangeText={setLeagueName}
          placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        />

        {/* Tek/Çift Devre Butonları */}
        <View style={styles.matchTypeContainer}>
          <TouchableOpacity
            style={[
              styles.matchTypeButton,
              matchTypeState === 'TEK' && styles.matchTypeButtonSelected,
            ]}
            onPress={() => setMatchType('TEK')}
          >
            <Text style={styles.matchTypeText}>Tek devre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.matchTypeButton,
              matchTypeState === 'CIFT' && styles.matchTypeButtonSelected,
            ]}
            onPress={() => setMatchType('CIFT')}
          >
            <Text style={styles.matchTypeText}>Çift devre</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modesInfo}>
          Tek devre: Her takım rakipleriyle 1 kez oynar. {'\n'}
          Çift devre: Her takım rakipleriyle 2 kez (iç ve dış saha) oynar.
        </Text>
        
        {/* Puan Durumları */}
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsTitle}>Puan Durumları</Text>
          <View style={styles.pointsRow}>
            <View style={styles.pointBox}>
              <Text style={styles.pointLabel}>Kazanan</Text>
              <TextInput
                style={styles.pointValue}
                keyboardType="numeric"
                value={pointsState.win.toString()}
                onChangeText={val => setPoints({ ...pointsState, win: parseInt(val) || 0 })}
                placeholder="3"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              />
              <Text>puan</Text>
            </View>
            <View style={styles.pointBox}>
              <Text style={styles.pointLabel}>Berabere</Text>
              <TextInput
                style={styles.pointValue}
                keyboardType="numeric"
                value={pointsState.draw.toString()}
                onChangeText={val => setPoints({ ...pointsState, draw: parseInt(val) || 0 })}
                placeholder="1"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              />
              <Text>puan</Text>
            </View>
            <View style={styles.pointBox}>
              <Text style={styles.pointLabel}>Kaybeden</Text>
              <TextInput
                style={styles.pointValue}
                keyboardType="numeric"
                value={pointsState.lose.toString()}
                onChangeText={val => setPoints({ ...pointsState, lose: parseInt(val) || 0 })}
                placeholder="0"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
              />
              <Text>puan</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.modesInfo}>
          Her kutudaki puan değerleri kutulara tıklanılarak düzenlenebilir.
        </Text>

        {/* Sıralama Önceliği Bilgisi */}
        <View style={{
          backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
          marginTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 5,
          height: 200, // 5 kural için yeterli yükseklik
        }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#444',
            marginBottom: 10,
          }}>
            Sıralama Önceliği (Oklarla değiştir)
          </Text>
          <DraggableFlatList
            data={orderRulesState}
            onDragEnd={({ data }) => setOrderRulesState(data)}
            keyExtractor={item => item.key}
            renderItem={({ item, drag, isActive }) => {
              const currentIndex = orderRulesState.findIndex(i => i.key === item.key);
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, opacity: isActive ? 0.7 : 1 }}>
                  <TouchableOpacity
                    onLongPress={drag}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    disabled={isActive}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 15, color: isDarkMode ? '#fff' : '#222', marginRight: 8 }}>
                      {currentIndex + 1}. {item.label}
                    </Text>
                  </TouchableOpacity>
                  {/* Yukarı ok */}
                  <TouchableOpacity
                    disabled={currentIndex === 0}
                    onPress={() => {
                      if (currentIndex === 0) return;
                      const newRules = [...orderRulesState];
                      [newRules[currentIndex - 1], newRules[currentIndex]] = [newRules[currentIndex], newRules[currentIndex - 1]];
                      setOrderRulesState(newRules);
                    }}
                    style={{ opacity: currentIndex === 0 ? 0.3 : 1, marginRight: 8 }}
                  >
                    <Icon name="arrow-up" size={20} color="#222" />
                  </TouchableOpacity>
                  {/* Aşağı ok */}
                  <TouchableOpacity
                    disabled={currentIndex === orderRulesState.length - 1}
                    onPress={() => {
                      if (currentIndex === orderRulesState.length - 1) return;
                      const newRules = [...orderRulesState];
                      [newRules[currentIndex], newRules[currentIndex + 1]] = [newRules[currentIndex + 1], newRules[currentIndex]];
                      setOrderRulesState(newRules);
                    }}
                    style={{ opacity: currentIndex === orderRulesState.length - 1 ? 0.3 : 1 }}
                  >
                    <Icon name="arrow-down" size={20} color="#FFD700" />
                  </TouchableOpacity>
                </View>
              );
            }}
            scrollEnabled={false}
          />
        </View>

        {/* Takım Seçim Türü Butonları */}
        <View style={styles.teamSelectContainer}>
          <TouchableOpacity
            style={[
              styles.teamSelectButton,
              teamSelectTypeState === 'RASTGELE' && styles.teamSelectButtonSelected,
            ]}
            onPress={() => setTeamSelectType('RASTGELE')}
          >
            <Text style={styles.teamSelectText}>Rastgele</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.teamSelectButton,
              teamSelectTypeState === 'MANUEL' && styles.teamSelectButtonSelected,
            ]}
            onPress={() => setTeamSelectType('MANUEL')}
          >
            <Text style={styles.teamSelectText}>Manuel</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modesInfo}>
          Takımların eşleşme yöntemi: Rastgele seçerseniz eşleşmeler otomatik yapılır, manuel seçerseniz eşleşmeleri siz belirlersiniz.
        </Text>

        {/* Devam Butonu */}
        <TouchableOpacity
          style={[
            styles.createButton,
            (!leagueNameState.trim() || !matchTypeState || !teamSelectTypeState) && styles.createButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!leagueNameState.trim() || !matchTypeState || !teamSelectTypeState}
        >
          <Text
            style={[
              styles.createButtonText,
              (!leagueNameState.trim() || !matchTypeState || !teamSelectTypeState) && styles.createButtonTextDisabled,
            ]}
          >
            DEVAM
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDarkMode } from '../DarkModeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation, route }) {
  const [turnuvalar, setTurnuvalar] = useState([]);
  const { isDarkMode } = useDarkMode();
  const email = route?.params?.email || '';
  const iconColor = isDarkMode ? '#fff' : '#000';

  // Turnuvaları yükle
  useEffect(() => {
    const loadTournaments = async () => {
      const stored = await AsyncStorage.getItem('tournaments');
      setTurnuvalar(stored ? JSON.parse(stored) : []);
    };
    const unsubscribe = navigation.addListener('focus', loadTournaments);
    return unsubscribe;
  }, [navigation]);

  const handleDeleteTournament = (id) => {
    Alert.alert(
      'Turnuva Sil',
      'Bu turnuvayı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updated = turnuvalar.filter(t => t.id !== id);
            setTurnuvalar(updated);
            await AsyncStorage.setItem('tournaments', JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const handleCreateTournament = async (name) => {
    if (!name.trim()) return; // Boş isimle turnuva oluşturma
    const newTournament = {
      id: Date.now().toString(),
      ad: name.trim(),
      // diğer bilgiler...
    };
    const updatedTournaments = [...turnuvalar, newTournament];
    setTurnuvalar(updatedTournaments);
    await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    navigation.navigate('Home', { email }); // Ana sayfaya dön
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#222' }]}>
      {/* Üst Menü */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { email })}>
          <Icon name="user-circle" size={40} color={iconColor} />
        </TouchableOpacity>

        <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>
          TURNUVALAR
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="cog" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Turnuva Listesi */}
      <FlatList
        data={turnuvalar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tournamentBox}>
            {/* En sol futbol topu ikonu */}
            <Icon name="soccer-ball-o" size={28} color="#222" style={styles.soccerIcon} />
            {/* Ortada turnuva adı */}
            <TouchableOpacity style={styles.tournamentTextWrapper} onPress={() => navigation.navigate('TournamentDashboard', { tournament: item })}>
              <Text style={styles.tournamentText}>{item.ad}</Text>
            </TouchableOpacity>
            {/* Sağda silme ikonu */}
            <View style={styles.iconGroup}>
              <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => handleDeleteTournament(item.id)}>
                <Icon name="trash" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        fadingEdgeLength={250}
        keyboardDismissMode='on-drag'
        persistentScrollbar={true}
        contentContainerStyle={styles.tournamentList}
      />

      {/* Turnuva Ekle Butonu */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateTournament', { email })}>
        <Icon name="plus-circle" size={70} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // varsayılan açık mod
    paddingTop: 60,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black', // varsayılan açık mod
  },
  tournamentList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  tournamentBox: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  soccerIcon: {
    marginRight: 12,
  },
  tournamentTextWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  tournamentText: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  iconGroup: {
    flexDirection: 'row',
  },
  addButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
});

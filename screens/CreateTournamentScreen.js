import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDarkMode } from '../DarkModeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateTournament({ navigation, route }) {
  const [name, setName] = useState('');
  const { isDarkMode } = useDarkMode();
  const iconColor = isDarkMode ? '#fff' : '#222';
  const { email } = route.params || {};
  const [selectedMode, setSelectedMode] = useState('');
  

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Turnuva adı boş olamaz!');
      return;
    }
    if (!selectedMode) {
      Alert.alert('Hata', 'Bir mod seçmelisiniz!');
      return;
    }
    try {
      const stored = await AsyncStorage.getItem('tournaments');
      const tournaments = stored ? JSON.parse(stored) : [];
      const newTournament = {
        id: Date.now().toString(),
        ad: name.trim(),
        email,
        mode: selectedMode
      };
      const updated = [...tournaments, newTournament];
      await AsyncStorage.setItem('tournaments', JSON.stringify(updated));
      if (selectedMode === 'LIG') {
        navigation.navigate('LeagueCreate', { tournamentName: name.trim() });
      } else {
        Alert.alert('Başarılı', 'Turnuva adı turnuvalar listesine eklendi!');
        navigation.navigate('Home');
      }
    } catch (e) {
      Alert.alert('Hata', 'Turnuva kaydedilemedi!');
    }
  };

  const handleContinue = () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Turnuva adı boş olamaz!');
      return;
    }
    if (!selectedMode) {
      Alert.alert('Hata', 'Bir mod seçmelisiniz!');
      return;
    }
    // Sadece bilgileri aktar, kaydetme!
    if (selectedMode === 'LIG') {
      navigation.navigate('LeagueCreate', { tournamentName: name.trim(), email });
    } else if (selectedMode === 'GRUP') {
      navigation.navigate('GroupCreate', { tournamentName: name.trim(), email });
    } else if (selectedMode === 'ELEME') {
      navigation.navigate('EliminationCreate', { tournamentName: name.trim(), email });
    }
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: isDarkMode ? '#222' : '#fff', 
      padding: 24, 
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      marginBottom: 24,
      backgroundColor: isDarkMode ? '#222' : '#fff', 
      paddingTop: 60,
      paddingHorizontal: 4,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 100,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : 'black',
    },
    label: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      marginLeft: 4,
      paddingTop: 8,
      color: isDarkMode ? '#fff' : '#000',
    },
    input: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderColor: isDarkMode ? '#555' : '#888',
      borderRadius: 8,
      padding: 12,
      marginBottom: 96,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      borderWidth: 1,
    },
    modesContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
    },
    modeButton: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 32,
      marginHorizontal: 8,
      alignItems: 'center',
      minWidth: 90,
    },
    modeButtonAlt: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 32,
      alignItems: 'center',
      alignSelf: 'center',
      minWidth: 90,
      marginBottom: 60,
      paddingTop: 16,
    },
    modeButtonSelected: {
      backgroundColor: '#FFD700',
      borderColor: 'black',
      borderWidth: 2,
    },
    modeText: {
      fontWeight: 'bold',
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#222',
    },
    modesInfo: {
      fontSize: 16,
      color: isDarkMode ? '#aaa' : '#666',
      textAlign: 'left',
      marginBottom: 80,
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

  return (
    <View style={styles.container}>
      {/* Üst Menü */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TURNUVA OLUŞTUR</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Turnuva Adı */}
      <Text style={styles.label}>Turnuva Adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Turnuva Adı"
        value={name}
        onChangeText={setName}
        placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
      />

      {/* Modlar */}
      <View style={styles.modesContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'LIG' && styles.modeButtonSelected
          ]}
          onPress={() => setSelectedMode('LIG')}
        >
          <Text style={styles.modeText}>LIG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'GRUP' && styles.modeButtonSelected
          ]}
          onPress={() => setSelectedMode('GRUP')}
        >
          <Text style={styles.modeText}>GRUP</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[
          styles.modeButtonAlt,
          selectedMode === 'ELEME' && styles.modeButtonSelected
        ]}
        onPress={() => setSelectedMode('ELEME')}
      >
        <Text style={styles.modeText}>ELEME</Text>
      </TouchableOpacity>

      {/* Modlar hakkında kısa bilgi */}
      <Text style={styles.modesInfo}>
        Lig: Herkes herkesle oynar. {'\n\n'}Grup: Takımlar gruplara ayrılır. {'\n\n'}Eleme: Kaybeden elenir.
      </Text>

      {/* Devam Butonu */}
      <TouchableOpacity
        style={[styles.createButton, (!name.trim() || !selectedMode) && styles.createButtonDisabled]}
        onPress={handleContinue}
        disabled={!name.trim() || !selectedMode}
      >
        <Text style={[styles.createButtonText, (!name.trim() || !selectedMode) && styles.createButtonTextDisabled]}>
          DEVAM
        </Text>
      </TouchableOpacity>
    </View>
  );
}
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function GroupCreateScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const iconColor = isDarkMode ? '#fff' : '#222';

  const [groupName, setGroupName] = useState('');
  const [matchType, setMatchType] = useState('');
  const [points, setPoints] = useState({ win: 3, draw: 1, lose: 0 });
  const [orderRules, setOrderRules] = useState([
    { key: 'mutual', label: 'İkili Averaj' },
    { key: 'wins', label: 'Galibiyet' },
    { key: 'goals', label: 'Atılan Gol' },
    { key: 'difference', label: 'Averaj' },
    { key: 'points', label: 'Puan' },
  ]);
  const [warning, setWarning] = useState('');

  const tournamentName = route.params?.tournamentName || '';
  const email = route.params?.email || '';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#222' : '#fff',
      padding: 24,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#222' : '#fff',
      paddingTop: 30,
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
      backgroundColor: '#FFD700',
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
    orderBox: {
      backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
      borderRadius: 10,
      padding: 16,
      marginBottom: 24,
      marginTop: 6,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
      height: 200,
    },
    orderTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#444',
      marginBottom: 10,
    },
    orderText: {
      flex: 1,
      fontSize: 15,
      color: isDarkMode ? '#fff' : '#222',
    },
  });

  const handleContinue = () => {
    if (!groupName.trim()) {
      setWarning('Grup adı boş olamaz!');
      return;
    }
    if (!matchType) {
      setWarning('Tek veya Çift devre seçmelisiniz!');
      return;
    }
    setWarning('');
    const tournament = {
      tournamentName,
      groupName: groupName.trim(),
      matchType,
      points,
      orderRules,
      email,
      ownerEmail: email,
    };
    navigation.navigate('GroupSetup', { tournament });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GRUP OLUŞTUR</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { email })}>
          <Icon name="home" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>

      {warning ? (
        <Text style={{ color: '#d00', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>{warning}</Text>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Grup Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Grup Adı"
          value={groupName}
          onChangeText={setGroupName}
          placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
        />

        <View style={styles.matchTypeContainer}>
          <TouchableOpacity
            style={[
              styles.matchTypeButton,
              matchType === 'TEK' && styles.matchTypeButtonSelected,
            ]}
            onPress={() => setMatchType('TEK')}
          >
            <Text style={styles.matchTypeText}>Tek devre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.matchTypeButton,
              matchType === 'CIFT' && styles.matchTypeButtonSelected,
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

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsTitle}>Puan Durumları</Text>
          <View style={styles.pointsRow}>
            <View style={styles.pointBox}>
              <Text style={styles.pointLabel}>Kazanan</Text>
              <TextInput
                style={styles.pointValue}
                keyboardType="numeric"
                value={points.win.toString()}
                onChangeText={val => setPoints({ ...points, win: parseInt(val) || 0 })}
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
                value={points.draw.toString()}
                onChangeText={val => setPoints({ ...points, draw: parseInt(val) || 0 })}
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
                value={points.lose.toString()}
                onChangeText={val => setPoints({ ...points, lose: parseInt(val) || 0 })}
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

        <View style={styles.orderBox}>
          <Text style={styles.orderTitle}>
            Sıralama Önceliği (Oklarla değiştir)
          </Text>
          <DraggableFlatList
            data={orderRules}
            onDragEnd={({ data }) => setOrderRules(data)}
            keyExtractor={item => item.key}
            renderItem={({ item, drag, isActive }) => {
              const currentIndex = orderRules.findIndex(i => i.key === item.key);
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6,
                    opacity: isActive ? 0.7 : 1,
                  }}
                >
                  <TouchableOpacity
                    onLongPress={drag}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    disabled={isActive}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      fontSize: 15,
                      color: isDarkMode ? '#fff' : '#222',
                      marginRight: 8,
                    }}>
                      {currentIndex + 1}. {item.label}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={currentIndex === 0}
                    onPress={() => {
                      if (currentIndex === 0) return;
                      const newRules = [...orderRules];
                      [newRules[currentIndex - 1], newRules[currentIndex]] = [newRules[currentIndex], newRules[currentIndex - 1]];
                      setOrderRules(newRules);
                    }}
                    style={{ opacity: currentIndex === 0 ? 0.3 : 1, marginRight: 8 }}
                  >
                    <Icon name="arrow-up" size={20} color="#222" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={currentIndex === orderRules.length - 1}
                    onPress={() => {
                      if (currentIndex === orderRules.length - 1) return;
                      const newRules = [...orderRules];
                      [newRules[currentIndex], newRules[currentIndex + 1]] = [newRules[currentIndex + 1], newRules[currentIndex]];
                      setOrderRules(newRules);
                    }}
                    style={{ opacity: currentIndex === orderRules.length - 1 ? 0.3 : 1 }}
                  >
                    <Icon name="arrow-down" size={20} color="#FFD700" />
                  </TouchableOpacity>
                </View>
              );
            }}
            scrollEnabled={false}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!groupName.trim() || !matchType) && styles.createButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!groupName.trim() || !matchType}
        >
          <Text
            style={[
              styles.createButtonText,
              (!groupName.trim() || !matchType) && styles.createButtonTextDisabled,
            ]}
          >
            Devam
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


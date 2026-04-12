import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useDarkMode } from '../DarkModeContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function SettingsScreen({ navigation, route }) {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { email = '' } = route.params || {};

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#222' }]}>
      {/* Geri Butonu */}
      <View style={{ position: 'absolute', top: 72, left: 24, zIndex: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
      </View>

      {/* Ayarlar İkonu */}
      <Icon name="cog" size={48} style={[styles.icon, isDarkMode && { color: '#fff' }]} />

      {/* Koyu Mod */}
      <View style={styles.row}>
        <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>Koyu Mod</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
    color: '#222',
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 48,
    marginBottom: 30,
    color: '#222',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
    width: 220,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
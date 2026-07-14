import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';

export default function HomeButton({ navigation, tournament, email }) {
  const { isDarkMode } = useDarkMode();
  const homeEmail = email || tournament?.ownerEmail || tournament?.email || '';

  return (
    <TouchableOpacity
      style={[styles.button, isDarkMode && styles.buttonDark]}
      onPress={() => navigation.navigate('Home', { email: homeEmail })}
      activeOpacity={0.8}
    >
      <Icon name="home" size={24} color={isDarkMode ? '#FFD700' : '#222'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonDark: {
    backgroundColor: '#232323',
    borderColor: '#444',
  },
});

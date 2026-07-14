import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../components/I18nPrimitives';

export default function AdBanner({ isDarkMode = false, label = 'Reklam Alanı', compact = false }) {
  return (
    <View style={[
      styles.container,
      compact && styles.containerCompact,
      isDarkMode && styles.containerDark,
    ]}>
      <Text style={[styles.label, isDarkMode && styles.labelDark]}>{label}</Text>
      <Text style={[styles.subLabel, isDarkMode && styles.subLabelDark]}>Banner reklam için ayrıldı</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6C64A',
    backgroundColor: '#FFF7C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  containerCompact: {
    minHeight: 48,
    marginVertical: 6,
  },
  containerDark: {
    backgroundColor: '#232323',
    borderColor: '#FFD700',
  },
  label: {
    color: '#222',
    fontSize: 13,
    fontWeight: '900',
  },
  labelDark: {
    color: '#FFD700',
  },
  subLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  subLabelDark: {
    color: '#ddd',
  },
});
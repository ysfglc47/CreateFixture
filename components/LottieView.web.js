import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Text } from '../components/I18nPrimitives';

export default function LottieViewWeb({ style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 999,
  },
  icon: {
    color: '#222',
    fontSize: 42,
    fontWeight: 'bold',
  },
});



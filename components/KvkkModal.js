import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { getKvkkSections } from '../utils/privacy';

import { Text } from '../components/I18nPrimitives';

export default function KvkkModal({ visible, onClose, isDarkMode }) {
  const colors = {
    backdrop: 'rgba(0,0,0,0.62)',
    card: isDarkMode ? '#232323' : '#fff',
    text: isDarkMode ? '#fff' : '#222',
    muted: isDarkMode ? '#cfcfcf' : '#555',
    border: isDarkMode ? '#444' : '#e6e6e6',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>KVKK Aydınlatma Metni</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={20} color="#222" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator>
            {getKvkkSections().map(section => (
              <View key={section.title} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                <Text style={[styles.body, { color: colors.muted }]}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
  },
  card: {
    maxHeight: '82%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: '900',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  scroll: {
    paddingRight: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 5,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});

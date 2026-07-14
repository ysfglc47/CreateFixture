import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, Modal, Image } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { useDarkMode } from '../DarkModeContext';
import {
  deleteTournamentFromDatabase,
  getTournamentsFromDatabase,
} from '../database';
import AdBanner from '../components/AdBanner';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function HomeScreen({ navigation, route }) {
  const [turnuvalar, setTurnuvalar] = useState([]);
  const [warning, setWarning] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { isDarkMode } = useDarkMode();
  const email = route?.params?.email || '';
  const iconColor = isDarkMode ? '#fff' : '#000';

  const formatFilters = [
    { key: 'ALL', label: 'Tümü' },
    { key: 'LIG', label: 'Lig' },
    { key: 'GRUP', label: 'Grup' },
    { key: 'ELEME', label: 'Eleme' },
  ];

  const getTournamentName = tournament =>
    tournament.ad || tournament.tournamentName || tournament.groupName || tournament.leagueName || 'İsimsiz Turnuva';

  const getTournamentMode = tournament => tournament.mode || (tournament.groups ? 'GRUP' : 'LIG');

  const getModeLabel = mode => {
    if (mode === 'GRUP') return 'Grup';
    if (mode === 'ELEME') return 'Eleme';
    return 'Lig';
  };

  const filteredTournaments = turnuvalar.filter(tournament => {
    const mode = getTournamentMode(tournament);
    const name = getTournamentName(tournament).toLocaleLowerCase('tr-TR');
    const query = searchText.trim().toLocaleLowerCase('tr-TR');
    const matchesFormat = selectedFormat === 'ALL' || mode === selectedFormat;
    const matchesSearch = !query || name.includes(query);

    return matchesFormat && matchesSearch;
  });

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const databaseTournaments = await getTournamentsFromDatabase(email);
        setTurnuvalar(databaseTournaments);
        setWarning('');
      } catch (e) {
        setWarning('Turnuvalar yüklenemedi!');
      }
    };
    loadTournaments();
    const unsubscribe = navigation.addListener('focus', loadTournaments);
    return unsubscribe;
  }, [navigation, email]);

  const handleDeleteTournament = tournament => {
    setDeleteTarget(tournament);
  };

  const confirmDeleteTournament = async () => {
    if (!deleteTarget) return;
    try {
      const updated = turnuvalar.filter(t => t.id !== deleteTarget.id);
      setTurnuvalar(updated);
      await deleteTournamentFromDatabase(deleteTarget.id, email);
      setWarning('Turnuva silindi.');
    } catch (e) {
      setWarning('Turnuva silinemedi!');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#222' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { email })}>
          <Icon name="user-circle" size={40} color={iconColor} />
        </TouchableOpacity>

        <Image source={require('../assets/createfixture-logo.png')} style={styles.headerLogo} resizeMode="contain" />

        <TouchableOpacity onPress={() => navigation.navigate('Settings', { email })}>
          <Icon name="cog" size={40} color={iconColor} />
        </TouchableOpacity>
      </View>

      {warning ? (
        <Text style={{ color: '#d00', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>{warning}</Text>
      ) : null}

      <View style={styles.searchBox}>
        <Icon name="search" size={18} color={isDarkMode ? '#aaa' : '#666'} />
        <TextInput
          style={[styles.searchInput, isDarkMode && { color: '#fff' }]}
          placeholder="Turnuva adı ara"
          placeholderTextColor={isDarkMode ? '#aaa' : '#777'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterRow}>
        {formatFilters.map(filter => {
          const active = selectedFormat === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                isDarkMode && styles.filterButtonDark,
                active && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFormat(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                isDarkMode && styles.filterButtonTextDark,
                active && styles.filterButtonTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredTournaments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.tournamentBox, isDarkMode && styles.tournamentBoxDark]}>
            <Icon name="soccer-ball-o" size={28} color="#222" style={styles.soccerIcon} />
            <TouchableOpacity
              style={styles.tournamentTextWrapper}
              onPress={() => {
                try {
                  const mode = getTournamentMode(item);
                  if (mode === 'GRUP') {
                    navigation.navigate('GroupDashboard', { group: item.groups?.[0], tournament: item });
                  } else if (mode === 'ELEME') {
                    navigation.navigate('EliminationDashboard', { tournament: item });
                  } else {
                    navigation.navigate('TournamentDashboard', { tournament: item });
                  }
                  setWarning('');
                } catch (e) {
                  setWarning('Turnuva açılırken hata oluştu!');
                }
              }}
            >
              <Text style={styles.tournamentText}>
                {getTournamentName(item)}
              </Text>
              <View style={styles.modeBadge}>
                <Text style={styles.modeText}>{getModeLabel(getTournamentMode(item))}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.iconGroup}>
              <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => handleDeleteTournament(item)}>
                <Icon name="trash" size={24} color="#222" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        fadingEdgeLength={32}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        persistentScrollbar={true}
        contentContainerStyle={styles.tournamentList}
        ListEmptyComponent={(
          <Text style={[styles.emptyText, isDarkMode && { color: '#aaa' }]}>
            Aradığınız kritere uygun turnuva bulunamadı.
          </Text>
        )}
      />

      <AdBanner isDarkMode={isDarkMode} />

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateTournament', { email })}>
        <Icon name="plus-circle" size={70} color={iconColor} />
      </TouchableOpacity>

      <DeleteTournamentDialog
        visible={Boolean(deleteTarget)}
        tournamentName={deleteTarget ? getTournamentName(deleteTarget) : ''}
        isDarkMode={isDarkMode}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteTournament}
      />
    </View>
  );
}

function DeleteTournamentDialog({ visible, tournamentName, isDarkMode, onCancel, onConfirm }) {
  const colors = {
    card: isDarkMode ? '#232323' : '#fff',
    text: isDarkMode ? '#fff' : '#222',
    muted: isDarkMode ? '#cfcfcf' : '#666',
    border: isDarkMode ? '#3a3a3a' : '#e6e6e6',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogBackdrop}>
        <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.dialogIcon}>
            <Icon name="trash" size={22} color="#fff" />
          </View>
          <Text style={[styles.dialogTitle, { color: colors.text }]}>Turnuvayı sil</Text>
          <Text style={[styles.dialogMessage, { color: colors.muted }]}>
            {tournamentName ? `"${tournamentName}" turnuvası kalıcı olarak silinecek.` : 'Bu turnuva kalıcı olarak silinecek.'}
          </Text>
          <Text style={[styles.dialogHint, { color: colors.muted }]}>Maçlar, tablo kayıtları ve turnuvaya bağlı tüm bilgiler kaldırılır.</Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity style={[styles.dialogButton, styles.cancelButton, { borderColor: colors.border }]} onPress={onCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Vazgeç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dialogButton, styles.deleteButton]} onPress={onConfirm}>
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
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
  headerLogo: {
    width: '52%',
    maxWidth: 220,
    minWidth: 172,
    height: 66,
  },
  tournamentList: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#222',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  filterButton: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonDark: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  filterButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterButtonTextDark: {
    color: '#fff',
  },
  filterButtonTextActive: {
    color: '#222',
  },
  tournamentBox: {
    backgroundColor: '#FFE173',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F2C600',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  tournamentBoxDark: {
    backgroundColor: '#FFD84A',
  },
  soccerIcon: {
    marginRight: 12,
  },
  tournamentTextWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tournamentText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
    textAlign: 'left',
  },
  modeText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#222',
  },
  modeBadge: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  iconGroup: {
    flexDirection: 'row',
  },
  addButton: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 40,
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  dialogIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  dialogHint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '900',
  },
  deleteButton: {
    backgroundColor: '#d33',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
});
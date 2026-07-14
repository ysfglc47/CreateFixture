import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import LocalStore from '../utils/localStore';
import { useDarkMode } from '../DarkModeContext';
import { saveTournamentToDatabase } from '../database';
import { showExportInterstitialAd } from '../utils/ads';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function GroupSetupScreen({ route, navigation }) {
  const { tournament } = route.params || {};
  const ownerEmail = tournament?.ownerEmail || tournament?.email || '';
  const hasExistingTournament = Boolean(tournament?.id);
  const createInitialGroups = () => [{ name: tournament?.groupName || '', teams: [] }];
  const [groups, setGroups] = useState(() => (
    hasExistingTournament && Array.isArray(tournament?.groups) && tournament.groups.length > 0
      ? tournament.groups
      : createInitialGroups()
  ));
  const [editGroupIdx, setEditGroupIdx] = useState(null);
  const [editTeamIdx, setEditTeamIdx] = useState({ group: null, team: null });
  const [editGroupValue, setEditGroupValue] = useState('');
  const [editTeamValue, setEditTeamValue] = useState('');
  const { isDarkMode } = useDarkMode();

  const styles = getStyles(isDarkMode);

  const sanitizeGroups = (items) => (
    items.map(group => ({
      name: group.name || '',
      teams: Array.isArray(group.teams) ? group.teams : [],
    }))
  );

  const saveGroups = async (newGroups) => {
    const cleanGroups = sanitizeGroups(newGroups);
    setGroups(cleanGroups);

    if (hasExistingTournament && tournament?.id) {
      await LocalStore.setItem(`groups_${tournament.id}`, JSON.stringify(cleanGroups));
      await saveTournamentToDatabase({ ...tournament, groups: cleanGroups, ownerEmail, email: ownerEmail });
    }
  };
  const handleGroupNameChange = (idx, value) => {
    const newGroups = [...groups];
    newGroups[idx].name = value;
    setGroups(newGroups);
  };

  const startEditGroup = (idx) => {
    setEditGroupIdx(idx);
    setEditGroupValue(groups[idx].name);
  };

  const saveEditGroup = () => {
    if (editGroupValue.trim() === '') return;
    const newGroups = [...groups];
    newGroups[editGroupIdx].name = editGroupValue.trim();
    saveGroups(newGroups);
    setEditGroupIdx(null);
    setEditGroupValue('');
  };

  const removeGroup = (idx) => {
    const newGroups = groups.filter((_, i) => i !== idx);
    saveGroups(newGroups);
  };

  const addTeam = (groupIdx, teamName) => {
    if (!teamName.trim()) return;
    const newGroups = [...groups];
    if (newGroups[groupIdx].teams.includes(teamName.trim())) return;
    newGroups[groupIdx].teams.push(teamName.trim());
    saveGroups(newGroups);
  };

  const startEditTeam = (groupIdx, teamIdx) => {
    setEditTeamIdx({ group: groupIdx, team: teamIdx });
    setEditTeamValue(groups[groupIdx].teams[teamIdx]);
  };

  const saveEditTeam = () => {
    if (editTeamValue.trim() === '') return;
    const { group, team } = editTeamIdx;
    const newGroups = [...groups];
    newGroups[group].teams[team] = editTeamValue.trim();
    saveGroups(newGroups);
    setEditTeamIdx({ group: null, team: null });
    setEditTeamValue('');
  };

  const removeTeam = (groupIdx, teamIdx) => {
    const newGroups = [...groups];
    newGroups[groupIdx].teams.splice(teamIdx, 1);
    saveGroups(newGroups);
  };

  const addGroup = () => {
    const newGroups = [...groups, { name: '', teams: [] }];
      saveGroups(newGroups); 
  };

  const handleCreate = async () => {
    const newTournament = {
      id: Date.now().toString(),
      ad: tournament?.tournamentName || tournament?.ad || '',
      email: ownerEmail,
      ownerEmail,
      mode: tournament?.mode || 'GRUP',
      groupName: tournament?.groupName || '',
      matchType: tournament?.matchType || '',
      points: tournament?.points || {},
      orderRules: tournament?.orderRules || [],
      groups: sanitizeGroups(groups), 
    };

    await LocalStore.setItem(`groups_${newTournament.id}`, JSON.stringify(newTournament.groups));

    await saveTournamentToDatabase(newTournament);
    await showExportInterstitialAd();
    navigation.navigate('Home', { email: ownerEmail });
  };

  useEffect(() => {
    if (!hasExistingTournament || !tournament?.id) {
      LocalStore.removeItem('groups_undefined').catch(() => {});
      setGroups(createInitialGroups());
      setEditGroupIdx(null);
      setEditTeamIdx({ group: null, team: null });
      setEditGroupValue('');
      setEditTeamValue('');
      return;
    }

    const fetchGroups = async () => {
      const storedGroups = await LocalStore.getItem(`groups_${tournament.id}`);
      if (storedGroups) {
        setGroups(sanitizeGroups(JSON.parse(storedGroups)));
      }
    };

    fetchGroups();
  }, [hasExistingTournament, tournament?.id, tournament?.groupName]);
  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.header, isDarkMode && { backgroundColor: '#181818' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={40} color={isDarkMode ? "#FFD700" : "#222"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#FFD700' }]}>GRUPLAR</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { email: ownerEmail })}>
          <Icon name="home" size={40} color={isDarkMode ? "#FFD700" : "#222"} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group, gIdx) => (
          <View key={gIdx} style={[
            styles.groupBox,
            isDarkMode && { backgroundColor: '#232323', borderColor: '#FFD700' }
          ]}>
            {editGroupIdx === gIdx ? (
              <View style={styles.groupRow}>
                <TextInput
                  style={[
                    styles.groupInput,
                    isDarkMode && { backgroundColor: '#FFD700', color: '#222' }
                  ]}
                  value={editGroupValue}
                  onChangeText={setEditGroupValue}
                  autoFocus
                  placeholder="Grup Adı"
                  placeholderTextColor={isDarkMode ? "#888" : "#222"}
                />
                <TouchableOpacity onPress={saveEditGroup}>
                  <Icon name="check" size={22} color="#0a0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditGroupIdx(null); setEditGroupValue(''); }}>
                  <Icon name="close" size={22} color="#d00" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.groupRow}>
                <TextInput
                  style={[
                    styles.groupInput,
                    isDarkMode && { backgroundColor: '#FFD700', color: '#222' }
                  ]}
                  value={group.name}
                  onChangeText={val => handleGroupNameChange(gIdx, val)}
                  placeholder="Grup Adı"
                  placeholderTextColor={isDarkMode ? "#888" : "#222"}
                />
                <TouchableOpacity onPress={() => startEditGroup(gIdx)}>
                  <Icon name="pencil" size={22} color="#FFD700" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeGroup(gIdx)}>
                  <Icon name="trash" size={22} color="#d00" />
                </TouchableOpacity>
              </View>
            )}
            {group.teams.map((team, tIdx) => (
              <View key={tIdx} style={[
                styles.teamRow,
                isDarkMode && { backgroundColor: '#181818' }
              ]}>
                {editTeamIdx.group === gIdx && editTeamIdx.team === tIdx ? (
                  <>
                    <TextInput
                      style={[
                        styles.teamInput,
                        isDarkMode && { backgroundColor: '#FFD700', color: '#222' }
                      ]}
                      value={editTeamValue}
                      onChangeText={setEditTeamValue}
                      autoFocus
                      placeholder="Takım Adı"
                      placeholderTextColor={isDarkMode ? "#888" : "#222"}
                    />
                    <TouchableOpacity onPress={saveEditTeam}>
                      <Icon name="check" size={22} color="#0a0" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setEditTeamIdx({ group: null, team: null }); setEditTeamValue(''); }}>
                      <Icon name="close" size={22} color="#d00" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TextInput
                      style={[
                        styles.teamInput,
                        isDarkMode && { backgroundColor: '#232323', color: '#FFD700' }
                      ]}
                      value={team}
                      editable={false}
                      placeholderTextColor={isDarkMode ? "#888" : "#222"}
                    />
                    <TouchableOpacity onPress={() => startEditTeam(gIdx, tIdx)}>
                      <Icon name="pencil" size={22} color="#FFD700" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeTeam(gIdx, tIdx)}>
                      <Icon name="trash" size={22} color="#d00" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
            <View style={styles.addTeamRow}>
              <TextInput
                style={[
                  styles.teamInput,
                  isDarkMode && { backgroundColor: '#232323', color: '#FFD700' }
                ]}
                placeholder="Takım Adı Ekle"
                placeholderTextColor={isDarkMode ? "#888" : "#222"}
                value={group.newTeam || ''}
                onChangeText={val => {
                  const newGroups = [...groups];
                  newGroups[gIdx].newTeam = val;
                  setGroups(newGroups);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  addTeam(gIdx, group.newTeam || '');
                  const newGroups = [...groups];
                  newGroups[gIdx].newTeam = '';
                  setGroups(newGroups);
                }}
              >
                <Icon name="plus-circle" size={28} color={isDarkMode ? "#FFD700" : "#222"} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={styles.addGroupRow}>
          <TouchableOpacity style={[
            styles.addGroupButton,
            isDarkMode && { backgroundColor: '#FFD700' }
          ]} onPress={addGroup}>
            <Icon name="plus-circle" size={28} color={isDarkMode ? "#222" : "#222"} />
            <Text style={{ marginLeft: 8, color: isDarkMode ? "#222" : "#222", fontWeight: 'bold' }}>GRUP EKLE</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>OLUŞTUR</Text>
        </TouchableOpacity>
    </View>
  );
}

function getStyles(isDarkMode) {
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: isDarkMode ? '#181818' : '#fff', 
      paddingTop: 0 , 
      padding:24 
    },
    header: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#181818' : '#fff',
      paddingTop: 60,
      paddingHorizontal: 4,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFD700' : 'black',
      letterSpacing: 1,
    },
    groupBox: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      borderRadius: 10,
      padding: 12,
      marginHorizontal: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: '#FFD700',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    groupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    groupInput: {
      flex: 1,
      backgroundColor: isDarkMode ? '#FFD700' : '#FFD700',
      borderRadius: 6,
      paddingHorizontal: 10,
      fontSize: 16,
      color: isDarkMode ? '#222' : '#222',
      marginRight: 8,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      backgroundColor: isDarkMode ? '#181818' : '#eee',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    teamInput: {
      flex: 1,
      backgroundColor: isDarkMode ? '#232323' : '#eee',
      borderRadius: 6,
      paddingHorizontal: 10,
      fontSize: 15,
      color: isDarkMode ? '#FFD700' : '#222',
      marginRight: 8,
    },
    addTeamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      marginTop: 4,
    },
    addGroupRow: {
      alignItems: 'center',
      marginVertical: 12,
    },
    addGroupButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#FFD700' : '#FFD700',
      borderRadius: 8,
      paddingHorizontal: 18,
      paddingVertical: 10,
      elevation: 2,
    },
    createButton: {
      backgroundColor: isDarkMode ? '#FFD700' : '#FFD700',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 32,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 12,
      elevation: 2,
    },
    createButtonText: {
      color: isDarkMode ? '#222' : '#222',
      fontWeight: 'bold',
      fontSize: 17,
      letterSpacing: 1,
    },
  });
}






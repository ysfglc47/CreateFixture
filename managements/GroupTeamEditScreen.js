import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import BottomBar from '../components/BottomBar';
import HomeButton from '../components/HomeButton';
import LocalStore from '../utils/localStore';
import { useDarkMode } from '../DarkModeContext';

import { Text, TextInput } from '../components/I18nPrimitives';

export default function GroupTeamEditScreen({ route, navigation }) {
  const { isDarkMode } = useDarkMode();
  const { tournament } = route.params;
  const [groups, setGroups] = useState(tournament.groups || []);
  const [activeTab, setActiveTab] = useState(3);
  const [editGroupIdx, setEditGroupIdx] = useState(null);
  const [editTeamIdx, setEditTeamIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [warning, setWarning] = useState('');

  const addTeamToGroup = () => {
    const name = newTeamName.trim();
    if (!name) {
      setWarning('Takım adı boş olamaz!');
      return;
    }
    const group = groups[selectedGroupIdx];
    if (group.teams.some(t => t.toLowerCase() === name.toLowerCase())) {
      setWarning('Bu isimde bir takım zaten var!');
      return;
    }
    setWarning('');
    const updatedGroups = groups.map((g, idx) =>
      idx === selectedGroupIdx
        ? { ...g, teams: [...g.teams, name] }
        : g
    );
    setGroups(updatedGroups);
    setNewTeamName('');
    saveGroupsToStorage(updatedGroups);
  };

  const removeTeamFromGroup = async (groupIdx, teamIdx) => {
    const teamName = groups[groupIdx].teams[teamIdx];
    const updatedGroups = groups.map((g, idx) =>
      idx === groupIdx
        ? {
            ...g,
            teams: g.teams.filter((_, i) => i !== teamIdx),
            matches: (g.matches || []).filter(
              m => m.home !== teamName && m.away !== teamName
            ),
          }
        : g
    );
    setGroups(updatedGroups);

    const groupsKey = `groups_${tournament.id}`;
    try {
      await LocalStore.setItem(groupsKey, JSON.stringify(updatedGroups));
      const stored = await LocalStore.getItem('tournaments');
      let tournaments = stored ? JSON.parse(stored) : [];
      tournaments = tournaments.map(t =>
        t.id === tournament.id ? { ...t, groups: updatedGroups } : t
      );
      await LocalStore.setItem('tournaments', JSON.stringify(tournaments));
      await LocalStore.setItem(`tournament_${tournament.id}`, JSON.stringify({ ...tournament, groups: updatedGroups }));
    } catch (e) {}
  };

  const startEditTeam = (groupIdx, teamIdx) => {
    setEditGroupIdx(groupIdx);
    setEditTeamIdx(teamIdx);
    setEditValue(groups[groupIdx].teams[teamIdx]);
  };

  const saveEditTeam = async () => {
    const name = editValue.trim();
    if (!name) {
      setWarning('Takım adı boş olamaz!');
      return;
    }
    if (groups[editGroupIdx].teams.some((t, i) => t.toLowerCase() === name.toLowerCase() && i !== editTeamIdx)) {
      setWarning('Bu isimde bir takım zaten var!');
      return;
    }
    setWarning('');
    const oldName = groups[editGroupIdx].teams[editTeamIdx];
    const updatedGroups = groups.map((g, gIdx) =>
      gIdx === editGroupIdx
        ? {
            ...g,
            teams: g.teams.map((t, tIdx) => (tIdx === editTeamIdx ? name : t)),
            matches: (g.matches || []).map(m =>
              m.home === oldName
                ? { ...m, home: name }
                : m.away === oldName
                ? { ...m, away: name }
                : m
            ),
          }
        : g
    );
    setGroups(updatedGroups);
    setEditGroupIdx(null);
    setEditTeamIdx(null);
    setEditValue('');
    await saveGroupsToStorage(updatedGroups);
  };

  const saveGroupsToStorage = async (updatedGroups) => {
    await LocalStore.setItem(`groups_${tournament.id}`, JSON.stringify(updatedGroups));
    try {
      const stored = await LocalStore.getItem('tournaments');
      let tournaments = stored ? JSON.parse(stored) : [];
      tournaments = tournaments.map(t =>
        t.id === tournament.id ? { ...t, groups: updatedGroups } : t
      );
      await LocalStore.setItem('tournaments', JSON.stringify(tournaments));
      await LocalStore.setItem(`tournament_${tournament.id}`, JSON.stringify({
        ...tournament,
        groups: updatedGroups
      }));
    } catch (e) {
      setWarning('Gruplar kaydedilemedi!');
    }
  };

  const saveAndGoBack = async () => {
    await saveGroupsToStorage(groups);
    navigation.navigate('GroupDashboard', { tournament: { ...tournament, groups } });
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: '#181818' }
    ]}>
      <View style={styles.topRow}>
        <HomeButton navigation={navigation} tournament={tournament} />
        <Text style={[styles.header, isDarkMode && { color: '#FFD700' }]}>Grup Takım Düzenle</Text>
      </View>

      <View style={styles.groupSelectorRow}>
        {groups.map((group, idx) => (
          <TouchableOpacity
            key={group.name || idx}
            style={[
              styles.groupButton,
              idx === selectedGroupIdx && styles.groupButtonActive,
              isDarkMode && { backgroundColor: idx === selectedGroupIdx ? '#FFD700' : '#333' }
            ]}
            onPress={() => setSelectedGroupIdx(idx)}
          >
            <Text style={[
              styles.groupButtonText,
              isDarkMode && { color: idx === selectedGroupIdx ? '#222' : '#FFD700' }
            ]}>
              {group.name || `Grup ${idx + 1}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            isDarkMode && { backgroundColor: '#232323', color: '#FFD700', borderColor: '#FFD700' }
          ]}
          placeholder="Takım adı ekle"
          placeholderTextColor={isDarkMode ? "#888" : "#222"}
          value={newTeamName}
          onChangeText={setNewTeamName}
        />
        <TouchableOpacity style={[
          styles.addButton,
          isDarkMode && { backgroundColor: '#FFD700' }
        ]} onPress={addTeamToGroup}>
          <Icon name="plus" size={24} color={isDarkMode ? "#222" : "#222"} />
        </TouchableOpacity>
      </View>

      {warning ? (
        <Text style={[
          styles.warningText,
          isDarkMode && { color: '#ff0000ff' }
        ]}>{warning}</Text>
      ) : null}


      <FlatList
        data={groups[selectedGroupIdx]?.teams || []}
        keyExtractor={(item, idx) => idx.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={[
            styles.teamBox,
            isDarkMode && { backgroundColor: '#232323' }
          ]}>
            {editGroupIdx === selectedGroupIdx && editTeamIdx === index ? (
              <>
                <TextInput
                  style={[
                    styles.teamName,
                    { backgroundColor: isDarkMode ? '#333' : '#eee', borderRadius: 6, paddingHorizontal: 6, color: isDarkMode ? '#FFD700' : '#222' }
                  ]}
                  value={editValue}
                  onChangeText={setEditValue}
                  autoFocus
                  placeholderTextColor={isDarkMode ? "#888" : "#222"}
                />
                <TouchableOpacity onPress={saveEditTeam}>
                  <Icon name="check" size={22} color="#0a0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditGroupIdx(null); setEditTeamIdx(null); setEditValue(''); }}>
                  <Icon name="close" size={22} color="#d00" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[
                  styles.teamName,
                  isDarkMode && { color: '#FFD700' }
                ]}>{item}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => startEditTeam(selectedGroupIdx, index)} style={{ marginRight: 8 }}>
                    <Icon name="pencil" size={22} color="#FFD700" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeTeamFromGroup(selectedGroupIdx, index)}>
                    <Icon name="trash" size={22} color="#d00" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: isDarkMode ? '#FFD700' : '#888', marginTop: 40 }}>
            Takım yok
          </Text>
        }
      />

      <TouchableOpacity style={[
        styles.saveButton,
        isDarkMode && { backgroundColor: '#FFD700' }
      ]} onPress={saveAndGoBack}>
        <Text style={[
          styles.saveButtonText,
          isDarkMode && { color: '#222' }
        ]}>Kaydet</Text>
      </TouchableOpacity>

      <BottomBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigation={navigation}
        tournament={{ ...tournament, groups }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7fa', 
    padding: 5, 
    paddingTop: 40 
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 18,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  groupSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    marginHorizontal: 8,
  },
  groupButton: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 6,
  },
  groupButtonActive: {
    backgroundColor: '#FFD700',
  },
  groupButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 18,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  teamName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 40,
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
  },
  saveButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  warningText: {
    color: '#d00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 15,
  },
});


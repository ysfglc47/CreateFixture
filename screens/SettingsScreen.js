import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import LocalStore from '../utils/localStore';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../DarkModeContext';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { deleteTournamentFromDatabase, getTournamentsFromDatabase } from '../database';
import { useLanguage } from '../src/i18n/LanguageContext';
import { LANGUAGE_STORAGE_KEY } from '../src/i18n/translations';

import { Text } from '../components/I18nPrimitives';

const SETTINGS_KEY = 'createfixture_settings';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const defaultSettings = {
  autoSaveResults: true,
  showMatchDates: true,
  compactLists: false,
  defaultMode: 'LIG',
};

export default function SettingsScreen({ navigation, route }) {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const { language, supportedLanguages, setLanguage, t } = useLanguage();
  const { email = '' } = route?.params || {};
  const [settings, setSettings] = useState(defaultSettings);
  const [summary, setSummary] = useState({ tournaments: 0, teams: 0 });
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const storedSettings = await LocalStore.getItem(SETTINGS_KEY);
        if (storedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
        }

        const tournaments = await getTournamentsFromDatabase(email);
        const teams = tournaments.reduce((sum, item) => {
          if (Array.isArray(item.teams)) return sum + item.teams.length;
          if (Array.isArray(item.groups)) {
            return sum + item.groups.reduce((groupSum, group) => groupSum + (group.teams?.length || 0), 0);
          }
          return sum;
        }, 0);
        setSummary({ tournaments: tournaments.length, teams });
      };

      loadSettings();
    }, [email])
  );

  const updateSetting = async (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    await LocalStore.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  };

  const toggleLanguageList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLanguageOpen(value => !value);
  };

  const updateLanguage = async nextLanguage => {
    await setLanguage(nextLanguage);
    await LocalStore.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLanguageOpen(false);
  };

  const clearTournamentData = () => {
    Alert.alert(
      t('settings.clearDataTitle'),
      t('settings.clearDataMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.clean'),
          style: 'destructive',
          onPress: async () => {
            const tournaments = await getTournamentsFromDatabase(email);
            for (const tournament of tournaments) {
              await deleteTournamentFromDatabase(tournament.id, email);
            }
            const keys = await LocalStore.getAllKeys();
            const tournamentKeys = keys.filter(key =>
              key === 'tournaments' ||
              key.startsWith('matches_') ||
              key.startsWith('matchResults_') ||
              key.startsWith('tableData_') ||
              key.startsWith('groups_') ||
              key.startsWith('tournament_')
            );
            await LocalStore.multiRemove(tournamentKeys);
            setSummary({ tournaments: 0, teams: 0 });
          },
        },
      ]
    );
  };

  const colors = {
    background: isDarkMode ? '#181818' : '#fff',
    text: isDarkMode ? '#fff' : '#222',
    muted: isDarkMode ? '#cfcfcf' : '#666',
    card: isDarkMode ? '#232323' : '#f5f5f5',
    border: isDarkMode ? '#333' : '#e6e6e6',
  };

  const selectedLanguage = supportedLanguages.find(item => item.code === language) || supportedLanguages[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={32} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: '#FFD700' }]}> 
          <Icon name="sliders" size={30} color="#222" />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>{t('settings.controlCenter')}</Text>
            <Text style={styles.summaryText}>
              {t('settings.summary', { tournaments: summary.tournaments, teams: summary.teams })}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.appearance')}</Text>
          <SwitchRow
            icon="moon-o"
            label={t('settings.darkMode')}
            description={t('settings.darkModeDescription')}
            value={isDarkMode}
            onValueChange={() => setIsDarkMode(!isDarkMode)}
            colors={colors}
          />
          <SwitchRow
            icon="compress"
            label={t('settings.compactLists')}
            description={t('settings.compactListsDescription')}
            value={settings.compactLists}
            onValueChange={value => updateSetting('compactLists', value)}
            colors={colors}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguageList} activeOpacity={0.85}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 4 }]}>{t('settings.languageTitle')}</Text>
                <Text style={[styles.note, { color: colors.muted, marginTop: 0 }]}>{t('settings.languageDescription')}</Text>
              </View>
              <View style={styles.selectedLanguageBadge}>
                <Text style={styles.selectedLanguageBadgeText}>{selectedLanguage.flag}</Text>
              </View>
            </View>
            <View style={[styles.selectedLanguageRow, { borderColor: colors.border, backgroundColor: colors.background }]}> 
              <Text style={styles.languageFlag}>{selectedLanguage.flag}</Text>
              <View style={styles.languageTextBlock}>
                <Text style={[styles.languageName, { color: colors.text }]} numberOfLines={1}>
                  {selectedLanguage.nativeName}
                </Text>
                <Text style={[styles.languageSubName, { color: colors.muted }]} numberOfLines={1}>
                  {t('settings.selectedLanguage')} · {selectedLanguage.englishName}
                </Text>
              </View>
              <Icon name={isLanguageOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#FFD700" />
            </View>
          </TouchableOpacity>

          {isLanguageOpen ? (
            <View style={styles.languageList}>
              {supportedLanguages.map(item => {
                const isSelected = item.code === language;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageButton,
                      { borderColor: isSelected ? '#FFD700' : colors.border, backgroundColor: isSelected ? '#FFD700' : colors.background },
                    ]}
                    onPress={() => updateLanguage(item.code)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.languageFlag}>{item.flag}</Text>
                    <View style={styles.languageTextBlock}>
                      <Text style={[styles.languageName, { color: isSelected ? '#222' : colors.text }]} numberOfLines={1}>
                        {item.nativeName}
                      </Text>
                      <Text style={[styles.languageSubName, { color: isSelected ? '#444' : colors.muted }]} numberOfLines={1}>
                        {item.englishName}
                      </Text>
                    </View>
                    {isSelected ? <Icon name="check-circle" size={22} color="#222" /> : <Icon name="circle-o" size={22} color={colors.muted} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.tournamentPreferences')}</Text>
          <SwitchRow
            icon="save"
            label={t('settings.autoSaveResults')}
            description={t('settings.autoSaveResultsDescription')}
            value={settings.autoSaveResults}
            onValueChange={value => updateSetting('autoSaveResults', value)}
            colors={colors}
          />
          <SwitchRow
            icon="calendar"
            label={t('settings.showMatchDates')}
            description={t('settings.showMatchDatesDescription')}
            value={settings.showMatchDates}
            onValueChange={value => updateSetting('showMatchDates', value)}
            colors={colors}
          />

          <Text style={[styles.smallLabel, { color: colors.muted }]}>{t('settings.defaultMode')}</Text>
          <View style={styles.modeRow}>
            {['LIG', 'GRUP', 'ELEME'].map(mode => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  { borderColor: colors.border, backgroundColor: settings.defaultMode === mode ? '#FFD700' : colors.background },
                ]}
                onPress={() => updateSetting('defaultMode', mode)}
              >
                <Text style={[styles.modeText, { color: settings.defaultMode === mode ? '#222' : colors.text }]}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.dataManagement')}</Text>
          <TouchableOpacity style={styles.dataButton} onPress={clearTournamentData}>
            <Icon name="trash" size={18} color="#fff" />
            <Text style={styles.dataButtonText}>{t('settings.clearTournamentData')}</Text>
          </TouchableOpacity>
          <Text style={[styles.note, { color: colors.muted }]}>
            {t('settings.clearDataNote')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SwitchRow({ icon, label, description, value, onValueChange, colors }) {
  return (
    <View style={styles.switchRow}>
      <Icon name={icon} size={20} color="#FFD700" />
      <View style={styles.switchText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowDescription, { color: colors.muted }]}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  summaryCard: {
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  summaryTitle: {
    color: '#222',
    fontSize: 17,
    fontWeight: 'bold',
  },
  summaryText: {
    color: '#222',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedLanguageBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLanguageBadgeText: {
    color: '#222',
    fontSize: 24,
    fontWeight: '900',
  },
  languageToggle: {
    gap: 12,
  },
  selectedLanguageRow: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  languageList: {
    gap: 8,
    marginTop: 10,
  },
  languageButton: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageFlag: {
    fontSize: 25,
    width: 34,
    textAlign: 'center',
  },
  languageTextBlock: {
    flex: 1,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '800',
  },
  languageSubName: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },  switchRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160,160,160,0.2)',
    paddingVertical: 10,
  },
  switchText: { flex: 1 },
  rowLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  rowDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  smallLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeText: { fontWeight: 'bold' },
  dataButton: {
    backgroundColor: '#d33',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dataButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
  },
});








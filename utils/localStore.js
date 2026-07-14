import {
  getAllSettingKeys,
  getAllTournamentsFromDatabase,
  getSetting,
  getSettingsByKeys,
  removeSetting,
  removeSettings,
  saveSetting,
  saveTournamentToDatabase,
} from '../database';

async function syncTournamentList(key, value) {
  if (key !== 'tournaments') return;
  try {
    const tournaments = JSON.parse(value);
    if (!Array.isArray(tournaments)) return;
    for (const tournament of tournaments) {
      await saveTournamentToDatabase(tournament);
    }
  } catch (error) {
    // Ignore malformed compatibility values; the key-value write still succeeds.
  }
}

async function parseRowsByKey(keys) {
  return getSettingsByKeys(keys);
}

const LocalStore = {
  async getItem(key) {
    if (key === 'tournaments') {
      const tournaments = await getAllTournamentsFromDatabase();
      return JSON.stringify(tournaments);
    }

    return getSetting(key, null);
  },

  async setItem(key, value) {
    await syncTournamentList(key, String(value));
    if (key === 'tournaments') return;

    await saveSetting(key, String(value));
  },

  async removeItem(key) {
    if (key === 'tournaments') return;
    await removeSetting(key);
  },

  async multiRemove(keys = []) {
    if (!keys.length) return;
    await removeSettings(keys);
  },

  async multiGet(keys = []) {
    return parseRowsByKey(keys);
  },

  async getAllKeys() {
    return getAllSettingKeys();
  },
};

export default LocalStore;

import md5 from 'md5';

const USERS_KEY = 'users';
const TOURNAMENTS_KEY = 'tournaments';
const SETTINGS_PREFIX = 'setting_';
const memoryStore = new Map();

function readRaw(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return memoryStore.get(key) || null;
}

function writeRaw(key, value) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
    return;
  }
  memoryStore.set(key, value);
}

async function getJson(key, fallback) {
  const raw = readRaw(key);
  return raw ? JSON.parse(raw) : fallback;
}

async function setJson(key, value) {
  writeRaw(key, JSON.stringify(value));
}

function hashPassword(password = '') {
  return password ? `md5:${md5(`createfixture:${password}`)}` : '';
}

function verifyPassword(user, password) {
  if (!user) return false;
  if (user.password_hash) return user.password_hash === hashPassword(password);
  return user.password === password;
}

function createResetToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeEmail(email = '') {
  return String(email || '').trim().toLowerCase();
}

export async function getDatabase() {
  return null;
}

export async function createUser(email, password, provider = 'email', options = {}) {
  const users = await getJson(USERS_KEY, []);
  const cleanEmail = normalizeEmail(email);
  if (users.find(user => normalizeEmail(user.email) === cleanEmail)) {
    throw new Error('Bu e-posta zaten kayıtlı.');
  }
  users.push({
    id: Date.now(),
    email: cleanEmail,
    username: options.username || cleanEmail.split('@')[0],
    password: '',
    password_hash: hashPassword(password || ''),
    provider,
    avatar_uri: options.avatarUri || '',
    kvkk_accepted_at: options.kvkkAcceptedAt || '',
  });
  await setJson(USERS_KEY, users);
}

export async function findUserByEmail(email) {
  const users = await getJson(USERS_KEY, []);
  const cleanEmail = normalizeEmail(email);
  return users.find(user => normalizeEmail(user.email) === cleanEmail) || null;
}

export async function findUserByUsername(username) {
  const users = await getJson(USERS_KEY, []);
  return users.find(user => (user.username || '').toLowerCase() === username.toLowerCase()) || null;
}

export async function findUserByCredentials(email, password) {
  const user = await findUserByEmail(email);
  return verifyPassword(user, password) ? user : null;
}

export async function updateUser(oldEmail, newEmail, newPassword, options = {}) {
  const users = await getJson(USERS_KEY, []);
  const cleanOldEmail = normalizeEmail(oldEmail);
  const cleanNewEmail = normalizeEmail(newEmail);
  const updatedUsers = users.map(user =>
    normalizeEmail(user.email) === cleanOldEmail
      ? {
        ...user,
        email: cleanNewEmail,
        username: options.username || user.username,
        password: '',
        password_hash: hashPassword(newPassword),
        avatar_uri: options.avatarUri || user.avatar_uri,
        updated_at: new Date().toISOString(),
      }
      : user
  );
  await setJson(USERS_KEY, updatedUsers);

  const tournaments = await getJson(TOURNAMENTS_KEY, []);
  await setJson(TOURNAMENTS_KEY, tournaments.map(tournament => {
    const owner = normalizeEmail(tournament.ownerEmail || tournament.email || '');
    return owner === cleanOldEmail
      ? { ...tournament, ownerEmail: cleanNewEmail, email: cleanNewEmail }
      : tournament;
  }));
}

export async function updateUserProfile(email, updates = {}) {
  const users = await getJson(USERS_KEY, []);
  const cleanEmail = normalizeEmail(email);
  await setJson(USERS_KEY, users.map(user =>
    normalizeEmail(user.email) === cleanEmail
      ? {
        ...user,
        username: updates.username || user.username,
        avatar_uri: updates.avatarUri || user.avatar_uri,
        updated_at: new Date().toISOString(),
      }
      : user
  ));
}

export async function updateUserPassword(email, oldPassword, newPassword) {
  const users = await getJson(USERS_KEY, []);
  const cleanEmail = normalizeEmail(email);
  const user = users.find(item => normalizeEmail(item.email) === cleanEmail);
  if (!verifyPassword(user, oldPassword)) {
    throw new Error('OLD_PASSWORD_INVALID');
  }
  await setJson(USERS_KEY, users.map(item =>
    normalizeEmail(item.email) === cleanEmail
      ? { ...item, password: '', password_hash: hashPassword(newPassword), updated_at: new Date().toISOString() }
      : item
  ));
}

export async function createPasswordResetToken(email) {
  const users = await getJson(USERS_KEY, []);
  const cleanEmail = normalizeEmail(email);
  const user = users.find(item => normalizeEmail(item.email) === cleanEmail);
  if (!user) return null;
  const token = createResetToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await setJson(USERS_KEY, users.map(item =>
    normalizeEmail(item.email) === cleanEmail
      ? { ...item, reset_token_hash: md5(token), reset_token_expires_at: expiresAt, updated_at: new Date().toISOString() }
      : item
  ));
  return { token, expiresAt };
}

export async function resetPasswordWithToken(token, newPassword) {
  const users = await getJson(USERS_KEY, []);
  const tokenHash = md5(token || '');
  const user = users.find(item => item.reset_token_hash === tokenHash);
  if (!user || !user.reset_token_expires_at || new Date(user.reset_token_expires_at).getTime() < Date.now()) {
    throw new Error('RESET_TOKEN_INVALID');
  }
  await setJson(USERS_KEY, users.map(item =>
    normalizeEmail(item.email) === normalizeEmail(user.email)
      ? {
        ...item,
        password: '',
        password_hash: hashPassword(newPassword),
        reset_token_hash: '',
        reset_token_expires_at: '',
        updated_at: new Date().toISOString(),
      }
      : item
  ));
}

export async function deleteUserByEmail(email) {
  const users = await getJson(USERS_KEY, []);
  const cleanEmail = normalizeEmail(email);
  await setJson(USERS_KEY, users.filter(user => normalizeEmail(user.email) !== cleanEmail));
  const tournaments = await getJson(TOURNAMENTS_KEY, []);
  await setJson(
    TOURNAMENTS_KEY,
    tournaments.filter(tournament => normalizeEmail(tournament.ownerEmail || tournament.email || '') !== cleanEmail)
  );
}

export async function saveTournamentToDatabase(tournament) {
  if (!tournament?.id) return;
  const ownerEmail = normalizeEmail(tournament.ownerEmail || tournament.email || '');
  const scopedTournament = {
    ...tournament,
    ownerEmail,
    email: ownerEmail,
  };
  const tournaments = await getJson(TOURNAMENTS_KEY, []);
  const next = [
    ...tournaments.filter(item => String(item.id) !== String(scopedTournament.id)),
    scopedTournament,
  ];
  await setJson(TOURNAMENTS_KEY, next);
}

export async function assignOwnerToUnownedTournaments(ownerEmail) {
  const cleanEmail = normalizeEmail(ownerEmail);
  if (!cleanEmail) return;
  const tournaments = await getJson(TOURNAMENTS_KEY, []);
  const updated = tournaments.map(item => {
    const currentOwner = item.ownerEmail || item.email || '';
    return currentOwner ? item : { ...item, ownerEmail: cleanEmail, email: cleanEmail };
  });
  await setJson(TOURNAMENTS_KEY, updated);
}

export async function getTournamentsFromDatabase(ownerEmail = '') {
  const tournaments = await getJson(TOURNAMENTS_KEY, []);
  const cleanEmail = normalizeEmail(ownerEmail);
  if (!cleanEmail) return [];
  return tournaments.filter(item => normalizeEmail(item.ownerEmail || item.email || '') === cleanEmail);
}

export async function getAllTournamentsFromDatabase() {
  return getJson(TOURNAMENTS_KEY, []);
}

export async function deleteTournamentFromDatabase(id, ownerEmail = '') {
  const tournaments = await getJson(TOURNAMENTS_KEY, []);
  const cleanEmail = normalizeEmail(ownerEmail);
  await setJson(
    TOURNAMENTS_KEY,
    tournaments.filter(item => {
      const sameTournament = String(item.id) === String(id);
      const sameOwner = !cleanEmail || normalizeEmail(item.ownerEmail || item.email || '') === cleanEmail;
      return !(sameTournament && sameOwner);
    })
  );
}

export async function saveSetting(key, value) {
  await setJson(`${SETTINGS_PREFIX}${key}`, value);
}

export async function getSetting(key, fallback = null) {
  return getJson(`${SETTINGS_PREFIX}${key}`, fallback);
}

export async function removeSetting(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(`${SETTINGS_PREFIX}${key}`);
    return;
  }
  memoryStore.delete(`${SETTINGS_PREFIX}${key}`);
}

export async function removeSettings(keys = []) {
  for (const key of keys) {
    await removeSetting(key);
  }
}

export async function getSettingsByKeys(keys = []) {
  const entries = [];
  for (const key of keys) {
    const raw = readRaw(`${SETTINGS_PREFIX}${key}`);
    if (raw !== null) entries.push([key, raw]);
  }
  return entries;
}

export async function getAllSettingKeys() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return Object.keys(window.localStorage)
      .filter(key => key.startsWith(SETTINGS_PREFIX))
      .map(key => key.slice(SETTINGS_PREFIX.length))
      .sort();
  }

  return Array.from(memoryStore.keys())
    .filter(key => key.startsWith(SETTINGS_PREFIX))
    .map(key => key.slice(SETTINGS_PREFIX.length))
    .sort();
}

export default {
  getDatabase,
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserByCredentials,
  updateUser,
  updateUserProfile,
  updateUserPassword,
  createPasswordResetToken,
  resetPasswordWithToken,
  deleteUserByEmail,
  saveTournamentToDatabase,
  assignOwnerToUnownedTournaments,
  getTournamentsFromDatabase,
  getAllTournamentsFromDatabase,
  deleteTournamentFromDatabase,
  saveSetting,
  getSetting,
  removeSetting,
  removeSettings,
  getSettingsByKeys,
  getAllSettingKeys,
};

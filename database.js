import * as SQLite from 'expo-sqlite';
import md5 from 'md5';

const DATABASE_NAME = 'createfixture.db';

let dbPromise = null;
let initialized = false;

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  const db = await dbPromise;
  if (!initialized) {
    await initializeDatabase(db);
    initialized = true;
  }
  return db;
}

async function initializeDatabase(db) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT DEFAULT '',
      password TEXT DEFAULT '',
      password_hash TEXT DEFAULT '',
      provider TEXT NOT NULL DEFAULT 'email',
      avatar_uri TEXT DEFAULT '',
      kvkk_accepted_at TEXT DEFAULT '',
      reset_token_hash TEXT DEFAULT '',
      reset_token_expires_at TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      owner_email TEXT DEFAULT '',
      name TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'LIG',
      match_type TEXT,
      team_select_type TEXT,
      points_json TEXT,
      order_rules_json TEXT,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tournament_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (group_id) REFERENCES tournament_groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      group_id INTEGER,
      round_number INTEGER,
      week INTEGER,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_score TEXT DEFAULT '',
      away_score TEXT DEFAULT '',
      match_date TEXT,
      winner TEXT DEFAULT '',
      raw_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES tournament_groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS match_results (
      match_id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      home_score TEXT DEFAULT '',
      away_score TEXT DEFAULT '',
      match_date TEXT,
      winner TEXT DEFAULT '',
      raw_json TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await db.execAsync(`ALTER TABLE tournaments ADD COLUMN owner_email TEXT DEFAULT '';`);
  } catch (error) {
    // Column already exists on upgraded databases.
  }
  await ensureColumn(db, 'users', 'username', "TEXT DEFAULT ''");
  await ensureColumn(db, 'users', 'password_hash', "TEXT DEFAULT ''");
  await ensureColumn(db, 'users', 'avatar_uri', "TEXT DEFAULT ''");
  await ensureColumn(db, 'users', 'kvkk_accepted_at', "TEXT DEFAULT ''");
  await ensureColumn(db, 'users', 'reset_token_hash', "TEXT DEFAULT ''");
  await ensureColumn(db, 'users', 'reset_token_expires_at', "TEXT DEFAULT ''");

  await db.runAsync(
    "DELETE FROM app_settings WHERE key IN ('users', 'tournaments', 'sqlite_users_migrated', 'sqlite_tournaments_migrated')"
  );
}

async function ensureColumn(db, tableName, columnName, definition) {
  try {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  } catch (error) {
    // Column already exists on upgraded databases.
  }
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

function getTournamentName(tournament) {
  return tournament.ad || tournament.tournamentName || tournament.groupName || tournament.leagueName || 'İsimsiz Turnuva';
}

function getTournamentMode(tournament) {
  return tournament.mode || (tournament.groups ? 'GRUP' : 'LIG');
}

function getTournamentOwnerEmail(tournament) {
  return normalizeEmail(tournament.ownerEmail || tournament.email || '');
}

export async function createUser(email, password, provider = 'email', options = {}) {
  const db = await getDatabase();
  const cleanEmail = normalizeEmail(email);
  await db.runAsync(
    `INSERT INTO users (email, username, password, password_hash, provider, avatar_uri, kvkk_accepted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    cleanEmail,
    options.username || cleanEmail.split('@')[0],
    '',
    hashPassword(password || ''),
    provider,
    options.avatarUri || '',
    options.kvkkAcceptedAt || ''
  );
}

export async function findUserByUsername(username) {
  const db = await getDatabase();
  return db.getFirstAsync(
    'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
    username
  );
}

export async function findUserByEmail(email) {
  const db = await getDatabase();
  return db.getFirstAsync(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
    normalizeEmail(email)
  );
}

export async function findUserByCredentials(email, password) {
  const db = await getDatabase();
  const user = await db.getFirstAsync(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
    normalizeEmail(email)
  );
  return verifyPassword(user, password) ? user : null;
}

export async function updateUser(oldEmail, newEmail, newPassword, options = {}) {
  const db = await getDatabase();
  const cleanOldEmail = normalizeEmail(oldEmail);
  const cleanNewEmail = normalizeEmail(newEmail);
  await db.runAsync(
    `UPDATE users
     SET email = ?,
         username = COALESCE(?, username),
         password = '',
         password_hash = ?,
         avatar_uri = COALESCE(?, avatar_uri),
         updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER(?)`,
    cleanNewEmail,
    options.username || null,
    hashPassword(newPassword),
    options.avatarUri || null,
    cleanOldEmail
  );

  const rows = await db.getAllAsync(
    'SELECT raw_json FROM tournaments WHERE LOWER(owner_email) = LOWER(?)',
    cleanOldEmail
  );
  for (const row of rows) {
    const tournament = JSON.parse(row.raw_json);
    await saveTournamentToDatabase({
      ...tournament,
      email: cleanNewEmail,
      ownerEmail: cleanNewEmail,
    }, db);
  }
  await db.runAsync(
    'DELETE FROM tournaments WHERE LOWER(owner_email) = LOWER(?)',
    cleanOldEmail
  );
}

export async function updateUserProfile(email, updates = {}) {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE users
     SET username = COALESCE(?, username),
         avatar_uri = COALESCE(?, avatar_uri),
         updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER(?)`,
    updates.username || null,
    updates.avatarUri || null,
    normalizeEmail(email)
  );
}

export async function updateUserPassword(email, oldPassword, newPassword) {
  const db = await getDatabase();
  const user = await findUserByEmail(email);
  if (!verifyPassword(user, oldPassword)) {
    throw new Error('OLD_PASSWORD_INVALID');
  }
  await db.runAsync(
    `UPDATE users
     SET password = '', password_hash = ?, updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER(?)`,
    hashPassword(newPassword),
    normalizeEmail(email)
  );
}

export async function createPasswordResetToken(email) {
  const db = await getDatabase();
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = createResetToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await db.runAsync(
    `UPDATE users
     SET reset_token_hash = ?, reset_token_expires_at = ?, updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER(?)`,
    md5(token),
    expiresAt,
    normalizeEmail(email)
  );
  return { token, expiresAt };
}

export async function resetPasswordWithToken(token, newPassword) {
  const db = await getDatabase();
  const tokenHash = md5(token || '');
  const user = await db.getFirstAsync(
    'SELECT * FROM users WHERE reset_token_hash = ? LIMIT 1',
    tokenHash
  );
  if (!user || !user.reset_token_expires_at || new Date(user.reset_token_expires_at).getTime() < Date.now()) {
    throw new Error('RESET_TOKEN_INVALID');
  }
  await db.runAsync(
    `UPDATE users
     SET password = '',
         password_hash = ?,
         reset_token_hash = '',
         reset_token_expires_at = '',
         updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(email) = LOWER(?)`,
    hashPassword(newPassword),
    normalizeEmail(user.email)
  );
}

export async function deleteUserByEmail(email) {
  const db = await getDatabase();
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return;

  const databaseRows = await db.getAllAsync(
    'SELECT id FROM tournaments WHERE LOWER(owner_email) = LOWER(?)',
    cleanEmail
  );

  const tournamentIds = databaseRows.map(row => String(row.id)).filter(Boolean);

  for (const tournamentId of tournamentIds) {
    await db.runAsync('DELETE FROM match_results WHERE tournament_id = ?', tournamentId);
    await db.runAsync('DELETE FROM matches WHERE tournament_id = ?', tournamentId);
    await db.runAsync('DELETE FROM tournament_groups WHERE tournament_id = ?', tournamentId);
    await db.runAsync('DELETE FROM teams WHERE tournament_id = ?', tournamentId);
    await db.runAsync('DELETE FROM tournaments WHERE id = ?', tournamentId);
  }

  await db.runAsync('DELETE FROM tournaments WHERE LOWER(owner_email) = LOWER(?)', cleanEmail);
  await db.runAsync('DELETE FROM users WHERE LOWER(email) = LOWER(?)', cleanEmail);

  const userScopedKeys = tournamentIds.flatMap(tournamentId => [
    `matches_${tournamentId}`,
    `matchResults_${tournamentId}`,
    `groups_${tournamentId}`,
    `tournament_${tournamentId}`,
    `tableData_${tournamentId}`,
    `showAnimation_${tournamentId}`,
  ]);

  if (userScopedKeys.length > 0) {
    const placeholders = userScopedKeys.map(() => '?').join(',');
    await db.runAsync(
      `DELETE FROM app_settings WHERE key IN (${placeholders})`,
      ...userScopedKeys
    );
  }
}

export async function saveTournamentToDatabase(tournament, existingDb = null) {
  if (!tournament?.id) return;
  const db = existingDb || await getDatabase();
  const ownerEmail = getTournamentOwnerEmail(tournament);
  const scopedTournament = {
    ...tournament,
    ownerEmail,
    email: ownerEmail,
  };
  const mode = getTournamentMode(tournament);

  await db.runAsync(
    `INSERT OR REPLACE INTO tournaments
      (id, owner_email, name, mode, match_type, team_select_type, points_json, order_rules_json, raw_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    String(scopedTournament.id),
    ownerEmail,
    getTournamentName(scopedTournament),
    mode,
    scopedTournament.matchType || null,
    scopedTournament.teamSelectType || null,
    JSON.stringify(scopedTournament.points || null),
    JSON.stringify(scopedTournament.orderRules || []),
    JSON.stringify(scopedTournament)
  );

  await db.runAsync('DELETE FROM matches WHERE tournament_id = ?', String(scopedTournament.id));
  await db.runAsync('DELETE FROM match_results WHERE tournament_id = ?', String(scopedTournament.id));
  await db.runAsync('DELETE FROM tournament_groups WHERE tournament_id = ?', String(scopedTournament.id));
  await db.runAsync('DELETE FROM teams WHERE tournament_id = ?', String(scopedTournament.id));

  const teams = Array.isArray(scopedTournament.teams) ? scopedTournament.teams : [];
  for (let index = 0; index < teams.length; index += 1) {
    await db.runAsync(
      'INSERT INTO teams (tournament_id, name, sort_order) VALUES (?, ?, ?)',
      String(scopedTournament.id),
      teams[index],
      index
    );
  }

  const groups = Array.isArray(scopedTournament.groups) ? scopedTournament.groups : [];
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const group = groups[groupIndex];
    const result = await db.runAsync(
      'INSERT INTO tournament_groups (tournament_id, name, sort_order) VALUES (?, ?, ?)',
      String(scopedTournament.id),
      group.name || `Grup ${groupIndex + 1}`,
      groupIndex
    );
    const groupId = result.lastInsertRowId;

    for (let teamIndex = 0; teamIndex < (group.teams || []).length; teamIndex += 1) {
      await db.runAsync(
        'INSERT INTO group_teams (group_id, team_name, sort_order) VALUES (?, ?, ?)',
        groupId,
        group.teams[teamIndex],
        teamIndex
      );
    }

    for (const match of group.matches || []) {
      await saveMatchToDatabase(db, scopedTournament.id, match, { groupId });
    }
  }

  const rounds = Array.isArray(scopedTournament.rounds) ? scopedTournament.rounds : [];
  for (const round of rounds) {
    for (const match of round.matches || []) {
      await saveMatchToDatabase(db, scopedTournament.id, match, { roundNumber: round.roundNumber });
    }
  }
}

async function saveMatchToDatabase(db, tournamentId, match, options = {}) {
  if (!match?.id) return;
  await db.runAsync(
    `INSERT OR REPLACE INTO matches
      (id, tournament_id, group_id, round_number, week, home_team, away_team, home_score, away_score, match_date, winner, raw_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    String(match.id),
    String(tournamentId),
    options.groupId || null,
    options.roundNumber || match.roundNumber || null,
    match.week ? Number(match.week) : null,
    match.home || '',
    match.away || '',
    match.homeScore ?? '',
    match.awayScore ?? '',
    match.date || null,
    match.winner || '',
    JSON.stringify(match)
  );
}

export async function assignOwnerToUnownedTournaments(ownerEmail) {
  if (!ownerEmail) return;
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT raw_json FROM tournaments
     WHERE owner_email IS NULL OR owner_email = ''`
  );

  for (const row of rows) {
    const tournament = JSON.parse(row.raw_json);
    await saveTournamentToDatabase({ ...tournament, ownerEmail, email: tournament.email || ownerEmail }, db);
  }
}

export async function getTournamentsFromDatabase(ownerEmail = '') {
  const db = await getDatabase();
  const cleanEmail = normalizeEmail(ownerEmail);
  if (!cleanEmail) return [];
  const rows = await db.getAllAsync(
    'SELECT raw_json FROM tournaments WHERE LOWER(owner_email) = LOWER(?) ORDER BY created_at DESC',
    cleanEmail
  );
  return rows.map(row => JSON.parse(row.raw_json));
}

export async function getAllTournamentsFromDatabase() {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT raw_json FROM tournaments ORDER BY created_at DESC');
  return rows.map(row => JSON.parse(row.raw_json));
}

export async function deleteTournamentFromDatabase(id, ownerEmail = '') {
  const db = await getDatabase();
  if (ownerEmail) {
    await db.runAsync(
      'DELETE FROM tournaments WHERE id = ? AND LOWER(owner_email) = LOWER(?)',
      String(id),
      normalizeEmail(ownerEmail)
    );
    return;
  }
  await db.runAsync('DELETE FROM tournaments WHERE id = ?', String(id));
}

export async function saveSetting(key, value) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value_json, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)`,
    key,
    JSON.stringify(value)
  );
}

export async function getSetting(key, fallback = null) {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT value_json FROM app_settings WHERE key = ?', key);
  return row ? JSON.parse(row.value_json) : fallback;
}

export async function removeSetting(key) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', key);
}

export async function removeSettings(keys = []) {
  if (!keys.length) return;
  const db = await getDatabase();
  const placeholders = keys.map(() => '?').join(',');
  await db.runAsync(
    `DELETE FROM app_settings WHERE key IN (${placeholders})`,
    ...keys
  );
}

export async function getSettingsByKeys(keys = []) {
  if (!keys.length) return [];
  const db = await getDatabase();
  const placeholders = keys.map(() => '?').join(',');
  const rows = await db.getAllAsync(
    `SELECT key, value_json FROM app_settings WHERE key IN (${placeholders})`,
    ...keys
  );
  return rows.map(row => [row.key, row.value_json]);
}

export async function getAllSettingKeys() {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT key FROM app_settings ORDER BY key ASC');
  return rows.map(row => row.key);
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

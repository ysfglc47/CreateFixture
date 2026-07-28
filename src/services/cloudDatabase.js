import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const configured = Boolean(supabaseUrl && supabaseAnonKey);

const supabase = configured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

let activeUser = null;

function normalizeEmail(email = '') {
  return String(email || '').trim().toLowerCase();
}

function requireClient() {
  if (!supabase) {
    const error = new Error('CLOUD_DATABASE_NOT_CONFIGURED');
    error.code = 'CLOUD_DATABASE_NOT_CONFIGURED';
    throw error;
  }
  return supabase;
}

function throwCloudError(error, fallbackCode = 'CLOUD_DATABASE_ERROR') {
  const nextError = new Error(error?.message || fallbackCode);
  nextError.code = error?.code || fallbackCode;
  nextError.cause = error;
  throw nextError;
}

async function requireUser() {
  const client = requireClient();
  if (activeUser) return activeUser;

  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) {
    const authError = new Error('CLOUD_AUTH_REQUIRED');
    authError.code = 'CLOUD_AUTH_REQUIRED';
    throw authError;
  }
  activeUser = data.user;
  return activeUser;
}

async function getProfile(user) {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throwCloudError(error, 'PROFILE_LOAD_FAILED');
  return data || {
    id: user.id,
    email: normalizeEmail(user.email),
    username: user.user_metadata?.username || normalizeEmail(user.email).split('@')[0],
    provider: user.app_metadata?.provider || 'email',
    avatar_uri: user.user_metadata?.avatar_uri || '',
    kvkk_accepted_at: user.user_metadata?.kvkk_accepted_at || '',
  };
}

export function isCloudConfigured() {
  return configured;
}

export function hasCloudSession() {
  return Boolean(configured && activeUser);
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut().catch(() => {});
  activeUser = null;
}

export async function createUser(email, password, provider = 'email', options = {}) {
  const client = requireClient();
  const cleanEmail = normalizeEmail(email);
  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      emailRedirectTo: 'createfixture://auth-confirmed',
      data: {
        username: options.username || cleanEmail.split('@')[0],
        provider,
        avatar_uri: options.avatarUri || '',
        kvkk_accepted_at: options.kvkkAcceptedAt || '',
      },
    },
  });

  if (error) throwCloudError(error, 'REGISTER_FAILED');
  if (data?.user?.identities && data.user.identities.length === 0) {
    const duplicateError = new Error('EMAIL_ALREADY_REGISTERED');
    duplicateError.code = 'EMAIL_ALREADY_REGISTERED';
    throw duplicateError;
  }

  activeUser = data?.session?.user || null;
  return {
    id: data?.user?.id,
    email: cleanEmail,
    username: options.username || cleanEmail.split('@')[0],
    requiresEmailConfirmation: !data?.session,
  };
}

export async function findUserByCredentials(email, password) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error || !data?.user) throwCloudError(error, 'INVALID_CREDENTIALS');

  activeUser = data.user;
  return getProfile(data.user);
}

export async function findUserByEmail(email) {
  const user = await requireUser();
  if (normalizeEmail(user.email) !== normalizeEmail(email)) return null;
  return getProfile(user);
}

export async function findUserByUsername(username) {
  const client = requireClient();
  const { data, error } = await client.rpc('is_username_available', {
    requested_username: String(username || '').trim(),
  });
  if (error) throwCloudError(error, 'USERNAME_CHECK_FAILED');
  return data ? null : { username };
}

export async function updateUser(oldEmail, newEmail, newPassword, options = {}) {
  const client = requireClient();
  const user = await requireUser();
  const cleanNewEmail = normalizeEmail(newEmail);
  const updates = {};
  if (cleanNewEmail && cleanNewEmail !== normalizeEmail(oldEmail)) updates.email = cleanNewEmail;
  if (newPassword) updates.password = newPassword;
  if (options.username) updates.data = { ...user.user_metadata, username: options.username };

  if (Object.keys(updates).length > 0) {
    const { data, error } = await client.auth.updateUser(updates);
    if (error) throwCloudError(error, 'USER_UPDATE_FAILED');
    activeUser = data?.user || user;
  }

  const profileUpdates = {
    username: options.username || undefined,
    avatar_uri: options.avatarUri || undefined,
    updated_at: new Date().toISOString(),
  };
  if (activeUser?.email && normalizeEmail(activeUser.email) === cleanNewEmail) {
    profileUpdates.email = cleanNewEmail;
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries(profileUpdates).filter(([, value]) => value !== undefined)
  );
  const { error: profileError } = await client.from('profiles').update(cleanUpdates).eq('id', user.id);
  if (profileError) throwCloudError(profileError, 'PROFILE_UPDATE_FAILED');
}

export async function updateUserProfile(email, updates = {}) {
  const client = requireClient();
  const user = await requireUser();
  if (normalizeEmail(user.email) !== normalizeEmail(email)) {
    const error = new Error('PROFILE_ACCESS_DENIED');
    error.code = 'PROFILE_ACCESS_DENIED';
    throw error;
  }

  const payload = {
    username: updates.username || undefined,
    avatar_uri: updates.avatarUri || undefined,
    updated_at: new Date().toISOString(),
  };
  const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
  const { error } = await client.from('profiles').update(cleanPayload).eq('id', user.id);
  if (error) throwCloudError(error, 'PROFILE_UPDATE_FAILED');
}

export async function updateUserPassword(email, oldPassword, newPassword) {
  const client = requireClient();
  const { error: signInError } = await client.auth.signInWithPassword({
    email: normalizeEmail(email),
    password: oldPassword,
  });
  if (signInError) {
    const error = new Error('OLD_PASSWORD_INVALID');
    error.code = 'OLD_PASSWORD_INVALID';
    throw error;
  }

  const { data, error } = await client.auth.updateUser({ password: newPassword });
  if (error) throwCloudError(error, 'PASSWORD_UPDATE_FAILED');
  activeUser = data?.user || activeUser;
}

export async function createPasswordResetToken(email) {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: 'createfixture://reset-password',
  });
  if (error) throwCloudError(error, 'PASSWORD_RESET_FAILED');
  return { emailSent: true };
}

function getRecoveryParams(url) {
  const raw = String(url || '');
  const hashIndex = raw.indexOf('#');
  const queryIndex = raw.indexOf('?');
  const parameterText = hashIndex >= 0
    ? raw.slice(hashIndex + 1)
    : queryIndex >= 0
      ? raw.slice(queryIndex + 1)
      : '';
  return new URLSearchParams(parameterText);
}

export async function preparePasswordRecovery(url) {
  if (!configured || !String(url || '').startsWith('createfixture://reset-password')) return false;
  const params = getRecoveryParams(url);
  if (params.get('type') !== 'recovery') return false;

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return false;

  const client = requireClient();
  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error || !data?.user) throwCloudError(error, 'PASSWORD_RECOVERY_SESSION_FAILED');
  activeUser = data.user;
  return true;
}

export async function resetPasswordWithToken(_token, newPassword) {
  const client = requireClient();
  await requireUser();
  const { data, error } = await client.auth.updateUser({ password: newPassword });
  if (error) throwCloudError(error, 'PASSWORD_RESET_FAILED');
  activeUser = data?.user || activeUser;
}

export async function deleteUserByEmail(email) {
  const client = requireClient();
  const user = await requireUser();
  if (normalizeEmail(user.email) !== normalizeEmail(email)) {
    const error = new Error('ACCOUNT_DELETE_DENIED');
    error.code = 'ACCOUNT_DELETE_DENIED';
    throw error;
  }

  const { error } = await client.rpc('delete_current_user');
  if (error) throwCloudError(error, 'ACCOUNT_DELETE_FAILED');
  await client.auth.signOut().catch(() => {});
  activeUser = null;
}

export async function saveTournamentToDatabase(tournament) {
  if (!tournament?.id) return;
  const client = requireClient();
  const user = await requireUser();
  const ownerEmail = normalizeEmail(user.email);
  const scopedTournament = { ...tournament, ownerEmail, email: ownerEmail };
  const name = tournament.ad || tournament.tournamentName || tournament.groupName || tournament.leagueName || 'İsimsiz Turnuva';
  const mode = tournament.mode || (tournament.groups ? 'GRUP' : 'LIG');

  const { error } = await client.from('tournaments').upsert({
    user_id: user.id,
    id: String(tournament.id),
    name,
    mode,
    raw_json: scopedTournament,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,id' });
  if (error) throwCloudError(error, 'TOURNAMENT_SAVE_FAILED');
}

export async function getTournamentsFromDatabase() {
  const client = requireClient();
  const user = await requireUser();
  const { data, error } = await client
    .from('tournaments')
    .select('raw_json')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throwCloudError(error, 'TOURNAMENTS_LOAD_FAILED');
  return (data || []).map(row => row.raw_json);
}

export async function deleteTournamentFromDatabase(id) {
  const client = requireClient();
  const user = await requireUser();
  const { error } = await client
    .from('tournaments')
    .delete()
    .eq('user_id', user.id)
    .eq('id', String(id));
  if (error) throwCloudError(error, 'TOURNAMENT_DELETE_FAILED');
}

export async function saveSetting(key, value) {
  const client = requireClient();
  const user = await requireUser();
  const { error } = await client.from('user_settings').upsert({
    user_id: user.id,
    key: String(key),
    value_json: value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,key' });
  if (error) throwCloudError(error, 'SETTING_SAVE_FAILED');
}

export async function getSetting(key, fallback = null) {
  const client = requireClient();
  const user = await requireUser();
  const { data, error } = await client
    .from('user_settings')
    .select('value_json')
    .eq('user_id', user.id)
    .eq('key', String(key))
    .maybeSingle();
  if (error) throwCloudError(error, 'SETTING_LOAD_FAILED');
  return data ? data.value_json : fallback;
}

export async function removeSetting(key) {
  return removeSettings([key]);
}

export async function removeSettings(keys = []) {
  if (!keys.length) return;
  const client = requireClient();
  const user = await requireUser();
  const { error } = await client
    .from('user_settings')
    .delete()
    .eq('user_id', user.id)
    .in('key', keys.map(String));
  if (error) throwCloudError(error, 'SETTING_DELETE_FAILED');
}

export async function getSettingsByKeys(keys = []) {
  if (!keys.length) return [];
  const client = requireClient();
  const user = await requireUser();
  const { data, error } = await client
    .from('user_settings')
    .select('key,value_json')
    .eq('user_id', user.id)
    .in('key', keys.map(String));
  if (error) throwCloudError(error, 'SETTINGS_LOAD_FAILED');
  return (data || []).map(row => [row.key, JSON.stringify(row.value_json)]);
}

export async function getAllSettingKeys() {
  const client = requireClient();
  const user = await requireUser();
  const { data, error } = await client
    .from('user_settings')
    .select('key')
    .eq('user_id', user.id)
    .order('key');
  if (error) throwCloudError(error, 'SETTINGS_LOAD_FAILED');
  return (data || []).map(row => row.key);
}

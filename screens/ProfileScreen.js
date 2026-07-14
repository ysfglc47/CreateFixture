import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../DarkModeContext';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { deleteUserByEmail, findUserByEmail, getTournamentsFromDatabase, updateUserProfile } from '../database';
import KvkkModal from '../components/KvkkModal';
import { maskEmail } from '../utils/privacy';

import { Text } from '../components/I18nPrimitives';

export default function ProfileScreen({ navigation, route }) {
  const { isDarkMode } = useDarkMode();
  const { email = '' } = route.params || {};
  const [user, setUser] = useState(null);
  const [kvkkVisible, setKvkkVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [infoDialog, setInfoDialog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    league: 0,
    group: 0,
    elimination: 0,
    teams: 0,
    completedMatches: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const currentUser = await findUserByEmail(email);
        setUser(currentUser || { email, username: email.split('@')[0] || 'Kullanıcı' });

        const tournaments = await getTournamentsFromDatabase(email);
        const allTeams = tournaments.reduce((sum, item) => {
          if (Array.isArray(item.teams)) return sum + item.teams.length;
          if (Array.isArray(item.groups)) {
            return sum + item.groups.reduce((groupSum, group) => groupSum + (group.teams?.length || 0), 0);
          }
          return sum;
        }, 0);
        const completedMatches = tournaments.reduce((sum, item) => {
          if (!Array.isArray(item.rounds)) return sum;
          return sum + item.rounds.flatMap(round => round.matches || []).filter(match => match.winner).length;
        }, 0);

        setStats({
          total: tournaments.length,
          league: tournaments.filter(item => item.mode === 'LIG' || item.leagueName).length,
          group: tournaments.filter(item => item.mode === 'GRUP').length,
          elimination: tournaments.filter(item => item.mode === 'ELEME').length,
          teams: allTeams,
          completedMatches,
        });
      };

      loadProfile();
    }, [email])
  );

  const pickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setInfoDialog({
        title: 'İzin gerekli',
        message: 'Profil fotoğrafı seçmek için galeri erişimine izin vermelisiniz.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    const avatarUri = result.assets[0].uri;
    await updateUserProfile(email, { avatarUri });
    setUser(previous => ({ ...previous, avatar_uri: avatarUri }));
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleDeleteAccount = () => {
    setDeleteDialogVisible(true);
  };

  const handleRemoveAds = () => {
    setInfoDialog({
      title: 'Reklamları Kaldır',
      message: '$1 ile uygulamayı reklamsız kullanma seçeneği ödeme altyapısı eklendiğinde aktif olacaktır.',
    });
  };

  const confirmDeleteAccount = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteUserByEmail(email);
      setDeleteDialogVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      setDeleteDialogVisible(false);
      setInfoDialog({
        title: 'Hesap silinemedi',
        message: 'Hesap bilgileri silinirken bir sorun oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const colors = {
    background: isDarkMode ? '#181818' : '#fff',
    text: isDarkMode ? '#fff' : '#222',
    muted: isDarkMode ? '#cfcfcf' : '#666',
    card: isDarkMode ? '#232323' : '#f5f5f5',
    border: isDarkMode ? '#333' : '#e6e6e6',
  };

  const avatarUri = user?.avatar_uri || user?.avatarUri || '';
  const username = user?.username || email.split('@')[0] || 'Kullanıcı';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={32} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings', { email })}>
          <Icon name="cog" size={30} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Icon name="soccer-ball-o" size={40} color="#222" />
          </View>
        )}
        <TouchableOpacity style={styles.photoButton} onPress={pickProfilePhoto}>
          <Icon name="camera" size={15} color="#222" />
          <Text style={styles.photoButtonText}>Profil fotoğrafını değiştir</Text>
        </TouchableOpacity>
        <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>{username}</Text>
        <Text style={[styles.email, { color: colors.muted }]}>{maskEmail(email)}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Turnuva" value={stats.total} icon="trophy" colors={colors} />
        <StatCard label="Lig" value={stats.league} icon="table" colors={colors} />
        <StatCard label="Grup" value={stats.group} icon="object-group" colors={colors} />
        <StatCard label="Eleme" value={stats.elimination} icon="sitemap" colors={colors} />
        <StatCard label="Takım" value={stats.teams} icon="users" colors={colors} />
        <StatCard label="Biten Maç" value={stats.completedMatches} icon="check-circle" colors={colors} />
      </View>

      <View style={styles.removeAdsCard}>
        <View style={styles.removeAdsIcon}>
          <Icon name="ban" size={22} color="#222" />
        </View>
        <View style={styles.removeAdsText}>
          <Text style={styles.removeAdsTitle}>Reklamları Kaldır</Text>
          <Text style={styles.removeAdsDescription}>$1 ile uygulamayı reklamsız kullan.</Text>
        </View>
        <TouchableOpacity style={styles.removeAdsButton} onPress={handleRemoveAds}>
          <Text style={styles.removeAdsButtonText}>Kaldır</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hesap İşlemleri</Text>
        <ActionRow icon="edit" label="Hesabı düzenle" onPress={() => navigation.navigate('EditProfile', { email })} colors={colors} />
        <ActionRow icon="file-text-o" label="KVKK Aydınlatma Metni" onPress={() => setKvkkVisible(true)} colors={colors} />
        <ActionRow icon="cog" label="Uygulama ayarları" onPress={() => navigation.navigate('Settings', { email })} colors={colors} />
        <ActionRow icon="sign-out" label="Çıkış yap" onPress={handleLogout} colors={colors} />
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Icon name="trash" size={18} color="#fff" />
        <Text style={styles.deleteText}>Hesabı Sil</Text>
      </TouchableOpacity>

      <AppDialog
        visible={deleteDialogVisible}
        title="Hesabı kalıcı olarak sil"
        message="Bu işlem geri alınamaz. Hesabınız, e-posta ve şifre bilgileriniz, profil bilgileriniz, tüm turnuvalarınız, takımlarınız, maçlarınız, sonuçlarınız ve kayıtlı tablo verileriniz veritabanından silinecek."
        colors={colors}
        confirmText="Evet, sil"
        cancelText="Vazgeç"
        destructive
        loading={isDeleting}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDeleteAccount}
      />

      <AppDialog
        visible={Boolean(infoDialog)}
        title={infoDialog?.title || ''}
        message={infoDialog?.message || ''}
        colors={colors}
        confirmText="Tamam"
        onConfirm={() => setInfoDialog(null)}
      />

      <KvkkModal visible={kvkkVisible} onClose={() => setKvkkVisible(false)} isDarkMode={isDarkMode} />
    </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon, colors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Icon name={icon} size={22} color="#FFD700" />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function ActionRow({ icon, label, onPress, colors }) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <Icon name={icon} size={20} color="#FFD700" />
      <Text style={[styles.actionText, { color: colors.text }]}>{label}</Text>
      <Icon name="angle-right" size={22} color={colors.muted} />
    </TouchableOpacity>
  );
}

function AppDialog({
  visible,
  title,
  message,
  colors,
  confirmText,
  cancelText,
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={styles.dialogBackdrop}>
        <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.dialogIcon, destructive && styles.dialogIconDanger]}>
            <Icon name={destructive ? 'exclamation-triangle' : 'info'} size={22} color={destructive ? '#fff' : '#222'} />
          </View>
          <Text style={[styles.dialogTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.dialogMessage, { color: colors.muted }]}>{message}</Text>

          <View style={styles.dialogActions}>
            {cancelText ? (
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancelButton, { borderColor: colors.border }]}
                onPress={onCancel}
                disabled={loading}
              >
                <Text style={[styles.dialogCancelText, { color: colors.text }]}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.dialogButton, destructive ? styles.dialogDangerButton : styles.dialogConfirmButton]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={destructive ? '#fff' : '#222'} />
              ) : (
                <Text style={[styles.dialogConfirmText, destructive && styles.dialogDangerText]}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  profileCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  defaultAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  photoButtonText: {
    color: '#222',
    fontWeight: '900',
    fontSize: 12,
  },
  username: {
    maxWidth: '100%',
    fontSize: 19,
    fontWeight: '900',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeAdsCard: {
    backgroundColor: '#FFD700',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E6C64A',
  },
  removeAdsIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.76)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAdsText: {
    flex: 1,
  },
  removeAdsTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: '900',
  },
  removeAdsDescription: {
    color: '#333',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  removeAdsButton: {
    backgroundColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  removeAdsButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '900',
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  deleteButton: {
    backgroundColor: '#d33',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '900',
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.64)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  dialogIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dialogIconDanger: {
    backgroundColor: '#d33',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dialogCancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  dialogConfirmButton: {
    backgroundColor: '#FFD700',
  },
  dialogDangerButton: {
    backgroundColor: '#d33',
  },
  dialogCancelText: {
    fontWeight: '900',
    fontSize: 13,
  },
  dialogConfirmText: {
    color: '#222',
    fontWeight: '900',
    fontSize: 13,
  },
  dialogDangerText: {
    color: '#fff',
  },
});

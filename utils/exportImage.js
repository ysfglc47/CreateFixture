import { Alert, InteractionManager, Platform, Share } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { translateRuntimeText } from '../src/i18n/runtimeTranslator';

function askWebDownloadPermission() {
  if (typeof window === 'undefined') return true;
  return window.confirm('Tablo PNG çıktısını indirmek istiyor musunuz?');
}

function downloadOnWeb(uri, fileName) {
  if (typeof document === 'undefined') return false;
  const link = document.createElement('a');
  link.href = uri;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

async function requestMediaPermission() {
  const current = await MediaLibrary.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await MediaLibrary.requestPermissionsAsync(false);
  return requested.granted;
}

async function sharePng(uri) {
  try {
    await Share.share({
      title: 'CreateFixture tablo çıktısı',
      message: 'CreateFixture tablo çıktısı hazır.',
      url: uri,
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function exportRefAsPng(ref, fileName = 'createfixture-tablo.png') {
  const target = ref?.current;

  if (!target) {
    Alert.alert('PNG kaydedilemedi', 'Tablo çıktısı hazırlanamadı, lütfen tekrar deneyin.');
    return false;
  }

  if (Platform.OS === 'web' && !askWebDownloadPermission()) {
    return false;
  }

  if (Platform.OS !== 'web') {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      Alert.alert('İzin gerekli', 'PNG çıktısını kaydedebilmek için galeri erişimine izin vermelisiniz.');
      return false;
    }
  }

  try {
    await new Promise(resolve => InteractionManager.runAfterInteractions(resolve));
    await new Promise(resolve => setTimeout(resolve, 250));

    const uri = await captureRef(target, {
      format: 'png',
      quality: 1,
      snapshotContentContainer: true,
      result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
    });

    if (Platform.OS === 'web') {
      if (!downloadOnWeb(uri, fileName)) {
        Alert.alert('PNG hazır', 'Tarayıcı indirmeyi başlatamadı.');
        return false;
      }
      return true;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('CreateFixture');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('CreateFixture', asset, false);
      }
    } catch (albumError) {
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
      } catch (libraryError) {
        const shared = await sharePng(uri);
        if (shared) {
          Alert.alert(
            'PNG hazır',
            'Galeriye otomatik kaydedilemedi, bu yüzden paylaşım ekranı açıldı. Buradan cihazınıza kaydedebilirsiniz.'
          );
          return true;
        }
        throw libraryError;
      }
    }

    Alert.alert(
      'PNG galeriye kaydedildi',
      'Tablo çıktısı galerinize CreateFixture albümü içinde kaydedildi.',
      [
        {
          text: 'Paylaş',
          onPress: () => sharePng(uri),
        },
        { text: 'Tamam' },
      ]
    );
    return true;
  } catch (error) {
    Alert.alert(
      'PNG kaydedilemedi',
      `PNG kaydedilemedi, lütfen tekrar deneyin.${error?.message ? `\n\n${error.message}` : ''}`
    );
    return false;
  }
}

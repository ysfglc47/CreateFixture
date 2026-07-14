let initialized = false;
let initializingPromise: Promise<boolean> | null = null;
let canRequestAds = false;

function isExpoGoRuntime() {
  try {
    const Constants = require('expo-constants').default;
    return Constants?.appOwnership === 'expo' || Constants?.executionEnvironment === 'storeClient';
  } catch (error) {
    return false;
  }
}

function getGoogleMobileAdsModule() {
  if (isExpoGoRuntime()) return null;

  try {
    return require('react-native-google-mobile-ads');
  } catch (error) {
    return null;
  }
}

export async function initializeAdMob() {
  if (initialized) return true;
  if (initializingPromise) return initializingPromise;

  initializingPromise = (async () => {
    try {
      const GoogleMobileAds = getGoogleMobileAdsModule();
      if (!GoogleMobileAds) return false;

      const mobileAds = GoogleMobileAds.default || GoogleMobileAds;
      const AdsConsent = GoogleMobileAds.AdsConsent;

      if (AdsConsent?.gatherConsent) {
        const consentInfo = await AdsConsent.gatherConsent();
        canRequestAds = Boolean(consentInfo?.canRequestAds);
      } else {
        canRequestAds = true;
      }

      if (!canRequestAds) return false;

      await mobileAds().initialize();
      initialized = true;
      return true;
    } catch (error) {
      return false;
    } finally {
      initializingPromise = null;
    }
  })();

  return initializingPromise;
}

export function canRequestAdMobAds() {
  return canRequestAds || initialized;
}



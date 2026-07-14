export const ADMOB_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
};

export const ADMOB_TEST_AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

export const PRODUCTION_AD_UNITS = {
  publisherId: 'pub-3103480668670533',
  appAdsTxt: 'google.com, pub-3103480668670533, DIRECT, f08c47fec0942fa0',
  banner: '',
  interstitial: '',
};

function isValidAdUnitId(value?: string) {
  return Boolean(value && /^ca-app-pub-\d+\/\d+$/.test(value));
}

export function getAdMobUnitIds() {
  const banner = __DEV__
    ? ADMOB_TEST_AD_UNITS.banner
    : isValidAdUnitId(PRODUCTION_AD_UNITS.banner)
      ? PRODUCTION_AD_UNITS.banner
      : '';

  const interstitial = __DEV__
    ? ADMOB_TEST_AD_UNITS.interstitial
    : isValidAdUnitId(PRODUCTION_AD_UNITS.interstitial)
      ? PRODUCTION_AD_UNITS.interstitial
      : '';

  return {
    banner,
    interstitial,
  };
}

export function isAdMobAvailable() {
  return __DEV__ || isValidAdUnitId(PRODUCTION_AD_UNITS.banner) || isValidAdUnitId(PRODUCTION_AD_UNITS.interstitial);
}

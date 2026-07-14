import { useCallback, useState } from 'react';

export function useInterstitialAd() {
  const [loaded] = useState(false);

  const load = useCallback(async () => false, []);
  const show = useCallback(async () => false, []);

  return {
    loaded,
    load,
    show,
  };
}

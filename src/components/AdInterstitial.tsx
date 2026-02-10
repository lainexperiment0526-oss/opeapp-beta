import { useState, useEffect, useCallback } from 'react';
import { usePiNetwork } from '@/hooks/usePiNetwork';
import { useActiveAds } from '@/hooks/useAds';
import { useActiveCampaigns } from '@/hooks/useAdCampaigns';
import { VideoAdOverlay } from './VideoAdOverlay';
import { CampaignAdOverlay } from './CampaignAdOverlay';

interface AdInterstitialProps {
  onComplete: () => void;
  trigger: 'auth' | 'app-open';
}

export function AdInterstitial({ onComplete, trigger }: AdInterstitialProps) {
  const { showPiAd, isPiReady } = usePiNetwork();
  const { data: appAds } = useActiveAds();
  const { data: campaignAds } = useActiveCampaigns();
  const [showingAppAd, setShowingAppAd] = useState<any>(null);
  const [showingCampaignAd, setShowingCampaignAd] = useState<any>(null);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted) return;
    setAttempted(true);

    const eligibleCampaigns = (campaignAds || []).filter(
      (ad) => ad.ad_type === 'interstitial' || ad.ad_type === 'rewarded'
    );
    const combinedAds = [
      ...(appAds || []).map((ad) => ({ kind: 'app' as const, ad })),
      ...eligibleCampaigns.map((ad) => ({ kind: 'campaign' as const, ad })),
    ];

    // Randomly choose between Pi AdNetwork and app video ads
    const usePiAd = Math.random() > 0.5 && isPiReady;

    if (usePiAd) {
      // Try Pi AdNetwork interstitial
      const adType = Math.random() > 0.5 ? 'interstitial' : 'rewarded';
      showPiAd(adType as 'interstitial' | 'rewarded').then((success) => {
        if (!success && combinedAds.length > 0) {
          // Fallback to app/campaign ad
          const randomAd = combinedAds[Math.floor(Math.random() * combinedAds.length)];
          if (randomAd.kind === 'app') {
            setShowingAppAd(randomAd.ad);
          } else {
            setShowingCampaignAd(randomAd.ad);
          }
        } else {
          onComplete();
        }
      });
    } else if (combinedAds.length > 0) {
      // Show random app/campaign ad
      const randomAd = combinedAds[Math.floor(Math.random() * combinedAds.length)];
      if (randomAd.kind === 'app') {
        setShowingAppAd(randomAd.ad);
      } else {
        setShowingCampaignAd(randomAd.ad);
      }
    } else if (isPiReady) {
      // Try Pi AdNetwork as fallback
      showPiAd('interstitial').then(() => onComplete());
    } else {
      onComplete();
    }
  }, [attempted, isPiReady, appAds, campaignAds]);

  const handleClose = useCallback(() => {
    setShowingAppAd(null);
    setShowingCampaignAd(null);
    onComplete();
  }, [onComplete]);

  const handleNavigate = useCallback(() => {
    setShowingAppAd(null);
    setShowingCampaignAd(null);
  }, []);

  if (showingAppAd) {
    return <VideoAdOverlay ad={showingAppAd} onClose={handleClose} onNavigate={handleNavigate} />;
  }

  if (showingCampaignAd) {
    return <CampaignAdOverlay ad={showingCampaignAd} onClose={handleClose} />;
  }

  return null;
}

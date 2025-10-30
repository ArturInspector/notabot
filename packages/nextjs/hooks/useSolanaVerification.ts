import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BACKEND_URL, postJson, getJson } from '../utils/api';
import toast from 'react-hot-toast';

type SolanaVerifyResponse = {
  success: boolean;
  alreadyVerified?: boolean;
  data: {
    signature?: string;
    pda?: string;
    explorerUrl?: string;
    isVerified?: boolean;
    timestamp?: number;
    trustScore?: number;
  };
};

export function useSolanaVerification() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const checkVerification = useCallback(async () => {
    if (!publicKey || !connected) return null;

    try {
      const response = await getJson<SolanaVerifyResponse>(
        `${BACKEND_URL}/api/solana/check/${publicKey.toBase58()}`
      );
      
      if (response.success && response.data.isVerified) {
        setVerified(true);
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [publicKey, connected]);

  const verify = useCallback(async (source: string, uniqueId: string) => {
    if (!publicKey || !connected) {
      toast.error('Please connect your Solana wallet first');
      return null;
    }

    setLoading(true);
    const toastId = toast.loading('Verifying on Solana...');

    try {
      const response = await postJson<SolanaVerifyResponse>(
        `${BACKEND_URL}/api/solana/verify`,
        {
          userPublicKey: publicKey.toBase58(),
          source,
          uniqueId
        }
      );

      toast.dismiss(toastId);

      if (response.success) {
        if (response.alreadyVerified) {
          toast.success('Already verified on Solana!');
        } else {
          toast.success('✅ Verified on Solana!');
          if (response.data.explorerUrl) {
            toast.success('🔗 View on Solana Explorer', {
              duration: 6000,
            });
          }
        }
        setVerified(true);
        return response.data;
      } else {
        toast.error('Verification failed');
        return null;
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      const message = error?.message || 'Verification failed';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected]);

  return {
    publicKey,
    connected,
    loading,
    verified,
    verify,
    checkVerification
  };
}


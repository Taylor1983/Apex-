import { BiometricLogEntry } from '../types';

export async function checkHardwareBiometricSupport(): Promise<boolean> {
  try {
    if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return isAvailable;
    }
  } catch (err) {
    console.warn('WebAuthn check bypassed:', err);
  }
  return false;
}

export async function requestWebAuthnBiometric(actionName: string): Promise<{ success: boolean; method: 'WebAuthn FaceID' | 'WebAuthn TouchID' | 'PIN Fallback' | 'Hardware Security Key'; error?: string }> {
  try {
    // Attempt standard WebAuthn API if available
    if (window.PublicKeyCredential && navigator.credentials) {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname
        }
      };

      try {
        const assertion = await navigator.credentials.get(credentialRequestOptions);
        if (assertion) {
          return { success: true, method: 'WebAuthn FaceID' };
        }
      } catch (authError: any) {
        // If iframe policy disables webauthn or user cancelled, fallback will handle it
        console.info('Native WebAuthn caught expected iframe/user fallback:', authError?.message || authError);
      }
    }
  } catch (e: any) {
    console.info('Biometric native invocation fallback:', e);
  }

  // If native failed or not supported in iframe environment, signal caller to display in-app biometric modal
  return { success: false, method: 'WebAuthn TouchID', error: 'FALLBACK_REQUIRED' };
}

export function createAuditLog(
  action: string,
  method: 'WebAuthn FaceID' | 'WebAuthn TouchID' | 'PIN Fallback' | 'Hardware Security Key',
  success: boolean
): BiometricLogEntry {
  const isMac = navigator.userAgent.includes('Mac');
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const device = isMobile
    ? 'Mobile Biometric Sensor (FaceID / Fingerprint)'
    : isMac
    ? 'Apple Secure Enclave (Touch ID / Face ID)'
    : 'Windows Hello / FIDO2 Hardware Authenticator';

  return {
    id: `bio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    action,
    method,
    success,
    device,
    ipMasked: '192.168.1.***'
  };
}

import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
} from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';
import { Language } from '../i18n/translations';

export interface FirebaseSignInOutput {
  idToken: string;
  uid: string;
  email: string;
  name: string;
  phone: string;
  avatarUrl: string;
}

function formatCredentialOutput(cred: UserCredential, idToken: string): FirebaseSignInOutput {
  const u = cred.user;
  const rawPhone = String(u.phoneNumber || '').replace(/\D/g, '').slice(-10);
  return {
    idToken,
    uid: u.uid,
    email: u.email || '',
    name: u.displayName || '',
    phone: rawPhone.length === 10 ? rawPhone : '',
    avatarUrl: u.photoURL || '',
  };
}

export function mapFirebaseErrorMessage(err: any, language: Language = 'hi'): string {
  const code = String(err?.code || '');
  const isEn = language === 'en';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return isEn ? 'Sign-in popup was closed before completing.' : 'लॉगिन विंडो पूरी होने से पहले बंद कर दी गई।';
  }
  if (code === 'auth/popup-blocked') {
    return isEn
      ? 'Browser blocked the sign-in popup. Please allow popups for this site and try again.'
      : 'ब्राउज़र ने लॉगिन पॉपअप ब्लॉक किया है। कृपया पॉपअप की अनुमति दें या पुनः प्रयास करें।';
  }
  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'setu-1-nine.vercel.app';
    return isEn
      ? `Domain "${host}" is not authorized in Firebase Console → Authentication → Settings → Authorized domains.`
      : `डोमेन "${host}" अभी Firebase Console → Authentication → Authorized domains में नहीं जुड़ा है। कृपया इसे वहां Add करें।`;
  }
  if (code === 'auth/operation-not-allowed') {
    return isEn
      ? 'This login provider is not enabled yet in Firebase Console → Authentication → Sign-in method.'
      : 'यह लॉगिन विकल्प अभी Firebase Console → Authentication → Sign-in method में Enable नहीं किया गया है।';
  }
  if (code === 'auth/billing-not-enabled') {
    return isEn
      ? 'Firebase Phone SMS OTP requires Blaze billing in Firebase Console. Please use Google Sign-In or Email login (100% free!).'
      : 'Firebase Phone SMS OTP के लिए Firebase Console में Blaze बिलिंग आवश्यक है। आप अभी Google से लॉगिन या ईमेल लॉगिन (100% फ्री) उपयोग कर सकते हैं!';
  }
  if (code === 'auth/email-already-in-use') {
    return isEn
      ? 'This email is already registered. Try logging in instead.'
      : 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन मोड से साइन इन करें।';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return isEn ? 'Invalid email or password.' : 'गलत ईमेल या पासवर्ड दर्ज किया गया है।';
  }
  if (code === 'auth/weak-password') {
    return isEn ? 'Password must be at least 6 characters.' : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।';
  }
  if (code === 'auth/invalid-verification-code') {
    return isEn ? 'Invalid OTP verification code.' : 'गलत OTP कोड दर्ज किया गया है।';
  }
  if (code === 'auth/too-many-requests') {
    return isEn ? 'Too many attempts. Please wait a few minutes and try again.' : 'बहुत अधिक प्रयास किए गए। कृपया कुछ मिनट बाद पुनः प्रयास करें।';
  }
  return err?.message || (isEn ? 'Firebase authentication failed.' : 'Firebase प्रमाणीकरण विफल रहा।');
}

export async function signInWithFirebaseGoogle(): Promise<FirebaseSignInOutput | null> {
  if (Platform.OS !== 'web') {
    throw new Error('Google popup login is configured for Web browser.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await signInWithPopup(firebaseAuth, provider);
    const idToken = await cred.user.getIdToken();
    return formatCredentialOutput(cred, idToken);
  } catch (err: any) {
    if (err?.code === 'auth/popup-blocked') {
      await signInWithRedirect(firebaseAuth, provider);
      return null;
    }
    throw err;
  }
}

export async function consumeFirebaseRedirectResult(): Promise<FirebaseSignInOutput | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const cred = await getRedirectResult(firebaseAuth);
    if (!cred) return null;
    const idToken = await cred.user.getIdToken();
    return formatCredentialOutput(cred, idToken);
  } catch {
    return null;
  }
}

export async function signInOrRegisterWithFirebaseEmail(
  email: string,
  password: string,
  isRegister: boolean,
  fullName?: string
): Promise<FirebaseSignInOutput> {
  const cleanEmail = email.trim().toLowerCase();
  const cred = isRegister
    ? await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password)
    : await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);

  if (isRegister && fullName && fullName.trim() && !cred.user.displayName) {
    await updateProfile(cred.user, { displayName: fullName.trim() }).catch(() => {});
  }
  const idToken = await cred.user.getIdToken(true);
  return formatCredentialOutput(cred, idToken);
}

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

export async function sendFirebasePhoneOtp(
  phone10Digits: string,
  containerId: string
): Promise<ConfirmationResult> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    throw new Error('Firebase web reCAPTCHA requires browser environment.');
  }
  const clean = phone10Digits.replace(/\D/g, '').slice(-10);
  if (clean.length !== 10) {
    throw new Error('कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।');
  }
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // Ignore cleanup error
    }
    activeRecaptchaVerifier = null;
  }
  const el = document.getElementById(containerId);
  if (!el) {
    throw new Error('reCAPTCHA container not ready on screen.');
  }
  activeRecaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
  });
  return signInWithPhoneNumber(firebaseAuth, `+91${clean}`, activeRecaptchaVerifier);
}

export async function confirmFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<FirebaseSignInOutput> {
  const cred = await confirmationResult.confirm(code.trim());
  const idToken = await cred.user.getIdToken();
  return formatCredentialOutput(cred, idToken);
}

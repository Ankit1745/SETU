import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
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
  emailVerified: boolean;
  name: string;
  phone: string;
  avatarUrl: string;
  needsEmailVerification?: boolean;
}

function formatCredentialOutput(cred: UserCredential, idToken: string): FirebaseSignInOutput {
  const u = cred.user;
  const rawPhone = String(u.phoneNumber || '').replace(/\D/g, '').slice(-10);
  return {
    idToken,
    uid: u.uid,
    email: u.email || '',
    emailVerified: Boolean(u.emailVerified),
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
      ? 'Email/Password login is not enabled yet in Firebase Console → Authentication → Sign-in method.'
      : 'ईमेल/पासवर्ड लॉगिन अभी Firebase Console → Authentication → Sign-in method में Enable नहीं है। कृपया इसे Enable करें।';
  }
  if (code === 'auth/billing-not-enabled') {
    return isEn
      ? 'Firebase Phone SMS OTP requires Blaze billing in Firebase Console. Please use Google Sign-In or Email login (100% free!).'
      : 'Firebase Phone SMS OTP के लिए Firebase Console में Blaze बिलिंग आवश्यक है। आप अभी Google से लॉगिन या ईमेल वेरिफिकेशन (100% फ्री) उपयोग कर सकते हैं!';
  }
  if (code === 'auth/email-already-in-use') {
    return isEn
      ? 'This email is already registered. Switch to Login mode to sign in or verify your email.'
      : 'यह ईमेल पहले से पंजीकृत है। लॉगिन टैब से साइन इन करें या ईमेल वेरिफाई करें।';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return isEn
      ? 'Invalid email or password. If you are a new user, switch to "Create Account".'
      : 'गलत ईमेल या पासवर्ड। यदि आप नए यूज़र हैं तो ऊपर "नया खाता बनाएं" टैब चुनें।';
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

  await cred.user.reload().catch(() => {});
  if (!cred.user.emailVerified) {
    await sendEmailVerification(cred.user).catch(() => {});
    return {
      idToken: '',
      uid: cred.user.uid,
      email: cred.user.email || cleanEmail,
      emailVerified: false,
      name: cred.user.displayName || fullName || '',
      phone: '',
      avatarUrl: cred.user.photoURL || '',
      needsEmailVerification: true,
    };
  }

  const idToken = await cred.user.getIdToken(true);
  return formatCredentialOutput(cred, idToken);
}

export async function checkCurrentFirebaseEmailVerified(): Promise<FirebaseSignInOutput | null> {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  await user.reload();
  if (!user.emailVerified) return null;
  const idToken = await user.getIdToken(true);
  const rawPhone = String(user.phoneNumber || '').replace(/\D/g, '').slice(-10);
  return {
    idToken,
    uid: user.uid,
    email: user.email || '',
    emailVerified: true,
    name: user.displayName || '',
    phone: rawPhone.length === 10 ? rawPhone : '',
    avatarUrl: user.photoURL || '',
  };
}

export async function resendCurrentFirebaseVerificationEmail(): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error('सत्र समाप्त हो गया है। कृपया ईमेल और पासवर्ड फिर से डालें।');
  }
  await sendEmailVerification(user);
}

export async function signOutFirebaseSession(): Promise<void> {
  await signOut(firebaseAuth).catch(() => {});
}

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;
let sessionPhoneAuthUnsupportedCode: string | null = null;

function clearRecaptchaState(containerId?: string) {
  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
    } catch {
      // Ignore cleanup error
    }
    activeRecaptchaVerifier = null;
  }
  if (containerId && typeof document !== 'undefined') {
    const hostEl = document.getElementById(containerId);
    if (hostEl) hostEl.innerHTML = '';
  }
}

export async function sendFirebasePhoneOtp(
  phone10Digits: string,
  containerId: string
): Promise<ConfirmationResult> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    throw new Error('Firebase web reCAPTCHA requires browser environment.');
  }
  if (sessionPhoneAuthUnsupportedCode) {
    const err: any = new Error('Firebase Phone Auth not active on current billing plan.');
    err.code = sessionPhoneAuthUnsupportedCode;
    throw err;
  }
  const clean = phone10Digits.replace(/\D/g, '').slice(-10);
  if (clean.length !== 10) {
    throw new Error('कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।');
  }

  clearRecaptchaState(containerId);
  const hostEl = document.getElementById(containerId);
  if (!hostEl) {
    throw new Error('reCAPTCHA container not ready on screen.');
  }
  // Always mount on a fresh unique child element so retries never collide with "already rendered"
  const slotId = `${containerId}_slot_${Date.now()}`;
  const slotDiv = document.createElement('div');
  slotDiv.id = slotId;
  hostEl.appendChild(slotDiv);

  try {
    activeRecaptchaVerifier = new RecaptchaVerifier(firebaseAuth, slotId, {
      size: 'invisible',
    });
    return await signInWithPhoneNumber(firebaseAuth, `+91${clean}`, activeRecaptchaVerifier);
  } catch (err: any) {
    const code = String(err?.code || '');
    if (code === 'auth/billing-not-enabled' || code === 'auth/operation-not-allowed') {
      sessionPhoneAuthUnsupportedCode = code;
    }
    clearRecaptchaState(containerId);
    throw err;
  }
}

export async function confirmFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<FirebaseSignInOutput> {
  const cred = await confirmationResult.confirm(code.trim());
  const idToken = await cred.user.getIdToken();
  return formatCredentialOutput(cred, idToken);
}

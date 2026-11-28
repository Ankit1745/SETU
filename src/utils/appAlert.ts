/**
 * Branded SETU In-App Alert, Confirmation & Toast System
 * Replaces native browser window.alert / window.confirm dialogs everywhere
 * so alerts render cleanly inside SETU's own themed UI across Web, Android, and iOS.
 */

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

export interface AppAlertPayload {
  id: string;
  title: string;
  message?: string;
  buttons: AlertButton[];
  tone: AlertTone;
}

export interface AppToastPayload {
  id: string;
  title: string;
  message?: string;
  tone: AlertTone;
}

type Listener = {
  onAlert: (payload: AppAlertPayload) => void;
  onToast: (payload: AppToastPayload) => void;
};

const listeners = new Set<Listener>();
const pendingAlerts: AppAlertPayload[] = [];
const pendingToasts: AppToastPayload[] = [];

function detectTone(title: string, message = ''): AlertTone {
  const combined = `${title} ${message}`;
  if (/✅|🎉|सफल|स्वीकृत|approved|success|welcome|कन्फर्म/i.test(combined)) return 'success';
  if (/❌|⛔|त्रुटि|अस्वीकार|error|failed|blocked|denied|अवैध|अमान्य/i.test(combined)) return 'error';
  if (/⚠|🔒|🚨|अनिवार्य|प्रतीक्षा|caution|warning|required|security|जरूरी/i.test(combined)) return 'warning';
  return 'info';
}

export function subscribeAppAlerts(listener: Listener): () => void {
  listeners.add(listener);
  while (pendingAlerts.length > 0) {
    const item = pendingAlerts.shift();
    if (item) listener.onAlert(item);
  }
  while (pendingToasts.length > 0) {
    const item = pendingToasts.shift();
    if (item) listener.onToast(item);
  }
  return () => {
    listeners.delete(listener);
  };
}

export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  const resolvedButtons: AlertButton[] =
    Array.isArray(buttons) && buttons.length > 0
      ? buttons
      : [{ text: 'ठीक है', style: 'default' }];

  const payload: AppAlertPayload = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: String(title || 'SETU सूचना'),
    message: message ? String(message) : undefined,
    buttons: resolvedButtons,
    tone: detectTone(title, message),
  };

  if (listeners.size === 0) {
    pendingAlerts.push(payload);
    return;
  }

  listeners.forEach((l) => l.onAlert(payload));
}

export function showAppToast(
  title: string,
  message?: string,
  tone?: AlertTone
): void {
  const payload: AppToastPayload = {
    id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: String(title || 'SETU'),
    message: message ? String(message) : undefined,
    tone: tone || detectTone(title, message),
  };

  if (listeners.size === 0) {
    pendingToasts.push(payload);
    return;
  }

  listeners.forEach((l) => l.onToast(payload));
}

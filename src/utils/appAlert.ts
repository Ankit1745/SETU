import { Alert, AlertButton, Platform } from 'react-native';

/**
 * Cross-platform alert helper: react-native-web leaves Alert.alert() as a no-op,
 * so Web callers fall back to native browser confirm/alert dialogs while mobile
 * platforms use React Native Alert.alert directly.
 */
export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    Alert.alert(title, message, buttons);
    return;
  }

  const fullText = message ? `${title}\n\n${message}` : title;
  const actionButtons = (buttons || []).filter((b) => b && b.style !== 'cancel');

  if (buttons && buttons.length > 1 && actionButtons.length > 0 && typeof window.confirm === 'function') {
    const confirmed = window.confirm(fullText);
    if (confirmed) {
      actionButtons[0]?.onPress?.();
    } else {
      const cancelBtn = buttons.find((b) => b.style === 'cancel');
      cancelBtn?.onPress?.();
    }
    return;
  }

  if (typeof window.alert === 'function') {
    window.alert(fullText);
  }
  if (actionButtons.length === 1) {
    actionButtons[0]?.onPress?.();
  }
}

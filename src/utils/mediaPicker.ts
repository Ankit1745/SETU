import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

export interface PickedMedia {
  uri: string;
  base64?: string;
  name: string;
  type: 'image' | 'video';
  sizeBytes?: number;
}

/**
 * Resizes and compresses picked photos on Web (and ensures safe payload size under ~150KB)
 * so AI endpoints & in-photo diffusion models stay fast and never hit 413 limits.
 */
async function normalizePickedImageBase64(uri: string, rawBase64?: string | null): Promise<string> {
  const fallbackDataUri = rawBase64
    ? (rawBase64.startsWith('data:') ? rawBase64 : `data:image/jpeg;base64,${rawBase64}`)
    : uri;

  if (Platform.OS !== 'web' || typeof document === 'undefined' || typeof window === 'undefined') {
    return fallbackDataUri;
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = (val: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(val);
    };
    const timeoutId = setTimeout(() => done(fallbackDataUri), 8000);

    try {
      const ImgCtor = (window as any).Image;
      if (!ImgCtor) return done(fallbackDataUri);
      const img = new ImgCtor();
      if (!fallbackDataUri.startsWith('data:') && !fallbackDataUri.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const maxDim = 768;
          const origW = img.naturalWidth || img.width || 768;
          const origH = img.naturalHeight || img.height || 512;
          const scale = Math.min(1, maxDim / Math.max(origW, origH));
          const targetW = Math.max(64, Math.round(origW * scale));
          const targetH = Math.max(64, Math.round(origH * scale));
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) return done(fallbackDataUri);
          // Fill white background before drawing transparent PNG/WEBP so JPEG conversion doesn't turn black
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          let compressed = canvas.toDataURL('image/jpeg', 0.78);
          if (compressed.length > 3500000) {
            compressed = canvas.toDataURL('image/jpeg', 0.58);
          }
          done(
            compressed && compressed.startsWith('data:image/') && compressed.length > 200
              ? compressed
              : fallbackDataUri
          );
        } catch {
          done(fallbackDataUri);
        }
      };
      img.onerror = () => done(fallbackDataUri);
      img.src = fallbackDataUri;
    } catch {
      done(fallbackDataUri);
    }
  });
}

function checkNativeMediaSize(base64Data: string, fileSize?: number): boolean {
  const approxBytes = fileSize || Math.round((base64Data.length * 3) / 4);
  if (approxBytes > 4.9 * 1024 * 1024) {
    Alert.alert(
      'फ़ोटो का आकार बड़ा है',
      'कृपया 5MB से छोटी या कम रिज़ॉल्यूशन की फ़ोटो चुनें ताकि AI तेजी से जांच कर सके।'
    );
    return false;
  }
  return true;
}

/**
 * Universal cross-platform Media Picker for React Native (Android, iOS & Web)
 * Eliminates crashes caused by `document.createElement('input')` on mobile.
 */
export async function pickImageFromGallery(): Promise<PickedMedia | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'अनुमति आवश्यक',
        'फोटो चुनने के लिए कृपया सेटिंग्स में जाकर फोटो लाइब्रेरी की अनुमति दें।'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.55,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
    const base64Data = await normalizePickedImageBase64(asset.uri, asset.base64);
    if (!checkNativeMediaSize(base64Data, asset.fileSize)) {
      return null;
    }

    return {
      uri: asset.uri,
      base64: base64Data,
      name: fileName,
      type: 'image',
      sizeBytes: asset.fileSize,
    };
  } catch (error: any) {
    console.error('Gallery pick error:', error);
    Alert.alert('त्रुटि', 'गैलरी से फोटो चुनने में असमर्थ: ' + error.message);
    return null;
  }
}

/**
 * Universal cross-platform Camera Capture for React Native & Web
 */
export async function capturePhotoFromCamera(): Promise<PickedMedia | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'कैमरा अनुमति आवश्यक',
        'समस्या की लाइव फोटो लेने के लिए कृपया कैमरा एक्सेस की अनुमति दें।'
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.55,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || `camera_${Date.now()}.jpg`;
    const base64Data = await normalizePickedImageBase64(asset.uri, asset.base64);
    if (!checkNativeMediaSize(base64Data, asset.fileSize)) {
      return null;
    }

    return {
      uri: asset.uri,
      base64: base64Data,
      name: fileName,
      type: 'image',
      sizeBytes: asset.fileSize,
    };
  } catch (error: any) {
    console.error('Camera capture error:', error);
    Alert.alert('त्रुटि', 'कैमरे से फोटो लेने में असमर्थ: ' + error.message);
    return null;
  }
}

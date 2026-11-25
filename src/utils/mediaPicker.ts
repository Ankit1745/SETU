import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

export interface PickedMedia {
  uri: string;
  base64?: string;
  name: string;
  type: 'image' | 'video';
  sizeBytes?: number;
}

function photoDataUrl(asset: ImagePicker.ImagePickerAsset) {
  // The web picker encodes the original file, while the native picker returns JPEG data.
  const mimeType = (Platform.OS === 'web' && asset.mimeType) || 'image/jpeg';
  return asset.base64 ? `data:${mimeType};base64,${asset.base64}` : asset.uri;
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
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || `photo_${Date.now()}.jpg`;

    return {
      uri: asset.uri,
      base64: photoDataUrl(asset),
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
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || `camera_${Date.now()}.jpg`;

    return {
      uri: asset.uri,
      base64: photoDataUrl(asset),
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

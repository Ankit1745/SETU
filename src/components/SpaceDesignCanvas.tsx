import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SetuVisualPlan {
  designType: 'kitchen' | 'wardrobe' | 'bedroom' | 'house' | 'bathroom' | 'electrical' | 'painting' | 'repair_fix';
  title: string;
  finishLabel: string;
  dimensionsLabel: string;
  afterCaption?: string;
  selectedMaterialNames?: string[];
}

interface SpaceDesignCanvasProps {
  userPhotoUri?: string;
  renderedImageUri?: string | null;
  isEditingPhoto?: boolean;
  inPhotoEditError?: string | null;
  onRetryInPhotoEdit?: () => void;
  visualPlan: SetuVisualPlan;
  language?: string;
  onRegenerateAngle?: () => void;
}

const FALLBACK_REAL_RENDERS: Record<string, string> = {
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
  wardrobe: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80',
  bedroom: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80',
  house: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
  electrical: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80',
  repair_fix: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
};

export const SpaceDesignCanvas: React.FC<SpaceDesignCanvasProps> = ({
  userPhotoUri,
  renderedImageUri,
  isEditingPhoto = false,
  inPhotoEditError = null,
  onRetryInPhotoEdit,
  visualPlan,
  language = 'hi',
  onRegenerateAngle,
}) => {
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const isEn = language === 'en';
  const hasImgError = !!(renderedImageUri && failedUri === renderedImageUri);
  const isInPlaceDataImg = !!(renderedImageUri && renderedImageUri.startsWith('data:image/'));
  const isImgLoading = !!(
    isEditingPhoto ||
    (renderedImageUri &&
      viewMode === 'after' &&
      !hasImgError &&
      loadedUri !== renderedImageUri)
  );

  // CRITICAL: When user uploaded their own room/plot photo, NEVER substitute an unrelated random sample room!
  const fallbackPhoto = userPhotoUri
    ? userPhotoUri
    : FALLBACK_REAL_RENDERS[visualPlan.designType] || FALLBACK_REAL_RENDERS.kitchen;
  const afterUri = hasImgError ? fallbackPhoto : renderedImageUri || fallbackPhoto;
  const activeImageUri = viewMode === 'before' && userPhotoUri ? userPhotoUri : afterUri;

  return (
    <View style={styles.container}>
      {/* Before / After Toggle */}
      <View style={styles.topToggleBar}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'after' && styles.toggleBtnActive]}
          onPress={() => setViewMode('after')}
          activeOpacity={0.85}
        >
          <Ionicons
            name="sparkles"
            size={13}
            color={viewMode === 'after' ? '#0F172A' : '#94A3B8'}
          />
          <Text style={[styles.toggleText, viewMode === 'after' && styles.toggleTextActive]}>
            {isEn ? 'SETU Real Design' : 'SETU असली डिज़ाइन'}
          </Text>
        </TouchableOpacity>

        {userPhotoUri ? (
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'before' && styles.toggleBtnActive]}
            onPress={() => setViewMode('before')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="camera"
              size={13}
              color={viewMode === 'before' ? '#0F172A' : '#94A3B8'}
            />
            <Text style={[styles.toggleText, viewMode === 'before' && styles.toggleTextActive]}>
              {isEn ? 'Your Original Photo' : 'आपकी असली फोटो'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Pure Photorealistic Visual Frame (Zero 2D boxes) */}
      <View style={styles.stageContainer}>
        <Image
          source={{ uri: activeImageUri }}
          style={[
            styles.realPhoto,
            viewMode === 'after' && renderedImageUri && !isInPlaceDataImg && !hasImgError
              ? styles.cropWatermarkEdge
              : null,
          ]}
          resizeMode="cover"
          onLoad={() => {
            if (viewMode === 'after' && renderedImageUri) {
              setLoadedUri(renderedImageUri);
            }
          }}
          onError={() => {
            if (viewMode === 'after' && renderedImageUri) {
              setFailedUri(renderedImageUri);
            }
          }}
        />

        {isImgLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingRenderText}>
              {isEditingPhoto
                ? isEn
                  ? 'Installing design right inside your real photo (15-25s)...'
                  : 'आपकी असली फोटो के अंदर ही नया डिज़ाइन फिट किया जा रहा है (15-25 सेकंड)...'
                : isEn
                  ? 'Rendering photorealistic design...'
                  : 'SETU बिल्कुल असली डिज़ाइन फोटो तैयार कर रहा है...'}
            </Text>
          </View>
        )}

        {!isImgLoading && inPhotoEditError && !renderedImageUri && viewMode === 'after' ? (
          <View style={styles.quotaBannerOverlay}>
            <Ionicons name="alert-circle" size={20} color="#FBBF24" />
            <Text style={styles.quotaBannerText}>
              {inPhotoEditError === 'QUOTA_EXCEEDED'
                ? isEn
                  ? 'Free GPU in-photo edit daily quota reached for this device IP. Your original room photo is preserved above without fake substitution.'
                  : 'इस डिवाइस का आज का फ़्री इन-फोटो 3D एडिटिंग GPU कोटा पूरा हो गया है — हमने गलत कमरा दिखाने के बजाय आपकी असली फोटो सुरक्षित रखी है।'
                : inPhotoEditError}
            </Text>
            {onRetryInPhotoEdit ? (
              <TouchableOpacity
                style={styles.retryEditBtn}
                onPress={onRetryInPhotoEdit}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={13} color="#0F172A" />
                <Text style={styles.retryEditText}>
                  {isEn ? 'Retry Real Photo Edit' : 'असली फोटो एडिट पुनः प्रयास करें'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {onRegenerateAngle && viewMode === 'after' && !isImgLoading ? (
          <TouchableOpacity
            style={styles.regenBtn}
            onPress={onRegenerateAngle}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={12} color="#FFFFFF" />
            <Text style={styles.regenText}>
              {isEn ? 'New Look' : 'नया डिज़ाइन'}
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.captionOverlay}>
          <Text style={styles.captionTitle} numberOfLines={1}>
            📐 {visualPlan.dimensionsLabel} • {visualPlan.finishLabel}
          </Text>
          {visualPlan.afterCaption ? (
            <Text style={styles.captionSub} numberOfLines={2}>
              {visualPlan.afterCaption}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  topToggleBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#F59E0B',
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  stageContainer: {
    width: '100%',
    height: 265,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#020617',
  },
  realPhoto: {
    width: '100%',
    height: '100%',
  },
  cropWatermarkEdge: {
    height: '112%',
    marginTop: '-2%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 8,
  },
  loadingRenderText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  regenBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 9,
  },
  regenText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    zIndex: 10,
  },
  captionTitle: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
  },
  captionSub: {
    color: '#E2E8F0',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  quotaBannerOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    zIndex: 11,
  },
  quotaBannerText: {
    color: '#FDE68A',
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  retryEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  retryEditText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '900',
  },
});

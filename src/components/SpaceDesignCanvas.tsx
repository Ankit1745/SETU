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
import { ShowroomProjectType } from '../data/supplierShowroom';

export interface SetuVisualPlan {
  designType: ShowroomProjectType | 'bedroom' | 'repair_fix';
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
  isTextRender?: boolean;
  inPhotoEditError?: string | null;
  onRetryInPhotoEdit?: () => void;
  visualPlan: SetuVisualPlan;
  language?: string;
  onRegenerateAngle?: () => void;
}

const FALLBACK_REAL_RENDERS: Record<string, string> = {
  bed: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80',
  bedroom: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
  wardrobe: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80',
  tv_unit_living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  door_window: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
  house: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  tiles_flooring: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  false_ceiling: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
  painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80',
  electrical: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  iron_gate: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
  custom: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
  repair_fix: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
};

function isSafeMediaUri(uri?: string | null): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim().toLowerCase();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('file://')
  );
}

export const SpaceDesignCanvas: React.FC<SpaceDesignCanvasProps> = ({
  userPhotoUri,
  renderedImageUri,
  isEditingPhoto = false,
  isTextRender = false,
  inPhotoEditError = null,
  onRetryInPhotoEdit,
  visualPlan,
  language = 'hi',
  onRegenerateAngle,
}) => {
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');
  const [prevRenderedProp, setPrevRenderedProp] = useState<string | null | undefined>(renderedImageUri);
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const [renderRetryNonce, setRenderRetryNonce] = useState<number>(0);

  if (renderedImageUri !== prevRenderedProp) {
    setPrevRenderedProp(renderedImageUri);
    if (renderedImageUri && viewMode === 'before') {
      setViewMode('after');
    }
  }

  const isEn = language === 'en';
  const retrySep = renderedImageUri?.includes('?') ? '&' : '?';
  const safeRenderedUri = isSafeMediaUri(renderedImageUri)
    ? renderedImageUri! +
      (renderRetryNonce > 0 && !renderedImageUri!.startsWith('data:')
        ? `${retrySep}retry=${renderRetryNonce}`
        : '')
    : null;
  const safeUserPhotoUri = isSafeMediaUri(userPhotoUri) ? userPhotoUri : undefined;

  const hasImgError = !!(safeRenderedUri && failedUri === safeRenderedUri);
  const isInPlaceDataImg = !!(safeRenderedUri && safeRenderedUri.startsWith('data:image/'));
  const isWatermarkSource = !!(safeRenderedUri && safeRenderedUri.toLowerCase().includes('pollinations.ai'));
  const isBusyFallback = inPhotoEditError === 'RENDER_BUSY_FALLBACK';
  const isImgLoading = !!(
    isEditingPhoto ||
    (safeRenderedUri &&
      viewMode === 'after' &&
      !hasImgError &&
      loadedUri !== safeRenderedUri)
  );

  // CRITICAL: When user uploaded their own photo, preserve userPhotoUri strictly if render isn't ready yet!
  const fallbackPhoto = safeUserPhotoUri
    ? safeUserPhotoUri
    : FALLBACK_REAL_RENDERS[visualPlan.designType] || FALLBACK_REAL_RENDERS.custom;
  const afterUri = hasImgError ? fallbackPhoto : safeRenderedUri || fallbackPhoto;
  const activeImageUri = viewMode === 'before' && safeUserPhotoUri ? safeUserPhotoUri : afterUri;

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
            {isEn ? 'SETU Real Design' : 'SETU असली मॉडल'}
          </Text>
        </TouchableOpacity>

        {safeUserPhotoUri ? (
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

      {/* Pure Photorealistic Visual Frame */}
      <View style={styles.stageContainer}>
        <Image
          source={{ uri: activeImageUri }}
          style={[
            styles.realPhoto,
            viewMode === 'after' && isWatermarkSource && !isInPlaceDataImg && !hasImgError
              ? styles.cropWatermarkEdge
              : null,
          ]}
          resizeMode="cover"
          onLoad={() => {
            if (viewMode === 'after' && safeRenderedUri) {
              setLoadedUri(safeRenderedUri);
            }
          }}
          onError={() => {
            if (viewMode === 'after' && safeRenderedUri) {
              setFailedUri(safeRenderedUri);
            }
          }}
        />

        {hasImgError && !isEditingPhoto && viewMode === 'after' ? (
          <TouchableOpacity
            style={styles.retryRenderPill}
            onPress={() => {
              setFailedUri(null);
              setRenderRetryNonce((n) => n + 1);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={12} color="#0F172A" />
            <Text style={styles.retryRenderPillText}>
              {isEn ? 'Reload AI Render' : 'AI मॉडल पुनः लोड करें'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {isImgLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingRenderText}>
              {isEditingPhoto
                ? isTextRender || !safeUserPhotoUri
                  ? isEn
                    ? 'Creating HD interior render from your selected raw materials (8-12s)...'
                    : 'आपके चुने हुए कच्चे माल से HD डिज़ाइन मॉडल तैयार हो रहा है (8-12s)...'
                  : isEn
                    ? 'Building your design right inside your photo (15-25s)...'
                    : 'आपके चुने हुए कच्चे माल से आपकी असली फोटो में मॉडल बन रहा है (15-25s)...'
                : isEn
                  ? 'Rendering photorealistic design...'
                  : 'SETU बिल्कुल असली मॉडल तैयार कर रहा है...'}
            </Text>
          </View>
        )}

        {!isImgLoading && isBusyFallback && !safeRenderedUri && viewMode === 'after' ? (
          <TouchableOpacity
            style={styles.retryRenderPill}
            onPress={onRegenerateAngle || onRetryInPhotoEdit}
            activeOpacity={0.88}
          >
            <Ionicons name="refresh" size={12} color="#0F172A" />
            <Text style={styles.retryRenderPillText}>
              {isEn ? 'Sample Preview • Tap to Render HD' : 'सैंपल प्रीव्यू • AI HD बनाने के लिए दबाएं'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!isImgLoading && inPhotoEditError && !isBusyFallback && !safeRenderedUri && viewMode === 'after' ? (
          <View style={styles.quotaBannerOverlay}>
            <Ionicons name="alert-circle" size={20} color="#FBBF24" />
            <Text style={styles.quotaBannerText}>
              {inPhotoEditError === 'QUOTA_EXCEEDED'
                ? isEn
                  ? 'Free GPU in-photo edit daily quota reached for this IP. Your original photo is preserved cleanly.'
                  : 'आज का फ़्री इन-फोटो 3D एडिटिंग GPU कोटा पूरा हो गया है — आपकी असली फोटो सुरक्षित रखी गई है।'
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
                  {isEn ? 'Retry Photo Edit' : 'पुनः प्रयास करें'}
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
              {isEn ? 'Fresh Style' : 'नया लुक'}
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
  retryRenderPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    zIndex: 9,
  },
  retryRenderPillText: {
    color: '#0F172A',
    fontSize: 10.5,
    fontWeight: '900',
  },
});

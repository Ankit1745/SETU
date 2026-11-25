import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PlacementBox {
  topPct: number;
  leftPct: number;
  widthPct: number;
  heightPct: number;
}

export interface SetuVisualPlan {
  designType: 'kitchen' | 'wardrobe' | 'house' | 'bathroom' | 'electrical' | 'painting' | 'repair_fix';
  title: string;
  finishStyle:
    | 'standard_laminate'
    | 'teak_walnut'
    | 'high_gloss_acrylic'
    | 'italian_pu'
    | 'modern_brick'
    | 'chrome_sanitary'
    | 'clean_paint';
  finishLabel: string;
  dimensionsLabel: string;
  primaryHex: string;
  accentHex: string;
  panelCount?: number;
  hasLoft?: boolean;
  hasDrawers?: boolean;
  hasLedStrip?: boolean;
  placementBox?: PlacementBox;
  afterCaption?: string;
}

interface SpaceDesignCanvasProps {
  userPhotoUri?: string;
  editedImageBase64?: string | null;
  visualPlan: SetuVisualPlan;
  language?: string;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const SpaceDesignCanvas: React.FC<SpaceDesignCanvasProps> = ({
  userPhotoUri,
  editedImageBase64,
  visualPlan,
  language = 'hi',
}) => {
  const [viewMode, setViewMode] = useState<'after' | 'before'>('after');

  const isEn = language === 'en';
  const box = visualPlan.placementBox || { topPct: 16, leftPct: 14, widthPct: 72, heightPct: 68 };
  const top = clamp(box.topPct ?? 16, 6, 65);
  const left = clamp(box.leftPct ?? 14, 5, 65);
  const width = clamp(box.widthPct ?? 72, 22, 92);
  const height = clamp(box.heightPct ?? 68, 22, 85);

  const primary = visualPlan.primaryHex || '#8B5A2B';
  const accent = visualPlan.accentHex || '#1E293B';
  const panels = Math.max(2, Math.min(5, visualPlan.panelCount || 3));
  const isGlossy =
    visualPlan.finishStyle === 'high_gloss_acrylic' || visualPlan.finishStyle === 'italian_pu';
  const isTeak = visualPlan.finishStyle === 'teak_walnut';

  // Render tailored architectural structure strictly anchored inside placementBox
  const renderDesignStructure = () => {
    const type = visualPlan.designType;

    // 1. REPAIR FIX OVERLAY (Clean patched plaster / new tap / safe switchboard)
    if (type === 'repair_fix') {
      return (
        <View style={[styles.overlayZone, { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }]}>
          <View
            style={[
              styles.repairCleanPatch,
              { backgroundColor: primary === '#8B5A2B' ? 'rgba(241, 245, 249, 0.92)' : `${primary}E6` },
            ]}
          >
            <View style={styles.repairBadgePill}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.repairBadgeText}>
                {isEn ? 'Fixed & Sealed Preview' : 'रिपेयर के बाद ऐसा साफ दिखेगा'}
              </Text>
            </View>
            <Text style={styles.repairFinishText} numberOfLines={2}>
              {visualPlan.finishLabel}
            </Text>
          </View>
        </View>
      );
    }

    // 2. PAINTING / WALL SURFACE OVERLAY
    if (type === 'painting') {
      return (
        <View
          style={[
            styles.overlayZone,
            {
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
              backgroundColor: `${primary}99`,
              borderRadius: 6,
            },
          ]}
        >
          <View style={styles.paintSwatchTag}>
            <View style={[styles.paintDot, { backgroundColor: primary }]} />
            <Text style={styles.paintTagText}>{visualPlan.finishLabel}</Text>
          </View>
        </View>
      );
    }

    // 3. ELECTRICAL / PROFILE LIGHTING OVERLAY
    if (type === 'electrical') {
      return (
        <View style={[styles.overlayZone, { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }]}>
          <View style={styles.ledCoveFrame}>
            <View style={styles.ledGlowStrip} />
            <View style={styles.switchBoardPlate}>
              <View style={styles.switchKeyRow}>
                {[0, 1, 2, 3].map((k) => (
                  <View key={k} style={styles.modularSwitchKey} />
                ))}
              </View>
              <Text style={styles.switchPlateCaption}>{visualPlan.finishLabel}</Text>
            </View>
          </View>
        </View>
      );
    }

    // 4. HOUSE / EXTERIOR ELEVATION DESIGN
    if (type === 'house') {
      return (
        <View style={[styles.overlayZone, { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }]}>
          <View style={[styles.houseFacadeFrame, { backgroundColor: '#F8FAFC' }]}>
            {/* Parapet + Pergola Roof Band */}
            <View style={[styles.houseRoofBand, { backgroundColor: accent }]}>
              <View style={styles.warmLedUnderGlow} />
            </View>
            {/* First Floor Glass Balcony */}
            <View style={styles.houseFloorRow}>
              <View style={[styles.housePillar, { backgroundColor: primary }]} />
              <View style={styles.houseBalcony}>
                <View style={styles.houseGlassRailing} />
              </View>
              <View style={[styles.housePillar, { backgroundColor: primary }]} />
            </View>
            {/* Ground Floor Entry & Porch */}
            <View style={[styles.houseGroundRow, { borderTopColor: accent }]}>
              <View style={[styles.houseMainDoor, { backgroundColor: primary }]} />
              <View style={styles.houseWindowBox} />
            </View>
          </View>
        </View>
      );
    }

    // 5. BATHROOM / SANITARY OVERLAY
    if (type === 'bathroom') {
      return (
        <View style={[styles.overlayZone, { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }]}>
          <View style={[styles.bathTileWall, { backgroundColor: `${primary}EA` }]}>
            <View style={styles.bathMirrorLed}>
              <View style={styles.bathMirrorGlass} />
            </View>
            <View style={styles.chromeDiverterBar}>
              <View style={styles.chromeFixtureKnob} />
              <View style={styles.chromeFixtureSpout} />
            </View>
            <View style={[styles.floatingVanity, { backgroundColor: accent }]}>
              <View style={styles.vanityBasin} />
            </View>
          </View>
        </View>
      );
    }

    // 6. MODULAR KITCHEN OVERLAY
    if (type === 'kitchen') {
      return (
        <View style={[styles.overlayZone, { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }]}>
          <View style={styles.cabinetOuterShadow}>
            {/* Overhead Wall Units */}
            <View style={styles.kitchenUpperRow}>
              {Array.from({ length: panels }).map((_, idx) => {
                const isChimneySlot = idx === Math.floor(panels / 2);
                if (isChimneySlot) {
                  return (
                    <View key={idx} style={styles.chimneyHoodUnit}>
                      <View style={styles.chimneyFlue} />
                      <View style={styles.chimneyBaffle} />
                    </View>
                  );
                }
                return (
                  <View
                    key={idx}
                    style={[
                      styles.cabinetShutter,
                      { backgroundColor: primary },
                      isGlossy && styles.glossySheenBorder,
                    ]}
                  >
                    {isGlossy && <View style={styles.specularStreak} />}
                    {isTeak && <View style={styles.woodGrainAccent} />}
                    <View style={styles.profileHandleBottom} />
                  </View>
                );
              })}
            </View>

            {/* Warm Under-Cabinet Strip + Backsplash */}
            <View style={styles.kitchenBacksplash}>
              {visualPlan.hasLedStrip !== false && <View style={styles.warmLedUnderGlow} />}
              <View style={styles.tileGroutGrid} />
            </View>

            {/* Granite / Quartz Countertop */}
            <View style={[styles.graniteSlab, { backgroundColor: accent }]}>
              <View style={styles.hobBurnerBar} />
            </View>

            {/* Base Drawers & Baskets */}
            <View style={styles.kitchenBaseRow}>
              {Array.from({ length: panels }).map((_, idx) => (
                <View key={idx} style={[styles.baseColumn, { backgroundColor: primary }]}>
                  {visualPlan.hasDrawers !== false ? (
                    <>
                      <View style={styles.drawerFront}>
                        <View style={styles.drawerHandle} />
                      </View>
                      <View style={styles.drawerFront}>
                        <View style={styles.drawerHandle} />
                      </View>
                      <View style={[styles.drawerFront, { flex: 1.4 }]}>
                        <View style={styles.drawerHandle} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.profileHandleTop} />
                  )}
                </View>
              ))}
            </View>

            {/* Kick Plinth */}
            <View style={styles.skirtingPlinth} />
          </View>
        </View>
      );
    }

    // 7. DEFAULT: WARDROBE / ALMIRAH OVERLAY
    return (
      <View style={[styles.overlayZone, { top: `${top}%`, left: `${left}%`, width: `${width}%`, height: `${height}%` }]}>
        <View style={styles.cabinetOuterShadow}>
          {/* Top LED Cove Trim */}
          {visualPlan.hasLedStrip !== false && <View style={styles.warmLedUnderGlow} />}

          {/* Optional Loft Cabinets */}
          {visualPlan.hasLoft !== false && (
            <View style={styles.wardrobeLoftRow}>
              {Array.from({ length: panels }).map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.cabinetShutter,
                    { backgroundColor: primary },
                    isGlossy && styles.glossySheenBorder,
                  ]}
                >
                  <View style={styles.loftHandle} />
                </View>
              ))}
            </View>
          )}

          {/* Main Full-Height Doors */}
          <View style={styles.wardrobeMainRow}>
            {Array.from({ length: panels }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.cabinetShutter,
                  { backgroundColor: primary },
                  isGlossy && styles.glossySheenBorder,
                ]}
              >
                {isGlossy && <View style={styles.specularStreak} />}
                {isTeak && (
                  <>
                    <View style={styles.woodGrainAccent} />
                    <View style={[styles.woodGrainAccent, { left: '58%', opacity: 0.14 }]} />
                  </>
                )}
                <View style={[styles.longProfileHandle, { backgroundColor: accent }]} />
              </View>
            ))}
          </View>

          {/* Optional Bottom Soft-Close Drawers */}
          {visualPlan.hasDrawers && (
            <View style={styles.wardrobeBottomDrawers}>
              {Array.from({ length: Math.min(3, panels) }).map((_, idx) => (
                <View key={idx} style={[styles.drawerFront, { backgroundColor: primary, flex: 1 }]}>
                  <View style={styles.drawerHandle} />
                </View>
              ))}
            </View>
          )}

          <View style={styles.skirtingPlinth} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Before/After Toggle */}
      <View style={styles.topToggleBar}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'after' && styles.toggleBtnActive]}
          onPress={() => setViewMode('after')}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={13} color={viewMode === 'after' ? '#0F172A' : '#94A3B8'} />
          <Text style={[styles.toggleText, viewMode === 'after' && styles.toggleTextActive]}>
            {isEn ? 'SETU Design Preview' : '✨ SETU डिज़ाइन तैयार'}
          </Text>
        </TouchableOpacity>

        {userPhotoUri ? (
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'before' && styles.toggleBtnActive]}
            onPress={() => setViewMode('before')}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={13} color={viewMode === 'before' ? '#0F172A' : '#94A3B8'} />
            <Text style={[styles.toggleText, viewMode === 'before' && styles.toggleTextActive]}>
              {isEn ? 'Your Original Photo' : '📸 आपकी असली फोटो'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Main Viewport — Uses Customer's Actual Photo as Base */}
      <View style={styles.stageContainer}>
        {editedImageBase64 && viewMode === 'after' ? (
          <Image source={{ uri: editedImageBase64 }} style={styles.basePhoto} resizeMode="cover" />
        ) : userPhotoUri ? (
          <>
            <Image source={{ uri: userPhotoUri }} style={styles.basePhoto} resizeMode="cover" />
            {viewMode === 'after' && renderDesignStructure()}
          </>
        ) : (
          /* Clean empty architectural room stage if customer hasn't uploaded a photo yet */
          <View style={styles.architecturalStage}>
            <View style={styles.stageBackWall}>
              <Text style={styles.stageNoPhotoHint}>
                {isEn
                  ? 'Upload your room photo to preview inside your actual space'
                  : 'अपनी असली दीवार/कमरे की फोटो भेजेंगे तो डिज़ाइन सीधे उसी में दिखेगा'}
              </Text>
            </View>
            <View style={styles.stageFloor} />
            {renderDesignStructure()}
          </View>
        )}

        {/* Dimension & Material Badge */}
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
    marginTop: 8,
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
    paddingVertical: 6,
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
    height: 235,
    position: 'relative',
    backgroundColor: '#020617',
  },
  basePhoto: {
    width: '100%',
    height: '100%',
  },
  architecturalStage: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  stageBackWall: {
    flex: 0.78,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  stageNoPhotoHint: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  stageFloor: {
    flex: 0.22,
    backgroundColor: '#CBD5E1',
    borderTopWidth: 2,
    borderTopColor: '#94A3B8',
  },
  overlayZone: {
    position: 'absolute',
    zIndex: 5,
  },
  cabinetOuterShadow: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.85)',
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  warmLedUnderGlow: {
    height: 3,
    width: '100%',
    backgroundColor: '#FDE68A',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  wardrobeLoftRow: {
    flex: 0.22,
    flexDirection: 'row',
    gap: 2,
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  wardrobeMainRow: {
    flex: 0.78,
    flexDirection: 'row',
    gap: 2,
    backgroundColor: '#0F172A',
  },
  wardrobeBottomDrawers: {
    flex: 0.22,
    flexDirection: 'row',
    gap: 2,
    borderTopWidth: 2,
    borderTopColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  cabinetShutter: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  glossySheenBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.45)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.28)',
  },
  specularStreak: {
    position: 'absolute',
    top: -10,
    left: '15%',
    width: '32%',
    height: '130%',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    transform: [{ rotate: '14deg' }],
  },
  woodGrainAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '22%',
    width: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  loftHandle: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  longProfileHandle: {
    position: 'absolute',
    right: 5,
    top: '28%',
    bottom: '28%',
    width: 3,
    borderRadius: 2,
    opacity: 0.9,
  },
  kitchenUpperRow: {
    flex: 0.34,
    flexDirection: 'row',
    gap: 2,
    backgroundColor: '#0F172A',
  },
  chimneyHoodUnit: {
    flex: 1,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chimneyFlue: {
    width: '36%',
    flex: 1,
    backgroundColor: '#475569',
  },
  chimneyBaffle: {
    width: '100%',
    height: 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
  },
  kitchenBacksplash: {
    flex: 0.2,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    justifyContent: 'space-between',
  },
  tileGroutGrid: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
  },
  graniteSlab: {
    height: 9,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hobBurnerBar: {
    width: '28%',
    height: 3,
    backgroundColor: '#020617',
    borderRadius: 2,
  },
  kitchenBaseRow: {
    flex: 0.4,
    flexDirection: 'row',
    gap: 2,
    backgroundColor: '#0F172A',
  },
  baseColumn: {
    flex: 1,
    gap: 2,
    padding: 1,
  },
  drawerFront: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHandle: {
    width: '42%',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  profileHandleBottom: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    width: '45%',
    height: 2.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  profileHandleTop: {
    marginTop: 5,
    alignSelf: 'center',
    width: '45%',
    height: 2.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  skirtingPlinth: {
    height: 6,
    width: '100%',
    backgroundColor: '#020617',
  },
  houseFacadeFrame: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  houseRoofBand: {
    height: 14,
    width: '100%',
    justifyContent: 'flex-end',
  },
  houseFloorRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 6,
    gap: 6,
    backgroundColor: '#E2E8F0',
  },
  housePillar: {
    width: 14,
    borderRadius: 2,
  },
  houseBalcony: {
    flex: 1,
    backgroundColor: '#94A3B8',
    justifyContent: 'flex-end',
    borderRadius: 3,
  },
  houseGlassRailing: {
    height: '45%',
    backgroundColor: 'rgba(56, 189, 248, 0.55)',
    borderTopWidth: 2,
    borderTopColor: '#0F172A',
  },
  houseGroundRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 6,
    gap: 8,
    borderTopWidth: 3,
    backgroundColor: '#F1F5F9',
    alignItems: 'flex-end',
  },
  houseMainDoor: {
    width: '28%',
    height: '86%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  houseWindowBox: {
    flex: 1,
    height: '65%',
    marginBottom: 8,
    backgroundColor: '#38BDF8',
    borderWidth: 2,
    borderColor: '#1E293B',
    borderRadius: 3,
  },
  bathTileWall: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bathMirrorLed: {
    width: '48%',
    height: '40%',
    borderRadius: 24,
    padding: 2,
    backgroundColor: '#FDE68A',
  },
  bathMirrorGlass: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#BAE6FD',
  },
  chromeDiverterBar: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  chromeFixtureKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#64748B',
  },
  chromeFixtureSpout: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  floatingVanity: {
    width: '72%',
    height: '24%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  vanityBasin: {
    width: '55%',
    height: 7,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  repairCleanPatch: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  repairBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  repairBadgeText: {
    color: '#166534',
    fontSize: 10.5,
    fontWeight: '900',
  },
  repairFinishText: {
    color: '#0F172A',
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  paintSwatchTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  paintDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  paintTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  ledCoveFrame: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
  },
  ledGlowStrip: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FDE047',
  },
  switchBoardPlate: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
  },
  switchKeyRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 3,
  },
  modularSwitchKey: {
    width: 10,
    height: 14,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#64748B',
  },
  switchPlateCaption: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '800',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.84)',
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    marginTop: 1,
    fontWeight: '600',
  },
});

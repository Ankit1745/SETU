import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Language } from '../i18n/translations';
import {
  diagnoseVisualProblem,
  calculate3DSpaceDesign,
  VisualProblemDiagnosis,
  SpaceDesign3D,
  VISUAL_PROBLEM_SCENARIOS,
} from '../services/constructionAI';
import { ApiService } from '../services/api';
import {
  openWhatsAppChat,
  formatAiDoctorWhatsAppMessage,
  format3DStudioWhatsAppMessage,
} from '../utils/whatsapp';
import { pickImageFromGallery, capturePhotoFromCamera } from '../utils/mediaPicker';

interface AIVideoDoctorModalProps {
  visible: boolean;
  onClose: () => void;
  language: Language;
  currentLocation: string;
  onOpenContractorCategory?: (category: string) => void;
}

export const AIVideoDoctorModal: React.FC<AIVideoDoctorModalProps> = ({
  visible,
  onClose,
  language,
  currentLocation,
  onOpenContractorCategory,
}) => {
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'video' | 'studio' | 'gyan'>('video');

  // ==========================================
  // FREEMIUM TOKEN / ZERO-DB LOCAL TRACKER
  // ==========================================
  const [dailyCredits, setDailyCredits] = useState<number>(3);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const todayKey = `setu_ai_credits_${new Date().toISOString().slice(0, 10)}`;
        const saved = window.localStorage.getItem(todayKey);
        if (saved !== null) {
          setDailyCredits(parseInt(saved, 10));
        } else {
          window.localStorage.setItem(todayKey, '3');
          setDailyCredits(3);
        }
      } catch (e) {
        // Fallback in-memory
      }
    }
  }, [visible]);

  const consumeCredit = (): boolean => {
    if (dailyCredits <= 0) {
      setIsPaywallOpen(true);
      return false;
    }
    const next = dailyCredits - 1;
    setDailyCredits(next);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const todayKey = `setu_ai_credits_${new Date().toISOString().slice(0, 10)}`;
        window.localStorage.setItem(todayKey, next.toString());
      } catch (e) {}
    }
    return true;
  };

  // ==========================================
  // TAB 1: AI VIDEO CALL / VISUAL DOCTOR STATE
  // ==========================================
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(12);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('tap_leakage');
  const [diagnosisResult, setDiagnosisResult] = useState<VisualProblemDiagnosis | null>(null);
  const [visionError, setVisionError] = useState<string>('');
  const [sourceContext, setSourceContext] = useState<'photo' | 'video_frame' | 'sample_demo'>('photo');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string>('');
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // REAL LIVE CAMERA (WebRTC & Mobile Viewfinder)
  const videoRef = useRef<any>(null);
  const mediaStreamRef = useRef<any>(null);
  const [isCameraLive, setIsCameraLive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraPermissionError, setCameraPermissionError] = useState<string>('');

  const startRealCamera = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        setCameraPermissionError('');
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        mediaStreamRef.current = stream;
        setIsCameraLive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.log('[Camera] Error starting live camera:', err);
        setIsCameraLive(false);
        setCameraPermissionError('कृपया ब्राउज़र में कैमरा अनुमति दें ताकि AI उस्ताद आपकी समस्या लाइव देख सके।');
      }
    }
  };

  const stopRealCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraLive(false);
  };

  const handleToggleFlipCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Start real camera when modal is open and on video tab
  useEffect(() => {
    if (visible && activeTab === 'video' && !attachedMediaUrl) {
      startRealCamera();
    } else {
      stopRealCamera();
    }
    return () => {
      stopRealCamera();
    };
  }, [visible, activeTab, cameraFacing, attachedMediaUrl]);

  // Capture real live camera frame & scan automatically
  const handleCaptureLiveFrame = async () => {
    if (!consumeCredit()) return;

    // 1. If camera stream is live, grab canvas snapshot
    let frameBase64 = '';
    if (typeof document !== 'undefined' && videoRef.current && isCameraLive) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          frameBase64 = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.log('[Capture] Error capturing canvas frame:', e);
      }
    }

    if (frameBase64) {
      setAttachedMediaUrl(frameBase64);
      stopRealCamera();
      // Execute AI Vision Diagnosis immediately!
      await runAIVisionDiagnosis(frameBase64, customQuery, 'video_frame');
      // Background upload
      ApiService.uploadFile(frameBase64, `live_snap_${Date.now()}.jpg`, 'portfolio').catch(() => {});
      return;
    }

    // 2. If camera stream is not live, open camera capture or gallery picker directly!
    try {
      const captured = (await capturePhotoFromCamera()) || (await pickImageFromGallery());
      if (captured && captured.base64) {
        setAttachedMediaUrl(captured.uri);
        await runAIVisionDiagnosis(captured.base64, customQuery, 'photo');
        // Background upload
        ApiService.uploadFile(captured.base64, captured.name || `photo_${Date.now()}.jpg`, 'portfolio').catch(() => {});
      }
    } catch (err: any) {
      console.log('[Capture] Error capturing photo:', err);
    }
  };

  // AI Multimodal Vision Diagnosis Runner (Gemini Multimodal Vision Engine)
  const runAIVisionDiagnosis = async (imageBase64: string, query: string, ctx: 'photo' | 'video_frame' = 'photo') => {
    setIsScanning(true);
    setVisionError('');
    setSourceContext(ctx);
    try {
      const activeUserQuery = (query || customQuery || '').trim();
      const apiResp = await ApiService.diagnoseVision(
        imageBase64,
        activeUserQuery,
        currentLocation || 'भोपाल',
        language
      );
      if (apiResp?.success && apiResp.diagnosis) {
        const d = apiResp.diagnosis;
        const mapped: VisualProblemDiagnosis = {
          id: 'vision_' + Date.now(),
          category: d.tradeCategory || 'plumber',
          titleHindi: d.problemTitle || (language === 'en' ? 'Home Repair Issue' : 'घरेलू मरम्मत समस्या'),
          visibleObservation: d.visibleObservation || d.visualSymptom || d.problemTitle || 'सतह पर समस्या का लक्षण दिखाई दे रहा है।',
          inferredCause: d.inferredCause || d.rootCause || 'आंतरिक कारण की जांच साइट मुआयने से की जानी चाहिए।',
          visualSymptom: d.visualSymptom || d.rootCause || '',
          realProblem: d.inferredCause || d.rootCause || '',
          sourceContext: ctx,
          isSafetyHazard: d.isSafetyHazard || d.severity === 'EMERGENCY' || false,
          safetyMessage: d.safetyMessage || (d.isSafetyHazard ? '⚠️ आपातकालीन सुरक्षा चेतावनी: तुरंत मुख्य DP / MCB बंद करें!' : undefined),
          neededHardware: (d.requiredParts || []).map((p: any) => ({
            name: `${p.name} (${p.brand || 'ISI'})`,
            approxPrice: p.approxRate || 100,
            unit: p.unit || '1 पीस',
          })),
          laborEstimate: {
            description: `${currentLocation || 'भोपाल'} मानक कारीगर मजदूरी चार्ज`,
            approxPrice: d.estimatedLaborCharge || 180,
          },
          totalEstimatedCost:
            (d.requiredParts || []).reduce((sum: number, p: any) => sum + (p.approxRate || 0), 0) +
            (d.estimatedLaborCharge || 180),
          diySteps: d.isSafetyHazard ? [] : d.diySteps || [],
          karigarAdvice: d.ustadAdvice || '',
        };
        setDiagnosisResult(mapped);
        setIsScanning(false);
        speakDiagnosis(mapped.titleHindi + '. ' + mapped.visibleObservation);
        return;
      } else if (apiResp?.error) {
        setIsScanning(false);
        setVisionError(apiResp.error);
        return;
      }
    } catch (e) {
      console.log('AI Vision error:', e);
    }

    // Heuristics fallback ONLY if user typed a specific query
    const activeText = (query || customQuery || '').trim();
    if (activeText) {
      const diag = diagnoseVisualProblem(activeText, undefined, ctx);
      if (diag) {
        setDiagnosisResult(diag);
        setIsScanning(false);
        speakDiagnosis(diag.titleHindi + '. ' + diag.visibleObservation);
        return;
      }
    }

    // Clear boundary if image is blurry or vision service is offline - NO fabricated diagnosis!
    setIsScanning(false);
    setVisionError('फोटो का विश्लेषण अभी उपलब्ध नहीं है। कृपया अच्छी रोशनी में साफ फोटो लें या समस्या का विवरण लिखकर बताएं।');
  };

  // In-call timer
  useEffect(() => {
    let timer: any;
    if (visible && isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible, isCallActive]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Scan & Diagnose Demo Scenarios (Explicitly sample demo mode)
  const handlePerformDiagnosis = (scenarioKey: string) => {
    if (!consumeCredit()) return;

    setSelectedScenarioKey(scenarioKey);
    setIsScanning(true);
    setVisionError('');
    setSourceContext('sample_demo');
    setTimeout(() => {
      const diag = diagnoseVisualProblem(scenarioKey, undefined, 'sample_demo');
      setDiagnosisResult(diag);
      setIsScanning(false);

      if (diag) {
        speakDiagnosis(diag.titleHindi + '. ' + diag.visibleObservation);
      }
    }, 800);
  };

  const handleCustomScan = () => {
    if (!customQuery.trim()) {
      Alert.alert('कृपया लिखें', 'अपनी समस्या या ख़राब सामान का नाम लिखें।');
      return;
    }
    if (!consumeCredit()) return;

    setIsScanning(true);
    setTimeout(() => {
      const diag = diagnoseVisualProblem(customQuery, undefined, 'photo');
      setDiagnosisResult(diag);
      setIsScanning(false);
      if (diag) {
        speakDiagnosis(diag.titleHindi + '. ' + (diag.visibleObservation || diag.realProblem || ''));
      } else {
        setVisionError('इस समस्या का विवरण स्पष्ट नहीं है। कृपया स्पष्ट विवरण लिखें।');
      }
    }, 1200);
  };

  // Text-To-Speech (AI Ustad speaks Hindi)
  const speakDiagnosis = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(false);
      }
    }
  };

  // Upload Real Photo / Video to Backend & Immediately Trigger AI Diagnosis
  const handleUploadSiteMedia = async (type: 'photo' | 'video') => {
    setIsUploadingMedia(true);
    try {
      const picked = await pickImageFromGallery();
      setIsUploadingMedia(false);
      if (!picked || !picked.base64) {
        return;
      }

      setAttachedMediaUrl(picked.uri);
      // Immediately run real AI diagnosis automatically!
      runAIVisionDiagnosis(picked.base64, customQuery, 'photo');

      // Upload file to backend asynchronously in background (non-blocking)
      ApiService.uploadFile(picked.base64, picked.name || 'site_media.jpg', 'portfolio').catch(() => {});
    } catch (err: any) {
      setIsUploadingMedia(false);
      console.log('[Upload] Media pick error:', err);
    }
  };

  // Send to Bhopal Karigar via WhatsApp
  const handleSendToKarigarWhatsApp = () => {
    if (!diagnosisResult) return;
    const msg = formatAiDoctorWhatsAppMessage({
      contractorName: 'रमेश जी / संबंधित कारीगर',
      problemTitle: diagnosisResult.titleHindi,
      diagnosis: diagnosisResult.realProblem || diagnosisResult.visibleObservation || '',
      estimatedCost: `₹${diagnosisResult.totalEstimatedCost} (सामान ₹${diagnosisResult.neededHardware.reduce((acc, h) => acc + h.approxPrice, 0)} + लेबर ₹${diagnosisResult.laborEstimate.approxPrice})`,
      partsNeeded: diagnosisResult.neededHardware.map(
        (h) => `${h.name} (~₹${h.approxPrice})`
      ),
      userLocation: currentLocation,
      mediaUrl: attachedMediaUrl,
    });
    openWhatsAppChat('9812345678', msg);
  };

  // ==========================================
  // TAB 2: 3D KITCHEN & WARDROBE STUDIO STATE
  // ==========================================
  const [studioType, setStudioType] = useState<'kitchen' | 'wardrobe'>('kitchen');
  const [studioLayout, setStudioLayout] = useState<'L_SHAPE' | 'PARALLEL' | 'U_SHAPE' | 'STRAIGHT'>('L_SHAPE');
  const [studioFinish, setStudioFinish] = useState<'ACRYLIC' | 'PVC_LAMINATE' | 'PU_GLOSS' | 'TEAK_WOOD'>('ACRYLIC');
  const [studioLength, setStudioLength] = useState<number>(10);
  const [studioWidth, setStudioWidth] = useState<number>(8);
  const [studioDesign, setStudioDesign] = useState<SpaceDesign3D>(
    calculate3DSpaceDesign({
      type: 'kitchen',
      layout: 'L_SHAPE',
      finish: 'ACRYLIC',
      lengthFt: 10,
      widthFt: 8,
    })
  );

  const handleUpdateStudioDesign = (
    nextType = studioType,
    nextLayout = studioLayout,
    nextFinish = studioFinish,
    nextLength = studioLength,
    nextWidth = studioWidth
  ) => {
    setStudioType(nextType);
    setStudioLayout(nextLayout);
    setStudioFinish(nextFinish);
    setStudioLength(nextLength);
    setStudioWidth(nextWidth);
    const updated = calculate3DSpaceDesign({
      type: nextType,
      layout: nextLayout,
      finish: nextFinish,
      lengthFt: nextLength,
      widthFt: nextWidth,
    });
    setStudioDesign(updated);
  };

  const handleSendStudioWhatsApp = () => {
    const msg = format3DStudioWhatsAppMessage({
      contractorName: 'रमेश शर्मा (मास्टर कारपेंटर)',
      projectType: studioType === 'kitchen' ? 'मॉड्यूलर किचन (Modular Kitchen)' : 'मास्टर वॉर्डरोब (Wardrobe)',
      layoutName: studioDesign.layoutTitle,
      finishType: studioDesign.finishTitle,
      dimensions: `${studioLength}x${studioWidth} ft`,
      approxSqFt: studioDesign.totalSqFt,
      estimatedTotal: `₹${studioDesign.grandTotal.toLocaleString('en-IN')} (सामान ₹${studioDesign.totalMaterialCost.toLocaleString('en-IN')} + लेबर ₹${studioDesign.laborCost.toLocaleString('en-IN')})`,
      userLocation: currentLocation,
    });
    openWhatsAppChat('9812345678', msg);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header & Tab Controls */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.titleBadgeRow}>
              <View style={styles.liveRedDot} />
              <Text style={styles.headerTitle}>SETU AI उस्ताद & 3D स्टूडियो</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {(currentLocation || 'भोपाल').split('•')[0]} • लाइव वीडियो समाधान
            </Text>
          </View>
          <TouchableOpacity
            style={styles.creditsPill}
            onPress={() => setIsPaywallOpen(true)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="bolt" size={11} color="#F59E0B" />
            <Text style={styles.creditsText}>{dailyCredits}/3 फ़्री</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Main Modes Navigation Bar */}
        <View style={styles.navTabsRow}>
          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'video' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('video')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="videocam"
              size={18}
              color={activeTab === 'video' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navTabText,
                activeTab === 'video' && styles.navTabTextActive,
              ]}
            >
              लाइव वीडियो कॉल
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'studio' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('studio')}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name="cube"
              size={16}
              color={activeTab === 'studio' ? '#8B5CF6' : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navTabText,
                activeTab === 'studio' && { color: '#8B5CF6', fontWeight: '800' },
              ]}
            >
              3D रूम स्टूडियो
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabBtn, activeTab === 'gyan' && styles.navTabBtnActive]}
            onPress={() => setActiveTab('gyan')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="school"
              size={18}
              color={activeTab === 'gyan' ? '#10B981' : COLORS.textMuted}
            />
            <Text
              style={[
                styles.navTabText,
                activeTab === 'gyan' && { color: '#10B981', fontWeight: '800' },
              ]}
            >
              उस्ताद ज्ञान
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* TAB 1: AI VIDEO CALL & LIVE PROBLEM DOCTOR */}
        {/* ========================================================================= */}
        {activeTab === 'video' && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Live Camera Viewfinder Card */}
            <View style={styles.viewfinderCard}>
              {/* Top Viewfinder Bar */}
              <View style={styles.viewfinderTopBar}>
                <View style={styles.callBadge}>
                  <View style={styles.pulseGreenDot} />
                  <Text style={styles.callTimerText}>{formatTimer(callDuration)}</Text>
                </View>
                <View style={styles.viewfinderActionsRight}>
                  <TouchableOpacity
                    style={styles.viewfinderSmallBtn}
                    onPress={() =>
                      speakDiagnosis(
                        diagnosisResult
                          ? diagnosisResult.titleHindi + '. ' + diagnosisResult.realProblem
                          : 'कैमरे के सामने समस्या दिखाइए'
                      )
                    }
                  >
                    <Ionicons
                      name={isSpeaking ? 'volume-high' : 'volume-medium'}
                      size={18}
                      color={isSpeaking ? '#10B981' : '#FFFFFF'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Viewfinder Main Video Frame */}
              <View style={styles.cameraFrame}>
                {attachedMediaUrl ? (
                  <Image
                    source={{ uri: attachedMediaUrl }}
                    style={styles.cameraSnapshot}
                    resizeMode="cover"
                  />
                ) : isCameraLive ? (
                  Platform.OS === 'web' ? (
                    React.createElement('video', {
                      ref: videoRef,
                      autoPlay: true,
                      playsInline: true,
                      muted: true,
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      },
                    })
                  ) : (
                    <View style={styles.cameraPlaceholder}>
                      <Ionicons name="camera-reverse" size={54} color="#10B981" />
                      <Text style={styles.cameraPromptText}>लाइव कैमरा सक्रिय है</Text>
                    </View>
                  )
                ) : (
                  <View style={styles.cameraPlaceholder}>
                    <Ionicons name="videocam-outline" size={54} color="#60A5FA" />
                    <Text style={styles.cameraPromptText}>
                      {cameraPermissionError || 'AI उस्ताद से लाइव वीडियो परामर्श शुरू करें'}
                    </Text>
                    <TouchableOpacity
                      style={styles.startLiveCameraBtn}
                      onPress={startRealCamera}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                      <Text style={styles.startLiveCameraText}>📹 लाइव कैमरा चालू करें</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Laser Scanning Grid Animation Overlay */}
                {isScanning && (
                  <View style={styles.scanningOverlay}>
                    <View style={styles.laserBar} />
                    <Text style={styles.scanningText}>🔍 AI उस्ताद फोटो स्कैन कर रहा है...</Text>
                  </View>
                )}

                {/* Floating AI Doctor PiP Avatar */}
                <View style={styles.doctorPipBadge}>
                  <View style={styles.doctorPipAvatar}>
                    <Text style={styles.doctorPipEmoji}>👷‍♂️</Text>
                  </View>
                  <View>
                    <Text style={styles.doctorPipName}>AI उस्ताद (लाइव)</Text>
                    <Text style={styles.doctorPipStatus}>
                      {isScanning ? 'जांच जारी है...' : isCameraLive ? '🟢 लाइव कैमरा ऑन' : '🟢 ऑनलाइन'}
                    </Text>
                  </View>
                </View>

                {/* Retake Button if photo attached */}
                {attachedMediaUrl && (
                  <TouchableOpacity
                    style={styles.retakeLiveBtn}
                    onPress={() => {
                      setAttachedMediaUrl('');
                      startRealCamera();
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={13} color="#FFFFFF" />
                    <Text style={styles.retakeLiveText}>दोबारा लाइव देखें</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Viewfinder Bottom Toolbar */}
              <View style={styles.viewfinderBottomToolbar}>
                {isCameraLive && (
                  <TouchableOpacity
                    style={styles.cameraToolBtn}
                    onPress={handleToggleFlipCamera}
                  >
                    <Ionicons name="camera-reverse" size={18} color="#FFFFFF" />
                    <Text style={styles.cameraToolText}>फ्लिप</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.cameraToolBtn}
                  onPress={() => handleUploadSiteMedia('photo')}
                  disabled={isUploadingMedia}
                >
                  <Ionicons name="images" size={18} color="#FFFFFF" />
                  <Text style={styles.cameraToolText}>
                    {isUploadingMedia ? 'अपलोड...' : 'गैलरी'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.scanNowActionBtn}
                  onPress={handleCaptureLiveFrame}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="camera" size={18} color="#FFFFFF" />
                      <Text style={styles.scanNowActionText}>
                        📸 फोटो खींचें & AI स्कैन करें
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Scenario Selector Chips */}
            <View style={styles.scenariosSection}>
              <Text style={styles.sectionHeaderTitle}>
                💡 Demo उदाहरण देखें (1-क्लिक जांच):
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarioChipsRow}>
                {Object.values(VISUAL_PROBLEM_SCENARIOS).map((sc) => {
                  const isSelected = selectedScenarioKey === sc.id;
                  return (
                    <TouchableOpacity
                      key={sc.id}
                      style={[styles.scenarioChip, isSelected && styles.scenarioChipSelected]}
                      onPress={() => handlePerformDiagnosis(sc.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.scenarioChipText, isSelected && styles.scenarioChipTextSelected]}>
                        {sc.titleHindi.split('(')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Custom Query Search Box */}
            <View style={styles.customQueryBox}>
              <TextInput
                style={styles.customInput}
                placeholder="या अपनी समस्या यहाँ लिखें (जैसे: सिंक जाम है, गीजर चालू नहीं हो रहा)..."
                placeholderTextColor="#94A3B8"
                value={customQuery}
                onChangeText={setCustomQuery}
              />
              <TouchableOpacity
                style={styles.customQueryBtn}
                onPress={handleCustomScan}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Vision Error Notice if photo is blurry or service offline */}
            {visionError ? (
              <View style={styles.visionErrorBox}>
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.visionErrorTitle}>फोटो का विश्लेषण अभी उपलब्ध नहीं है</Text>
                  <Text style={styles.visionErrorText}>{visionError}</Text>
                  <Text style={styles.visionErrorSub}>
                    💡 ऊपर दिए बॉक्स में समस्या का नाम लिखकर तुरंत समाधान व कारीगर प्राप्त करें।
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Live Diagnosis Report Card */}
            {diagnosisResult && (
              <View style={styles.reportCard}>
                <View style={styles.reportBadgeRow}>
                  <View style={styles.reportBadge}>
                    <Text style={styles.reportBadgeText}>
                      ✓ AI उस्ताद डायग्नोस्टिक रिपोर्ट {diagnosisResult.sourceContext === 'video_frame' ? '(लाइव वीडियो फ्रेम)' : diagnosisResult.sourceContext === 'photo' ? '(फोटो विश्लेषण)' : '(Demo उदाहरण)'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.listenVoiceBtn}
                    onPress={() =>
                      speakDiagnosis(
                        diagnosisResult.titleHindi + '. ' + (diagnosisResult.visibleObservation || diagnosisResult.realProblem)
                      )
                    }
                  >
                    <Ionicons name="volume-high" size={16} color={COLORS.primary} />
                    <Text style={styles.listenVoiceText}>उस्ताद से सुनें</Text>
                  </TouchableOpacity>
                </View>

                {/* 1. Problem title */}
                <Text style={styles.reportTitle}>{diagnosisResult.titleHindi}</Text>

                {/* 2. Distinct Visible Observation */}
                <View style={styles.observationBox}>
                  <View style={styles.observationHeader}>
                    <Ionicons name="eye" size={16} color="#2563EB" />
                    <Text style={styles.observationTitle}>👁️ प्रत्यक्ष दृश्य लक्षण (Visible Observation):</Text>
                  </View>
                  <Text style={styles.observationText}>
                    {diagnosisResult.sourceContext === 'video_frame'
                      ? 'इस frame में: '
                      : diagnosisResult.sourceContext === 'photo'
                      ? 'अपलोड की गई फोटो में: '
                      : 'Demo नमूना: '}
                    {diagnosisResult.visibleObservation || diagnosisResult.visualSymptom}
                  </Text>
                </View>

                {/* 3. Distinct Inferred Root Cause */}
                <View style={styles.realCauseBox}>
                  <View style={styles.realCauseHeader}>
                    <Ionicons name="bulb" size={18} color="#D97706" />
                    <Text style={styles.realCauseTitle}>🔍 संभावित अनुमान व वजह (Inferred Cause):</Text>
                  </View>
                  <Text style={styles.realCauseDesc}>{diagnosisResult.inferredCause || diagnosisResult.realProblem}</Text>
                </View>

                {/* 4. Safety Hazard Warning */}
                {diagnosisResult.isSafetyHazard && (
                  <View style={styles.hazardWarningBanner}>
                    <Ionicons name="warning" size={24} color="#DC2626" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hazardWarningTitle}>आपातकालीन सुरक्षा चेतावनी</Text>
                      <Text style={styles.hazardWarningText}>
                        {diagnosisResult.safetyMessage || '⚠️ तुरंत मुख्य DP / MCB (मेन स्विच) बंद करें! किसी भी नंगे तार या बोर्ड को हाथ न लगाएं।'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* 5. Parts Needed with Bhopal MRP */}
                {diagnosisResult.neededHardware && diagnosisResult.neededHardware.length > 0 && (
                  <View style={styles.reportSectionBox}>
                    <Text style={styles.reportSectionTitle}>📦 क्या सामान लगेगा (मार्केट रेट):</Text>
                    {diagnosisResult.neededHardware.map((hw, idx) => (
                      <View key={idx} style={styles.hardwareRow}>
                        <View style={styles.hwInfo}>
                          <Ionicons name="cube-outline" size={14} color={COLORS.textPrimary} />
                          <Text style={styles.hwName}>{hw.name}</Text>
                        </View>
                        <View style={styles.hwPriceBadge}>
                          <Text style={styles.hwPriceText}>
                            ₹{hw.approxPrice} ({hw.unit})
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* 6. Cost Breakdown */}
                <View style={styles.costBreakdownCard}>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>
                      सामान का कुल खर्च:
                    </Text>
                    <Text style={styles.costValue}>
                      ₹{diagnosisResult.neededHardware.reduce((acc, h) => acc + h.approxPrice, 0)}
                    </Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>
                      {diagnosisResult.laborEstimate?.description || 'मानक कारीगर मजदूरी'}:
                    </Text>
                    <Text style={styles.costValue}>
                      ₹{diagnosisResult.laborEstimate?.approxPrice || 180}
                    </Text>
                  </View>
                  <View style={styles.costDivider} />
                  <View style={styles.grandCostRow}>
                    <Text style={styles.grandCostLabel}>कुल उचित बजट (Total Fair Price):</Text>
                    <Text style={styles.grandCostValue}>
                      ₹{diagnosisResult.totalEstimatedCost}
                    </Text>
                  </View>
                  <Text style={styles.fairPriceNote}>
                    💡 भोपाल मार्केट का मानक रेट: कारीगर या दुकानदार इससे ज्यादा नहीं ले सकते।
                  </Text>
                </View>

                {/* 7. DIY Steps (ONLY if NOT a safety hazard) */}
                {!diagnosisResult.isSafetyHazard && diagnosisResult.diySteps && diagnosisResult.diySteps.length > 0 && (
                  <View style={styles.diyBox}>
                    <Text style={styles.diyTitle}>🛠️ अगर खुद ठीक करना चाहें (3 आसान स्टेप्स):</Text>
                    {diagnosisResult.diySteps.map((step, idx) => (
                      <Text key={idx} style={styles.diyStepText}>
                        {step}
                      </Text>
                    ))}
                  </View>
                )}

                {/* 8. Ustad Advice / Fraud Prevention */}
                <View style={styles.ustadAdviceBox}>
                  <Text style={styles.ustadAdviceText}>
                    {diagnosisResult.karigarAdvice}
                  </Text>
                </View>

                {/* 6. 1-Click WhatsApp & Call Karigar Buttons */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.whatsAppCallBtn}
                    onPress={handleSendToKarigarWhatsApp}
                    activeOpacity={0.85}
                  >
                    <FontAwesome5 name="whatsapp" size={18} color="#FFFFFF" />
                    <Text style={styles.whatsAppCallText}>
                      कारीगर को WhatsApp पर फ़ोटो भेजें
                    </Text>
                  </TouchableOpacity>

                  {onOpenContractorCategory && (
                    <TouchableOpacity
                      style={styles.openCategoryBtn}
                      onPress={() => {
                        onOpenContractorCategory(diagnosisResult.category);
                        onClose();
                      }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="people" size={16} color={COLORS.primary} />
                      <Text style={styles.openCategoryText}>
                        भोपाल के {diagnosisResult.category === 'plumber' ? 'प्लंबर' : 'कारीगर'} सूची
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 3D MODULAR KITCHEN & WARDROBE STUDIO */}
        {/* ========================================================================= */}
        {activeTab === 'studio' && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Space Type Selector */}
            <View style={styles.studioTypeRow}>
              <TouchableOpacity
                style={[styles.studioTypeBtn, studioType === 'kitchen' && styles.studioTypeBtnActive]}
                onPress={() => handleUpdateStudioDesign('kitchen', studioLayout, studioFinish, studioLength, studioWidth)}
                activeOpacity={0.8}
              >
                <Text style={styles.studioTypeEmoji}>🍳</Text>
                <Text style={[styles.studioTypeText, studioType === 'kitchen' && styles.studioTypeTextActive]}>
                  मॉड्यूलर किचन
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.studioTypeBtn, studioType === 'wardrobe' && styles.studioTypeBtnActive]}
                onPress={() => handleUpdateStudioDesign('wardrobe', studioLayout, studioFinish, studioLength, studioWidth)}
                activeOpacity={0.8}
              >
                <Text style={styles.studioTypeEmoji}>🪚</Text>
                <Text style={[styles.studioTypeText, studioType === 'wardrobe' && styles.studioTypeTextActive]}>
                  मास्टर वॉर्डरोब
                </Text>
              </TouchableOpacity>
            </View>

            {/* Layout Options */}
            <View style={styles.studioSection}>
              <Text style={styles.studioSectionHeader}>📐 लेआउट चुनें (Layout Type):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studioChipsScroll}>
                {[
                  { key: 'L_SHAPE', label: 'एल-शेप (L-Shape)' },
                  { key: 'PARALLEL', label: 'समानांतर (Parallel)' },
                  { key: 'U_SHAPE', label: 'यू-शेप (U-Shape)' },
                  { key: 'STRAIGHT', label: 'स्ट्रेट लाइन (Single Wall)' },
                ].map((l) => (
                  <TouchableOpacity
                    key={l.key}
                    style={[styles.studioChip, studioLayout === l.key && styles.studioChipActive]}
                    onPress={() =>
                      handleUpdateStudioDesign(
                        studioType,
                        l.key as any,
                        studioFinish,
                        studioLength,
                        studioWidth
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.studioChipText,
                        studioLayout === l.key && styles.studioChipTextActive,
                      ]}
                    >
                      {l.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Finish Options */}
            <View style={styles.studioSection}>
              <Text style={styles.studioSectionHeader}>✨ सामग्री & फिनिश चुनें (Finishes):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studioChipsScroll}>
                {[
                  { key: 'ACRYLIC', label: '1.5mm ऐक्रेलिक हाई-ग्लॉस' },
                  { key: 'PVC_LAMINATE', label: '1mm PVC वाटरप्रूफ माइका' },
                  { key: 'PU_GLOSS', label: 'इटैलियन PU पेंट' },
                  { key: 'TEAK_WOOD', label: 'नेचुरल टीकवुड वेनियर' },
                ].map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.studioChip, studioFinish === f.key && styles.studioChipActive]}
                    onPress={() =>
                      handleUpdateStudioDesign(
                        studioType,
                        studioLayout,
                        f.key as any,
                        studioLength,
                        studioWidth
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.studioChipText,
                        studioFinish === f.key && styles.studioChipTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Room Dimensions Selector */}
            <View style={styles.dimensionsBox}>
              <Text style={styles.dimensionsTitle}>
                📏 माप (Dimensions): {studioLength} x {studioWidth} फीट • कुल {studioDesign.totalSqFt} sq.ft
              </Text>
              <View style={styles.dimButtonsRow}>
                {[
                  { l: 8, w: 6, label: '8x6 ft (छोटा)' },
                  { l: 10, w: 8, label: '10x8 ft (स्टैंडर्ड)' },
                  { l: 12, w: 10, label: '12x10 ft (बड़ा)' },
                  { l: 14, w: 12, label: '14x12 ft (लक्जरी)' },
                ].map((dim, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dimPillBtn,
                      studioLength === dim.l && studioWidth === dim.w && styles.dimPillBtnActive,
                    ]}
                    onPress={() =>
                      handleUpdateStudioDesign(
                        studioType,
                        studioLayout,
                        studioFinish,
                        dim.l,
                        dim.w
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dimPillText,
                        studioLength === dim.l && studioWidth === dim.w && styles.dimPillTextActive,
                      ]}
                    >
                      {dim.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Interactive 3D Visual Schematic Diagram */}
            <View style={styles.schematicCanvasCard}>
              <View style={styles.schematicCanvasHeader}>
                <View style={styles.canvasLiveBadge}>
                  <Ionicons name="eye" size={14} color="#FFFFFF" />
                  <Text style={styles.canvasLiveText}>3D स्कीमेटिक विजुअलाइज़र</Text>
                </View>
                <Text style={styles.schematicSubtitle}>{studioDesign.layoutTitle}</Text>
              </View>

              {/* Visual Isometric Blueprint */}
              <View style={styles.blueprintArea}>
                <View style={styles.blueprintGrid}>
                  {studioDesign.schematicBoxes.map((box, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.blueprintBox,
                        {
                          backgroundColor: box.color + '22',
                          borderColor: box.color,
                          top: box.y,
                          left: box.x,
                          width: box.width,
                          height: box.height,
                        },
                      ]}
                    >
                      <Text style={[styles.blueprintBoxLabel, { color: box.color }]}>
                        {box.label}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.blueprintWatermark}>
                  <Text style={styles.blueprintWatermarkText}>
                    SETU 3D CAD ENGINE • {studioLength}ft x {studioWidth}ft
                  </Text>
                </View>
              </View>
            </View>

            {/* Cabinet & Storage Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>🗄️ कैबिनेट्स & स्टोरेज विभाजन:</Text>
              {studioDesign.cabinetBreakdown.map((cab, idx) => (
                <View key={idx} style={styles.cabRow}>
                  <View style={styles.cabBadge}>
                    <Text style={styles.cabBadgeQty}>{cab.qty}x</Text>
                  </View>
                  <View style={styles.cabDetails}>
                    <Text style={styles.cabItemName}>{cab.item}</Text>
                    <Text style={styles.cabItemDesc}>{cab.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Material & Cost Calculation */}
            <View style={styles.studioEstimateCard}>
              <Text style={styles.estimateTitle}>💰 सामग्री & लेबर बजट अनुमान:</Text>
              {studioDesign.materialEstimate.map((mat, idx) => (
                <View key={idx} style={styles.matCostRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matName}>{mat.name}</Text>
                    <Text style={styles.matQty}>मात्रा: {mat.qty}</Text>
                  </View>
                  <Text style={styles.matTotal}>₹{mat.total.toLocaleString('en-IN')}</Text>
                </View>
              ))}

              <View style={styles.matCostRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matName}>मास्टर कारपेंटर लेबर चार्ज</Text>
                  <Text style={styles.matQty}>
                    {studioDesign.totalSqFt} sq.ft @ ₹{studioType === 'kitchen' ? '380' : '350'}/sq.ft
                  </Text>
                </View>
                <Text style={styles.matTotal}>₹{studioDesign.laborCost.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.costDivider} />
              <View style={styles.grandCostRow}>
                <Text style={styles.grandCostLabel}>कुल प्रोजेक्ट बजट:</Text>
                <Text style={styles.grandCostValue}>
                  ₹{studioDesign.grandTotal.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.ustadAdviceBox}>
                <Text style={styles.ustadAdviceText}>{studioDesign.ustadAdvice}</Text>
              </View>

              <TouchableOpacity
                style={styles.whatsAppCallBtn}
                onPress={handleSendStudioWhatsApp}
                activeOpacity={0.85}
              >
                <FontAwesome5 name="whatsapp" size={18} color="#FFFFFF" />
                <Text style={styles.whatsAppCallText}>
                  मास्टर कारपेंटर को 3D डिज़ाइन & कोटेशन भेजें
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: USTAD GYAN & KARIGAR TRAINING */}
        {/* ========================================================================= */}
        {activeTab === 'gyan' && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.gyanHeroCard}>
              <Text style={styles.gyanHeroEmoji}>🎓</Text>
              <Text style={styles.gyanHeroTitle}>SETU उस्ताद निर्माण संहिता (Master Code)</Text>
              <Text style={styles.gyanHeroSubtitle}>
                कारीगर और ग्राहक दोनों के लिए CPWD व IS कोड पर आधारित सत्य नियम
              </Text>
            </View>

            {/* Rule 1: Plywood */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>01</Text>
                <Text style={styles.gyanHeaderTitle}>प्लाईवुड: कमर्शियल vs मरीन प्लाई का सच</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • अक्सर ठेकेदार सस्ते मुनाफे के लिए MR Grade (कमर्शियल प्लाई) लगाते हैं जो दीमक और नमी से 2 साल में फूल जाती है।{'\n'}
                • किचन और बाथरूम में हमेशा <Text style={{ fontWeight: '800' }}>IS:710 मरीन ग्रेड 100% वॉटरप्रूफ प्लाई</Text> ही लगाएं।{'\n'}
                • फेविकोल मरीन में पानी मिलाने से रोकें; पानी मिलाने से 6 महीने बाद माइका पर बुलबुले उभर आते हैं।
              </Text>
            </View>

            {/* Rule 2: Plumbing */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>02</Text>
                <Text style={styles.gyanHeaderTitle}>प्लंबिंग: 10-Bar प्रेशर टेस्टिंग का नियम</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • CPVC सॉल्वेंट वेल्डिंग के बाद टाइल्स लगाने से पहले कम से कम 24 घंटे 10-Bar हाइड्रोस्टैटिक प्रेशर टेस्ट जरूरी है।{'\n'}
                • नल के स्पिंडल में जब भी लीकेज हो, पूरा नल न बदलें। केवल ₹85 का ब्रास स्पिंडल बदलने से काम हो जाता है।
              </Text>
            </View>

            {/* Rule 3: Masonry & Slab */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>03</Text>
                <Text style={styles.gyanHeaderTitle}>छत ढलाई & कंक्रीट: 14 दिन तराई का नियम</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • छत ढलाई में बिना नीडल वाइब्रेटर के कभी काम न होने दें। वाइब्रेटर न चलाने से कंक्रीट में छिद्र रह जाते हैं और बारिश में छत चूने लगती है।{'\n'}
                • ढलाई के बाद 14 दिन लगातार क्यारियां बनाकर पानी भरा रहना चाहिए, तभी कंक्रीट अपनी पूरी 100% मजबूती हासिल करता है।
              </Text>
            </View>

            {/* Rule 4: Electrical */}
            <View style={styles.gyanCard}>
              <View style={styles.gyanCardHeader}>
                <Text style={styles.gyanNum}>04</Text>
                <Text style={styles.gyanHeaderTitle}>इलेक्ट्रिकल: 30mA RCCB शॉक प्रोटेक्शन</Text>
              </View>
              <Text style={styles.gyanBodyText}>
                • हर घर के डिस्ट्रीब्यूशन बोर्ड में 30mA RCCB लगा होना चाहिए। यह किसी बच्चे या व्यक्ति को करंट लगते ही 0.03 सेकंड में बिजली काट देता है और जान बचाता है।{'\n'}
                • AC और गीजर के लिए कभी भी 2.5mm से पतली तार न डलवाएं।
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* PAYWALL / TOKEN RECHARGE MODAL */}
        {/* ========================================================================= */}
        <Modal visible={isPaywallOpen} transparent animationType="fade" onRequestClose={() => setIsPaywallOpen(false)}>
          <View style={styles.paywallOverlay}>
            <View style={styles.paywallCard}>
              <View style={styles.paywallIcon}>
                <FontAwesome5 name="crown" size={32} color="#D97706" />
              </View>
              <Text style={styles.paywallTitle}>आज का फ्री कोटा पूर्ण हुआ!</Text>
              <Text style={styles.paywallDesc}>
                आपने आज के 3 फ्री AI उस्ताद वीडियो स्कैन पूरे कर लिए हैं। कल सुबह यह फिर से स्वतः रिसेट हो जाएगा।
              </Text>

              <View style={styles.paywallPriceBox}>
                <Text style={styles.paywallPrice}>सिर्फ ₹19 / दिन</Text>
                <Text style={styles.paywallPerk}>• असीमित लाइव वीडियो डायग्नोसिस</Text>
                <Text style={styles.paywallPerk}>• 3D किचन & वॉर्डरोब ब्लूप्रिंट</Text>
                <Text style={styles.paywallPerk}>• सीधे उस्ताद से वॉइस परामर्श</Text>
              </View>

              <TouchableOpacity
                style={styles.paywallBtn}
                onPress={() => {
                  setDailyCredits(10);
                  setIsPaywallOpen(false);
                  Alert.alert('🎉 प्रीमियम पास एक्टिवेटेड', 'आपको 10 अतिरिक्त AI स्कैन दिए गए हैं!');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.paywallBtnText}>₹19 टोकन जोड़ें (डेमो)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paywallSecondaryBtn}
                onPress={() => {
                  setIsPaywallOpen(false);
                  handleSendToKarigarWhatsApp();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.paywallSecondaryText}>
                  या भोपाल के कारीगर से मुफ़्त में पूछें ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  closeBtn: {
    padding: 6,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 10,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#475569',
  },
  creditsText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  navTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  navTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  navTabBtnActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  tabContent: {
    flex: 1,
    padding: 12,
  },
  viewfinderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  viewfinderTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  callTimerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  viewfinderActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  viewfinderSmallBtn: {
    backgroundColor: '#334155',
    padding: 6,
    borderRadius: 8,
  },
  cameraFrame: {
    height: 240,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraSnapshot: {
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cameraPromptText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  cameraSubprompt: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 4,
    textAlign: 'center',
  },
  startLiveCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
    marginTop: 12,
  },
  startLiveCameraText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  retakeLiveBtn: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: '#475569',
  },
  retakeLiveText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserBar: {
    width: '90%',
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    marginBottom: 16,
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  doctorPipBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  doctorPipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorPipEmoji: {
    fontSize: 14,
  },
  doctorPipName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  doctorPipStatus: {
    color: '#10B981',
    fontSize: 8.5,
    fontWeight: '700',
  },
  viewfinderBottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0F172A',
    gap: 8,
  },
  cameraToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  cameraToolText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  scanNowActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  scanNowActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  scenariosSection: {
    marginTop: 14,
  },
  sectionHeaderTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  scenarioChipsRow: {
    gap: 8,
  },
  scenarioChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scenarioChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  scenarioChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  scenarioChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  customQueryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  customInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 8,
  },
  customQueryBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  reportBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  listenVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listenVoiceText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  reportTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  visionErrorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  visionErrorTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  visionErrorText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 16,
  },
  visionErrorSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontStyle: 'italic',
  },
  observationBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    marginBottom: 10,
  },
  observationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  observationTitle: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '800',
  },
  observationText: {
    color: '#1E3A8A',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
  },
  hazardWarningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 12,
  },
  hazardWarningTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  hazardWarningText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 16,
  },
  realCauseBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    marginBottom: 12,
  },
  realCauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  realCauseTitle: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
  },
  realCauseDesc: {
    color: '#78350F',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
  },
  reportSectionBox: {
    marginBottom: 12,
  },
  reportSectionTitle: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  hardwareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  hwInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  hwName: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  hwPriceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hwPriceText: {
    color: '#0F172A',
    fontSize: 10.5,
    fontWeight: '800',
  },
  costBreakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  costLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  costValue: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 6,
  },
  grandCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandCostLabel: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '900',
  },
  grandCostValue: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '900',
  },
  fairPriceNote: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 6,
  },
  diyBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  diyTitle: {
    color: '#1D4ED8',
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  diyStepText: {
    color: '#1E3A8A',
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 3,
  },
  ustadAdviceBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  ustadAdviceText: {
    color: '#92400E',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  actionButtonsRow: {
    gap: 8,
  },
  whatsAppCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  whatsAppCallText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  openCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  openCategoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  // STUDIO STYLES
  studioTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  studioTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  studioTypeBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8B5CF6',
  },
  studioTypeEmoji: {
    fontSize: 18,
  },
  studioTypeText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  studioTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  studioSection: {
    marginBottom: 14,
  },
  studioSectionHeader: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  studioChipsScroll: {
    gap: 8,
  },
  studioChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  studioChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  studioChipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  studioChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dimensionsBox: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  dimensionsTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  dimButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dimPillBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dimPillBtnActive: {
    backgroundColor: '#8B5CF6',
  },
  dimPillText: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '700',
  },
  dimPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  schematicCanvasCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  schematicCanvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
  },
  canvasLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  canvasLiveText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  schematicSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  blueprintArea: {
    height: 200,
    position: 'relative',
    backgroundColor: '#020617',
    padding: 10,
  },
  blueprintGrid: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 8,
  },
  blueprintBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  blueprintBoxLabel: {
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  blueprintWatermark: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  blueprintWatermarkText: {
    color: '#334155',
    fontSize: 8.5,
    fontWeight: '800',
  },
  breakdownCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  breakdownTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  cabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 8,
  },
  cabBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cabBadgeQty: {
    color: '#F59E0B',
    fontSize: 10.5,
    fontWeight: '900',
  },
  cabDetails: {
    flex: 1,
  },
  cabItemName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cabItemDesc: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
  studioEstimateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
  },
  estimateTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  matCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  matName: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '700',
  },
  matQty: {
    color: '#64748B',
    fontSize: 9.5,
  },
  matTotal: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // GYAN STYLES
  gyanHeroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gyanHeroEmoji: {
    fontSize: 32,
  },
  gyanHeroTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
  },
  gyanHeroSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  gyanCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gyanCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  gyanNum: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '900',
  },
  gyanHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    flex: 1,
  },
  gyanBodyText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 17,
  },

  // PAYWALL STYLES
  paywallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paywallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  paywallIcon: {
    marginBottom: 10,
  },
  paywallTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  paywallDesc: {
    color: '#64748B',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  paywallPriceBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  paywallPrice: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  paywallPerk: {
    color: '#78350F',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  paywallBtn: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  paywallBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  paywallSecondaryBtn: {
    marginTop: 10,
    paddingVertical: 6,
  },
  paywallSecondaryText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
});

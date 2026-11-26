import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Contractor, MaterialItem, WorkVideo } from '../data/mockData';
import { COLORS } from '../theme/colors';
import { VideoPlayerModal } from './VideoPlayerModal';
import { RateSurveyModal } from './RateSurveyModal';
import { ApiService } from '../services/api';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

interface ContractorDetailModalProps {
  visible: boolean;
  contractor: Contractor | null;
  onClose: () => void;
  onBookPress: (contractor: Contractor) => void;
  onCallPress: (contractor: Contractor) => void;
}

export const ContractorDetailModal: React.FC<ContractorDetailModalProps> = ({
  visible,
  contractor,
  onClose,
  onBookPress,
  onCallPress,
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'materials' | 'rates' | 'reviews'>('photos');
  const scrollViewRef = useRef<any>(null);

  // Sub-views
  const [selectedVideo, setSelectedVideo] = useState<WorkVideo | null>(null);
  const [showRateSurveyModal, setShowRateSurveyModal] = useState<boolean>(false);

  // Extra customer-submitted reviews keyed by contractor id (no setState-in-effect needed)
  const [addedReviewsByContractor, setAddedReviewsByContractor] = useState<Record<string, any[]>>({});
  const [showAddReviewModal, setShowAddReviewModal] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [hasAttachedVideo, setHasAttachedVideo] = useState<boolean>(false);

  // Track Y offsets of each section for smooth scroll & active tab sync
  const sectionYOffsets = useRef<{ [key: string]: number }>({
    photos: 0,
    videos: 300,
    materials: 600,
    rates: 950,
    reviews: 1300,
  });
  const { getModalStyles } = useResponsive();
  const { isDialog, overlayStyle, containerStyle } = getModalStyles({
    maxWidth: 820,
    fixedHeight: true,
    mobileHeight: '92%',
    desktopHeight: '90%',
  });

  if (!contractor) return null;

  const reviewsList = [
    ...(addedReviewsByContractor[contractor.id] || []),
    ...(Array.isArray(contractor.reviews) ? contractor.reviews : []),
  ];

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      showAppAlert('समीक्षा आवश्यक', 'कृपया अपना अनुभव या काम की प्रतिक्रिया लिखें।');
      return;
    }

    const res = ApiService.getAuthToken()
      ? await ApiService.addContractorReview(contractor.id, {
          rating: newRating,
          comment: newComment.trim(),
          workDone: contractor.specialtyHindi,
        })
      : null;

    if (res && res.success === false) {
      showAppAlert('त्रुटि', res.error || 'समीक्षा सर्वर पर दर्ज नहीं हो सकी।');
      return;
    }

    const newRev = res?.review || {
      id: 'rev_' + Date.now(),
      customerName: 'SETU ग्राहक',
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toLocaleDateString('hi-IN'),
      workDone: contractor.specialtyHindi,
      location: 'भोपाल',
      verifiedWork: Boolean(ApiService.getAuthToken()),
    };

    setAddedReviewsByContractor((prev) => ({
      ...prev,
      [contractor.id]: [newRev, ...(prev[contractor.id] || [])],
    }));
    setShowAddReviewModal(false);
    setNewComment('');
    setHasAttachedVideo(false);
    showAppAlert(
      '🎉 समीक्षा स्वीकृत!',
      'आपकी समीक्षा प्रोफ़ाइल पर जोड़ दी गई है!'
    );
  };

  const handleOrderMaterial = (item: MaterialItem) => {
    showAppAlert(
      'सामग्री + कारीगर बुकिंग',
      `"${item.name}" (₹${item.sellingPrice}) को ${contractor.name} की बुकिंग के साथ जोड़ने के लिए आगे बढ़ें?`,
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'बुकिंग खोलें ➔',
          onPress: () => {
            onClose();
            onBookPress(contractor);
          },
        },
      ]
    );
  };

  const scrollToSection = (section: 'photos' | 'videos' | 'materials' | 'rates' | 'reviews') => {
    setActiveTab(section);
    const targetY = sectionYOffsets.current[section] || 0;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY - 10), animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const offsets = sectionYOffsets.current;

    if (scrollY >= (offsets['reviews'] || 1300) - 70) {
      if (activeTab !== 'reviews') setActiveTab('reviews');
    } else if (scrollY >= (offsets['rates'] || 950) - 70) {
      if (activeTab !== 'rates') setActiveTab('rates');
    } else if (scrollY >= (offsets['materials'] || 600) - 70) {
      if (activeTab !== 'materials') setActiveTab('materials');
    } else if (scrollY >= (offsets['videos'] || 300) - 70) {
      if (activeTab !== 'videos') setActiveTab('videos');
    } else {
      if (activeTab !== 'photos') setActiveTab('photos');
    }
  };

  return (
    <Modal visible={visible} animationType={isDialog ? 'fade' : 'slide'} transparent={true} onRequestClose={onClose}>
      <View style={overlayStyle}>
        <View style={[styles.container, containerStyle]}>
          {/* Top Modal Navigation Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {contractor.name}
            </Text>
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>⚡ {contractor.distance} ({contractor.etaMinutes}m)</Text>
            </View>
          </View>

          {/* STICKY TAB BAR: Stays pinned at top when scrolling! */}
          <View style={styles.stickyTabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
              onPress={() => scrollToSection('photos')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="image-multiple"
                size={13}
                color={activeTab === 'photos' ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.tabButtonText, activeTab === 'photos' && styles.tabButtonTextActive]}>
                फोटो ({contractor.portfolioPhotos?.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'videos' && styles.tabButtonActive]}
              onPress={() => scrollToSection('videos')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="videocam"
                size={13}
                color={activeTab === 'videos' ? '#DC2626' : COLORS.textSecondary}
              />
              <Text style={[styles.tabButtonText, activeTab === 'videos' && { color: '#DC2626', fontWeight: '800' }]}>
                वीडियो ({contractor.videos?.length || 2})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'materials' && styles.tabButtonActive]}
              onPress={() => scrollToSection('materials')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="storefront-outline"
                size={13}
                color={activeTab === 'materials' ? COLORS.secondary : COLORS.textSecondary}
              />
              <Text style={[styles.tabButtonText, activeTab === 'materials' && styles.tabButtonTextActive]}>
                सामग्री ({contractor.recommendedMaterials?.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'rates' && styles.tabButtonActive]}
              onPress={() => scrollToSection('rates')}
              activeOpacity={0.8}
            >
              <FontAwesome
                name="id-card"
                size={12}
                color={activeTab === 'rates' ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.tabButtonText, activeTab === 'rates' && styles.tabButtonTextActive]}>
                रेट-कार्ड
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'reviews' && styles.tabButtonActive]}
              onPress={() => scrollToSection('reviews')}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="rate-review"
                size={13}
                color={activeTab === 'reviews' ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.tabButtonText, activeTab === 'reviews' && styles.tabButtonTextActive]}>
                रिव्यू ({contractor.reviews?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* MAIN CONTINUOUS SCROLL VIEW: Photos, Videos, Materials, Rates, Reviews ALL visible as you scroll! */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* 1. Profile Overview Card */}
            <View style={styles.profileSection}>
              <View style={styles.topRow}>
                <Image source={{ uri: contractor.avatar }} style={styles.avatar} />
                <View style={styles.topInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.nameText}>{contractor.name}</Text>
                    {contractor.verified && (
                      <MaterialIcons name="verified" size={18} color="#0284C7" />
                    )}
                  </View>
                  <Text style={styles.specialtyText}>{contractor.specialtyHindi}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>{Number(contractor.rating || 0).toFixed(1)}</Text>
                      <FontAwesome name="star" size={10} color="#FFFFFF" style={{ marginLeft: 2 }} />
                    </View>
                    <Text style={styles.statSub}>
                      ({contractor.reviewsCount || 0} समीक्षाएं) • {contractor.jobsCompleted || 0} काम पूरे
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.bioText}>{contractor.bio}</Text>

              {/* Skills Tags */}
              <View style={styles.skillsRow}>
                {(contractor.skills || []).map((s, idx) => (
                  <View key={idx} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>✓ {s}</Text>
                  </View>
                ))}
              </View>

              {/* Availability Banner */}
              <View
                style={[
                  styles.availBanner,
                  { backgroundColor: contractor.available ? COLORS.accentLight : '#F1F5F9' },
                ]}
              >
                <Ionicons
                  name={contractor.available ? 'checkmark-circle' : 'time-outline'}
                  size={16}
                  color={contractor.available ? '#065F46' : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.availBannerText,
                    { color: contractor.available ? '#065F46' : COLORS.textMuted },
                  ]}
                >
                  {contractor.available
                    ? `🟢 अभी उपलब्ध हैं • पहुँच समय लगभग ${contractor.etaMinutes} मिनट`
                    : '⏳ अभी अन्य प्रोजेक्ट पर व्यस्त हैं (अग्रिम बुकिंग उपलब्ध)'}
                </Text>
              </View>
            </View>

            {/* 2. SECTION 1: 📸 काम की फोटो गैलरी (Real Work Portfolio Photos) */}
            <View
              style={styles.sectionContainer}
              onLayout={(e) => {
                sectionYOffsets.current['photos'] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                  <MaterialCommunityIcons name="image-multiple" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.sectionTitle}>
                    📸 काम की फोटो गैलरी ({contractor.portfolioPhotos?.length || 0})
                  </Text>
                  <Text style={styles.sectionSub}>
                    कारीगर द्वारा अपनी साइट्स से सीधे अपलोड की गई तस्वीरें
                  </Text>
                </View>
              </View>

              {(!contractor.portfolioPhotos || contractor.portfolioPhotos.length === 0) ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>फिलहाल कोई फोटो अपलोड नहीं है।</Text>
                </View>
              ) : (
                contractor.portfolioPhotos.map((photo) => (
                  <View key={photo.id} style={styles.portfolioCard}>
                    <Image
                      source={{ uri: photo.imageUrl }}
                      style={styles.portfolioImage}
                      resizeMode="cover"
                    />
                    <View style={styles.portfolioInfo}>
                      <View style={styles.photoTopRow}>
                        <Text style={styles.photoTitle}>{photo.title}</Text>
                        <Text style={styles.photoDate}>📅 {photo.date}</Text>
                      </View>
                      <Text style={styles.photoDesc}>{photo.description}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionDivider} />

            {/* 3. SECTION 2: 🎥 वीडियो वॉकथ्रू & ग्राहक वीडियो रिव्यू */}
            <View
              style={styles.sectionContainer}
              onLayout={(e) => {
                sectionYOffsets.current['videos'] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="videocam" size={18} color="#DC2626" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.sectionTitle}>
                    🎥 काम के वीडियो & ग्राहक समीक्षा ({contractor.videos?.length || 2} वीडियो)
                  </Text>
                  <Text style={styles.sectionSub}>
                    साइट वॉकथ्रू व 100% वेरिफाइड ग्राहकों के वीडियो टेस्टिमोनियल
                  </Text>
                </View>
              </View>

              {contractor.videos && contractor.videos.length > 0 ? (
                contractor.videos.map((vid) => (
                  <TouchableOpacity
                    key={vid.id}
                    style={styles.videoCard}
                    activeOpacity={0.88}
                    onPress={() => setSelectedVideo(vid)}
                  >
                    <View style={styles.videoThumbWrapper}>
                      <Image source={{ uri: vid.thumbnail }} style={styles.videoThumb} />
                      <View style={styles.playButtonCircle}>
                        <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
                      </View>
                      <View style={styles.videoDurationPill}>
                        <Text style={styles.videoDurationText}>▶ {vid.duration}</Text>
                      </View>
                    </View>

                    <View style={styles.videoCardBody}>
                      <View style={styles.videoBadgeRow}>
                        <View
                          style={[
                            styles.videoTypeTag,
                            { backgroundColor: vid.type === 'CUSTOMER_TESTIMONIAL' ? '#DCFCE7' : '#EFF6FF' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.videoTypeTagText,
                              { color: vid.type === 'CUSTOMER_TESTIMONIAL' ? '#15803D' : COLORS.primary },
                            ]}
                          >
                            {vid.type === 'CUSTOMER_TESTIMONIAL' ? '🗣️ ग्राहक वीडियो रिव्यू' : '🔨 कारीगर वॉकथ्रू'}
                          </Text>
                        </View>
                        <Text style={styles.videoDateText}>📅 {vid.date}</Text>
                      </View>
                      <Text style={styles.videoCardTitle}>{vid.title}</Text>
                      <Text style={styles.videoCardAuthor}>प्रमाणित: {vid.author}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>फिलहाल कोई वीडियो उपलब्ध नहीं है।</Text>
                </View>
              )}
            </View>

            <View style={styles.sectionDivider} />

            {/* 4. SECTION 3: 🛍️ आवश्यक ओरिजिनल रॉ-मटेरियल (Materials & Combo Offers) */}
            <View
              style={styles.sectionContainer}
              onLayout={(e) => {
                sectionYOffsets.current['materials'] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.bundleBanner}>
                <Ionicons name="pricetags" size={18} color="#C2410C" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.bundleTitle}>कारीगर + सामग्री कॉम्बो ऑफर (Combo)</Text>
                  <Text style={styles.bundleSub}>
                    इस कारीगर के साथ पास की दुकान से सामान लेने पर 5% अतिरिक्त कैशबैक!
                  </Text>
                </View>
              </View>

              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FFF7ED' }]}>
                  <MaterialCommunityIcons name="storefront-outline" size={18} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.sectionTitle}>
                    🛍️ आवश्यक सामान ({contractor.recommendedMaterials?.length || 0} ब्रांडेड सामग्री)
                  </Text>
                  <Text style={styles.sectionSub}>
                    {contractor.name} द्वारा अनुशंसित सामान (लोकल सप्लायर स्टोर से)
                  </Text>
                </View>
              </View>

              {(!contractor.recommendedMaterials || contractor.recommendedMaterials.length === 0) ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>इस श्रेणी में कोई सामग्री लिस्टेड नहीं है।</Text>
                </View>
              ) : (
                contractor.recommendedMaterials.map((mat) => (
                  <View key={mat.id} style={styles.materialItemCard}>
                    <Image source={{ uri: mat.image }} style={styles.matImage} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.matBrand}>{mat.brand}</Text>
                      <Text style={styles.matName}>{mat.name}</Text>
                      <View style={styles.matPriceRow}>
                        <Text style={styles.matPrice}>₹{mat.sellingPrice}</Text>
                        <Text style={styles.matMrp}>MRP ₹{mat.mrp}</Text>
                        <Text style={styles.matUnit}>({mat.unit})</Text>
                      </View>
                      <Text style={styles.matStore}>🏪 {mat.storeName}</Text>
                      {mat.bulkOffer ? (
                        <Text style={styles.matOffer}>🏷️ {mat.bulkOffer}</Text>
                      ) : null}

                      <TouchableOpacity
                        style={styles.addMatBtn}
                        onPress={() => handleOrderMaterial(mat)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addMatBtnText}>+ सामान जोड़ें (Order)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionDivider} />

            {/* 5. SECTION 4: 📋 ट्रेड-विशिष्ट डिजिटल रेट-कार्ड (Rate Cards) */}
            <View
              style={styles.sectionContainer}
              onLayout={(e) => {
                sectionYOffsets.current['rates'] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#F0FDF4' }]}>
                  <FontAwesome name="id-card" size={16} color="#15803D" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.sectionTitle}>
                    📋 डिजिटल रेट-कार्ड ({contractor.specialtyHindi})
                  </Text>
                  <Text style={styles.sectionSub}>
                    कारीगर द्वारा स्वयं निर्धारित पारदर्शी दरें
                  </Text>
                </View>
              </View>

              {/* Benchmark Trigger Button */}
              <TouchableOpacity
                style={styles.benchmarkBtn}
                activeOpacity={0.85}
                onPress={() => setShowRateSurveyModal(true)}
              >
                <Ionicons name="stats-chart" size={15} color={COLORS.primary} />
                <Text style={styles.benchmarkBtnText}>
                  📊 अखिल भारतीय फेयर रेट सर्वे देखें (UP, Delhi, Mumbai मानक दरें) ➔
                </Text>
              </TouchableOpacity>

              {/* Base Shift Rates */}
              <View style={styles.rateHighlightBox}>
                <View style={styles.rateHighlightRow}>
                  <View>
                    <Text style={styles.rateHighlightTitle}>🟢 1 दिन की दिहाड़ी (8 घंटे शिफ्ट)</Text>
                    <Text style={styles.rateHighlightSub}>मास्टर कारीगर मजदूरी</Text>
                  </View>
                  <Text style={styles.rateHighlightVal}>
                    {contractor.dailyWageRate ? `₹${contractor.dailyWageRate} / दिन` : 'भाव पूछें'}
                  </Text>
                </View>
                <View style={styles.rateDivider} />
                <View style={styles.rateHighlightRow}>
                  <View>
                    <Text style={styles.rateHighlightTitle}>👷 हेल्पर / सहायक की दिहाड़ी</Text>
                    <Text style={styles.rateHighlightSub}>साथ आने वाले हेल्पर का चार्ज</Text>
                  </View>
                  <Text style={styles.rateHighlightVal}>
                    {contractor.helperRate ? `₹${contractor.helperRate} / दिन` : 'भाव पूछें'}
                  </Text>
                </View>
              </View>

              {/* Theka Unit Rates */}
              <View style={styles.thekaListBox}>
                <Text style={styles.thekaListHeader}>
                  📐 ठेका व यूनिट दरें (Unit / Sq.Ft Rates):
                </Text>
                <View style={styles.thekaItem}>
                  <Text style={styles.thekaItemTitle}>मुख्य कार्य यूनिट दर:</Text>
                  <Text style={styles.thekaItemVal}>
                    {contractor.contractUnitRate ? `₹${contractor.contractUnitRate} ${contractor.unitLabel}` : 'भाव पूछें'}
                  </Text>
                </View>

                {contractor.additionalRateCards?.map((item, idx) => (
                  <View key={idx} style={styles.thekaItem}>
                    <Text style={styles.thekaItemTitle}>{item.title}:</Text>
                    <Text style={styles.thekaItemVal}>{item.rate}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* 6. SECTION 5: ⭐ 100% सत्यापित ग्राहक समीक्षाएं (Verified Reviews) */}
            <View
              style={styles.sectionContainer}
              onLayout={(e) => {
                sectionYOffsets.current['reviews'] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.reviewSummaryBox}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreText}>{Number(contractor.rating || 0).toFixed(1)}</Text>
                  <Text style={styles.scoreSub}>/ 5.0</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.reviewSummaryTitle}>100% सत्यापित ग्राहक समीक्षाएं</Text>
                  <Text style={styles.reviewSummarySub}>
                    SETU सुरक्षा गारंटी के तहत काम पूरा होने पर ग्राहकों द्वारा दिए गए रिव्यू
                  </Text>
                </View>
              </View>

              {(!reviewsList || reviewsList.length === 0) ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>अभी तक कोई समीक्षा नहीं है।</Text>
                </View>
              ) : (
                reviewsList.map((rev) => (
                  <View key={rev.id} style={styles.reviewItemCard}>
                    <View style={styles.reviewItemTop}>
                      <View>
                        <Text style={styles.reviewerName}>{rev.customerName}</Text>
                        <Text style={styles.reviewerLocation}>📍 {rev.location}</Text>
                      </View>
                      <View style={styles.starsRow}>
                        {[...Array(5)].map((_, i) => (
                          <FontAwesome
                            key={i}
                            name="star"
                            size={12}
                            color={i < Math.floor(rev.rating) ? COLORS.star : '#CBD5E1'}
                            style={{ marginHorizontal: 1 }}
                          />
                        ))}
                      </View>
                    </View>

                    <View style={styles.workBadgeRow}>
                      <Text style={styles.workDoneBadge}>🔧 काम: {rev.workDone}</Text>
                      <Text style={styles.verifiedJobBadge}>✓ वेरिफाइड वर्क</Text>
                    </View>

                    <Text style={styles.reviewComment}>&ldquo;{rev.comment}&rdquo;</Text>
                    <Text style={styles.reviewDateText}>सत्यापित दिनांक: {rev.date}</Text>
                  </View>
                ))
              )}

              {/* Add Review Action Button */}
              <TouchableOpacity
                style={styles.addReviewActionBtn}
                onPress={() => setShowAddReviewModal(true)}
                activeOpacity={0.85}
              >
                <MaterialIcons name="rate-review" size={18} color="#FFFFFF" />
                <Text style={styles.addReviewActionText}>
                  ✍️ अपना रिव्यू / वीडियो प्रतिक्रिया दें (+50 कॉइन्स)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Sticky Bottom Action Buttons */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => onCallPress(contractor)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color={COLORS.primary} />
              <Text style={styles.callButtonText}>मास्क्ड कॉल</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => {
                onClose();
                onBookPress(contractor);
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="event-available" size={18} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>बुकिंग करें / कोटेशन लें ➔</Text>
            </TouchableOpacity>
          </View>

          {/* Video Player Overlay */}
          {selectedVideo && (
            <VideoPlayerModal
              visible={true}
              video={selectedVideo}
              onClose={() => setSelectedVideo(null)}
            />
          )}

          {/* All-India Rate Survey Index Overlay */}
          {showRateSurveyModal && (
            <RateSurveyModal
              visible={true}
              onClose={() => setShowRateSurveyModal(false)}
              selectedTradeId={contractor.category}
            />
          )}

          {/* Inline Add Review Panel (avoids simultaneous nested Modals on iOS) */}
          {showAddReviewModal && (
            <View style={[styles.addReviewOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }]}>
              <View style={styles.addReviewContainer}>
                <View style={styles.addReviewHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.addReviewTitle}>समीक्षा & अनुभव शेयर करें</Text>
                    <Text style={styles.addReviewSub}>{contractor.name} के काम का मूल्यांकन</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowAddReviewModal(false)} style={{ padding: 4 }}>
                    <MaterialIcons name="close" size={22} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Star rating selector */}
                <Text style={styles.ratingPromptText}>रेटिंग चुनें (1 से 5 स्टार):</Text>
                <View style={styles.starPickerRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setNewRating(s)}
                      style={styles.starPickerBtn}
                    >
                      <FontAwesome
                        name="star"
                        size={28}
                        color={s <= newRating ? COLORS.star : '#CBD5E1'}
                      />
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.starValueText}>{newRating}.0 / 5</Text>
                </View>

                {/* Review Text */}
                <Text style={styles.inputPromptText}>अपनी प्रतिक्रिया लिखें:</Text>
                <TextInput
                  style={styles.reviewTextInput}
                  placeholder="कारीगर का काम, समय की पाबंदी और व्यवहार कैसा रहा?"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />

                {/* Attach Video Testimonial */}
                <TouchableOpacity
                  style={[styles.attachVideoBox, hasAttachedVideo && styles.attachVideoBoxActive]}
                  onPress={() => {
                    setHasAttachedVideo(!hasAttachedVideo);
                    if (!hasAttachedVideo) {
                      showAppAlert('🎥 वीडियो क्लिप जुड़ी', 'ग्राहक वीडियो फीडबैक क्लिप जोड़ दी गई है!');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={hasAttachedVideo ? 'check-circle' : 'video-call'}
                    size={22}
                    color={hasAttachedVideo ? '#059669' : '#D97706'}
                  />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.attachVideoTitle}>
                      {hasAttachedVideo ? '✓ वीडियो टेस्टिमोनियल जुड़ा हुआ है' : '+ 15 सेकंड का वीडियो रिव्यू जोड़ें'}
                    </Text>
                    <Text style={styles.attachVideoSub}>
                      {hasAttachedVideo ? 'काम की संतुष्टि पर 50 अतिरिक्त कॉइन्स' : 'काम पूरा होने के बाद वीडियो रिकॉर्डिंग अपलोड करें'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Submit button */}
                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  onPress={handleSubmitReview}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitReviewBtnText}>समीक्षा पोस्ट करें ➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.cardBg,
    height: '92%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginHorizontal: 10,
  },
  etaBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  etaText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  stickyTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 2,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  tabButtonText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  topInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  specialtyText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bioText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 10,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  skillTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  availBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    gap: 6,
  },
  availBannerText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  portfolioCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  portfolioImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  portfolioInfo: {
    padding: 12,
  },
  photoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  photoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  photoDate: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  photoDesc: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  videoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  videoThumbWrapper: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#000000',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  playButtonCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  videoDurationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  videoCardBody: {
    padding: 12,
  },
  videoBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  videoTypeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoTypeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  videoDateText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  videoCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  videoCardAuthor: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bundleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  bundleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
  },
  bundleSub: {
    fontSize: 10,
    color: '#9A3412',
    marginTop: 1,
  },
  materialItemCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  matImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  matBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  matName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  matPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 3,
  },
  matPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  matMrp: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  matUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  matStore: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  matOffer: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '700',
    marginTop: 2,
  },
  addMatBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
  },
  addMatBtnText: {
    color: '#C2410C',
    fontSize: 10.5,
    fontWeight: '800',
  },
  benchmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  benchmarkBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
  },
  rateHighlightBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  rateHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateHighlightTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rateHighlightSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  rateHighlightVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rateDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  thekaListBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  thekaListHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  thekaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  thekaItemTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  thekaItemVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reviewSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  scoreSub: {
    color: '#FFFFFF',
    fontSize: 8.5,
  },
  reviewSummaryTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  reviewSummarySub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  reviewItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  reviewItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reviewerLocation: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  starsRow: {
    flexDirection: 'row',
  },
  workBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  workDoneBadge: {
    backgroundColor: '#EFF6FF',
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedJobBadge: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    fontSize: 9.5,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewComment: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  reviewDateText: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  callButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  bookButton: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  addReviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  addReviewActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  addReviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  addReviewContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 30,
  },
  addReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  addReviewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addReviewSub: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  ratingPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  starPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  starPickerBtn: {
    padding: 2,
  },
  starValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 8,
  },
  inputPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  reviewTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  attachVideoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    marginBottom: 16,
  },
  attachVideoBoxActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  attachVideoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  attachVideoSub: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

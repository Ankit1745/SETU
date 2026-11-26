import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { ApiService } from '../services/api';
import { Language } from '../i18n/translations';
import { showAppAlert } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

interface KycApplication {
  id: string;
  name: string;
  role: 'CONTRACTOR' | 'VENDOR';
  tradeOrShop: string;
  phone: string;
  rawPhone?: string;
  docNumber: string;
  docFilePath?: string;
  appliedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DisputeCase {
  id: string;
  customerName: string;
  contractorName: string;
  jobTitle: string;
  escrowAmount: number;
  issueDescription: string;
  status: 'OPEN' | 'RESOLVED' | 'REFUNDED';
}

const INITIAL_KYC_APPLICATIONS: KycApplication[] = [
  {
    id: 'kyc_1',
    name: 'दीपक कश्यप',
    role: 'CONTRACTOR',
    tradeOrShop: 'राजमिस्त्री & टाइल्स कारीगर (8 साल अनुभव)',
    phone: '+91 98XXX-XX410',
    docNumber: 'आधार: XXXX-XXXX-4912 (सत्यापित)',
    appliedDate: 'आज, 2 घंटे पहले',
    status: 'PENDING',
  },
  {
    id: 'kyc_2',
    name: 'अग्रवाल पेंट्स & सेनेटरी हाउस',
    role: 'VENDOR',
    tradeOrShop: 'हार्डवेयर & पेंट्स रिटेल स्टोर',
    phone: '+91 94XXX-XX881',
    docNumber: 'GSTIN: 09AAACA8821F1ZX',
    appliedDate: 'आज, 4 घंटे पहले',
    status: 'PENDING',
  },
];

const INITIAL_DISPUTES: DisputeCase[] = [
  {
    id: 'disp_1',
    customerName: 'सुनीता त्रिपाठी (ग्रीन पार्क)',
    contractorName: 'सोनू वर्मा (पेंटर)',
    jobTitle: '3BHK बालकनी वाटरप्रूफिंग',
    escrowAmount: 6400,
    issueDescription: 'ग्राहक का कहना है कि पुट्टी में एक जगह दरार दिख रही है, पेंटर कह रहा है कि प्लास्टर पुराना था।',
    status: 'OPEN',
  },
];

export const AdminDashboard: React.FC<{ language?: Language }> = ({ language: _language = 'hi' }) => {
  const [kycList, setKycList] = useState<KycApplication[]>(INITIAL_KYC_APPLICATIONS);
  const [disputes, setDisputes] = useState<DisputeCase[]>(INITIAL_DISPUTES);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);

  const applyAdminPayload = useCallback((data: any) => {
    setLiveMetrics(data.metrics || {});
    if (Array.isArray(data.kycApplications)) {
      const mapped: KycApplication[] = data.kycApplications.map((k: any) => ({
        id: k._id || k.id || k.customId,
        name: k.name,
        role: k.role || 'CONTRACTOR',
        tradeOrShop: k.tradeOrShop || 'पंजीकृत भागीदार',
        phone: k.phone ? `+91 ${k.phone}` : 'फोन उपलब्ध नहीं',
        rawPhone: k.phone || '',
        docNumber: k.docNumber || 'पहचान पत्र विचाराधीन',
        docFilePath: k.docFilePath || '',
        appliedDate: k.createdAt ? new Date(k.createdAt).toLocaleDateString('hi-IN') : (k.appliedDate || 'आज'),
        status: k.status || 'PENDING',
      }));
      setKycList(mapped);
    }
    if (Array.isArray(data.disputes) && data.disputes.length > 0) {
      setDisputes(
        data.disputes.map((d: any) => ({
          id: d._id || d.id || d.customId,
          customerName: d.customerName,
          contractorName: d.contractorName,
          jobTitle: d.jobTitle,
          escrowAmount: Number(d.escrowAmount) || 0,
          issueDescription: d.issueDescription,
          status: d.status || 'OPEN',
        }))
      );
    }
  }, []);

  const loadLiveMetrics = useCallback(async () => {
    try {
      const data = await ApiService.getAdminMetrics();
      if (data && data.success) {
        applyAdminPayload(data);
      }
    } catch (err) {
      console.log('Error loading admin metrics:', err);
    }
  }, [applyAdminPayload]);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await ApiService.getAdminMetrics();
        if (!cancelled && data && data.success) {
          applyAdminPayload(data);
        }
      } catch {
        // non-fatal polling error
      }
    };
    void poll();
    const interval = setInterval(poll, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [applyAdminPayload]);

  const handleApproveKyc = async (item: KycApplication) => {
    const res = await ApiService.actionKyc(item.id, 'APPROVED', item.rawPhone);
    if (!res || !res.success) {
      showAppAlert('KYC त्रुटि', res?.error || 'सर्वर से KYC स्वीकृति नहीं हो सकी।');
      return;
    }
    setKycList((prev) => prev.map((k) => (k.id === item.id ? { ...k, status: 'APPROVED' } : k)));
    showAppAlert('✅ KYC स्वीकृत!', `${item.name} को वेरीफाइड 'ब्लू टिक' और लाइव आईडी कार्ड जारी कर दिया गया है।`);
  };

  const handleRejectKyc = async (item: KycApplication) => {
    const res = await ApiService.actionKyc(item.id, 'REJECTED', item.rawPhone);
    if (!res || !res.success) {
      showAppAlert('KYC त्रुटि', res?.error || 'सर्वर से KYC अस्वीकृति नहीं हो सकी।');
      return;
    }
    setKycList((prev) => prev.map((k) => (k.id === item.id ? { ...k, status: 'REJECTED' } : k)));
    showAppAlert('KYC अस्वीकृत', `${item.name} का आवेदन अस्वीकृत कर दिया गया है।`);
  };

  const handleResolveDispute = async (id: string) => {
    const res = await ApiService.resolveDispute(id, 'RESOLVED');
    if (res && res.success === false) {
      showAppAlert('त्रुटि', res.error || 'विवाद सर्वर पर अपडेट नहीं हो सका।');
      return;
    }
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'RESOLVED' } : d)));
    showAppAlert(
      '⚖️ विवाद मध्यस्थता पूर्ण!',
      'SETU फील्ड सुपरवाइजर ने मामले का निपटान और एस्क्रो सेटलमेंट रिकॉर्ड कर दिया है।'
    );
  };

  const gpv = liveMetrics?.grossPlatformVolume ?? 0;
  const commission = liveMetrics?.platformCommissionEarned ?? 0;
  const escrowHeld = liveMetrics?.escrowFundsHeld ?? 0;
  const totalUsersCount = liveMetrics?.totalUsers ?? 0;
  const totalBookingsCount = liveMetrics?.totalBookings ?? 0;
  const { isSplitDesktop, horizontalPadding, shellStyle } = useResponsive();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: horizontalPadding, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={shellStyle}>
        {/* Admin Super Badge Header */}
        <View style={styles.adminHeaderCard}>
          <View style={styles.adminTopRow}>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.adminBadgeText}>SETU केंद्रीय एडमिन नियंत्रण कक्ष (Admin Hub)</Text>
            </View>
          </View>
          <Text style={styles.adminDesc}>
            KYC सत्यापन, एस्क्रो फंड्स सुरक्षा, प्लेटफॉर्म फीस (₹35 / 5%) और विवाद मध्यस्थता।
          </Text>
        </View>

        {/* Financial Metrics Grid (Live DB Values) — 4 columns on desktop, 2x2 on mobile/tablet */}
        <View style={[styles.metricsGridWrap, isSplitDesktop && styles.metricsGridDesktop]}>
          <View style={[styles.metricCard, isSplitDesktop ? styles.metricCardQuarter : styles.metricCardHalf]}>
            <Text style={styles.metricLabel}>सकल व्यापार (GPV)</Text>
            <Text style={styles.metricValue}>₹{gpv.toLocaleString('en-IN')}</Text>
            <Text style={styles.metricSub}>{totalBookingsCount} कुल बुकिंग्स मूल्य</Text>
          </View>

          <View style={[styles.metricCard, isSplitDesktop ? styles.metricCardQuarter : styles.metricCardHalf]}>
            <Text style={styles.metricLabel}>SETU प्लेटफॉर्म शुल्क</Text>
            <Text style={[styles.metricValue, { color: COLORS.accent }]}>₹{commission.toLocaleString('en-IN')}</Text>
            <Text style={styles.metricSub}>₹35 कैश / 5% एस्क्रो</Text>
          </View>

          <View style={[styles.metricCard, isSplitDesktop ? styles.metricCardQuarter : styles.metricCardHalf]}>
            <Text style={styles.metricLabel}>एस्क्रो में सुरक्षित राशि</Text>
            <Text style={[styles.metricValue, { color: COLORS.primary }]}>₹{escrowHeld.toLocaleString('en-IN')}</Text>
            <Text style={styles.metricSub}>सक्रिय बुकिंग टोकन होल्ड</Text>
          </View>

          <View style={[styles.metricCard, isSplitDesktop ? styles.metricCardQuarter : styles.metricCardHalf]}>
            <Text style={styles.metricLabel}>पंजीकृत उपयोगकर्ता व पार्टनर</Text>
            <Text style={styles.metricValue}>
              {totalUsersCount} पंजीकृत
            </Text>
            <Text style={styles.metricSub}>लाइव डेटाबेस गणना</Text>
          </View>
        </View>

        {/* Dual Workspace: KYC Desk & Dispute Arbitration side-by-side on Desktop */}
        <View style={isSplitDesktop ? styles.adminColumnsDesktop : undefined}>
          {/* KYC Verification Queue */}
          <View style={[styles.sectionCard, isSplitDesktop && { flex: 1 }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="verified-user" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>
              KYC सत्यापन डेस्क ({kycList.filter((k) => k.status === 'PENDING').length} लंबित)
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshPill}
            onPress={loadLiveMetrics}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={13} color="#FFFFFF" />
            <Text style={styles.refreshPillText}>लाइव रिफ्रेश</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>नए कारीगरों व दुकानों के आधार/GST सत्यापन की समीक्षा करें:</Text>

        {kycList.map((item) => (
          <View key={item.id} style={styles.kycCard}>
            <View style={styles.kycTopRow}>
              <View>
                <Text style={styles.kycName}>{item.name}</Text>
                <Text style={styles.kycTrade}>{item.tradeOrShop}</Text>
                <Text style={styles.kycDoc}>{item.docNumber}</Text>
                <Text style={styles.kycDate}>आवेदन: {item.appliedDate}</Text>
              </View>
              <View
                style={[
                  styles.kycStatusBadge,
                  {
                    backgroundColor:
                      item.status === 'APPROVED'
                        ? '#DCFCE7'
                        : item.status === 'REJECTED'
                        ? '#FEE2E2'
                        : '#FEF3C7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.kycStatusText,
                    {
                      color:
                        item.status === 'APPROVED'
                          ? '#15803D'
                          : item.status === 'REJECTED'
                          ? '#B91C1C'
                          : '#B45309',
                    },
                  ]}
                >
                  {item.status === 'APPROVED'
                    ? '✓ स्वीकृत'
                    : item.status === 'REJECTED'
                    ? '✗ अस्वीकृत'
                    : '⏳ समीक्षाधीन'}
                </Text>
              </View>
            </View>

            {item.docFilePath ? (
              <TouchableOpacity
                style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => showAppAlert('🔒 प्राइवेट KYC दस्तावेज', `फ़ाइल रेफ़रेंस: ${item.docFilePath}\n\nयह फ़ाइल सुरक्षित /uploads/private वॉल्ट में संग्रहीत है।`)}
              >
                <Ionicons name="document-lock-outline" size={14} color={COLORS.primary} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>
                  दस्तावेज़ रेफ़रेंस देखें ({item.docFilePath})
                </Text>
              </TouchableOpacity>
            ) : null}

            {item.status === 'PENDING' && (
              <View style={styles.kycActionsRow}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleRejectKyc(item)}
                >
                  <Text style={styles.rejectBtnText}>अस्वीकार</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApproveKyc(item)}
                >
                  <Text style={styles.approveBtnText}>सत्यापित करें & ब्लू टिक दें ✓</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Dispute Arbitration Desk */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="scale" size={18} color="#C2410C" />
            <Text style={styles.sectionTitle}>
              विवाद मध्यस्थता डेस्क (Dispute Arbitration)
            </Text>
          </View>
        </View>
        <Text style={styles.sectionSub}>
          ग्राहक और कारीगर के बीच विवाद में निष्पक्ष फैसला और एस्क्रो फंड्स सेटलमेंट:
        </Text>

        {disputes.map((d) => (
          <View key={d.id} style={styles.disputeCard}>
            <View style={styles.disputeTopRow}>
              <Text style={styles.disputeJob}>{d.jobTitle}</Text>
              <Text style={styles.disputeAmount}>एस्क्रो: ₹{d.escrowAmount}</Text>
            </View>

            <Text style={styles.disputeParties}>
              👤 ग्राहक: {d.customerName} • 🔨 कारीगर: {d.contractorName}
            </Text>
            <Text style={styles.disputeDesc}>शिकायत: &ldquo;{d.issueDescription}&rdquo;</Text>

            {d.status === 'OPEN' ? (
              <TouchableOpacity
                style={styles.resolveBtn}
                onPress={() => handleResolveDispute(d.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.resolveBtnText}>
                  ⚖️ फील्ड सुपरवाइजर भेजकर विवाद निपटाएं ➔
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedBadgeText}>✓ विवाद सुलझ चुका है (Funds Settled)</Text>
              </View>
            )}
          </View>
        ))}
      </View>
        </View>
        {/* SETU Self-Learning AI, Customer Demand & Multi-Provider Health Desk */}
        {liveMetrics?.aiLearning ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="hardware-chip" size={18} color="#7C3AED" />
                <Text style={styles.sectionTitle}>
                  🧠 SETU स्व-शिक्षण AI & ग्राहक मांग विश्लेषण (Self-Learning Brain)
                </Text>
              </View>
              <View style={[styles.kycStatusBadge, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[styles.kycStatusText, { color: '#6D28D9' }]}>
                  संतुष्टि: {liveMetrics.aiLearning.satisfactionPercent ?? 100}% ({liveMetrics.aiLearning.totalLikes || 0}👍 / {liveMetrics.aiLearning.totalDislikes || 0}👎)
                </Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>
              कुल ग्राहक संवाद: {liveMetrics.aiLearning.totalInteractions || 0} • AI अपने आप ग्राहक की पसंद और सबसे तेज़ फ्री इंजन सीखता है:
            </Text>

            {/* Top Demands */}
            {Array.isArray(liveMetrics.aiLearning.topDemands) && liveMetrics.aiLearning.topDemands.length > 0 ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.kycTrade, { fontWeight: '700', marginBottom: 4 }]}>
                  🔥 ग्राहक सबसे ज़्यादा क्या चाहते हैं:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {liveMetrics.aiLearning.topDemands.map((d: any) => (
                    <View key={d.projectType} style={[styles.kycStatusBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.kycStatusText, { color: '#92400E' }]}>
                        {d.projectType} ({d.count} बार)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Recent Anonymized Customer Feedback / Changes */}
            {Array.isArray(liveMetrics.aiLearning.recentFeedbackThemes) && liveMetrics.aiLearning.recentFeedbackThemes.length > 0 ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.kycTrade, { fontWeight: '700', marginBottom: 4 }]}>
                  💬 हाल के ग्राहक सुझाव व बदलाव अनुरोध:
                </Text>
                {liveMetrics.aiLearning.recentFeedbackThemes.slice(0, 4).map((note: any, nIdx: number) => (
                  <Text key={nIdx} style={[styles.kycDate, { fontSize: 10.5, color: '#334155', marginBottom: 2 }]}>
                    • {note.text}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* Multi-Provider Live Failover Health */}
            {Array.isArray(liveMetrics.aiLearning.engineHealth) && liveMetrics.aiLearning.engineHealth.length > 0 ? (
              <View>
                <Text style={[styles.kycTrade, { fontWeight: '700', marginBottom: 4 }]}>
                  ⚡ मल्टी-इंजन ऑटो स्विच स्टेटस (Chat / Image / In-Photo):
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {liveMetrics.aiLearning.engineHealth.map((eh: any) => {
                    const isHealthy = eh.status === 'HEALTHY' || eh.status === 'READY';
                    return (
                      <View
                        key={eh.key}
                        style={[
                          styles.kycStatusBadge,
                          { backgroundColor: isHealthy ? '#DCFCE7' : '#FEE2E2' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.kycStatusText,
                            { color: isHealthy ? '#15803D' : '#B91C1C' },
                          ]}
                        >
                          {isHealthy ? '● ' : '⏳ '}
                          {eh.providerId} ({eh.successes}✓/{eh.failures}✗
                          {eh.avgLatencyMs > 0 ? ` • ${Math.round(eh.avgLatencyMs / 100) / 10}s` : ''})
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  metricsGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metricsGridDesktop: {
    gap: 12,
  },
  metricCardHalf: {
    width: '48.2%',
  },
  metricCardQuarter: {
    width: '23.8%',
  },
  adminColumnsDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  adminHeaderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  adminTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  adminDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metricCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  metricSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refreshPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  kycCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  kycTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kycName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  kycTrade: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  kycDoc: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  kycDate: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  kycStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  kycStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  kycActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rejectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  disputeCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 10,
  },
  disputeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disputeJob: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  disputeAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
  },
  disputeParties: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  disputeDesc: {
    fontSize: 11,
    color: '#9A3412',
    lineHeight: 16,
    marginTop: 4,
    fontStyle: 'italic',
  },
  resolveBtn: {
    backgroundColor: '#C2410C',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  resolveBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  resolvedBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  resolvedBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
});

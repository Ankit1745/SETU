import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { ApiService } from '../services/api';

interface KycApplication {
  id: string;
  name: string;
  role: 'CONTRACTOR' | 'VENDOR';
  tradeOrShop: string;
  phone: string;
  docNumber: string;
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
  status: 'OPEN' | 'RESOLVED';
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

export const AdminDashboard: React.FC = () => {
  const [kycList, setKycList] = useState<KycApplication[]>(INITIAL_KYC_APPLICATIONS);
  const [disputes, setDisputes] = useState<DisputeCase[]>(INITIAL_DISPUTES);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);

  useEffect(() => {
    loadLiveMetrics();
    // Auto-poll every 6 seconds so incoming registrations appear in real-time
    const interval = setInterval(loadLiveMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadLiveMetrics = async () => {
    try {
      const data = await ApiService.getAdminMetrics();
      if (data && data.success) {
        setLiveMetrics(data);
        if (data.kycApplications && data.kycApplications.length > 0) {
          const mapped: KycApplication[] = data.kycApplications.map((k: any) => ({
            id: k._id || k.id || k.customId,
            name: k.name,
            role: k.role || 'CONTRACTOR',
            tradeOrShop: k.tradeOrShop || 'पंजीकृत भागीदार',
            phone: k.phone ? `+91 ${k.phone}` : 'फोन उपलब्ध नहीं',
            docNumber: k.docNumber || 'पहचान पत्र विचाराधीन',
            appliedDate: k.createdAt ? new Date(k.createdAt).toLocaleDateString('hi-IN') : 'आज',
            status: k.status || 'PENDING',
          }));
          setKycList(mapped);
        }
      }
    } catch (err) {
      console.log('Error loading admin metrics:', err);
    }
  };

  const handleApproveKyc = async (id: string, name: string) => {
    setKycList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'APPROVED' } : k))
    );
    try {
      await ApiService.actionKyc(id, 'APPROVED');
    } catch (err) {
      // handled
    }
    Alert.alert('✅ KYC स्वीकृत!', `${name} को वेरीफाइड 'ब्लू टिक' और लाइव आईडी कार्ड जारी कर दिया गया है।`);
  };

  const handleRejectKyc = async (id: string, name: string) => {
    setKycList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'REJECTED' } : k))
    );
    try {
      await ApiService.actionKyc(id, 'REJECTED');
    } catch (err) {
      // handled
    }
    Alert.alert('KYC अस्वीकृत', `${name} का आवेदन अस्वीकृत कर दिया गया है।`);
  };

  const handleResolveDispute = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'RESOLVED' } : d))
    );
    Alert.alert(
      '⚖️ विवाद मध्यस्थता पूर्ण!',
      'SETU फील्ड सुपरवाइजर ने साइट का मुआयना किया। कारीगर द्वारा टचअप कराने पर 80% भुगतान कारीगर को और 20% ग्राहक को डिस्काउंट सेटल कर दिया गया।'
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Admin Super Badge Header */}
      <View style={styles.adminHeaderCard}>
        <View style={styles.adminTopRow}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>SETU केंद्रीय एडमिन नियंत्रण कक्ष (Admin Hub)</Text>
          </View>
        </View>
        <Text style={styles.adminDesc}>
          KYC सत्यापन, एस्क्रो फंड्स सुरक्षा, 6% कमीशन रेवेन्यू और विवाद मध्यस्थता।
        </Text>
      </View>

      {/* Financial Metrices Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>सकल व्यापार (GPV)</Text>
          <Text style={styles.metricValue}>₹14,80,000</Text>
          <Text style={styles.metricSub}>इस माह कुल प्रोजेक्ट वैल्यू</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>SETU कमीशन (6%)</Text>
          <Text style={[styles.metricValue, { color: COLORS.accent }]}>₹88,800</Text>
          <Text style={styles.metricSub}>नेट प्लेटफॉर्म कमाई</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>एस्क्रो में सुरक्षित राशि</Text>
          <Text style={[styles.metricValue, { color: COLORS.primary }]}>₹4,12,500</Text>
          <Text style={styles.metricSub}>माइलस्टोन रिलीज हेतु होल्ड</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>एक्टिव कारीगर & दुकानें</Text>
          <Text style={styles.metricValue}>
            {liveMetrics?.totalUsers ? `${liveMetrics.totalUsers} पंजीकृत` : '342 / 86'}
          </Text>
          <Text style={styles.metricSub}>सत्यापित नेटवर्क</Text>
        </View>
      </View>

      {/* KYC Verification Queue */}
      <View style={styles.sectionCard}>
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

            {item.status === 'PENDING' && (
              <View style={styles.kycActionsRow}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleRejectKyc(item.id, item.name)}
                >
                  <Text style={styles.rejectBtnText}>अस्वीकार</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApproveKyc(item.id, item.name)}
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
            <Text style={styles.disputeDesc}>शिकायत: "{d.issueDescription}"</Text>

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

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
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
    flex: 1,
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

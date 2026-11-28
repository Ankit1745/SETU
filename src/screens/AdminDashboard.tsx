import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { ApiService } from '../services/api';
import { Language } from '../i18n/translations';
import { showAppAlert, showAppToast } from '../utils/appAlert';
import { useResponsive } from '../hooks/useResponsive';

type AdminTab = 'OVERVIEW' | 'SYSTEM_APIS' | 'DIRECTORY' | 'HERO_AI';

interface HeroMessage {
  id: string;
  role: 'user' | 'hero';
  text: string;
  actions?: { id: string; label: string }[];
  score?: number;
}

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

export const AdminDashboard: React.FC<{ language?: Language }> = ({ language: _language = 'hi' }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [kycList, setKycList] = useState<KycApplication[]>([]);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [systemControl, setSystemControl] = useState<any>(null);
  const [smsBalanceData, setSmsBalanceData] = useState<any>(null);
  const [loadingControl, setLoadingControl] = useState(false);

  // Admin Notification Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'CUSTOMER' | 'CONTRACTOR' | 'VENDOR'>('ALL');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Exclusive Private Admin Personal AI ("SETU-HERO") state
  const [heroInput, setHeroInput] = useState('');
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroMessages, setHeroMessages] = useState<HeroMessage[]>([
    {
      id: 'hero_welcome',
      role: 'hero',
      text: '🛡️ नमस्ते एडमिन! मैं **SETU-HERO** हूँ — आपका प्राइवेट पर्सनल वेबसाइट कंट्रोल AI (केवल आपके लिए आरक्षित)।\n\nमुझसे पूरी वेबसाइट का सुरक्षा ऑडिट, लाइव बग/API जांच, खाते-एस्क्रो हिसाब, SMS बैलेंस या आगे का डेवलपमेंट प्लान पूछें।',
    },
  ]);

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

  const loadSystemControl = useCallback(async () => {
    setLoadingControl(true);
    try {
      const res = await ApiService.getAdminSystemControl();
      if (res && res.success) {
        setSystemControl(res);
      }
    } catch (err) {
      console.log('System control load error:', err);
    } finally {
      setLoadingControl(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const [data, ctrl] = await Promise.all([
          ApiService.getAdminMetrics(),
          ApiService.getAdminSystemControl(),
        ]);
        if (!cancelled && data && data.success) {
          applyAdminPayload(data);
        }
        if (!cancelled && ctrl && ctrl.success) {
          setSystemControl(ctrl);
        }
      } catch {
        // non-fatal polling error
      }
    };
    void poll();
    const interval = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [applyAdminPayload]);

  const handleCheckSmsBalance = async () => {
    const res = await ApiService.getAdminSmsStatus();
    setSmsBalanceData(res);
    if (res?.fast2sms?.balance !== null && res?.fast2sms?.balance !== undefined) {
      showAppToast('💰 Fast2SMS वॉलेट जांच', `वर्तमान बैलेंस: ₹${res.fast2sms.balance}`, 'success');
    } else if (res?.twoFactor?.balance !== null && res?.twoFactor?.balance !== undefined) {
      showAppToast('💰 2Factor SMS बैलेंस', `बैलेंस: ${res.twoFactor.balance}`, 'success');
    } else {
      showAppAlert('SMS गेटवे स्थिति', res?.fast2sms?.error || res?.twoFactor?.error || 'लाइव बैलेंस जांच पूरी हुई।');
    }
  };

  const handleResetAiCircuits = async () => {
    const res = await ApiService.resetAdminAiCircuits();
    if (res?.success) {
      showAppToast('⚡ AI सर्किट रीसेट', 'सभी बाहरी व इन-हाउस AI प्रोवाइडर व कैश रीसेट हुए।', 'success');
      void loadLiveMetrics();
      void loadSystemControl();
    } else {
      showAppAlert('त्रुटि', res?.error || 'AI सर्किट रीसेट नहीं हो सके।');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) {
      showAppAlert('अधूरी जानकारी', 'कृपया नोटिफिकेशन शीर्षक और संदेश दोनों भरें।');
      return;
    }
    setSendingBroadcast(true);
    try {
      const res = await ApiService.broadcastAdminNotification({
        title: broadcastTitle.trim(),
        message: broadcastMsg.trim(),
        targetRole: broadcastTarget,
      });
      if (res?.success) {
        setBroadcastTitle('');
        setBroadcastMsg('');
        showAppToast('📢 ब्रॉडकास्ट भेजा गया!', `लक्ष्य: ${broadcastTarget} को लाइव नोटिफिकेशन जारी हुआ।`, 'success');
      } else {
        showAppAlert('त्रुटि', res?.error || 'नोटिफिकेशन नहीं भेजा जा सका।');
      }
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleAskHeroAI = async (queryText?: string, executeAction?: string) => {
    const cmd = (queryText ?? heroInput).trim();
    if (!cmd && !executeAction) return;
    if (executeAction === 'CHECK_SMS_BALANCE') {
      await handleCheckSmsBalance();
    }
    const userMsgText = cmd || `कार्रवाई: ${executeAction}`;
    setHeroMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, role: 'user', text: userMsgText },
    ]);
    if (!queryText) setHeroInput('');
    setHeroLoading(true);
    try {
      const res = await ApiService.askAdminHeroAI(cmd || 'system audit', executeAction);
      if (res?.success) {
        setHeroMessages((prev) => [
          ...prev,
          {
            id: `h_${Date.now()}`,
            role: 'hero',
            text: res.replyText,
            actions: res.actions || [],
            score: res.audit?.overallScore,
          },
        ]);
        if (executeAction === 'RESET_AI_CIRCUITS' || executeAction === 'RUN_DEEP_AUDIT') {
          void loadSystemControl();
        }
      } else {
        showAppAlert('SETU-HERO त्रुटि', res?.error || 'एडमिन AI से संपर्क नहीं हो सका।');
      }
    } finally {
      setHeroLoading(false);
    }
  };

  const handleDeleteDirectoryItem = (kind: 'contractor' | 'material' | 'user', id: string, label: string) => {
    showAppAlert(
      '🗑️ हटाने की पुष्टि',
      `क्या आप वाकई "${label}" को स्थायी रूप से हटाना चाहते हैं?`,
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'हटाएं',
          style: 'destructive',
          onPress: async () => {
            const res =
              kind === 'contractor'
                ? await ApiService.deleteAdminContractor(id)
                : kind === 'material'
                ? await ApiService.deleteAdminMaterial(id)
                : await ApiService.deleteAdminUser(id);
            if (res?.success) {
              showAppToast('हटाया गया', `${label} डेटाबेस से हटा दिया गया।`, 'success');
              void loadSystemControl();
              void loadLiveMetrics();
            } else {
              showAppAlert('त्रुटि', res?.error || 'आइटम नहीं हटाया जा सका।');
            }
          },
        },
      ]
    );
  };

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
            सभी API एक्सेस (MongoDB, Cloudinary, Firebase, Fast2SMS, Python AI), KYC, एस्क्रो व आपका प्राइवेट SETU-HERO AI।
          </Text>
          {/* Exclusive 4-Tab Control Switcher */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={styles.adminTabsRow}>
              {[
                { key: 'OVERVIEW' as AdminTab, label: '📊 अवलोकन & KYC' },
                { key: 'SYSTEM_APIS' as AdminTab, label: '🔑 API व सिस्टम हब' },
                { key: 'DIRECTORY' as AdminTab, label: '🗂️ डेटाबेस व ब्रॉडकास्ट' },
                { key: 'HERO_AI' as AdminTab, label: '🤖 SETU-HERO AI' },
              ].map((tb) => {
                const isActive = activeTab === tb.key;
                return (
                  <TouchableOpacity
                    key={tb.key}
                    style={[
                      styles.adminTabBtn,
                      isActive && styles.adminTabBtnActive,
                      tb.key === 'HERO_AI' && !isActive && styles.adminTabBtnHero,
                    ]}
                    onPress={() => {
                      setActiveTab(tb.key);
                      if (tb.key !== 'OVERVIEW') void loadSystemControl();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.adminTabText, isActive && styles.adminTabTextActive]}>
                      {tb.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* TAB 2: COMPLETE API & SYSTEM CONTROL VAULT */}
        {activeTab === 'SYSTEM_APIS' && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="hardware-chip" size={18} color="#2563EB" />
                <Text style={styles.sectionTitle}>सभी API व सर्वर एक्सेस कंट्रोल</Text>
              </View>
              <TouchableOpacity style={styles.refreshPill} onPress={loadSystemControl}>
                <Ionicons name="refresh" size={13} color="#FFFFFF" />
                <Text style={styles.refreshPillText}>{loadingControl ? 'लोडिंग...' : 'स्कैन करें'}</Text>
              </TouchableOpacity>
            </View>

            {systemControl?.integrations ? (
              <View style={{ gap: 10, marginTop: 6 }}>
                {[
                  {
                    name: '🍃 MongoDB Atlas क्लाउड डेटाबेस',
                    ok: systemControl.integrations.mongodb.connected,
                    detail: `${systemControl.integrations.mongodb.engine} • Host: ${systemControl.integrations.mongodb.host}`,
                  },
                  {
                    name: '☁️ Cloudinary Cloud CDN (फ़ोटो/KYC वॉल्ट)',
                    ok: systemControl.integrations.cloudinary.configured,
                    detail: `Cloud: ${systemControl.integrations.cloudinary.cloudName} • Key: ${systemControl.integrations.cloudinary.maskedKey || 'Not Set'}`,
                  },
                  {
                    name: '🔥 Firebase Auth (Google + Email Verification)',
                    ok: systemControl.integrations.firebase.configured,
                    detail: `Project ID: ${systemControl.integrations.firebase.projectId}`,
                  },
                  {
                    name: '📲 Fast2SMS / 2Factor OTP गेटवे',
                    ok: systemControl.integrations.sms.configured,
                    detail: `Provider: ${systemControl.integrations.sms.provider} • Route: ${systemControl.integrations.sms.route} • Key: ${systemControl.integrations.sms.maskedKey || 'Not Set'}`,
                  },
                  {
                    name: '🧠 SETU Self-Dependent AI + Python इंजन',
                    ok: systemControl.integrations.python.ok,
                    detail: `Runtime: ${systemControl.integrations.python.runtime} • Gemini: ${systemControl.integrations.ai.geminiConfigured ? systemControl.integrations.ai.geminiMasked : 'Offline Ready'} • Cache: ${systemControl.integrations.ai.cacheEntries}`,
                  },
                  {
                    name: '🔐 JWT सुरक्षा टोकन शील्ड',
                    ok: systemControl.integrations.jwt.strong,
                    detail: systemControl.integrations.jwt.strong ? '256-bit Strong Production Key Active' : 'Weak/Dev Secret Warning',
                  },
                ].map((srv, idx) => (
                  <View key={idx} style={styles.apiStatusCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.apiName}>{srv.name}</Text>
                      <Text style={styles.apiDetail}>{srv.detail}</Text>
                    </View>
                    <View style={[styles.kycStatusBadge, { backgroundColor: srv.ok ? '#DCFCE7' : '#FEF3C7' }]}>
                      <Text style={[styles.kycStatusText, { color: srv.ok ? '#15803D' : '#B45309' }]}>
                        {srv.ok ? '● ACTIVE' : '⚠️ CHECK'}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Admin Instant Action Controls */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  <TouchableOpacity style={styles.adminActionBtn} onPress={handleCheckSmsBalance}>
                    <Text style={styles.adminActionBtnText}>💰 Fast2SMS लाइव बैलेंस जांचें</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.adminActionBtn, { backgroundColor: '#7C3AED' }]}
                    onPress={handleResetAiCircuits}
                  >
                    <Text style={styles.adminActionBtnText}>⚡ AI सर्किट व कैश रीसेट</Text>
                  </TouchableOpacity>
                </View>

                {smsBalanceData && (
                  <View style={styles.smsBalBox}>
                    <Text style={styles.apiName}>लाइव SMS गेटवे जांच परिणाम:</Text>
                    <Text style={styles.apiDetail}>
                      Fast2SMS: {smsBalanceData.fast2sms?.balance !== null ? `₹${smsBalanceData.fast2sms.balance}` : smsBalanceData.fast2sms?.error || 'N/A'} | 2Factor: {smsBalanceData.twoFactor?.balance ?? (smsBalanceData.twoFactor?.error || 'N/A')}
                    </Text>
                  </View>
                )}

                {/* Runtime Logs */}
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.sectionTitle}>🪵 हालिया सर्वर व सुरक्षा लॉग ({(systemControl.runtimeErrors || []).length})</Text>
                  {(systemControl.runtimeErrors || []).length === 0 ? (
                    <Text style={[styles.sectionSub, { marginTop: 4, color: '#15803D' }]}>
                      ✅ अभी तक कोई रनटाइम सर्वर त्रुटि दर्ज नहीं हुई।
                    </Text>
                  ) : (
                    (systemControl.runtimeErrors || []).slice(0, 8).map((lg: any, i: number) => (
                      <Text key={i} style={styles.logLineText}>
                        [{lg.time}] {lg.route} — {lg.message}
                      </Text>
                    ))
                  )}
                </View>
              </View>
            ) : (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
            )}
          </View>
        )}

        {/* TAB 3: LIVE PLATFORM DIRECTORY & BROADCAST */}
        {activeTab === 'DIRECTORY' && (
          <View style={{ gap: 14 }}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📢 आधिकारिक ब्रॉडकास्ट नोटिफिकेशन भेजें</Text>
              <Text style={styles.sectionSub}>सीधे ग्राहकों, कारीगरों या दुकानदारों की ऐप बेल में तुरंत अलर्ट भेजें:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 }}>
                {(['ALL', 'CUSTOMER', 'CONTRACTOR', 'VENDOR'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.targetChip, broadcastTarget === r && styles.targetChipActive]}
                    onPress={() => setBroadcastTarget(r)}
                  >
                    <Text style={[styles.targetChipText, broadcastTarget === r && { color: '#FFFFFF' }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.adminInput}
                placeholder="शीर्षक (जैसे: मानसून वाटरप्रूफिंग स्पेशल ऑफर)"
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
              />
              <TextInput
                style={[styles.adminInput, { minHeight: 68, textAlignVertical: 'top' }]}
                placeholder="पूरा संदेश लिखें..."
                multiline
                value={broadcastMsg}
                onChangeText={setBroadcastMsg}
              />
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={handleSendBroadcast}
                disabled={sendingBroadcast}
              >
                <Text style={styles.approveBtnText}>
                  {sendingBroadcast ? 'भेजा जा रहा है...' : '📢 सभी को नोटिफिकेशन भेजें'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                👷 लाइव कारीगर ({systemControl?.contractors?.length || 0}) • 🧱 सामग्री ({systemControl?.materials?.length || 0}) • 👤 यूज़र ({systemControl?.users?.length || 0})
              </Text>
              {(systemControl?.contractors || []).slice(0, 10).map((c: any) => (
                <View key={c.customId || c.id || c._id} style={styles.dirRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kycName}>{c.name} {c.verified ? '✓' : '⏳'}</Text>
                    <Text style={styles.kycDate}>{c.category} • {c.city || 'भोपाल'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleDeleteDirectoryItem('contractor', c.customId || c.id || c._id, c.name)}
                  >
                    <Text style={styles.rejectBtnText}>हटाएं</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {(systemControl?.materials || []).slice(0, 10).map((m: any) => (
                <View key={m.customId || m.id || m._id} style={styles.dirRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kycName}>{m.name} (₹{m.sellingPrice})</Text>
                    <Text style={styles.kycDate}>{m.storeName} • {m.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleDeleteDirectoryItem('material', m.customId || m.id || m._id, m.name)}
                  >
                    <Text style={styles.rejectBtnText}>हटाएं</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {(systemControl?.users || []).slice(0, 10).map((u: any) => (
                <View key={u._id || u.id || u.setuId} style={styles.dirRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kycName}>{u.name} ({u.role})</Text>
                    <Text style={styles.kycDate}>{u.setuId} • {u.email || u.phone}</Text>
                  </View>
                  {u.role !== 'ADMIN' && (
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleDeleteDirectoryItem('user', u.setuId || u._id || u.id, u.name)}
                    >
                      <Text style={styles.rejectBtnText}>हटाएं</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 4: EXCLUSIVE PRIVATE ADMIN PERSONAL AI ("SETU-HERO") */}
        {activeTab === 'HERO_AI' && (
          <View style={styles.heroConsoleCard}>
            <View style={styles.heroHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.heroAvatar}>
                  <Ionicons name="shield" size={18} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.heroTitle}>SETU-HERO • प्राइवेट एडमिन AI कमांडर</Text>
                  <Text style={styles.heroSub}>⛔ केवल सुपर एडमिन के लिए — सुरक्षा, बग, Python ऑडिट, खाते व डेवलपमेंट कंट्रोल</Text>
                </View>
              </View>
            </View>

            {/* Quick One-Tap Admin Commands */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[
                  { label: '🛡️ फुल सुरक्षा ऑडिट', q: 'पूरी वेबसाइट का सुरक्षा ऑडिट करो' },
                  { label: '🐞 बग व एरर जांच', q: 'कौन से बग या API एरर आ रहे हैं' },
                  { label: '💼 खाते, एस्क्रो & KYC', q: 'अकाउंट, एस्क्रो और KYC का पूरा हिसाब दो' },
                  { label: '🚀 आगे का डेवलपमेंट प्लान', q: 'आगे क्या डेवलपमेंट करनी चाहिए' },
                  { label: '📲 SMS व मैसेज जांच', q: 'SMS OTP और नोटिफिकेशन स्थिति बताओ' },
                ].map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.heroQuickChip}
                    onPress={() => void handleAskHeroAI(chip.q)}
                  >
                    <Text style={styles.heroQuickChipText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Messages Thread */}
            <View style={{ gap: 10 }}>
              {heroMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={msg.role === 'user' ? styles.heroUserBubble : styles.heroBotBubble}
                >
                  {typeof msg.score === 'number' && (
                    <View style={styles.scorePill}>
                      <Text style={styles.scorePillText}>SECURITY SCORE: {msg.score}/100</Text>
                    </View>
                  )}
                  <Text style={msg.role === 'user' ? styles.heroUserText : styles.heroBotText}>
                    {msg.text}
                  </Text>
                  {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {msg.actions.map((act) => (
                        <TouchableOpacity
                          key={act.id}
                          style={styles.heroExecBtn}
                          onPress={() => void handleAskHeroAI(act.label, act.id)}
                        >
                          <Text style={styles.heroExecBtnText}>{act.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {heroLoading && <ActivityIndicator color="#F59E0B" style={{ marginVertical: 8 }} />}
            </View>

            {/* Command Input */}
            <View style={styles.heroInputRow}>
              <TextInput
                style={styles.heroTextInput}
                placeholder="SETU-HERO को आदेश दें (जैसे: security check / bug fix / escrow report)..."
                placeholderTextColor="#94A3B8"
                value={heroInput}
                onChangeText={setHeroInput}
                onSubmitEditing={() => void handleAskHeroAI()}
              />
              <TouchableOpacity style={styles.heroSendBtn} onPress={() => void handleAskHeroAI()}>
                <Ionicons name="send" size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 1: EXISTING FINANCIAL OVERVIEW, KYC DESK, DISPUTES & AI LEARNING */}
        {activeTab === 'OVERVIEW' && (
          <>
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

          </>
        )}

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
  adminTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adminTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  adminTabBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  adminTabBtnHero: {
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
    borderColor: 'rgba(167, 139, 250, 0.5)',
  },
  adminTabText: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '800',
  },
  adminTabTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  apiStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 11,
  },
  apiName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  apiDetail: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  adminActionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
  },
  adminActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  smsBalBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
  },
  logLineText: {
    fontSize: 10.5,
    color: '#991B1B',
    backgroundColor: '#FEF2F2',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  targetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  targetChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  targetChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  adminInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 12.5,
    color: '#0F172A',
    marginBottom: 8,
  },
  dirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  heroConsoleCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  heroHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 10,
  },
  heroAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  heroQuickChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  heroQuickChipText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
  },
  heroUserBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 12,
    maxWidth: '85%',
  },
  heroUserText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  heroBotBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  heroBotText: {
    color: '#F1F5F9',
    fontSize: 12,
    lineHeight: 18,
  },
  scorePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22C55E',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  scorePillText: {
    color: '#86EFAC',
    fontSize: 10,
    fontWeight: '900',
  },
  heroExecBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heroExecBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
  heroInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  heroTextInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 12.5,
  },
  heroSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ThreeWayQuotationData } from '../data/supplierShowroom';
import { Contractor } from '../data/mockData';
import { openWhatsAppChat } from '../utils/whatsapp';

export type QuoteModeKey = 'only_karigar' | 'material_and_karigar' | 'only_material';

interface ThreeWayQuotationCardProps {
  quotation: ThreeWayQuotationData;
  matchedPro?: Contractor;
  language?: string;
  onBookMode: (mode: QuoteModeKey, amount: number, summaryText: string) => void;
  onAdjustBudget?: () => void;
  onChangeMaterials?: () => void;
}

export const ThreeWayQuotationCard: React.FC<ThreeWayQuotationCardProps> = ({
  quotation,
  matchedPro,
  language = 'hi',
  onBookMode,
  onAdjustBudget,
  onChangeMaterials,
}) => {
  const isEn = language === 'en';
  const [selectedTab, setSelectedTab] = useState<QuoteModeKey>('material_and_karigar');

  if (!quotation || !quotation.includeQuotation) return null;

  const cleanLoc = (quotation.locality || 'भोपाल').split('•')[0].trim();

  const handleShareAllWhatsApp = () => {
    const itemsText = (quotation.onlyMaterial?.items || [])
      .map(
        (it) =>
          `• ${it.name}${it.gradeOrBrand ? ` [${it.gradeOrBrand}]` : ''} (${it.qtyRate}) — ₹${Number(it.amount || 0).toLocaleString('en-IN')}`
      )
      .join('\n');

    const msg = `नमस्ते${matchedPro ? ` ${matchedPro.name} जी` : ''},
मैंने *SETU Master AI* पर काम का 3-टाइप स्मार्ट कोटेशन बनवाया है:

🏠 *कार्य:* ${quotation.projectTitle}
📐 *नाप / अवधि:* ${quotation.dimensionsSummary} (${quotation.estimatedDuration})
📍 *लोकेशन:* ${quotation.locality}
${quotation.customerBudget ? `💰 *ग्राहक बजट:* ₹${Number(quotation.customerBudget).toLocaleString('en-IN')}\n` : ''}
━━━━━━━━━━━━━━━
*1️⃣ बिना माल — केवल कारीगर (Only Karigar):*
👷 मजदूरी कुल: *₹${Number(quotation.onlyKarigar?.laborTotal || 0).toLocaleString('en-IN')}*

*2️⃣ कच्चा माल + कारीगर (सम्पूर्ण पैकेज):*
🪵 कच्चा माल: ₹${Number(quotation.materialAndKarigar?.materialTotal || 0).toLocaleString('en-IN')}
🔨 कारीगरी: ₹${Number(quotation.materialAndKarigar?.laborTotal || 0).toLocaleString('en-IN')}
✅ पैकेज कुल: *₹${Number(quotation.materialAndKarigar?.grandTotal || 0).toLocaleString('en-IN')}*

*3️⃣ केवल कच्चा माल (थोक सप्लायर BOM):*
📦 मटीरियल कुल: *₹${Number(quotation.onlyMaterial?.materialTotal || 0).toLocaleString('en-IN')}*

🪵 *कच्चा माल विवरण:*
${itemsText}

कृपया अपनी उपलब्धता व पक्के काम की पुष्टि करें।`;

    openWhatsAppChat(matchedPro?.phone || '', msg);
  };

  const handleOrderRawMaterialWhatsApp = () => {
    const itemsText = (quotation.onlyMaterial?.items || [])
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name} (${it.gradeOrBrand || 'Standard'}) — ${it.qtyRate} = ₹${Number(it.amount || 0).toLocaleString('en-IN')} [${it.supplierStore || cleanLoc}]`
      )
      .join('\n');

    const msg = `नमस्ते सप्लायर जी,
मुझे *SETU* से नीचे दिए कच्चे माल ("Only Raw Material") का होलसेल ऑर्डर/कोटेशन चाहिए:

🏠 *प्रोजेक्ट:* ${quotation.projectTitle}
📍 *डिलीवरी लोकेशन:* ${quotation.locality}

🪵 *ज़रूरी कच्चा माल (BOM):*
${itemsText}

💰 *कुल कच्चा माल अनुमान:* *₹${Number(quotation.onlyMaterial?.materialTotal || 0).toLocaleString('en-IN')}*

कृपया ताजा थोक रेट व डिलीवरी समय बताएं।`;

    openWhatsAppChat('', msg);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            📋 {quotation.projectTitle}
          </Text>
          <Text style={styles.metaText}>
            📍 {cleanLoc} • 📐 {quotation.dimensionsSummary} • ⏱️ {quotation.estimatedDuration}
          </Text>
        </View>
        {quotation.customerBudget ? (
          <View style={[styles.budgetBadge, quotation.isWithinBudget === false && styles.budgetBadgeWarn]}>
            <Text style={[styles.budgetBadgeText, quotation.isWithinBudget === false && styles.budgetBadgeWarnText]}>
              {isEn ? 'Budget' : 'बजट'}: ₹{Number(quotation.customerBudget).toLocaleString('en-IN')}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Budget & Location Fit Analysis */}
      {quotation.budgetFitNote ? (
        <View style={[styles.fitBanner, quotation.isWithinBudget === true && styles.fitBannerGreen]}>
          <Text style={[styles.fitBannerText, quotation.isWithinBudget === true && styles.fitBannerGreenText]}>
            {quotation.budgetFitNote}
          </Text>
          {quotation.suggestedTierUpgradeOrSave ? (
            <Text style={styles.fitTipText}>{quotation.suggestedTierUpgradeOrSave}</Text>
          ) : null}
        </View>
      ) : null}

      {/* 3-Type Selector Tabs */}
      <Text style={styles.chooseTabLabel}>
        {isEn ? 'Choose Your Quotation Model (3 Options):' : '👇 अपनी पसंद का कोटेशन मॉडल चुनें (3 विकल्प):'}
      </Text>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.modeCardTab, selectedTab === 'only_karigar' && styles.modeCardTabActive]}
          onPress={() => setSelectedTab('only_karigar')}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeTabIcon]}>👷</Text>
          <Text style={[styles.modeTabTitle, selectedTab === 'only_karigar' && styles.modeTabTitleActive]}>
            {isEn ? 'Karigar Only' : 'केवल कारीगर'}
          </Text>
          <Text style={[styles.modeTabSub, selectedTab === 'only_karigar' && styles.modeTabSubActive]}>
            {isEn ? 'Without Maal' : 'बिना माल'}
          </Text>
          <Text style={[styles.modeTabPrice, selectedTab === 'only_karigar' && styles.modeTabPriceActive]}>
            ₹{Number(quotation.onlyKarigar?.laborTotal || 0).toLocaleString('en-IN')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCardTab, selectedTab === 'material_and_karigar' && styles.modeCardTabActive]}
          onPress={() => setSelectedTab('material_and_karigar')}
          activeOpacity={0.85}
        >
          <View style={styles.recPill}>
            <Text style={styles.recPillText}>BEST</Text>
          </View>
          <Text style={styles.modeTabIcon}>🏆</Text>
          <Text style={[styles.modeTabTitle, selectedTab === 'material_and_karigar' && styles.modeTabTitleActive]}>
            {isEn ? 'Maal + Karigar' : 'माल + कारीगर'}
          </Text>
          <Text style={[styles.modeTabSub, selectedTab === 'material_and_karigar' && styles.modeTabSubActive]}>
            {isEn ? 'Full Package' : 'पूरा पैकेज'}
          </Text>
          <Text style={[styles.modeTabPrice, selectedTab === 'material_and_karigar' && styles.modeTabPriceActive]}>
            ₹{Number(quotation.materialAndKarigar?.grandTotal || 0).toLocaleString('en-IN')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCardTab, selectedTab === 'only_material' && styles.modeCardTabActive]}
          onPress={() => setSelectedTab('only_material')}
          activeOpacity={0.85}
        >
          <Text style={styles.modeTabIcon}>🪵</Text>
          <Text style={[styles.modeTabTitle, selectedTab === 'only_material' && styles.modeTabTitleActive]}>
            {isEn ? 'Maal Only' : 'केवल माल'}
          </Text>
          <Text style={[styles.modeTabSub, selectedTab === 'only_material' && styles.modeTabSubActive]}>
            {isEn ? 'Raw Materials' : 'कच्चा माल BOM'}
          </Text>
          <Text style={[styles.modeTabPrice, selectedTab === 'only_material' && styles.modeTabPriceActive]}>
            ₹{Number(quotation.onlyMaterial?.materialTotal || 0).toLocaleString('en-IN')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Mode Details */}
      {selectedTab === 'only_karigar' && (
        <View style={styles.detailPanel}>
          <Text style={styles.panelTitle}>{quotation.onlyKarigar?.title || '1. बिना माल — केवल कारीगर'}</Text>
          <Text style={styles.panelSub}>{quotation.onlyKarigar?.subtitle || 'कच्चा माल आप देंगे, कारीगर सिर्फ लेबर चार्ज करेगा'}</Text>

          <View style={styles.bulletsBox}>
            {(quotation.onlyKarigar?.breakdown || []).map((line, i) => (
              <Text key={i} style={styles.bulletLine}>• {line}</Text>
            ))}
          </View>

          {quotation.onlyKarigar?.rateNote ? (
            <Text style={styles.rateNoteText}>📌 {quotation.onlyKarigar.rateNote}</Text>
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{isEn ? 'Labor Charge Only' : 'कुल कारीगरी (बिना माल)'}</Text>
            <Text style={styles.totalAmount}>
              ₹{Number(quotation.onlyKarigar?.laborTotal || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() =>
              onBookMode(
                'only_karigar',
                Number(quotation.onlyKarigar?.laborTotal || 0),
                `${quotation.projectTitle} — केवल कारीगर कोटेशन (${quotation.dimensionsSummary}, लोकेशन: ${cleanLoc})`
              )
            }
            activeOpacity={0.88}
          >
            <Ionicons name="hammer-outline" size={16} color="#0F172A" />
            <Text style={styles.primaryActionText}>
              {isEn ? 'Book Karigar Only (No Material)' : '👷 केवल कारीगर बुक करें (बिना माल)'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedTab === 'material_and_karigar' && (
        <View style={styles.detailPanel}>
          <Text style={styles.panelTitle}>{quotation.materialAndKarigar?.title || '2. कच्चा माल + कारीगर'}</Text>
          <Text style={styles.panelSub}>{quotation.materialAndKarigar?.subtitle || 'सप्लायर से शुद्ध कच्चा माल + SETU कारीगर'}</Text>

          {(quotation.materialAndKarigar?.items || []).map((item, idx) => (
            <View key={idx} style={styles.bomRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bomName}>{item.name}</Text>
                <Text style={styles.bomSub}>
                  {item.qtyRate}{item.supplierStore ? ` • 🏪 ${item.supplierStore}` : ''}
                </Text>
              </View>
              <Text style={styles.bomPrice}>₹{Number(item.amount || 0).toLocaleString('en-IN')}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.subRow}>
            <Text style={styles.subLabel}>{isEn ? 'Raw Materials Total:' : 'कच्चा माल कुल:'}</Text>
            <Text style={styles.subVal}>
              ₹{Number(quotation.materialAndKarigar?.materialTotal || 0).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>{isEn ? 'Skilled Karigar Labor:' : 'कुशल कारीगर मजदूरी:'}</Text>
            <Text style={styles.subVal}>
              ₹{Number(quotation.materialAndKarigar?.laborTotal || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{isEn ? 'All-Inclusive Grand Total' : 'सम्पूर्ण पैकेज कुल खर्च'}</Text>
            <Text style={styles.totalAmount}>
              ₹{Number(quotation.materialAndKarigar?.grandTotal || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <Text style={styles.warrantyText}>
            {quotation.materialAndKarigar?.warrantyNote || '🛡️ शुद्ध कच्चा माल बिल (GST/भाड़ा चालान अनुसार लागू)'}
          </Text>

          <View style={styles.actionStack}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() =>
                onBookMode(
                  'material_and_karigar',
                  Number(quotation.materialAndKarigar?.grandTotal || 0),
                  `${quotation.projectTitle} — माल + कारीगर फुल पैकेज (कच्चा माल: ₹${Number(quotation.materialAndKarigar?.materialTotal || 0).toLocaleString('en-IN')}, लेबर: ₹${Number(quotation.materialAndKarigar?.laborTotal || 0).toLocaleString('en-IN')})`
                )
              }
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-circle" size={16} color="#0F172A" />
              <Text style={styles.primaryActionText}>
                {isEn ? 'Book Full Package (Material + Pro)' : '✅ पूरा पैकेज बुक करें (माल + कारीगर)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.waBtn}
              onPress={handleShareAllWhatsApp}
              activeOpacity={0.88}
            >
              <FontAwesome5 name="whatsapp" size={14} color="#FFFFFF" />
              <Text style={styles.waBtnText}>
                {isEn ? 'Share 3-Way Quote on WhatsApp' : 'WhatsApp पर तीनों कोटेशन भेजें'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selectedTab === 'only_material' && (
        <View style={styles.detailPanel}>
          <Text style={styles.panelTitle}>{quotation.onlyMaterial?.title || '3. केवल कच्चा माल'}</Text>
          <Text style={styles.panelSub}>{quotation.onlyMaterial?.subtitle || 'थोक सप्लायर से शुद्ध कच्चा माल BOM'}</Text>

          {(quotation.onlyMaterial?.items || []).map((item, idx) => (
            <View key={idx} style={styles.bomRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bomName}>{item.name}</Text>
                <Text style={styles.bomSub}>
                  {item.gradeOrBrand ? `${item.gradeOrBrand} • ` : ''}{item.qtyRate}
                </Text>
                {item.supplierStore ? (
                  <Text style={styles.bomStore}>🏪 {item.supplierStore}</Text>
                ) : null}
              </View>
              <Text style={styles.bomPrice}>₹{Number(item.amount || 0).toLocaleString('en-IN')}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{isEn ? 'Raw Material BOM Total' : 'केवल कच्चा माल थोक बिल'}</Text>
            <Text style={styles.totalAmount}>
              ₹{Number(quotation.onlyMaterial?.materialTotal || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <Text style={styles.deliveryNoteText}>
            {quotation.onlyMaterial?.deliveryNote || `🚚 ${cleanLoc} डिलीवरी (नोट: थोक GST व भाड़ा बिल अनुसार)`}
          </Text>

          <TouchableOpacity
            style={styles.waBtn}
            onPress={handleOrderRawMaterialWhatsApp}
            activeOpacity={0.88}
          >
            <FontAwesome5 name="whatsapp" size={14} color="#FFFFFF" />
            <Text style={styles.waBtnText}>
              {isEn ? 'Order Raw Material Only on WhatsApp' : '🚚 सप्लायर को केवल कच्चा माल ऑर्डर भेजें'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Optional Footer Utility Row */}
      {(onChangeMaterials || onAdjustBudget) && (
        <View style={styles.utilityRow}>
          {onChangeMaterials ? (
            <TouchableOpacity style={styles.utilityBtn} onPress={onChangeMaterials}>
              <Ionicons name="color-palette-outline" size={13} color="#FBBF24" />
              <Text style={styles.utilityText}>
                {isEn ? 'Swap Raw Material Grade' : 'कच्चा माल / क्वालिटी बदलें'}
              </Text>
            </TouchableOpacity>
          ) : null}
          {onAdjustBudget && quotation.isWithinBudget === false ? (
            <TouchableOpacity style={styles.utilityBtn} onPress={onAdjustBudget}>
              <Ionicons name="options-outline" size={13} color="#34D399" />
              <Text style={[styles.utilityText, { color: '#34D399' }]}>
                {isEn ? 'Fit Within My Budget' : 'बजट में सस्ता विकल्प लाएं'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: '#FBBF24',
    fontSize: 13.5,
    fontWeight: '900',
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  budgetBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  budgetBadgeWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderColor: '#F59E0B',
  },
  budgetBadgeText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '800',
  },
  budgetBadgeWarnText: {
    color: '#FDE68A',
  },
  fitBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 9,
    padding: 8,
    marginBottom: 10,
  },
  fitBannerGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  fitBannerText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  fitBannerGreenText: {
    color: '#A7F3D0',
  },
  fitTipText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    marginTop: 3,
    fontWeight: '600',
  },
  chooseTabLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  modeCardTab: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
    position: 'relative',
  },
  modeCardTabActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  recPill: {
    position: 'absolute',
    top: -6,
    right: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  recPillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  modeTabIcon: {
    fontSize: 15,
    marginBottom: 2,
  },
  modeTabTitle: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    textAlign: 'center',
  },
  modeTabTitleActive: {
    color: '#0F172A',
  },
  modeTabSub: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  modeTabSubActive: {
    color: '#78350F',
  },
  modeTabPrice: {
    color: '#34D399',
    fontSize: 11.5,
    fontWeight: '900',
    marginTop: 4,
  },
  modeTabPriceActive: {
    color: '#B45309',
  },
  detailPanel: {
    backgroundColor: '#0F172A',
    borderRadius: 11,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  panelSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
    marginBottom: 8,
  },
  bulletsBox: {
    gap: 4,
    marginBottom: 8,
  },
  bulletLine: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 16,
  },
  rateNoteText: {
    color: '#93C5FD',
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  bomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E293B',
  },
  bomName: {
    color: '#F1F5F9',
    fontSize: 11.5,
    fontWeight: '700',
  },
  bomSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  bomStore: {
    color: '#6EE7B7',
    fontSize: 9.5,
    marginTop: 1,
    fontWeight: '600',
  },
  bomPrice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 7,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  subLabel: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  subVal: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 7,
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 8,
  },
  totalLabel: {
    color: '#FBBF24',
    fontSize: 12.5,
    fontWeight: '900',
  },
  totalAmount: {
    color: '#FBBF24',
    fontSize: 16.5,
    fontWeight: '900',
  },
  warrantyText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  deliveryNoteText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionStack: {
    gap: 7,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 9,
  },
  primaryActionText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 9,
    borderRadius: 9,
  },
  waBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
  },
  utilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },
  utilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  utilityText: {
    color: '#FBBF24',
    fontSize: 10.5,
    fontWeight: '700',
  },
});

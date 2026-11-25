import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SpaceDesignPreviewProps {
  originalUri: string;
  editedUri: string;
  caption?: string;
  isEn: boolean;
}

export function SpaceDesignPreview({ originalUri, editedUri, caption, isEn }: SpaceDesignPreviewProps) {
  const [view, setView] = useState<'original' | 'edited'>('edited');
  const [failedUri, setFailedUri] = useState<string>();
  const uri = view === 'original' ? originalUri : editedUri;
  const options = [
    { key: 'original', label: isEn ? 'Original photo' : 'असली फोटो' },
    { key: 'edited', label: isEn ? 'AI design' : 'AI डिज़ाइन' },
  ] as const;

  return (
    <View style={styles.card}>
      <View style={styles.tabs}>
        {options.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, view === key && styles.selectedTab]}
            accessibilityRole="button"
            accessibilityState={{ selected: view === key }}
            onPress={() => setView(key)}
          >
            <Text style={[styles.tabLabel, view === key && styles.selectedLabel]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {failedUri === uri ? (
        <Text style={styles.caption}>
          {isEn ? 'This image could not be displayed.' : 'यह फोटो दिखाने में दिक्कत आई।'}
        </Text>
      ) : (
        <Image
          key={uri}
          source={{ uri }}
          style={styles.photo}
          resizeMode="contain"
          accessibilityLabel={options[view === 'original' ? 0 : 1].label}
          onError={() => setFailedUri(uri)}
        />
      )}
      {caption && view === 'edited' && failedUri !== uri ? (
        <Text style={styles.caption}>{caption}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  tabs: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: '#1E293B',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectedTab: {
    backgroundColor: '#F59E0B',
  },
  tabLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  selectedLabel: {
    color: '#0F172A',
  },
  photo: {
    width: '100%',
    height: 360,
  },
  caption: {
    padding: 10,
    color: '#E2E8F0',
    fontSize: 13,
  },
});

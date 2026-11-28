import { Platform } from 'react-native';
import { ApiService } from '../services/api';
import { showAppToast } from './appAlert';

let activeHtmlAudio: HTMLAudioElement | null = null;
let activePlaySeq = 0;

export function stopSetuVoicePlayback(): void {
  activePlaySeq += 1;
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {
      // ignore audio stop error
    }
    activeHtmlAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

function speakWithTunedMascotWebSpeech(params: {
  text: string;
  language: string;
  seq: number;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  const { text, language, seq, onStart, onEnd } = params;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return false;
  }
  const chunks = text
    .split(/(?<=[।.!?])\s+|\n+/)
    .map((c) => c.trim())
    .filter(Boolean);
  const finalChunks = chunks.length > 0 ? chunks : [text.slice(0, 220)];

  const voices = window.speechSynthesis.getVoices?.() || [];
  const preferredVoice =
    voices.find((v) => /hi[-_]?in/i.test(v.lang) && /google|natural|madhur|swara|hemant/i.test(v.name)) ||
    voices.find((v) => /hi[-_]?in/i.test(v.lang)) ||
    voices.find((v) => /en[-_]?in/i.test(v.lang)) ||
    null;

  let idx = 0;
  onStart?.();

  const playNext = () => {
    if (seq !== activePlaySeq || idx >= finalChunks.length) {
      if (seq === activePlaySeq) onEnd?.();
      return;
    }
    const utt = new SpeechSynthesisUtterance(finalChunks[idx]);
    utt.lang = language === 'en' ? 'en-IN' : 'hi-IN';
    if (preferredVoice) utt.voice = preferredVoice;
    // Matched playful energetic mascot pitch & pace from user's uploaded SETU video sample
    utt.pitch = 1.48;
    utt.rate = 1.12;
    utt.onend = () => {
      idx += 1;
      playNext();
    };
    utt.onerror = () => {
      if (seq === activePlaySeq) onEnd?.();
    };
    window.speechSynthesis.speak(utt);
  };

  playNext();
  return true;
}

export async function speakSetuVoice(params: {
  text: string;
  language?: string;
  onStart?: () => void;
  onEnd?: () => void;
}): Promise<void> {
  const { text, language = 'hi', onStart, onEnd } = params;
  const cleanText = String(text || '').trim();
  if (!cleanText) return;

  stopSetuVoicePlayback();
  const mySeq = activePlaySeq;
  onStart?.();

  // Keep TTS clip crisp & responsive (max 340 chars)
  const spokenText = cleanText.length > 340 ? cleanText.slice(0, 340) : cleanText;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof Audio !== 'undefined') {
    try {
      const ttsRes = await ApiService.synthesizeSetuVoice(spokenText, language);
      if (mySeq !== activePlaySeq) return;

      if (ttsRes?.success && ttsRes.audioDataUri) {
        const audio = new Audio(ttsRes.audioDataUri);
        activeHtmlAudio = audio;
        // Slight crisp energetic rate matching video mascot warmth
        audio.playbackRate = 1.05;
        audio.onended = () => {
          if (activeHtmlAudio === audio) activeHtmlAudio = null;
          if (mySeq === activePlaySeq) onEnd?.();
        };
        audio.onerror = () => {
          if (activeHtmlAudio === audio) activeHtmlAudio = null;
          if (mySeq === activePlaySeq) {
            speakWithTunedMascotWebSpeech({ text: spokenText, language, seq: mySeq, onEnd });
          }
        };
        await audio.play();
        return;
      }
    } catch {
      // Fall back cleanly to tuned mascot Web Speech
    }
  }

  if (mySeq !== activePlaySeq) return;
  const started = speakWithTunedMascotWebSpeech({
    text: spokenText,
    language,
    seq: mySeq,
    onEnd,
  });
  if (!started) {
    onEnd?.();
    showAppToast(
      language === 'en' ? 'Audio Info' : 'ऑडियो सूचना',
      language === 'en'
        ? 'Voice playback requires audio support on this browser.'
        : 'आवाज़ सुनने की सुविधा इस डिवाइस पर उपलब्ध नहीं है।',
      'info'
    );
  }
}

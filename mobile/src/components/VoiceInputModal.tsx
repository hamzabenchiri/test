import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Mic, Send } from 'lucide-react-native';
import { getTheme } from '../theme';
import { AppTheme } from '../types';
import BottomSheet from './BottomSheet';

interface VoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
  onProcess: (text: string) => void;
  theme?: AppTheme;
}

const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ visible, onClose, onProcess, theme: themeProp }) => {
  const colors = getTheme(themeProp || 'dark');
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleProcess = () => {
    if (!text.trim()) return;
    setProcessing(true);
    setTimeout(() => {
      onProcess(text.trim());
      setText('');
      setProcessing(false);
      onClose();
    }, 1500);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Voice Input" theme={themeProp}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
          <Mic size={40} color={colors.accent} />
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Type or paste text as if you spoke it
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }]}
          value={text}
          onChangeText={setText}
          placeholder='e.g. "Lunch at Chipotle for 14 dollars"'
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.processBtn, { backgroundColor: colors.accent, opacity: processing || !text.trim() ? 0.5 : 1 }]}
          onPress={handleProcess}
          disabled={processing || !text.trim()}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.processRow}>
              <Send size={18} color="#fff" />
              <Text style={styles.processBtnText}>Process</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  hint: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  input: { width: '100%', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  processBtn: { width: '100%', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  processRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  processBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default VoiceInputModal;

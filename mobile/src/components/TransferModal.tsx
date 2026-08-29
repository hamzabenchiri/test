import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ArrowRightLeft } from 'lucide-react-native';
import { getTheme } from '../theme';
import { WalletAccount, AppTheme } from '../types';
import BottomSheet from './BottomSheet';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  onTransfer: (fromWalletId: string, toWalletId: string, amount: number) => void;
  wallets: WalletAccount[];
  theme?: AppTheme;
}

const TransferModal: React.FC<TransferModalProps> = ({ visible, onClose, onTransfer, wallets, theme: themeProp }) => {
  const colors = getTheme(themeProp || 'dark');
  const [fromId, setFromId] = useState(wallets[0]?.id || '');
  const [toId, setToId] = useState(wallets[1]?.id || '');
  const [amount, setAmount] = useState('');

  const handleTransfer = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (fromId === toId) {
      Alert.alert('Error', 'Cannot transfer to the same wallet');
      return;
    }
    onTransfer(fromId, toId, amt);
    setAmount('');
    onClose();
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Transfer Between Accounts" theme={themeProp}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>From</Text>
      <View style={styles.walletRow}>
        {wallets.map((w) => (
          <TouchableOpacity
            key={w.id}
            style={[styles.walletBtn, { backgroundColor: fromId === w.id ? colors.accentBg : colors.inputBg, borderColor: fromId === w.id ? colors.accent : colors.border }]}
            onPress={() => setFromId(w.id)}
          >
            <Text style={{ color: fromId === w.id ? colors.accent : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>{w.name}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{w.currency} {w.balance.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.arrowContainer}>
        <ArrowRightLeft size={20} color={colors.accent} />
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>To</Text>
      <View style={styles.walletRow}>
        {wallets.map((w) => (
          <TouchableOpacity
            key={w.id}
            style={[styles.walletBtn, { backgroundColor: toId === w.id ? colors.accentBg : colors.inputBg, borderColor: toId === w.id ? colors.accent : colors.border }]}
            onPress={() => setToId(w.id)}
          >
            <Text style={{ color: toId === w.id ? colors.accent : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>{w.name}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{w.currency} {w.balance.toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
      <TextInput style={inputStyle} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={colors.textSecondary} />

      <TouchableOpacity style={[styles.transferBtn, { backgroundColor: colors.accent }]} onPress={handleTransfer}>
        <Text style={styles.transferBtnText}>Transfer</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  walletRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  walletBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, minWidth: 100, alignItems: 'center' },
  arrowContainer: { alignItems: 'center', marginVertical: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 8 },
  transferBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12, marginBottom: 20 },
  transferBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default TransferModal;

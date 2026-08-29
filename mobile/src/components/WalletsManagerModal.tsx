import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Plus, Edit3, Trash2 } from 'lucide-react-native';
import { getTheme } from '../theme';
import { WalletAccount, WalletType, AppTheme } from '../types';
import BottomSheet from './BottomSheet';

interface WalletsManagerModalProps {
  visible: boolean;
  onClose: () => void;
  wallets: WalletAccount[];
  onAddWallet: (wallet: WalletAccount) => void;
  onUpdateWallet: (wallet: WalletAccount) => void;
  onDeleteWallet: (id: string) => void;
  theme?: AppTheme;
}

const WALLET_TYPES: WalletType[] = ['checking', 'savings', 'cash', 'credit', 'investment', 'crypto'];

const WalletsManagerModal: React.FC<WalletsManagerModalProps> = ({
  visible, onClose, wallets, onAddWallet, onUpdateWallet, onDeleteWallet, theme: themeProp,
}) => {
  const colors = getTheme(themeProp || 'dark');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<WalletType>('checking');
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setName('');
    setBalance('');
    setType('checking');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }
    const wallet: WalletAccount = {
      id: editingId || Date.now().toString(),
      name: name.trim(),
      balance: parseFloat(balance) || 0,
      type,
      currency: 'USD',
      icon: 'Wallet',
      color: '#6366f1',
    };
    if (editingId) {
      onUpdateWallet(wallet);
    } else {
      onAddWallet(wallet);
    }
    resetForm();
  };

  const handleEdit = (w: WalletAccount) => {
    setEditingId(w.id);
    setName(w.name);
    setBalance(w.balance.toString());
    setType(w.type);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Wallet', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteWallet(id) },
    ]);
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }];

  return (
    <BottomSheet visible={visible} onClose={() => { resetForm(); onClose(); }} title="Manage Wallets" theme={themeProp}>
      {!showForm ? (
        <>
          <ScrollView style={{ maxHeight: 350 }}>
            {wallets.map((w) => (
              <View key={w.id} style={[styles.walletRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.walletName, { color: colors.textPrimary }]}>{w.name}</Text>
                  <Text style={[styles.walletBalance, { color: w.balance >= 0 ? colors.success : colors.danger }]}>
                    {w.balance >= 0 ? '+' : ''}{w.currency} {w.balance.toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleEdit(w)} style={styles.iconBtn}>
                  <Edit3 size={18} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(w.id)} style={styles.iconBtn}>
                  <Trash2 size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={() => setShowForm(true)}>
            <Plus size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Wallet</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{editingId ? 'Edit Wallet' : 'New Wallet'}</Text>
          <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder="Wallet Name" placeholderTextColor={colors.textSecondary} />
          <TextInput style={inputStyle} value={balance} onChangeText={setBalance} placeholder="Balance" keyboardType="decimal-pad" placeholderTextColor={colors.textSecondary} />
          <View style={styles.typeRow}>
            {WALLET_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, { backgroundColor: type === t ? colors.accent : colors.inputBg, borderColor: colors.border }]}
                onPress={() => setType(t)}
              >
                <Text style={{ color: type === t ? '#fff' : colors.textPrimary, fontSize: 11 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={resetForm}>
              <Text style={{ color: colors.textPrimary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{editingId ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  walletRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  walletName: { fontSize: 15, fontWeight: '600' },
  walletBalance: { fontSize: 13, marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, marginTop: 16, gap: 6 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 20 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});

export default WalletsManagerModal;

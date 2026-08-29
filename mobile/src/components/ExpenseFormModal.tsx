import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { getTheme } from '../theme';
import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  TransactionType,
} from '../types';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS } from '../utils/formatters';
import { INITIAL_WALLETS } from '../data/sampleData';
import BottomSheet from './BottomSheet';

interface ExpenseFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  editExpense?: Expense | null;
  theme?: 'dark' | 'light';
  wallets?: typeof INITIAL_WALLETS;
}

const EXPENSE_TYPES: TransactionType[] = ['expense', 'income', 'transfer'];

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ visible, onClose, onSave, editExpense, theme: themeProp, wallets }) => {
  const colors = getTheme(themeProp || 'dark');
  const walletList = wallets && wallets.length > 0 ? wallets : INITIAL_WALLETS;

  const [type, setType] = useState<TransactionType>(editExpense?.type || 'expense');
  const [merchant, setMerchant] = useState(editExpense?.merchant || '');
  const [amount, setAmount] = useState(editExpense?.amount?.toString() || '');
  const [category, setCategory] = useState<ExpenseCategory>(editExpense?.category || 'Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editExpense?.paymentMethod || 'Credit Card');
  const [walletAccountId, setWalletAccountId] = useState(editExpense?.walletAccountId || walletList[0]?.id || '');
  const [date, setDate] = useState(editExpense?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editExpense?.time || new Date().toTimeString().slice(0, 5));
  const [tags, setTags] = useState(editExpense?.tags?.join(', ') || '');
  const [notes, setNotes] = useState(editExpense?.notes || '');

  useEffect(() => {
    if (visible) {
      setType(editExpense?.type || 'expense');
      setMerchant(editExpense?.merchant || '');
      setAmount(editExpense?.amount?.toString() || '');
      setCategory(editExpense?.category || 'Food & Dining');
      setPaymentMethod(editExpense?.paymentMethod || 'Credit Card');
      setWalletAccountId(editExpense?.walletAccountId || walletList[0]?.id || '');
      setDate(editExpense?.date || new Date().toISOString().split('T')[0]);
      setTime(editExpense?.time || new Date().toTimeString().slice(0, 5));
      setTags(editExpense?.tags?.join(', ') || '');
      setNotes(editExpense?.notes || '');
    }
  }, [visible, editExpense]);

  const handleSave = () => {
    if (!merchant.trim()) {
      Alert.alert('Error', 'Please enter a merchant name');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const expense: Expense = {
      id: editExpense?.id || Date.now().toString(),
      type,
      merchant: merchant.trim(),
      amount: parseFloat(amount),
      currency: 'USD',
      category,
      date,
      time,
      paymentMethod,
      walletAccountId,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes,
      isSubscription: editExpense?.isSubscription,
      subscriptionId: editExpense?.subscriptionId,
      createdAt: editExpense?.createdAt || new Date().toISOString(),
    };
    onSave(expense);
    onClose();
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }];
  const labelStyle = [styles.label, { color: colors.textSecondary }];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={editExpense ? 'Edit Transaction' : 'New Transaction'} theme={themeProp}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.typeRow}>
          {EXPENSE_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, { backgroundColor: type === t ? colors.accent : colors.inputBg, borderColor: colors.border }]}
              onPress={() => setType(t)}
            >
              <Text style={{ color: type === t ? '#fff' : colors.textPrimary, fontSize: 13, fontWeight: '600' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={labelStyle}>Merchant</Text>
        <TextInput style={inputStyle} value={merchant} onChangeText={setMerchant} placeholder="Merchant name" placeholderTextColor={colors.textSecondary} />

        <Text style={labelStyle}>Amount</Text>
        <TextInput style={inputStyle} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor={colors.textSecondary} />

        <Text style={labelStyle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {ALL_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, { backgroundColor: category === cat ? colors.accentBg : colors.inputBg, borderColor: category === cat ? colors.accent : colors.border }]}
              onPress={() => setCategory(cat)}
            >
              <Text style={{ color: category === cat ? colors.accent : colors.textPrimary, fontSize: 12 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={labelStyle}>Payment Method</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {ALL_PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm}
              style={[styles.catBtn, { backgroundColor: paymentMethod === pm ? colors.accentBg : colors.inputBg, borderColor: paymentMethod === pm ? colors.accent : colors.border }]}
              onPress={() => setPaymentMethod(pm)}
            >
              <Text style={{ color: paymentMethod === pm ? colors.accent : colors.textPrimary, fontSize: 12 }}>{pm}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={labelStyle}>Wallet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {walletList.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[styles.catBtn, { backgroundColor: walletAccountId === w.id ? colors.accentBg : colors.inputBg, borderColor: walletAccountId === w.id ? colors.accent : colors.border }]}
              onPress={() => setWalletAccountId(w.id)}
            >
              <Text style={{ color: walletAccountId === w.id ? colors.accent : colors.textPrimary, fontSize: 12 }}>{w.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={labelStyle}>Date</Text>
            <TextInput style={inputStyle} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textSecondary} />
          </View>
          <View style={styles.halfField}>
            <Text style={labelStyle}>Time</Text>
            <TextInput style={inputStyle} value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor={colors.textSecondary} />
          </View>
        </View>

        <Text style={labelStyle}>Tags (comma separated)</Text>
        <TextInput style={inputStyle} value={tags} onChangeText={setTags} placeholder="groceries, weekly" placeholderTextColor={colors.textSecondary} />

        <Text style={labelStyle}>Notes</Text>
        <TextInput style={[inputStyle, { height: 60 }]} value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline placeholderTextColor={colors.textSecondary} />

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{editExpense ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  typeRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  catScroll: { marginBottom: 4 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  saveBtn: { marginTop: 20, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ExpenseFormModal;

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus } from 'lucide-react-native';
import { Expense, WalletAccount, TransactionType, AppTheme } from '../types';
import { getTheme } from '../theme';
import { formatCurrency } from '../utils/formatters';
import CategoryIcon from '../components/CategoryIcon';

interface TransactionsScreenProps {
  expenses: Expense[];
  wallets: WalletAccount[];
  currency: string;
  theme: AppTheme;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  expenses, wallets, currency, theme: themeProp, onAddExpense, onEditExpense, onDeleteExpense,
}) => {
  const colors = getTheme(themeProp);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (filterType !== 'all') {
      list = list.filter(e => e.type === filterType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.merchant.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));
  }, [expenses, search, filterType]);

  const getWalletName = (id?: string) => wallets.find(w => w.id === id)?.name || 'Unknown';

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteExpense(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card }]}
      onPress={() => onEditExpense(item)}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.7}
    >
      <CategoryIcon category={item.category} size={18} />
      <View style={styles.itemInfo}>
        <Text style={[styles.merchant, { color: colors.textPrimary }]} numberOfLines={1}>{item.merchant}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {item.date} {item.time} | {getWalletName(item.walletAccountId)}
        </Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((t: string) => (
              <View key={t} style={[styles.tag, { backgroundColor: colors.accentBg }]}>
                <Text style={[styles.tagText, { color: colors.accent }]}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Text style={[styles.amount, { color: item.type === 'income' ? colors.success : colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, currency)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={onAddExpense}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'expense', 'income', 'transfer'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, { backgroundColor: filterType === f ? colors.accent : colors.card, borderColor: colors.border }]}
            onPress={() => setFilterType(f)}
          >
            <Text style={{ color: filterType === f ? '#fff' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
              {f === 'all' ? 'All' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {filtered.length} transactions
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, height: 42 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  addBtn: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  count: { fontSize: 12, marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, marginBottom: 10 },
  itemInfo: { flex: 1, marginLeft: 10 },
  merchant: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 2 },
  tags: { flexDirection: 'row', gap: 4, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagText: { fontSize: 10, fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
});

export default TransactionsScreen;

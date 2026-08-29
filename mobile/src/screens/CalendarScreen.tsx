import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Expense, WalletAccount, AppTheme } from '../types';
import { getTheme } from '../theme';
import { formatCurrency } from '../utils/formatters';
import CategoryIcon from '../components/CategoryIcon';

interface CalendarScreenProps {
  expenses: Expense[];
  wallets: WalletAccount[];
  currency: string;
  theme: AppTheme;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarScreen: React.FC<CalendarScreenProps> = ({ expenses, wallets, currency, theme: themeProp }) => {
  const colors = getTheme(themeProp);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startPad = firstDay.getDay();

  const expenseDates = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      if (!e.type || e.type === 'expense') {
        map[e.date] = (map[e.date] || 0) + e.amount;
      }
    });
    return map;
  }, [expenses]);

  const selectedExpenses = useMemo(
    () => expenses.filter(e => e.date === selectedDate).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [expenses, selectedDate]
  );

  const selectedTotal = selectedExpenses
    .filter(e => !e.type || e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0);

  const getWalletName = (id?: string) => wallets.find(w => w.id === id)?.name || 'Unknown';

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.calCard, { backgroundColor: colors.card }]}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={prevMonth}>
            <ChevronLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{monthLabel}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <ChevronRight size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.dayNamesRow}>
          {DAY_NAMES.map(d => (
            <Text key={d} style={[styles.dayName, { color: colors.textSecondary }]}>{d}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: startPad }).map((_, i) => (
            <View key={`pad-${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = ds === selectedDate;
            const hasExpense = expenseDates[ds];
            const isToday = ds === todayStr;

            return (
              <TouchableOpacity
                key={ds}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: colors.accent, borderRadius: 20 },
                  isToday && !isSelected && { borderColor: colors.accent, borderWidth: 1 },
                ]}
                onPress={() => setSelectedDate(ds)}
              >
                <Text style={[styles.dayNum, { color: isSelected ? '#fff' : colors.textPrimary }]}>
                  {day}
                </Text>
                {hasExpense && !isSelected && (
                  <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                )}
                {hasExpense && isSelected && (
                  <View style={[styles.dot, { backgroundColor: '#fff' }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.dayHeader}>
        <Text style={[styles.dayTitle, { color: colors.textPrimary }]}>
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
        {selectedTotal > 0 && (
          <Text style={[styles.dayTotal, { color: colors.danger }]}>
            -{formatCurrency(selectedTotal, currency)}
          </Text>
        )}
      </View>

      <ScrollView style={styles.txList} showsVerticalScrollIndicator={false}>
        {selectedExpenses.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>No transactions this day</Text>
        ) : (
          selectedExpenses.map(e => (
            <View key={e.id} style={[styles.txItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <CategoryIcon category={e.category} size={16} />
              <View style={styles.txInfo}>
                <Text style={[styles.txMerchant, { color: colors.textPrimary }]} numberOfLines={1}>{e.merchant}</Text>
                <Text style={[styles.txMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                  {e.time} | {getWalletName(e.walletAccountId)}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: e.type === 'income' ? colors.success : colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
                {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount, currency)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  calCard: { margin: 16, padding: 16, borderRadius: 14 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthTitle: { fontSize: 17, fontWeight: '700' },
  dayNamesRow: { flexDirection: 'row', marginBottom: 8 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayNum: { fontSize: 14 },
  dot: { width: 5, height: 5, borderRadius: 2.5, position: 'absolute', bottom: 4 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  dayTitle: { fontSize: 16, fontWeight: '700' },
  dayTotal: { fontSize: 14, fontWeight: '700' },
  txList: { flex: 1, paddingHorizontal: 16 },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  txInfo: { flex: 1, marginLeft: 10 },
  txMerchant: { fontSize: 14, fontWeight: '600' },
  txMeta: { fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});

export default CalendarScreen;

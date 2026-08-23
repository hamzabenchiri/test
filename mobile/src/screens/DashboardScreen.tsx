import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mic,
  Plus,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRightLeft,
  Target,
} from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';
import { Expense, Subscription, WalletAccount, CategoryBudget, AppTheme } from '../types';
import { getTheme } from '../theme';
import { formatCurrency, CATEGORY_CONFIG } from '../utils/formatters';
import CategoryIcon from '../components/CategoryIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardScreenProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
  subscriptions: Subscription[];
  wallets: WalletAccount[];
  currency: string;
  theme: AppTheme;
  onAddExpense: () => void;
  onVoiceInput: () => void;
  onManageWallets: () => void;
  onTransfer: () => void;
  onOpenGoals: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  expenses, budgets, subscriptions, wallets, currency, theme: themeProp,
  onAddExpense, onVoiceInput, onManageWallets, onTransfer, onOpenGoals,
}) => {
  const colors = getTheme(themeProp);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const todayExpenses = useMemo(
    () => expenses.filter(e => e.date === todayStr && (!e.type || e.type === 'expense')),
    [expenses, todayStr]
  );

  const monthExpenses = useMemo(
    () => expenses.filter(e => e.date.startsWith(currentMonthStr) && (!e.type || e.type === 'expense')),
    [expenses, currentMonthStr]
  );

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthIncome = expenses
    .filter(e => e.date.startsWith(currentMonthStr) && e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const monthSubscriptions = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const dailyBudget = 300;
  const dailyRemaining = dailyBudget - todayTotal;

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [monthExpenses]);

  const barData = useMemo(() => {
    const data: number[] = [];
    const labels: string[] = [];
    for (let d = 1; d <= today.getDate(); d++) {
      const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTotal = expenses
        .filter(e => e.date === ds && (!e.type || e.type === 'expense'))
        .reduce((s, e) => s + e.amount, 0);
      data.push(dayTotal);
      labels.push(String(d));
    }
    return { labels, datasets: [{ data: data.length > 0 ? data : [0] }] };
  }, [expenses, today]);

  const recentTransactions = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || '')).slice(0, 8),
    [expenses]
  );

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(210, 175, 38, ${opacity})`,
    labelColor: () => colors.textSecondary,
    barPercentage: 0.6,
    propsForBackgroundLines: { stroke: colors.border },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textPrimary }]}>Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.accent }]} onPress={onVoiceInput}>
            <Mic size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.accent }]} onPress={onAddExpense}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.banner, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
        <Text style={[styles.bannerTitle, { color: colors.accent }]}>AI Insight</Text>
        <Text style={[styles.bannerText, { color: colors.textPrimary }]}>
          You have {subscriptions.filter(s => s.status === 'active').length} active subscriptions costing {formatCurrency(monthSubscriptions, currency)}/month.
        </Text>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.cardIconWrap, { backgroundColor: colors.success + '20' }]}>
            <TrendingUp size={18} color={colors.success} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Daily Allowance</Text>
          <Text style={[styles.cardValue, { color: dailyRemaining >= 0 ? colors.success : colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(dailyRemaining, currency)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>of {formatCurrency(dailyBudget, currency)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.cardIconWrap, { backgroundColor: colors.danger + '20' }]}>
            <TrendingDown size={18} color={colors.danger} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Monthly Outflow</Text>
          <Text style={[styles.cardValue, { color: colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(monthTotal, currency)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Income: {formatCurrency(monthIncome, currency)}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.cardIconWrap, { backgroundColor: colors.accent + '20' }]}>
            <CreditCard size={18} color={colors.accent} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Subscriptions</Text>
          <Text style={[styles.cardValue, { color: colors.accent }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(monthSubscriptions, currency)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>{subscriptions.filter(s => s.status === 'active').length} active</Text>
        </View>
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onOpenGoals}>
          <View style={[styles.cardIconWrap, { backgroundColor: '#6366f120' }]}>
            <Target size={18} color="#6366f1" />
          </View>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Net Worth</Text>
          <Text style={[styles.cardValue, { color: totalBalance >= 0 ? colors.success : colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(totalBalance, currency)}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Tap to view goals</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Accounts</Text>
          <TouchableOpacity onPress={onManageWallets}>
            <Text style={{ color: colors.accent, fontSize: 13 }}>Manage</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {wallets.map((w) => (
            <TouchableOpacity key={w.id} style={[styles.walletChip, { backgroundColor: w.color + '15', borderColor: w.color + '30' }]} onPress={onTransfer}>
              <Wallet size={14} color={w.color} />
              <Text style={[styles.walletName, { color: colors.textPrimary }]} numberOfLines={1}>{w.name}</Text>
              <Text style={[styles.walletBal, { color: w.balance >= 0 ? colors.success : colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
                {w.currency} {w.balance.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.walletChip, { borderColor: colors.border }]} onPress={onTransfer}>
            <ArrowRightLeft size={14} color={colors.accent} />
            <Text style={{ color: colors.accent, fontSize: 12 }}>Transfer</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Daily Outflow</Text>
        <BarChart
          data={barData}
          width={SCREEN_WIDTH - 60}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel="$"
          yAxisSuffix=""
          showValuesOnTopOfBars={false}
        />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Category Breakdown</Text>
        {categoryBreakdown.map(([cat, amount]) => {
          const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
          return (
            <View key={cat} style={styles.catRow}>
              <CategoryIcon category={cat} size={16} />
              <Text style={[styles.catName, { color: colors.textPrimary }]} numberOfLines={1}>{cat}</Text>
              <View style={[styles.catBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.catBarFill,
                    {
                      width: `${(amount / (monthTotal || 1)) * 100}%`,
                      backgroundColor: config?.color || colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.catAmount, { color: colors.textSecondary }]}>
                {formatCurrency(amount, currency, { hideCents: true })}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
        {recentTransactions.map((e) => (
          <View key={e.id} style={[styles.txRow, { borderBottomColor: colors.border }]}>
            <CategoryIcon category={e.category} size={18} />
            <View style={styles.txInfo}>
              <Text style={[styles.txMerchant, { color: colors.textPrimary }]} numberOfLines={1}>{e.merchant}</Text>
              <Text style={[styles.txDate, { color: colors.textSecondary }]}>{e.date} {e.time}</Text>
            </View>
            <Text style={[styles.txAmount, { color: e.type === 'income' ? colors.success : colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
              {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount, currency)}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 24, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  banner: { marginHorizontal: 20, marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  bannerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  bannerText: { fontSize: 13, lineHeight: 18 },
  cardRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 12 },
  card: { flex: 1, padding: 16, borderRadius: 14 },
  cardIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardLabel: { fontSize: 12, marginBottom: 2 },
  cardValue: { fontSize: 20, fontWeight: '800' },
  cardSub: { fontSize: 11, marginTop: 2 },
  sectionCard: { marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  walletChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginRight: 10, alignItems: 'center', minWidth: 110 },
  walletName: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  walletBal: { fontSize: 11, marginTop: 2 },
  chart: { borderRadius: 10, marginLeft: -10 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  catName: { fontSize: 13, width: 95, marginLeft: 8 },
  catBarBg: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 4 },
  catAmount: { fontSize: 12, width: 70, textAlign: 'right' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  txInfo: { flex: 1, marginLeft: 10 },
  txMerchant: { fontSize: 14, fontWeight: '600' },
  txDate: { fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});

export default DashboardScreen;

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, AlertTriangle } from 'lucide-react-native';
import { Expense, CategoryBudget, FinancialGoal, AppTheme } from '../types';
import { getTheme } from '../theme';
import { formatCurrency, calculate503020Rule } from '../utils/formatters';
import CategoryIcon from '../components/CategoryIcon';

interface BudgetsScreenProps {
  budgets: CategoryBudget[];
  goals: FinancialGoal[];
  expenses: Expense[];
  currency: string;
  theme: AppTheme;
  onAddGoal: () => void;
  onEditGoal: (goal: FinancialGoal) => void;
}

const BudgetsScreen: React.FC<BudgetsScreenProps> = ({
  budgets, goals, expenses, currency, theme: themeProp, onAddGoal, onEditGoal,
}) => {
  const colors = getTheme(themeProp);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = useMemo(() => {
    const spentByCategory: Record<string, number> = {};
    expenses.filter(e => !e.type || e.type === 'expense').forEach(e => {
      spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
    });
    return budgets.reduce((sum, b) => sum + (spentByCategory[b.category] || 0), 0);
  }, [budgets, expenses]);

  const totalIncome = useMemo(
    () => expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const rule503020 = useMemo(
    () => calculate503020Rule(expenses, totalIncome || totalBudget),
    [expenses, totalIncome, totalBudget]
  );

  const activeGoals = goals;
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);

  const getSpentForCategory = (category: string) =>
    expenses.filter(e => (!e.type || e.type === 'expense') && e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.overviewTitle, { color: colors.textPrimary }]}>Budget Overview</Text>
        <View style={styles.overviewRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Total Budget</Text>
            <Text style={[styles.overviewValue, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(totalBudget, currency, { hideCents: true })}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Spent</Text>
            <Text style={[styles.overviewValue, { color: totalSpent > totalBudget ? colors.danger : colors.success }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(totalSpent, currency, { hideCents: true })}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Remaining</Text>
            <Text style={[styles.overviewValue, { color: totalBudget - totalSpent >= 0 ? colors.success : colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(totalBudget - totalSpent, currency, { hideCents: true })}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>50/30/20 Rule</Text>
        <View style={styles.ruleRow}>
          <View style={styles.ruleItem}>
            <View style={[styles.ruleDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>Needs</Text>
            <Text style={[styles.ruleValue, { color: colors.textPrimary }]}>{formatCurrency(rule503020.needsSpent, currency, { hideCents: true })}</Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={[styles.ruleDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>Wants</Text>
            <Text style={[styles.ruleValue, { color: colors.textPrimary }]}>{formatCurrency(rule503020.wantsSpent, currency, { hideCents: true })}</Text>
          </View>
          <View style={styles.ruleItem}>
            <View style={[styles.ruleDot, { backgroundColor: '#22c55e' }]} />
            <Text style={[styles.ruleLabel, { color: colors.textSecondary }]}>Savings</Text>
            <Text style={[styles.ruleValue, { color: colors.textPrimary }]}>{formatCurrency(rule503020.savingsSpent, currency, { hideCents: true })}</Text>
          </View>
        </View>
        <View style={styles.ruleBarBg}>
          <View style={[styles.ruleBarNeeds, { width: '50%', backgroundColor: '#3b82f6' }]} />
          <View style={[styles.ruleBarWants, { width: '30%', backgroundColor: '#f59e0b' }]} />
          <View style={[styles.ruleBarSavings, { width: '20%', backgroundColor: '#22c55e' }]} />
        </View>
      </View>

      <Text style={[styles.groupTitle, { color: colors.textPrimary }]}>Category Budgets</Text>
      {budgets.map((b, idx) => {
        const spent = getSpentForCategory(b.category);
        const pct = Math.min((spent / b.limit) * 100, 100);
        const overBudget = spent > b.limit;
        return (
          <View key={idx} style={[styles.budgetCard, { backgroundColor: colors.card }]}>
            <View style={styles.budgetRow}>
              <CategoryIcon category={b.category} size={18} />
              <Text style={[styles.budgetCat, { color: colors.textPrimary }]}>{b.category}</Text>
              <Text style={[styles.budgetAmt, { color: overBudget ? colors.danger : colors.textSecondary }]}>
                {formatCurrency(spent, currency, { hideCents: true })} / {formatCurrency(b.limit, currency, { hideCents: true })}
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressBarFill, { width: `${pct}%` as any, backgroundColor: overBudget ? colors.danger : pct > 80 ? colors.warning : colors.success }]} />
            </View>
            {overBudget && (
              <View style={styles.warnRow}>
                <AlertTriangle size={12} color={colors.danger} />
                <Text style={[styles.warnText, { color: colors.danger }]}>Over budget by {formatCurrency(spent - b.limit, currency, { hideCents: true })}</Text>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.goalsHeader}>
        <Text style={[styles.groupTitle, { color: colors.textPrimary }]}>Financial Goals</Text>
        <TouchableOpacity style={[styles.goalAddBtn, { backgroundColor: colors.accent }]} onPress={onAddGoal}>
          <Text style={styles.goalAddText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {activeGoals.map(g => {
        const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
        const daysLeft = Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <TouchableOpacity key={g.id} style={[styles.goalCard, { backgroundColor: colors.card }]} onPress={() => onEditGoal(g)}>
            <View style={styles.goalTop}>
              <Target size={18} color={g.color || colors.accent} />
              <Text style={[styles.goalName, { color: colors.textPrimary }]}>{g.title}</Text>
            </View>
            <View style={styles.goalAmtRow}>
              <Text style={[styles.goalAmt, { color: colors.textPrimary }]}>
                {formatCurrency(g.currentAmount, currency, { hideCents: true })} / {formatCurrency(g.targetAmount, currency, { hideCents: true })}
              </Text>
              <Text style={[styles.goalPct, { color: colors.accent }]}>{pct.toFixed(0)}%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressBarFill, { width: `${pct}%` as any, backgroundColor: g.color || colors.accent }]} />
            </View>
            <Text style={[styles.goalDeadline, { color: daysLeft < 0 ? colors.danger : colors.textSecondary }]}>
              {daysLeft < 0 ? 'Overdue by ' + Math.abs(daysLeft) + ' days' : daysLeft + ' days remaining'}
            </Text>
          </TouchableOpacity>
        );
      })}

      {completedGoals.length > 0 && (
        <>
          <Text style={[styles.groupTitle, { color: colors.textSecondary, marginTop: 16 }]}>Completed</Text>
          {completedGoals.map(g => (
            <View key={g.id} style={[styles.goalCard, { backgroundColor: colors.card, opacity: 0.7 }]}>
              <Text style={[styles.goalName, { color: colors.textSecondary, textDecorationLine: 'line-through' }]}>
                {g.title} - {formatCurrency(g.targetAmount, currency, { hideCents: true })}
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overviewCard: { margin: 16, padding: 16, borderRadius: 14 },
  overviewTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  overviewLabel: { fontSize: 12, marginBottom: 4 },
  overviewValue: { fontSize: 17, fontWeight: '800' },
  sectionCard: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ruleItem: { alignItems: 'center' },
  ruleDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  ruleLabel: { fontSize: 11 },
  ruleValue: { fontSize: 13, fontWeight: '700' },
  ruleBarBg: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' },
  ruleBarNeeds: { height: '100%' },
  ruleBarWants: { height: '100%' },
  ruleBarSavings: { height: '100%' },
  groupTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  budgetCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 12 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  budgetCat: { fontSize: 14, fontWeight: '600', flex: 1, marginLeft: 8 },
  budgetAmt: { fontSize: 12 },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  warnText: { fontSize: 11 },
  goalsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  goalAddBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  goalAddText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  goalCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 12 },
  goalTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  goalName: { fontSize: 15, fontWeight: '700', flex: 1 },
  goalAmtRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalAmt: { fontSize: 13 },
  goalPct: { fontSize: 13, fontWeight: '700' },
  goalDeadline: { fontSize: 11, marginTop: 6 },
});

export default BudgetsScreen;

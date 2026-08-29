import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, Send, TrendingUp, AlertTriangle, CircleCheck } from 'lucide-react-native';
import { Expense, Subscription, CategoryBudget, AppTheme, AIAdvisorMessage } from '../types';
import { getTheme } from '../theme';
import { formatCurrency } from '../utils/formatters';

interface AdvisorScreenProps {
  expenses: Expense[];
  subscriptions: Subscription[];
  budgets: CategoryBudget[];
  currency: string;
  theme: AppTheme;
}

const AdvisorScreen: React.FC<AdvisorScreenProps> = ({
  expenses, subscriptions, budgets, currency, theme: themeProp,
}) => {
  const colors = getTheme(themeProp);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIAdvisorMessage[]>([
    {
      id: '0',
      sender: 'assistant',
      text: 'Hello! I am your AI financial advisor. I can analyze your spending patterns, suggest budgets, and provide financial insights. What would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr) && (!e.type || e.type === 'expense'));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const dailyAvg = monthTotal / (new Date().getDate());
  const healthScore = Math.min(100, Math.round(Math.max(0, 100 - (monthTotal / 50))));

  const spentByCategory: Record<string, number> = {};
  monthExpenses.forEach(e => { spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount; });

  const overBudgetCategories = budgets.filter(b => {
    const spent = spentByCategory[b.category] || 0;
    return spent > b.limit;
  });
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('health') || q.includes('score')) {
      return 'Your financial health score is ' + healthScore + '/100. ' + (healthScore > 70 ? 'You are doing well! Keep maintaining your current habits.' : 'There is room for improvement. Lets look at your spending patterns.');
    }
    if (q.includes('spending') || q.includes('spend')) {
      const sorted = Object.entries(spentByCategory).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      return 'Your top spending category this month is ' + (top?.[0] || 'N/A') + ' at ' + formatCurrency((top?.[1] || 0), currency) + '. Your daily average spend is ' + formatCurrency(dailyAvg, currency) + '.';
    }
    if (q.includes('subscription') || q.includes('sub')) {
      const total = activeSubscriptions.reduce((s, sub) => s + sub.amount, 0);
      return 'You have ' + activeSubscriptions.length + ' active subscriptions costing ' + formatCurrency(total, currency) + '/month (' + formatCurrency(total * 12, currency) + '/year). Consider reviewing if you are using all of them.';
    }
    if (q.includes('budget') || q.includes('over')) {
      if (overBudgetCategories.length === 0) {
        return 'Great news! You are within budget across all categories this month.';
      }
      const list = overBudgetCategories.map(b => {
        const spent = spentByCategory[b.category] || 0;
        return b.category + ' (overspent ' + formatCurrency(spent - b.limit, currency, { hideCents: true }) + ')';
      }).join(', ');
      return 'You are over budget in: ' + list + '. Try reducing spending in these areas next month.';
    }
    if (q.includes('save') || q.includes('tip')) {
      const tips = [
        'Based on your ' + formatCurrency(monthTotal, currency, { hideCents: true }) + ' monthly spend, saving 10% (' + formatCurrency(monthTotal * 0.1, currency, { hideCents: true }) + ') could build your emergency fund faster.',
        'Your daily average is ' + formatCurrency(dailyAvg, currency) + '. Reducing by ' + formatCurrency(dailyAvg * 0.1, currency) + '/day saves ' + formatCurrency(dailyAvg * 0.1 * 30, currency, { hideCents: true }) + '/month.',
        'Consider the 50/30/20 rule: ' + formatCurrency(monthTotal * 0.5, currency, { hideCents: true }) + ' for needs, ' + formatCurrency(monthTotal * 0.3, currency, { hideCents: true }) + ' for wants, ' + formatCurrency(monthTotal * 0.2, currency, { hideCents: true }) + ' for savings.',
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    return 'I can help you analyze spending (' + formatCurrency(monthTotal, currency, { hideCents: true }) + ' this month), review subscriptions (' + activeSubscriptions.length + ' active), check budget status (' + overBudgetCategories.length + ' over budget), or provide savings tips. What interests you?';
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: AIAdvisorMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const advisorMsg: AIAdvisorMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: getAIResponse(input),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg, advisorMsg]);
    setInput('');
  };

  const quickActions = ['Health Score', 'My Spending', 'Subscriptions', 'Budget Status', 'Save Tips'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
        <View style={styles.scoreHeader}>
          <Brain size={24} color={colors.accent} />
          <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>Financial Health</Text>
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreValue, { color: healthScore > 70 ? colors.success : healthScore > 40 ? colors.warning : colors.danger }]}>
              {healthScore}
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>/ 100</Text>
          </View>
          <View style={styles.scoreDetails}>
            <View style={styles.scoreDetailRow}>
              {healthScore > 60 ? <CircleCheck size={14} color={colors.success} /> : <AlertTriangle size={14} color={colors.warning} />}
              <Text style={[styles.scoreDetailText, { color: colors.textPrimary }]}>Monthly Spend: {formatCurrency(monthTotal, currency, { hideCents: true })}</Text>
            </View>
            <View style={styles.scoreDetailRow}>
              <TrendingUp size={14} color="#3b82f6" />
              <Text style={[styles.scoreDetailText, { color: colors.textPrimary }]}>Daily Avg: {formatCurrency(dailyAvg, currency)}</Text>
            </View>
            <View style={styles.scoreDetailRow}>
              {overBudgetCategories.length === 0 ? (
                <CircleCheck size={14} color={colors.success} />
              ) : (
                <AlertTriangle size={14} color={colors.danger} />
              )}
              <Text style={[styles.scoreDetailText, { color: colors.textPrimary }]}>
                {overBudgetCategories.length === 0 ? 'All budgets on track' : overBudgetCategories.length + ' categories over budget'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.quickRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.quickBtn, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}
              onPress={() => { setInput(a); }}
            >
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>{a}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.sender === 'user' ? styles.userBubble : styles.advisorBubble,
              {
                backgroundColor: msg.sender === 'user' ? colors.accent : colors.card,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <Text style={[styles.bubbleText, { color: msg.sender === 'user' ? '#fff' : colors.textPrimary }]}>
              {msg.text}
            </Text>
            <Text style={[styles.bubbleTime, { color: msg.sender === 'user' ? '#ffffff99' : colors.textSecondary }]}>
              {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your finances..."
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.accent }]} onPress={handleSend}>
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scoreCard: { margin: 16, padding: 16, borderRadius: 14 },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  scoreTitle: { fontSize: 16, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreCircle: { alignItems: 'center' },
  scoreValue: { fontSize: 36, fontWeight: '900' },
  scoreLabel: { fontSize: 12 },
  scoreDetails: { flex: 1 },
  scoreDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  scoreDetailText: { fontSize: 13 },
  quickRow: { paddingHorizontal: 16, marginBottom: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chatArea: { flex: 1 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 14, marginBottom: 8 },
  userBubble: { borderBottomRightRadius: 4 },
  advisorBubble: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1 },
  input: { flex: 1, fontSize: 14, marginRight: 10, paddingVertical: 6 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});

export default AdvisorScreen;

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, CreditCard } from 'lucide-react-native';
import { Subscription, AppTheme } from '../types';
import { getTheme } from '../theme';
import { formatCurrency, getSubscriptionMonthlyCost, getDaysUntilDate } from '../utils/formatters';

interface SubscriptionsScreenProps {
  subscriptions: Subscription[];
  currency: string;
  theme: AppTheme;
  onAddSubscription: () => void;
  onToggleSubscription: (id: string) => void;
}

const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({
  subscriptions, currency, theme: themeProp, onAddSubscription, onToggleSubscription,
}) => {
  const colors = getTheme(themeProp);
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pausedSubs = subscriptions.filter(s => s.status === 'paused' || s.status === 'cancelled');

  const monthlyTotal = activeSubs.reduce((sum, s) => sum + getSubscriptionMonthlyCost(s), 0);
  const yearlyTotal = monthlyTotal * 12;

  const renderSubscription = ({ item }: { item: Subscription }) => {
    const daysUntil = getDaysUntilDate(item.nextBillingDate);
    const urgency = daysUntil <= 3 ? colors.danger : daysUntil <= 7 ? colors.warning : colors.success;

    return (
      <View style={[styles.subCard, { backgroundColor: colors.card }]}>
        <View style={styles.subHeader}>
          <View style={[styles.subIconWrap, { backgroundColor: (item.color || colors.accent) + '20' }]}>
            <CreditCard size={20} color={item.color || colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subName, { color: colors.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.subCat, { color: colors.textSecondary }]}>{item.category}</Text>
          </View>
          <Text style={[styles.subAmount, { color: colors.textPrimary }]}>
            {formatCurrency(item.amount, currency)}
          </Text>
        </View>
        <View style={styles.subFooter}>
          <View style={styles.subMetaRow}>
            <Calendar size={12} color={urgency} />
            <Text style={[styles.subDue, { color: urgency }]}>
              {daysUntil <= 0 ? 'Due today/overdue' : `Due in ${daysUntil} days`}
            </Text>
          </View>
          <Text style={[styles.subRecurrence, { color: colors.textSecondary }]}>
            {item.billingCycle}
          </Text>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: item.status === 'active' ? colors.danger + '20' : colors.success + '20' }]}
            onPress={() => onToggleSubscription(item.id)}
          >
            <Text style={{ color: item.status === 'active' ? colors.danger : colors.success, fontSize: 12, fontWeight: '600' }}>
              {item.status === 'active' ? 'Pause' : 'Resume'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Monthly Total</Text>
            <Text style={[styles.summaryValue, { color: colors.accent }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(monthlyTotal, currency)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Yearly Total</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(yearlyTotal, currency)}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Active</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{activeSubs.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Active Subscriptions</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={onAddSubscription}>
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeSubs}
        keyExtractor={(item) => item.id}
        renderItem={renderSubscription}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>No active subscriptions</Text>
        }
      />

      {pausedSubs.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginHorizontal: 20, marginTop: 12 }]}>
            Paused ({pausedSubs.length})
          </Text>
          <FlatList
            data={pausedSubs}
            keyExtractor={(item) => item.id}
            renderItem={renderSubscription}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: { margin: 16, padding: 16, borderRadius: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  subCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 12 },
  subHeader: { flexDirection: 'row', alignItems: 'center' },
  subIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  subName: { fontSize: 15, fontWeight: '700' },
  subCat: { fontSize: 12, marginTop: 2 },
  subAmount: { fontSize: 16, fontWeight: '800' },
  subFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  subMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  subDue: { fontSize: 12 },
  subRecurrence: { fontSize: 11 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});

export default SubscriptionsScreen;

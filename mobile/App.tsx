import React, { useState, useEffect, useCallback } from 'react';
import {
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Calendar,
  Target,
  Brain,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme } from './src/theme';
import {
  Expense,
  Subscription,
  WalletAccount,
  CategoryBudget,
  FinancialGoal,
  AppTheme,
} from './src/types';
import {
  INITIAL_WALLETS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_BUDGETS,
  INITIAL_EXPENSES,
  INITIAL_FINANCIAL_GOALS,
} from './src/data/sampleData';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SubscriptionsScreen from './src/screens/SubscriptionsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import AdvisorScreen from './src/screens/AdvisorScreen';
import ExpenseFormModal from './src/components/ExpenseFormModal';
import VoiceInputModal from './src/components/VoiceInputModal';
import WalletsManagerModal from './src/components/WalletsManagerModal';
import TransferModal from './src/components/TransferModal';
import Toast from './src/components/Toast';

const STORAGE_KEYS = {
  EXPENSES: '@finapp_expenses',
  WALLETS: '@finapp_wallets',
  SUBSCRIPTIONS: '@finapp_subscriptions',
  BUDGETS: '@finapp_budgets',
  GOALS: '@finapp_goals',
  THEME: '@finapp_theme',
  CURRENCY: '@finapp_currency',
};

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [wallets, setWallets] = useState<WalletAccount[]>(INITIAL_WALLETS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(INITIAL_BUDGETS);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_FINANCIAL_GOALS);
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [currency, setCurrency] = useState('USD');

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showWalletsModal, setShowWalletsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const colors = getTheme(theme);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [expenses, wallets, subscriptions, budgets, goals, theme, currency]);

  const loadData = async () => {
    try {
      const [
        savedExpenses, savedWallets, savedSubscriptions,
        savedBudgets, savedGoals, savedTheme, savedCurrency,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.getItem(STORAGE_KEYS.WALLETS),
        AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGETS),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY),
      ]);
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedWallets) setWallets(JSON.parse(savedWallets));
      if (savedSubscriptions) setSubscriptions(JSON.parse(savedSubscriptions));
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedTheme) setTheme(savedTheme as AppTheme);
      if (savedCurrency) setCurrency(savedCurrency);
    } catch (e) {
      console.log('Failed to load data:', e);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)),
        AsyncStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets)),
        AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions)),
        AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets)),
        AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals)),
        AsyncStorage.setItem(STORAGE_KEYS.THEME, theme),
        AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency),
      ]);
    } catch (e) {
      console.log('Failed to save data:', e);
    }
  };

  const handleSaveExpense = (data: Expense) => {
    if (editingExpense) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...e, ...data } : e));
      showToast('Transaction updated');
    } else {
      setExpenses(prev => [data, ...prev]);
      showToast('Transaction added');
    }
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Transaction deleted');
  };

  const handleVoiceProcess = (text: string) => {
    const lower = text.toLowerCase();
    let amount = 0;
    const amtMatch = lower.match(/(\d+\.?\d*)/);
    if (amtMatch) amount = parseFloat(amtMatch[1]);

    let category: Expense['category'] = 'Miscellaneous';
    if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('coffee') || lower.includes('restaurant')) category = 'Food & Dining';
    else if (lower.includes('transport') || lower.includes('uber') || lower.includes('gas')) category = 'Transportation';
    else if (lower.includes('shop') || lower.includes('buy') || lower.includes('amazon')) category = 'Shopping';
    else if (lower.includes('bill') || lower.includes('rent') || lower.includes('electric')) category = 'Housing & Utilities';

    const merchantMatch = text.match(/(?:at|from|for)\s+(.+?)(?:\s+for|\s+\d|$)/i);
    const merchant = merchantMatch ? merchantMatch[1].trim() : text.slice(0, 30);

    const newExpense: Expense = {
      id: Date.now().toString(),
      merchant,
      amount,
      currency: 'USD',
      category,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: 'Cash',
      tags: [],
      notes: 'Added via voice',
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    showToast('Expense added from voice input');
  };

  const handleAddWallet = (wallet: WalletAccount) => {
    setWallets(prev => [...prev, wallet]);
    showToast('Wallet added');
  };

  const handleUpdateWallet = (wallet: WalletAccount) => {
    setWallets(prev => prev.map(w => w.id === wallet.id ? wallet : w));
    showToast('Wallet updated');
  };

  const handleDeleteWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
    showToast('Wallet deleted');
  };

  const handleTransfer = (fromId: string, toId: string, amount: number) => {
    setWallets(prev => prev.map(w => {
      if (w.id === fromId) return { ...w, balance: w.balance - amount };
      if (w.id === toId) return { ...w, balance: w.balance + amount };
      return w;
    }));
    const transferExpense: Expense = {
      id: Date.now().toString(),
      merchant: 'Transfer',
      amount,
      currency: 'USD',
      category: 'Miscellaneous',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: 'Bank Transfer',
      type: 'transfer',
      walletAccountId: fromId,
      destinationWalletId: toId,
      tags: ['transfer'],
      notes: '',
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [transferExpense, ...prev]);
    showToast('Transfer completed');
  };

  const handleToggleSubscription = (id: string) => {
    setSubscriptions(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
    ));
  };

  const handleAddGoal = () => {
    const newGoal: FinancialGoal = {
      id: Date.now().toString(),
      title: 'New Goal',
      targetAmount: 1000,
      currentAmount: 0,
      currency,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Savings',
      color: '#D2AF26',
    };
    setGoals(prev => [...prev, newGoal]);
    showToast('Goal created');
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    showToast('Goal: ' + goal.title);
  };

  const iconColor = (focused: boolean) => focused ? colors.accent : colors.textSecondary;

  return (
    <>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              height: 60 + insets.bottom,
              paddingBottom: 8 + insets.bottom,
              paddingTop: 4,
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          }}
        >
          <Tab.Screen
            name="Overview"
            options={{
              tabBarIcon: ({ focused }) => <LayoutDashboard size={22} color={iconColor(focused)} />,
            }}
          >
            {() => (
              <DashboardScreen
                expenses={expenses}
                budgets={budgets}
                subscriptions={subscriptions}
                wallets={wallets}
                currency={currency}
                theme={theme}
                onAddExpense={() => { setEditingExpense(null); setShowExpenseModal(true); }}
                onVoiceInput={() => setShowVoiceModal(true)}
                onManageWallets={() => setShowWalletsModal(true)}
                onTransfer={() => setShowTransferModal(true)}
                onOpenGoals={() => {}}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Transactions"
            options={{
              tabBarIcon: ({ focused }) => <Receipt size={22} color={iconColor(focused)} />,
            }}
          >
            {() => (
              <TransactionsScreen
                expenses={expenses}
                wallets={wallets}
                currency={currency}
                theme={theme}
                onAddExpense={() => { setEditingExpense(null); setShowExpenseModal(true); }}
                onEditExpense={(e) => { setEditingExpense(e); setShowExpenseModal(true); }}
                onDeleteExpense={handleDeleteExpense}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Subscriptions"
            options={{
              tabBarIcon: ({ focused }) => <CreditCard size={22} color={iconColor(focused)} />,
            }}
          >
            {() => (
              <SubscriptionsScreen
                subscriptions={subscriptions}
                currency={currency}
                theme={theme}
                onAddSubscription={() => showToast('Add subscription')}
                onToggleSubscription={handleToggleSubscription}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Calendar"
            options={{
              tabBarIcon: ({ focused }) => <Calendar size={22} color={iconColor(focused)} />,
            }}
          >
            {() => (
              <CalendarScreen
                expenses={expenses}
                wallets={wallets}
                currency={currency}
                theme={theme}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Budgets"
            options={{
              tabBarIcon: ({ focused }) => <Target size={22} color={iconColor(focused)} />,
            }}
          >
            {() => (
              <BudgetsScreen
                budgets={budgets}
                goals={goals}
                expenses={expenses}
                currency={currency}
                theme={theme}
                onAddGoal={handleAddGoal}
                onEditGoal={handleEditGoal}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Advisor"
            options={{
              tabBarIcon: ({ focused }) => <Brain size={22} color={iconColor(focused)} />,
            }}
          >
            {() => (
              <AdvisorScreen
                expenses={expenses}
                subscriptions={subscriptions}
                budgets={budgets}
                currency={currency}
                theme={theme}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>

      <ExpenseFormModal
        visible={showExpenseModal}
        onClose={() => { setShowExpenseModal(false); setEditingExpense(null); }}
        onSave={handleSaveExpense}
        editExpense={editingExpense}
        theme={theme}
        wallets={wallets}
      />
      <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onProcess={handleVoiceProcess}
        theme={theme}
      />
      <WalletsManagerModal
        visible={showWalletsModal}
        onClose={() => setShowWalletsModal(false)}
        wallets={wallets}
        onAddWallet={handleAddWallet}
        onUpdateWallet={handleUpdateWallet}
        onDeleteWallet={handleDeleteWallet}
        theme={theme}
      />
      <TransferModal
        visible={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onTransfer={handleTransfer}
        wallets={wallets}
        theme={theme}
      />
      <Toast message={toast.message} visible={toast.visible} theme={theme} />
    </>
  );
};

const AppRoot: React.FC = () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
);

export default AppRoot;

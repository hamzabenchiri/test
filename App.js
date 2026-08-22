import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  LayoutDashboard,
  Receipt,
  Repeat,
  Sparkles,
  Mic,
  Settings,
  Plus,
  X,
  Camera,
  Sun,
  Moon,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  { id: '1', title: 'Blue Bottle Coffee', amount: 6.75, category: 'Food & Dining', date: 'Today', wallet: 'Apple Pay', type: 'expense' },
  { id: '2', title: 'Uber Trip Downtown', amount: 24.50, category: 'Transport', date: 'Today', wallet: 'Amex Gold', type: 'expense' },
  { id: '3', title: 'Whole Foods Market', amount: 82.14, category: 'Groceries', date: 'Yesterday', wallet: 'Chase Sapphire', type: 'expense' },
  { id: '4', title: 'Consulting Retainer', amount: 1250.00, category: 'Income', date: 'Yesterday', wallet: 'Mercury Bank', type: 'income' },
];

const INITIAL_SUBSCRIPTIONS = [
  { id: 'sub-1', name: 'Claude Pro & API', price: 20.00, cycle: 'monthly', renewal: 'Aug 24' },
  { id: 'sub-2', name: 'Vercel Pro Team', price: 20.00, cycle: 'monthly', renewal: 'Aug 28' },
  { id: 'sub-3', name: 'Gym & Spa All-Access', price: 145.00, cycle: 'monthly', renewal: 'Sep 01' },
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currency, setCurrency] = useState('USD');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions' | 'subscriptions'
  const [showVoiceBanner, setShowVoiceBanner] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  
  // Transaction creation form
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food & Dining');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Load persisted settings
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = window.localStorage.getItem('spense_theme_js');
        const savedBanner = window.localStorage.getItem('spense_show_voice_banner_v1');
        if (savedTheme) setTheme(savedTheme);
        if (savedBanner !== null) setShowVoiceBanner(savedBanner !== 'false');
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  const handleToggleVoiceBanner = () => {
    const nextVal = !showVoiceBanner;
    setShowVoiceBanner(nextVal);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('spense_show_voice_banner_v1', nextVal ? 'true' : 'false');
      }
    } catch (e) {}
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('spense_theme_js', nextTheme);
      }
    } catch (e) {}
  };

  const handleAddTransaction = () => {
    if (!newTitle.trim() || !newAmount.trim()) {
      alert('Please enter description and amount.');
      return;
    }
    const item = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      amount: parseFloat(newAmount) || 0,
      category: newCategory,
      date: 'Today',
      wallet: 'Default Wallet',
      type: 'expense',
    };
    setTransactions([item, ...transactions]);
    setNewTitle('');
    setNewAmount('');
    setIsAddModalOpen(false);
  };

  const handleSimulateVoiceInput = () => {
    if (!voiceInputText.trim()) return;
    // Simple AI heuristic parser in JavaScript
    const match = voiceInputText.match(/(\$?\d+(\.\d+)?)/);
    const amount = match ? parseFloat(match[1].replace('$', '')) : 15.00;
    const title = voiceInputText.replace(/(\$?\d+(\.\d+)?)/, '').replace(/spent on|spent|for|with|using/gi, '').trim() || 'Voice Entry';
    
    const newTx = {
      id: Date.now().toString(),
      title: title.charAt(0).toUpperCase() + title.slice(1),
      amount: amount,
      category: 'Smart Voice AI',
      date: 'Just now',
      wallet: 'Apple Pay',
      type: 'expense',
    };
    setTransactions([newTx, ...transactions]);
    setVoiceInputText('');
    setIsVoiceActive(false);
  };

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Navigation Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <Text style={[styles.brandText, { color: colors.textPrimary }]}>
            SPENSE <Text style={{ color: '#D2AF26' }}>AI</Text>
          </Text>
        </View>

        {/* Settings Action Button */}
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setIsSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <Settings size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'transactions', label: 'Transactions', icon: Receipt },
          { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                isActive && { backgroundColor: '#D2AF26' },
                !isActive && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={14} color={isActive ? '#141416' : colors.textSecondary} />
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? '#141416' : colors.textSecondary, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Scrollable View Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Voice AI Hero Banner */}
        {showVoiceBanner && activeTab === 'overview' && (
          <View style={[styles.voiceBanner, { backgroundColor: '#141417', borderColor: '#29292E' }]}>
            <TouchableOpacity
              style={styles.closeBannerBtn}
              onPress={handleToggleVoiceBanner}
            >
              <X size={14} color="#888" />
            </TouchableOpacity>

            <View style={styles.voiceHeaderRow}>
              <View style={styles.voiceBadge}>
                <Text style={styles.voiceBadgeText}>SPENSE VOICE AI</Text>
              </View>
            </View>

            <Text style={styles.voiceTitle}>"Spent $18.50 on lunch with Apple Pay"</Text>
            <Text style={styles.voiceSubtitle}>
              Speak or snap receipts — AI structures merchant, price, category, and wallet automatically.
            </Text>

            <View style={styles.voiceActionsRow}>
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => setIsVoiceActive(true)}
              >
                <Mic size={16} color="#141416" />
                <Text style={styles.speakButtonText}>Speak Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setIsAddModalOpen(true)}
              >
                <Camera size={16} color="#D2AF26" />
                <Text style={styles.scanButtonText}>Scan Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {activeTab === 'overview' && 'Financial Overview'}
            {activeTab === 'transactions' && 'All Transactions'}
            {activeTab === 'subscriptions' && 'Active Subscriptions'}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Real-time daily allowance, net worth aggregate, and ledger
          </Text>
        </View>

        {/* Financial Metrics Cards */}
        {activeTab === 'overview' && (
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Daily Allowance</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>$351.47</Text>
              <Text style={styles.metricSub}>• Ahead • 10d left</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Month Outflow</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>${totalExpense.toFixed(2)}</Text>
              <Text style={styles.metricSub}>21% of monthly target</Text>
            </View>
          </View>
        )}

        {/* Transactions / Activity List */}
        {activeTab !== 'subscriptions' && (
          <>
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
            </View>

            {transactions.map((tx) => (
              <View
                key={tx.id}
                style={[styles.txItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.txLeft}>
                  <View style={[styles.txIconBox, { backgroundColor: tx.type === 'income' ? 'rgba(34,197,94,0.1)' : colors.cardSubtle }]}>
                    {tx.type === 'income' ? (
                      <TrendingUp size={16} color="#22c55e" />
                    ) : (
                      <Receipt size={16} color="#D2AF26" />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.txTitle, { color: colors.textPrimary }]}>{tx.title}</Text>
                    <Text style={[styles.txCategory, { color: colors.textSecondary }]}>
                      {tx.category} • {tx.wallet}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#22c55e' : colors.textPrimary }]}>
                  {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Subscriptions List */}
        {activeTab === 'subscriptions' && (
          <>
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Recurring Services</Text>
            </View>

            {subscriptions.map((sub) => (
              <View
                key={sub.id}
                style={[styles.txItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View>
                  <Text style={[styles.txTitle, { color: colors.textPrimary }]}>{sub.name}</Text>
                  <Text style={[styles.txCategory, { color: colors.textSecondary }]}>
                    Renews on {sub.renewal} • {sub.cycle}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: colors.textPrimary }]}>
                  ${Number(sub.price).toFixed(2)}/mo
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating Bottom Dock */}
      <View style={[styles.bottomDock, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.dockVoiceBtn}
          onPress={() => setIsVoiceActive(true)}
        >
          <Mic size={16} color="#141416" />
          <Text style={styles.dockVoiceText}>Voice AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dockIconBtn, { backgroundColor: colors.cardSubtle }]}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Camera size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dockAddBtn, { backgroundColor: '#D2AF26' }]}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Plus size={20} color="#141416" />
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.settingsModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Settings & Preferences</Text>
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Theme Toggle */}
            <Text style={[styles.settingsLabel, { color: colors.textSecondary }]}>Appearance Theme</Text>
            <View style={styles.themeToggleRow}>
              <TouchableOpacity
                style={[styles.themeOption, !isDark && styles.themeSelected]}
                onPress={() => isDark && handleToggleTheme()}
              >
                <Sun size={16} color={!isDark ? '#D2AF26' : '#888'} />
                <Text style={{ color: !isDark ? '#D2AF26' : colors.textSecondary, fontWeight: '600' }}>Light</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.themeOption, isDark && styles.themeSelected]}
                onPress={() => !isDark && handleToggleTheme()}
              >
                <Moon size={16} color={isDark ? '#D2AF26' : '#888'} />
                <Text style={{ color: isDark ? '#D2AF26' : colors.textSecondary, fontWeight: '600' }}>Dark</Text>
              </TouchableOpacity>
            </View>

            {/* Voice Banner Toggle */}
            <View style={styles.settingSwitchRow}>
              <View>
                <Text style={[styles.settingSwitchTitle, { color: colors.textPrimary }]}>Voice AI Hero Banner</Text>
                <Text style={[styles.settingSwitchSub, { color: colors.textSecondary }]}>
                  {showVoiceBanner ? 'Shown on dashboard' : 'Hidden from dashboard'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.togglePill, { backgroundColor: showVoiceBanner ? '#D2AF26' : '#444' }]}
                onPress={handleToggleVoiceBanner}
              >
                <View style={[styles.toggleCircle, showVoiceBanner && { transform: [{ translateX: 16 }] }]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Voice Assistant Modal */}
      <Modal visible={isVoiceActive} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.voiceModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Mic size={18} color="#D2AF26" />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Spense Voice AI</Text>
              </View>
              <TouchableOpacity onPress={() => setIsVoiceActive(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 14 }}>
              Try saying: <Text style={{ color: '#D2AF26', fontWeight: '600' }}>"Spent $28 on dinner with Apple Pay"</Text>
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder='e.g. "Spent $14 on coffee"'
              placeholderTextColor={colors.textSecondary}
              value={voiceInputText}
              onChangeText={setVoiceInputText}
              autoFocus
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSimulateVoiceInput}>
              <Text style={styles.submitButtonText}>Process AI Voice Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.addModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Record Entry</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Description (e.g. Starbucks Coffee)"
              placeholderTextColor={colors.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Amount ($)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={newAmount}
              onChangeText={setNewAmount}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddTransaction}>
              <Text style={styles.submitButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const darkColors = {
  background: '#0c0c0e',
  card: '#161619',
  cardSubtle: '#222227',
  border: '#2a2a30',
  inputBg: '#1f1f24',
  textPrimary: '#f3f3f3',
  textSecondary: '#8a8a93',
};

const lightColors = {
  background: '#f4f4f6',
  card: '#ffffff',
  cardSubtle: '#eaeaea',
  border: '#e2e2e7',
  inputBg: '#f8f8fa',
  textPrimary: '#141416',
  textSecondary: '#6c6c75',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandText: { fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabText: { fontSize: 12 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  voiceBanner: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  closeBannerBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 10,
  },
  voiceHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  voiceBadge: {
    backgroundColor: 'rgba(210, 175, 38, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  voiceBadgeText: { color: '#D2AF26', fontSize: 10, fontWeight: '700' },
  voiceTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  voiceSubtitle: { color: '#999', fontSize: 12, marginBottom: 14 },
  voiceActionsRow: { flexDirection: 'row', gap: 10 },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D2AF26',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  speakButtonText: { color: '#141416', fontSize: 12, fontWeight: '700' },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#26262a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  scanButtonText: { color: '#eee', fontSize: 12, fontWeight: '600' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { fontSize: 12, marginTop: 2 },
  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metricCard: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1 },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  metricValue: { fontSize: 20, fontWeight: '800', marginVertical: 4 },
  metricSub: { fontSize: 10, color: '#D2AF26', fontWeight: '600' },
  listHeader: { marginBottom: 10 },
  listTitle: { fontSize: 15, fontWeight: '700' },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 13, fontWeight: '600' },
  txCategory: { fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  bottomDock: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 30,
    borderWidth: 1,
    elevation: 8,
  },
  dockVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D2AF26',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  dockVoiceText: { color: '#141416', fontWeight: '700', fontSize: 12 },
  dockIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dockAddBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  settingsModal: { padding: 20, borderRadius: 20, borderWidth: 1 },
  voiceModal: { padding: 20, borderRadius: 20, borderWidth: 1 },
  addModal: { padding: 20, borderRadius: 20, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  settingsLabel: { fontSize: 12, marginBottom: 8 },
  themeToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  themeSelected: { borderColor: '#D2AF26', backgroundColor: 'rgba(210, 175, 38, 0.1)' },
  settingSwitchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingSwitchTitle: { fontSize: 13, fontWeight: '600' },
  settingSwitchSub: { fontSize: 11 },
  togglePill: { width: 36, height: 20, borderRadius: 10, padding: 2 },
  toggleCircle: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  input: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12, fontSize: 13 },
  submitButton: { backgroundColor: '#D2AF26', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#141416', fontWeight: '700', fontSize: 14 },
});

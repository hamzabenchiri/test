import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { X } from 'lucide-react-native';
import { getTheme } from '../theme';
import { AppTheme } from '../types';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  theme?: AppTheme;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, title, children, theme: themeProp }) => {
  const colors = getTheme(themeProp || 'dark');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card }]}>
              <View style={styles.handleRow}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
              </View>
              {title && (
                <View style={styles.header}>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.content}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 34,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
});

export default BottomSheet;

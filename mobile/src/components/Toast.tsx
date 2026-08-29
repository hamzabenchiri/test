import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme } from '../theme';
import { AppTheme } from '../types';

interface ToastProps {
  message: string | null;
  visible: boolean;
  theme?: AppTheme;
}

const Toast: React.FC<ToastProps> = ({ message, visible, theme: themeProp }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const colors = getTheme(themeProp || 'dark');

  useEffect(() => {
    if (visible && message) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, message, opacity]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: colors.card, top: insets.top + 10 }]}>
      <View style={[styles.indicator, { backgroundColor: colors.accent }]} />
      <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 9999,
  },
  indicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default Toast;

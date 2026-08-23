import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Utensils, ShoppingBag, Car, Home, Film, HeartPulse, Plane,
  Repeat, Laptop, GraduationCap, Sparkles, TrendingUp, LineChart,
  MoreHorizontal, CreditCard,
} from 'lucide-react-native';
import { ExpenseCategory } from '../types';
import { CATEGORY_CONFIG } from '../utils/formatters';

const ICON_MAP: Record<string, any> = {
  Utensils, ShoppingBag, Car, Home, Film, HeartPulse, Plane,
  Repeat, Laptop, GraduationCap, Sparkles, TrendingUp, LineChart,
  MoreHorizontal, CreditCard,
};

interface CategoryIconProps {
  category: ExpenseCategory | string;
  size?: number;
  color?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size = 20, color }) => {
  const config = CATEGORY_CONFIG[category as ExpenseCategory];
  const iconName = config?.icon || 'MoreHorizontal';
  const iconColor = color || config?.color || '#9ca3af';
  const IconComp = ICON_MAP[iconName] || MoreHorizontal;

  return (
    <View
      style={[
        styles.container,
        {
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
          backgroundColor: iconColor + '20',
        },
      ]}
    >
      <IconComp size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoryIcon;

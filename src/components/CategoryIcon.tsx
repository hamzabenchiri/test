import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Film,
  HeartPulse,
  Plane,
  Repeat,
  Laptop,
  GraduationCap,
  Sparkles,
  Tag,
  Receipt,
  LucideProps,
} from 'lucide-react';
import { ExpenseCategory } from '../types';

interface Props extends LucideProps {
  category: ExpenseCategory | string;
}

export const CategoryIcon: React.FC<Props> = ({ category, ...props }) => {
  switch (category) {
    case 'Food & Dining':
      return <Utensils {...props} />;
    case 'Groceries':
      return <ShoppingBag {...props} />;
    case 'Shopping':
      return <ShoppingBag {...props} />;
    case 'Transportation':
      return <Car {...props} />;
    case 'Housing & Utilities':
      return <Home {...props} />;
    case 'Entertainment':
      return <Film {...props} />;
    case 'Health & Fitness':
      return <HeartPulse {...props} />;
    case 'Travel':
      return <Plane {...props} />;
    case 'Subscriptions':
      return <Repeat {...props} />;
    case 'Technology':
      return <Laptop {...props} />;
    case 'Education':
      return <GraduationCap {...props} />;
    case 'Personal Care':
      return <Sparkles {...props} />;
    default:
      return <Tag {...props} />;
  }
};

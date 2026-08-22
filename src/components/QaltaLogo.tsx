import React from 'react';
import { SpenseLogo } from './SpenseLogo';

interface QaltaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const QaltaLogo: React.FC<QaltaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  return <SpenseLogo size={size} showText={showText} className={className} />;
};

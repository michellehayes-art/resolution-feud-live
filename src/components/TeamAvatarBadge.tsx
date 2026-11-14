import React from 'react';
import { getAvatarById } from '../data/avatars';

interface TeamAvatarBadgeProps {
  avatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export const TeamAvatarBadge: React.FC<TeamAvatarBadgeProps> = ({
  avatarId,
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const avatar = getAvatarById(avatarId);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-2xl',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${avatar.bgGradient} ${
        showBorder ? `border-2 ${avatar.borderColor} shadow-md` : ''
      } ${sizeClasses[size]} shrink-0 select-none ${className}`}
      title={avatar.name}
    >
      <span className="leading-none drop-shadow-sm">{avatar.emoji}</span>
    </div>
  );
};

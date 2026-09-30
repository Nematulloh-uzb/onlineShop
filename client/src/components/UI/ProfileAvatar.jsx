import { useState } from 'react';
import { UserRound } from 'lucide-react';

export default function ProfileAvatar({ user, className = '', imageClassName = '' }) {
  const [failedImage, setFailedImage] = useState('');
  const photo = user?.avatarUrl;
  const displayName = [user?.name, user?.surname].filter(Boolean).join(' ') || 'Foydalanuvchi';
  const initials = `${user?.name?.trim()?.[0] || ''}${user?.surname?.trim()?.[0] || ''}`.toUpperCase();

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-[#F0F2E8] font-['Inter'] font-semibold text-[#56642B] ${className}`}
      role="img"
      aria-label={`${displayName} profil rasmi`}
    >
      {photo && failedImage !== photo ? (
        <img
          src={photo}
          alt=""
          className={`h-full w-full object-cover ${imageClassName}`}
          onError={() => setFailedImage(photo)}
        />
      ) : initials ? (
        <span aria-hidden="true" className="select-none">{initials}</span>
      ) : (
        <UserRound aria-hidden="true" className="h-1/2 w-1/2" />
      )}
    </span>
  );
}

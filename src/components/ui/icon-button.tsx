'use client';
import { useState, type ButtonHTMLAttributes } from 'react';
import {
  TiArrowBack,
  TiArrowBackOutline,
  TiDownload,
  TiDownloadOutline,
  TiMediaFastForward,
  TiMediaFastForwardOutline,
  TiMediaPause,
  TiMediaPauseOutline,
  TiMediaPlay,
  TiMediaPlayOutline,
  TiMediaStop,
  TiMediaStopOutline,
} from '@/components/ui/icons';
import {
  AiFillCloseCircle,
  AiOutlineCloseCircle,
  AiOutlineSortAscending,
  AiOutlineSortDescending,
  AiFillInfoCircle,
  AiOutlineInfoCircle,
  AiFillWarning,
  AiOutlineWarning,
} from '@/components/ui/icons';
import { RiAlarmWarningFill, RiAlarmWarningLine } from '@/components/ui/icons';
import { BsBell, BsBellFill } from '@/components/ui/icons';
import { GiBleedingEye } from '@/components/ui/icons';
import styles from './ui.module.css';

const icons = {
  play: [TiMediaPlay, TiMediaPlayOutline],
  forward: [TiMediaFastForward, TiMediaFastForwardOutline],
  pause: [TiMediaPause, TiMediaPauseOutline],
  stop: [TiMediaStop, TiMediaStopOutline],
  back: [TiArrowBack, TiArrowBackOutline],
  download: [TiDownload, TiDownloadOutline],
  close: [AiFillCloseCircle, AiOutlineCloseCircle],
  sortAsc: [AiOutlineSortAscending, AiOutlineSortAscending],
  sortDesc: [AiOutlineSortDescending, AiOutlineSortDescending],
  info: [AiFillInfoCircle, AiOutlineInfoCircle],
  warning: [AiFillWarning, AiOutlineWarning],
  error: [RiAlarmWarningFill, RiAlarmWarningLine],
  notification: [BsBell, BsBellFill],
  reportsPlay: [GiBleedingEye, GiBleedingEye],
} as const;
export type IconName = keyof typeof icons;
export function IconButton({
  icon,
  label,
  active = false,
  attention = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
  active?: boolean;
  attention?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const Icon = icons[icon][hover || active ? 1 : 0];
  const size =
    icon === 'notification'
      ? 16
      : ['info', 'warning', 'error', 'reportsPlay'].includes(icon)
        ? 18
        : 36;
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      title={label}
      className={`${styles.iconButton} ${active ? styles.active : ''} ${attention ? styles.attention : ''} ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Icon size={size} />
    </button>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { IconButton } from './icon-button';
import styles from './ui.module.css';
import { usePreferences } from '@/apps/shell/preferences';

export function TopMenu({ children, fixed = false }: { children: ReactNode; fixed?: boolean }) {
  const router = useRouter();
  const { t } = usePreferences();

  return (
    <div className={`${styles.topMenu} ${fixed ? styles.inFlow : ''}`}>
      <div className={styles.container}>
        <IconButton icon="back" label={t('Назад', 'Back')} onClick={() => router.push('/')} />
      </div>
      <div className={`${styles.container} ${styles.horizontal}`}>{children}</div>
    </div>
  );
}

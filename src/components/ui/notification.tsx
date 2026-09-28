'use client';

import { useState, type ReactNode } from 'react';
import { IconButton, type IconName } from './icon-button';
import styles from './notification.module.css';

export function Notification({
  children,
  mode,
  label,
}: {
  children: ReactNode;
  mode: IconName;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.root}>
      <IconButton
        icon={mode}
        label={label}
        active={open}
        attention={mode === 'error' || mode === 'warning'}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className={styles.content}>
          <div className={styles.scroll}>{children}</div>
        </div>
      )}
    </div>
  );
}

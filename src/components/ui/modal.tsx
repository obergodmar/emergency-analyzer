'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './icon-button';
import { usePreferences } from '@/apps/shell/preferences';
import styles from './modal.module.css';
export function Modal({
  children,
  onClose,
  fixed = false,
  autoHeight = false,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  fixed?: boolean;
  autoHeight?: boolean;
  label: string;
}) {
  const { t } = usePreferences();
  const dialog = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);
  const close = () => {
    if (timer.current) return;
    setClosing(true);
    timer.current = setTimeout(onClose, 250);
  };
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    element?.focus();
    return () => {
      element?.close();
      previous?.focus();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  return createPortal(
    <dialog
      tabIndex={-1}
      ref={dialog}
      aria-label={label}
      className={`${styles.overlay} ${closing ? styles.closing : ''}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={`${styles.content} ${fixed ? styles.fixed : ''} ${autoHeight ? styles.autoHeight : ''}`}
      >
        {children}
      </div>
      <div className={styles.close}>
        <IconButton icon="close" label={t('Закрыть', 'Close')} onClick={close} />
      </div>
    </dialog>,
    document.body,
  );
}

import type { ReactNode } from 'react';
import styles from './ui.module.css';

export function MenuItem({
  title,
  description,
  icon,
  warning = false,
  flat = false,
  odd = false,
  hoverDescription = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  warning?: boolean;
  flat?: boolean;
  odd?: boolean;
  hoverDescription?: boolean;
}) {
  return (
    <>
      <span className={`${styles.item} ${flat ? styles.flat : ''} ${odd ? styles.odd : ''}`}>
        <span className={styles.itemContent}>
          <span className={styles.text}>{title}</span>
          {!flat && !hoverDescription && (
            <span
              className={`${styles.secondary} ${styles.notMobile} ${warning ? styles.warning : ''}`}
            >
              {description}
            </span>
          )}
        </span>
        {icon && <span className={styles.itemIcon}>{icon}</span>}
      </span>
      {description && hoverDescription && (
        <span className={styles.hoverDescription}>{description}</span>
      )}
    </>
  );
}

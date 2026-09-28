import { BiLoaderAlt } from '@/components/ui/icons';
import styles from './ui.module.css';
export function Loading() {
  return (
    <div className={styles.centered} role="status" aria-label="Loading">
      <BiLoaderAlt className={styles.spinner} size={60} />
    </div>
  );
}
export function ProgressBar() {
  return <div className={styles.progress} role="progressbar" aria-label="Loading" />;
}

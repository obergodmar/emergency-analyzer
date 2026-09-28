'use client';
import { useState, type ReactNode } from 'react';
import { MdLanguage } from '@/components/ui/icons';
import { CgFormatSlash, CgDarkMode } from '@/components/ui/icons';
import { usePreferences } from './preferences';
import { useTranslation } from './use-translation';
import { Modal } from '@/components/ui/modal';
import ui from '@/components/ui/ui.module.css';
import styles from './shell.module.css';
export function Shell({ children }: { children: ReactNode }) {
  const { locale, setLocale, dark, setDark, t: localize } = usePreferences();
  const t = useTranslation();
  const [about, setAbout] = useState(false);
  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.group}>
          <span className={`${styles.language} ${ui.notMobile}`}>
            <MdLanguage size={16} />
            <span className={ui.text}>{t('footer.language')}: </span>
          </span>
          {(['ru', 'en'] as const).map((lang, i) => (
            <span key={lang} className={styles.language}>
              {i === 1 && <CgFormatSlash size={20} />}
              <button
                className={`${ui.textButton} ${locale === lang ? ui.selectedText : ''}`}
                onClick={() => setLocale(lang)}
              >
                {t(`footer.languages.${lang}`)}
              </button>
            </span>
          ))}
        </div>
        <div className={styles.group}>
          <button
            role="switch"
            aria-checked={dark}
            aria-label={localize('Переключить тему', 'Toggle theme')}
            onClick={() => setDark(!dark)}
            className={`${styles.switch} ${dark ? styles.dark : ''}`}
          >
            <CgDarkMode size={20} />
            <span />
          </button>
        </div>
        <div className={styles.group}>
          <button className={styles.aboutButton} onClick={() => setAbout(true)}>
            {t('footer.about.title')}
          </button>
        </div>
      </footer>
      {about && (
        <Modal label={t('footer.about.title')} onClose={() => setAbout(false)} fixed autoHeight>
          <div className={styles.about}>
            <h1 className={ui.title}>Emergency Analyzer</h1>
            <p className={`${ui.text} ${ui.notMobile}`}>{t('footer.about.description')}</p>
            <p className={styles.version}>
              <span className={ui.text}>{t('footer.about.version')}: </span>
              <i className={styles.versionNumber}>2.0.0</i>
            </p>
            <p className={ui.secondary}>
              {localize(
                'Исторические данные из архива проекта, около 2020 года. Учебная модель.',
                'Historical project archive data, circa 2020. Educational model.',
              )}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

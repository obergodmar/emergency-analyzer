'use client';
import { usePreferences } from '@/apps/shell/preferences';
import { TopMenu } from '@/components/ui/top-menu';
import ui from '@/components/ui/ui.module.css';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = usePreferences();
  return (
    <>
      <TopMenu>
        <h1 className={`${ui.title} ${ui.smallTitle}`}>
          {t('Не удалось загрузить страницу', 'Unable to load page')}
        </h1>
        <button className={ui.textButton} onClick={reset}>
          {t('Повторить', 'Retry')}
        </button>
      </TopMenu>
    </>
  );
}

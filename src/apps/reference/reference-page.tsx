'use client';

import dynamic from 'next/dynamic';
import { TopMenu } from '@/components/ui/top-menu';
import { useTranslation } from '@/apps/shell/use-translation';
import { Loading } from '@/components/ui/loading';
import ui from '@/components/ui/ui.module.css';

const DocumentViewer = dynamic(() => import('./document-viewer'), {
  ssr: false,
  loading: () => <Loading />,
});

export function ReferencePage() {
  const t = useTranslation();

  return (
    <>
      <DocumentViewer />
      <TopMenu>
        <h1 className={`${ui.title} ${ui.smallTitle} ${ui.notMobile}`}>{t('menu.references')}</h1>
      </TopMenu>
    </>
  );
}

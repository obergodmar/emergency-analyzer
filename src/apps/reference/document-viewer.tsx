'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePreferences } from '@/apps/shell/preferences';
import { useWindowSize } from '@/utils/use-window-size';
import { Loading } from '@/components/ui/loading';
import styles from './reference.module.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
const options = {
  cMapUrl: '/pdf-assets/cmaps/',
  standardFontDataUrl: '/pdf-assets/standard_fonts/',
  wasmUrl: '/pdf-assets/wasm/',
};

export default function DocumentViewer() {
  const { locale, t } = usePreferences();
  const { width } = useWindowSize();
  const [pages, setPages] = useState(0);

  return (
    <div className={styles.scroll}>
      <div className={styles.column}>
        <Document
          key={locale}
          file={`/documents/howto_${locale}.pdf`}
          options={options}
          loading={<Loading />}
          error={
            <p role="alert">{t('Не удалось загрузить инструкцию.', 'Unable to load the guide.')}</p>
          }
          onLoadSuccess={({ numPages }) => setPages(numPages)}
        >
          {Array.from({ length: pages }, (_, i) => (
            <Page
              key={i + 1}
              pageNumber={i + 1}
              width={width <= 520 ? Math.max(200, width - 60) : 1200}
              loading=""
            />
          ))}
        </Document>
      </div>
    </div>
  );
}

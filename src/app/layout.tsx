import type { Metadata } from 'next';
import { PreferencesProvider } from '@/apps/shell/preferences';
import { Shell } from '@/apps/shell/shell';
import { DraftProvider } from '@/apps/simulator/draft-provider';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
export const metadata: Metadata = {
  title: { default: 'Emergency Analyzer', template: '%s · Emergency Analyzer' },
  description: 'Educational emergency scenario simulator with historical data.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="light">
      <body>
        <PreferencesProvider>
          <DraftProvider>
            <Shell>{children}</Shell>
          </DraftProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}

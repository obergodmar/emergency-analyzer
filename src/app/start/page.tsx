import { Suspense } from 'react';
import { Loading } from '@/components/ui/loading';
import { Player } from '@/apps/simulator/player';

export const metadata = { title: 'Симуляция' };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Player />
    </Suspense>
  );
}

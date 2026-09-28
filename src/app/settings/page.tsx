import { Suspense } from 'react';
import { Loading } from '@/components/ui/loading';
import { ScenarioForm } from '@/apps/simulator/scenario-form';

export const metadata = { title: 'Настройка сценария' };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ScenarioForm />
    </Suspense>
  );
}

import { TopMenu } from '@/components/ui/top-menu';
import ui from '@/components/ui/ui.module.css';
export default function NotFound() {
  return (
    <TopMenu>
      <h1 className={`${ui.title} ${ui.smallTitle}`}>404</h1>
    </TopMenu>
  );
}

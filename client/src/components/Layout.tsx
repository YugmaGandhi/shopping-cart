import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';

/** App shell: persistent header + routed page content. */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container flex-1 py-8">
        <Outlet />
      </main>
    </div>
  );
}

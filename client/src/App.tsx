import { Button } from '@/components/ui/button';

/**
 * Placeholder app — proves the Tailwind-token → shadcn pipeline renders.
 * Real routing, layout, and features arrive in Phase 2.
 */
function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <p className="text-muted-foreground">Foundation ready. Features coming in Phase 2.</p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </main>
  );
}

export default App;

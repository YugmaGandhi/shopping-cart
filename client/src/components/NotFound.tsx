import { Button } from '@/components/ui/button';

/** 404 page — wired as the router's catch-all / errorElement in Stage 2.4. */
export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl font-bold text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Button asChild>
        <a href="/">Back to products</a>
      </Button>
    </div>
  );
}

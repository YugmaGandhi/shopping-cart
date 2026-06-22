import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Inline error with an optional retry action. Reused across features. */
export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive',
        className,
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message ?? 'Something went wrong.'}</span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

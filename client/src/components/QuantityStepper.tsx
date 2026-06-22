import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuantityStepperProps {
  quantity: number;
  /** Called with the requested next quantity. A value of 0 conventionally means "remove". */
  onChange: (next: number) => void;
  disabled?: boolean;
  className?: string;
}

/** Reusable minus/quantity/plus control shared by the cart and product list. */
export function QuantityStepper({ quantity, onChange, disabled, className }: QuantityStepperProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        aria-label="Decrease quantity"
        disabled={disabled}
        onClick={() => onChange(quantity - 1)}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(quantity + 1)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

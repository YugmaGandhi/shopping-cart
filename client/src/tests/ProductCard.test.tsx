import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '@/features/products/ProductCard';
import type { Product } from '@/features/products/types';
import { renderWithProviders } from './test-utils';

const { addMock, updateMock, navigateMock, cartState } = vi.hoisted(() => ({
  addMock: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  updateMock: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  navigateMock: vi.fn(),
  cartState: {
    current: undefined as
      | undefined
      | { items: Array<{ product: { id: string }; quantity: number }> },
  },
}));

vi.mock('@/features/cart/cartApi', () => ({
  useAddItemMutation: () => [addMock, { isLoading: false }],
  useUpdateQtyMutation: () => [updateMock, { isLoading: false }],
  useGetCartQuery: () => ({ data: cartState.current }),
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => navigateMock,
}));

const product: Product = {
  id: 'p1',
  name: 'Gadget',
  description: 'A gadget',
  price: 19.99,
  imageUrl: 'https://example.com/g.png',
  stock: 5,
  createdAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  addMock.mockClear();
  updateMock.mockClear();
  navigateMock.mockClear();
  cartState.current = undefined;
});

describe('ProductCard', () => {
  it('renders product name and price', () => {
    renderWithProviders(<ProductCard product={product} />, { authed: true });
    expect(screen.getByText('Gadget')).toBeInTheDocument();
    expect(screen.getByText('₹19.99')).toBeInTheDocument();
  });

  it('adds to cart when authenticated', async () => {
    renderWithProviders(<ProductCard product={product} />, { authed: true });
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(addMock).toHaveBeenCalledWith({ productId: 'p1', quantity: 1, _product: product });
  });

  it('does not call the mutation when out of stock (button disabled)', async () => {
    renderWithProviders(<ProductCard product={{ ...product, stock: 0 }} />, { authed: true });
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
    expect(addMock).not.toHaveBeenCalled();
  });

  it('redirects to /login (no add) when not authenticated', async () => {
    renderWithProviders(<ProductCard product={product} />); // not authed
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(addMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('shows the in-cart count and a stepper instead of the Add button when in cart', () => {
    cartState.current = { items: [{ product: { id: 'p1' }, quantity: 2 }] };
    renderWithProviders(<ProductCard product={product} />, { authed: true });
    expect(screen.getByText('2 in cart')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument();
  });

  it('increments quantity via the stepper', async () => {
    cartState.current = { items: [{ product: { id: 'p1' }, quantity: 2 }] };
    renderWithProviders(<ProductCard product={product} />, { authed: true });
    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(updateMock).toHaveBeenCalledWith({ productId: 'p1', quantity: 3 });
  });

  it('decrementing the last unit requests quantity 0 (removal)', async () => {
    cartState.current = { items: [{ product: { id: 'p1' }, quantity: 1 }] };
    renderWithProviders(<ProductCard product={product} />, { authed: true });
    await userEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(updateMock).toHaveBeenCalledWith({ productId: 'p1', quantity: 0 });
  });
});

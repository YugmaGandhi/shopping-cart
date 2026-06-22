import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartItem } from '@/features/cart/CartItem';
import type { CartItem as CartItemType } from '@/features/cart/types';

// Mock the cart API hooks so no store/network is needed.
const { updateMock, removeMock } = vi.hoisted(() => ({
  updateMock: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  removeMock: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
}));

vi.mock('@/features/cart/cartApi', () => ({
  useUpdateQtyMutation: () => [updateMock, { isLoading: false }],
  useRemoveItemMutation: () => [removeMock, { isLoading: false }],
}));

const item: CartItemType = {
  product: {
    id: 'p1',
    name: 'Widget',
    description: 'A widget',
    price: 10,
    imageUrl: 'https://example.com/w.png',
    stock: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  quantity: 2,
  lineTotal: 20,
};

beforeEach(() => {
  updateMock.mockClear();
  removeMock.mockClear();
});

describe('CartItem', () => {
  it('renders the product name, quantity, and line total', () => {
    render(<CartItem item={item} />);
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
  });

  it('increments quantity when + is clicked', async () => {
    render(<CartItem item={item} />);
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(updateMock).toHaveBeenCalledWith({ productId: 'p1', quantity: 3 });
  });

  it('decrements quantity when − is clicked', async () => {
    render(<CartItem item={item} />);
    await userEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(updateMock).toHaveBeenCalledWith({ productId: 'p1', quantity: 1 });
  });

  it('removes the item when the trash button is clicked', async () => {
    render(<CartItem item={item} />);
    await userEvent.click(screen.getByLabelText('Remove item'));
    expect(removeMock).toHaveBeenCalledWith('p1');
  });
});

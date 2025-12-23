'use client';

import { redirect } from 'next/navigation';

// Cart redirects to checkout
export default function CartPage() {
  redirect('/checkout');
}


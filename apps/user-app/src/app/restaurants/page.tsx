'use client';

import { redirect } from 'next/navigation';

// Restaurants list redirects to search
export default function RestaurantsPage() {
  redirect('/search');
}


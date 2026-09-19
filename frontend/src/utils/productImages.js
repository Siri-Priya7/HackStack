/**
 * Curated High-Quality Food & Grocery Photo Presets for Kirana Stores
 */

export const PRESET_PRODUCT_IMAGES = [
  {
    label: 'Rice / Chawal',
    category: 'Grains',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Wheat Flour / Atta',
    category: 'Grains',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Sugar / Chini',
    category: 'Essentials',
    url: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Cooking Oil / Tel',
    category: 'Oils',
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Fresh Milk / Doodh',
    category: 'Dairy',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Pulses / Dal',
    category: 'Pulses',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Eggs / Ande',
    category: 'Poultry',
    url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Potatoes / Aloo',
    category: 'Vegetables',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Onions / Pyaaz',
    category: 'Vegetables',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Tea / Chai',
    category: 'Beverages',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Spices / Masala',
    category: 'Essentials',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Biscuits & Snacks',
    category: 'General',
    url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80'
  }
];

export function getDefaultImageForCategory(category = 'General', productName = '') {
  const nameLower = (productName || '').toLowerCase();
  for (const preset of PRESET_PRODUCT_IMAGES) {
    const key = preset.label.toLowerCase();
    if (nameLower && (nameLower.includes(key.split('/')[0].trim().toLowerCase()) || nameLower.includes(key.split('/')[1]?.trim().toLowerCase()))) {
      return preset.url;
    }
  }

  const catMatch = PRESET_PRODUCT_IMAGES.find(p => p.category.toLowerCase() === (category || '').toLowerCase());
  if (catMatch) return catMatch.url;

  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
}

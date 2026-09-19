/**
 * Comprehensive Unit Definitions for Indian Trade & Kirana Stores
 * Handles metric units, count units, and customary Indian packaging trade units.
 */

export const BASE_UNITS = {
  MASS: 'kg',
  COUNT: 'pcs',
  VOLUME: 'litre'
};

export const UNIT_TYPES = {
  // Mass Units (normalized to kg)
  kg: {
    canonical: 'kg',
    type: 'MASS',
    multiplierToBase: 1.0,
    labels: { en: 'Kilogram', hi: 'किलो', hinglish: 'Kilo / Kg' },
    aliases: ['kg', 'kilo', 'kilogram', 'kilos', 'kilograms', 'केजी', 'किलो', 'किलोग्राम']
  },
  g: {
    canonical: 'g',
    type: 'MASS',
    multiplierToBase: 0.001,
    labels: { en: 'Gram', hi: 'ग्राम', hinglish: 'Gram' },
    aliases: ['g', 'gm', 'gms', 'gram', 'grams', 'ग्राम']
  },
  quintal: {
    canonical: 'quintal',
    type: 'MASS',
    multiplierToBase: 100.0,
    labels: { en: 'Quintal (100 kg)', hi: 'क्विंटल', hinglish: 'Quintal / Palla' },
    aliases: ['quintal', 'kattal', 'palla', 'pallu', 'क्विंटल', 'पल्ला']
  },
  ton: {
    canonical: 'ton',
    type: 'MASS',
    multiplierToBase: 1000.0,
    labels: { en: 'Ton (1000 kg)', hi: 'टन', hinglish: 'Ton' },
    aliases: ['ton', 'tonne', 'tons', 'टन']
  },

  // Packaging / Bulk Units (Conversion depends on product.unit_size or defaults)
  bori: {
    canonical: 'bori',
    type: 'PACKAGE',
    defaultMultiplier: 25.0, // Default 25kg if not overridden by product
    labels: { en: 'Bag / Sack', hi: 'बोरी', hinglish: 'Bori / Bag' },
    aliases: ['bori', 'bora', 'bag', 'bags', 'katta', 'kattal', 'thailee', 'sack', 'sacks', 'बोरी', 'बोरा', 'कट्टा', 'थैली', 'மூட்டை']
  },
  peti: {
    canonical: 'peti',
    type: 'PACKAGE',
    defaultMultiplier: 12.0, // Default 12 units/bottles/litres
    labels: { en: 'Carton / Peti', hi: 'पेटी', hinglish: 'Peti / Carton' },
    aliases: ['peti', 'carton', 'cartons', 'box', 'boxes', 'crate', 'crates', 'पेटी', 'कार्टन', 'बॉक्स']
  },
  packet: {
    canonical: 'packet',
    type: 'PACKAGE',
    defaultMultiplier: 1.0,
    labels: { en: 'Packet', hi: 'पैकेट', hinglish: 'Packet / Pouch' },
    aliases: ['packet', 'packets', 'pkt', 'pkts', 'pouch', 'pouches', 'पैकेट', 'पाउच']
  },

  // Count Units (normalized to pcs)
  pcs: {
    canonical: 'pcs',
    type: 'COUNT',
    multiplierToBase: 1.0,
    labels: { en: 'Piece', hi: 'पीस', hinglish: 'Piece / Nag' },
    aliases: ['pcs', 'pc', 'piece', 'pieces', 'nag', 'item', 'items', 'पीस', 'नग']
  },
  dozen: {
    canonical: 'dozen',
    type: 'COUNT',
    multiplierToBase: 12.0,
    labels: { en: 'Dozen (12 pcs)', hi: 'दर्जन', hinglish: 'Darjan / Dozen' },
    aliases: ['dozen', 'dozens', 'darjan', 'darzon', 'dz', 'दर्जन']
  },

  // Volume Units (normalized to litre)
  litre: {
    canonical: 'litre',
    type: 'VOLUME',
    multiplierToBase: 1.0,
    labels: { en: 'Litre', hi: 'लीटर', hinglish: 'Litre' },
    aliases: ['litre', 'liter', 'litres', 'l', 'ltr', 'ltrs', 'लीटर']
  },
  ml: {
    canonical: 'ml',
    type: 'VOLUME',
    multiplierToBase: 0.001,
    labels: { en: 'Millilitre', hi: 'मिलीलीटर', hinglish: 'ML' },
    aliases: ['ml', 'milli', 'millilitre', 'milliliter', 'एमएल']
  }
};

/**
 * Normalizes any spoken or written unit variant to its canonical representation.
 * @param {string} rawUnit 
 * @returns {string} canonical unit key (e.g., 'bori', 'kg', 'dozen')
 */
export function normalizeUnit(rawUnit) {
  if (!rawUnit) return 'kg';
  const clean = rawUnit.toLowerCase().trim();

  for (const [key, definition] of Object.entries(UNIT_TYPES)) {
    if (key === clean || definition.aliases.includes(clean)) {
      return definition.canonical;
    }
  }
  return clean;
}

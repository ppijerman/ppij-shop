import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 1, no: '01', category: 'T-SHIRT', name: 'Fang & Horn',
    subtitle: 'OVERSIZED TEE — WHITE', price: 25, originalPrice: 30, tag: 'BESTSELLER',
    colors: [{ name: 'White', hex: '#F5F1E6' }, { name: 'Black', hex: '#0E0E0E' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    desc: "Kaos oversized 220gsm dengan hand-drawn graphic 'Fang & Horn'. Cotton combed 30s, premium ringspun.",
    images: ['fang_horn_front', 'editorial_color'], primaryImg: 'tshirt_grid', featurePos: { x: 25, y: 48 },
    stock: {
      'White': { 'S': 5, 'M': 10, 'L': 8, 'XL': 4, 'XXL': 2 },
      'Black': { 'S': 3, 'M': 0, 'L': 5, 'XL': 5, 'XXL': 3 }
    }
  },
  {
    id: 2, no: '02', category: 'T-SHIRT', name: 'Trio Komodores',
    subtitle: 'GRAPHIC TEE — BLACK', price: 25, originalPrice: null, tag: 'NEW',
    colors: [{ name: 'Black', hex: '#0E0E0E' }, { name: 'Charcoal', hex: '#3A3A3A' }],
    sizes: ['S', 'M', 'L', 'XL'],
    desc: "Graphic tee dengan illustrasi 'Trio Komodores' — tribute ke fauna Indonesia. Soft heavyweight cotton.",
    images: ['komodores'], primaryImg: 'tshirt_grid', featurePos: { x: 74, y: 88 },
    stock: {
      'Black': { 'S': 10, 'M': 15, 'L': 12, 'XL': 8 },
      'Charcoal': { 'S': 5, 'M': 8, 'L': 10, 'XL': 4 }
    }
  },
  {
    id: 3, no: '03', category: 'T-SHIRT', name: 'Elle the Elephant',
    subtitle: 'BACK PRINT TEE — GREY', price: 28, originalPrice: 35, tag: 'LIMITED',
    colors: [{ name: 'Grey', hex: '#5A5A5A' }, { name: 'Sand', hex: '#C9B89A' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    desc: 'Tee abu dengan POV back print storytelling. Vintage washed look, fabric breathable untuk daily wear.',
    images: ['elle_back'], primaryImg: 'tshirt_grid', featurePos: { x: 14, y: 42 },
    stock: {
      'Grey': { 'S': 2, 'M': 5, 'L': 3, 'XL': 1, 'XXL': 0 },
      'Sand': { 'S': 4, 'M': 6, 'L': 5, 'XL': 2, 'XXL': 1 }
    }
  },
  {
    id: 4, no: '04', category: 'TOTE BAG', name: '"Einkaufen 101"',
    subtitle: 'HEAVY CANVAS TOTE — BLUE PRINT', price: 18, originalPrice: null, tag: 'NEW',
    colors: [{ name: 'Natural / Blue', hex: '#E8E0CC' }],
    sizes: ['ONE SIZE'],
    desc: "Tote canvas 400gsm dengan blue print 'Einkaufen 101'. Tribute ke kehidupan supermarket di Jerman.",
    images: ['einkaufen'], primaryImg: 'totebag_grid', featurePos: { x: 24, y: 75 },
    stock: {
      'Natural / Blue': { 'ONE SIZE': 20 }
    }
  },
  {
    id: 5, no: '05', category: 'TOTE BAG', name: '"Mit Karte Bitte"',
    subtitle: 'HEAVY CANVAS TOTE — BESTSELLER', price: 18, originalPrice: null, tag: 'BESTSELLER',
    colors: [{ name: 'Natural / Green', hex: '#E8E0CC' }],
    sizes: ['ONE SIZE'],
    desc: "Tote canvas dengan green print 'Mit Karte Bitte!' — humor klasik tentang pembayaran kartu di Jerman.",
    images: ['mit_karte'], primaryImg: 'totebag_grid', featurePos: { x: 78, y: 75 },
    stock: {
      'Natural / Green': { 'ONE SIZE': 15 }
    }
  },
];

export const CATEGORIES = ['ALL', 'T-SHIRT', 'TOTE BAG'];

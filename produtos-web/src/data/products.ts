import type { Product } from '../types/Product'

export const PRODUCTS: Product[] = [
  { category: 'Frutas', price: 'R$ 5,00', stocked: true, name: 'Maçã' },
  { category: 'Frutas', price: 'R$ 8,00', stocked: true, name: 'Pitaya' },
  { category: 'Frutas', price: 'R$ 6,00', stocked: false, name: 'Maracujá' },
  { category: 'Vegetais', price: 'R$ 4,00', stocked: true, name: 'Espinafre' },
  { category: 'Vegetais', price: 'R$ 9,00', stocked: false, name: 'Abóbora' },
  { category: 'Vegetais', price: 'R$ 5,00', stocked: true, name: 'Ervilha' },
]

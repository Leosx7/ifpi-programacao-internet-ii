import type { Product } from '../types/Product'
import styles from './ProductTable.module.css'

type ProductRowProps = {
  product: Product
}

export function ProductRow({ product }: ProductRowProps) {
  return (
    <tr>
      <td>
        <span className={product.stocked ? styles.inStock : styles.outOfStock}>
          {product.name}
        </span>
      </td>
      <td className={styles.price}>{product.price}</td>
    </tr>
  )
}

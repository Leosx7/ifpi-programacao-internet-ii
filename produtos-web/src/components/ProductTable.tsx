import type { ReactNode } from 'react'
import type { Product } from '../types/Product'
import { ProductCategoryRow } from './ProductCategoryRow'
import { ProductRow } from './ProductRow'
import styles from './ProductTable.module.css'

type ProductTableProps = {
  products: Product[]
  filterText: string
  inStockOnly: boolean
}

export function ProductTable({
  products,
  filterText,
  inStockOnly,
}: ProductTableProps) {
  const rows: ReactNode[] = []
  let lastCategory: string | null = null
  const normalizedFilter = filterText.trim().toLocaleLowerCase('pt-BR')

  products.forEach((product) => {
    const matchesText = product.name
      .toLocaleLowerCase('pt-BR')
      .includes(normalizedFilter)

    if (!matchesText) {
      return
    }

    if (inStockOnly && !product.stocked) {
      return
    }

    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={product.category}
        />,
      )
    }

    rows.push(<ProductRow product={product} key={product.name} />)
    lastCategory = product.category
  })

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td className={styles.empty} colSpan={2}>
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

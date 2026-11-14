import { useState } from 'react'
import type { Product } from '../types/Product'
import { ProductTable } from './ProductTable'
import { SearchBar } from './SearchBar'
import styles from './FilterableProductTable.module.css'

type FilterableProductTableProps = {
  products: Product[]
}

export function FilterableProductTable({
  products,
}: FilterableProductTableProps) {
  const [filterText, setFilterText] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Thinking in React</p>
        <h1>Catálogo de produtos</h1>
        <p>
          Pesquise pelo nome e filtre somente os produtos disponíveis em
          estoque.
        </p>
      </div>

      <SearchBar
        filterText={filterText}
        inStockOnly={inStockOnly}
        onFilterTextChange={setFilterText}
        onInStockOnlyChange={setInStockOnly}
      />

      <ProductTable
        products={products}
        filterText={filterText}
        inStockOnly={inStockOnly}
      />
    </section>
  )
}

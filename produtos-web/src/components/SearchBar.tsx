import type { ChangeEvent } from 'react'
import styles from './SearchBar.module.css'

type SearchBarProps = {
  filterText: string
  inStockOnly: boolean
  onFilterTextChange: (value: string) => void
  onInStockOnlyChange: (value: boolean) => void
}

export function SearchBar({
  filterText,
  inStockOnly,
  onFilterTextChange,
  onInStockOnlyChange,
}: SearchBarProps) {
  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    onFilterTextChange(event.target.value)
  }

  function handleStockChange(event: ChangeEvent<HTMLInputElement>) {
    onInStockOnlyChange(event.target.checked)
  }

  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <label className={styles.searchLabel} htmlFor="product-search">
        Buscar produto
      </label>

      <input
        id="product-search"
        className={styles.searchInput}
        type="search"
        value={filterText}
        placeholder="Ex.: maçã"
        onChange={handleTextChange}
      />

      <label className={styles.stockFilter}>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={handleStockChange}
        />
        Mostrar apenas produtos em estoque
      </label>
    </form>
  )
}

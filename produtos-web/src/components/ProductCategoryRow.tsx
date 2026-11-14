import styles from './ProductTable.module.css'

type ProductCategoryRowProps = {
  category: string
}

export function ProductCategoryRow({ category }: ProductCategoryRowProps) {
  return (
    <tr>
      <th className={styles.category} colSpan={2}>
        {category}
      </th>
    </tr>
  )
}

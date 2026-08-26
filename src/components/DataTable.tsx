import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'

export interface DataTableColumn<T> {
  id: string
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string
  sortable?: boolean
  sortValue?: (item: T) => string | number
  render: (item: T, index: number) => ReactNode
}

export function DataTable<T>({
  items,
  columns,
  getRowId,
  onRowClick,
  pageSize = 6,
  defaultSort,
  empty = 'No matching rows',
}: {
  items: T[]
  columns: Array<DataTableColumn<T>>
  getRowId: (item: T) => string
  onRowClick?: (item: T) => void
  pageSize?: number
  /** Pass `null` to keep the input order until the user sorts a column. */
  defaultSort?: { id: string; direction: 'asc' | 'desc' } | null
  empty?: string
}) {
  const [sortId, setSortId] = useState<string | null>(() => {
    if (defaultSort === null) return null
    return defaultSort?.id ?? columns[0]?.id ?? null
  })
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSort?.direction ?? 'desc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    const column = columns.find((item) => item.id === sortId)
    if (!sortId || !column?.sortValue) return items
    const list = [...items]
    list.sort((a, b) => {
      const av = column.sortValue!(a)
      const bv = column.sortValue!(b)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [columns, items, sortDir, sortId])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pages - 1)
  const start = sorted.length === 0 ? 0 : safePage * pageSize + 1
  const end = Math.min(sorted.length, (safePage + 1) * pageSize)
  const pageItems = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  useEffect(() => {
    setPage(0)
  }, [items])

  function toggleSort(column: DataTableColumn<T>) {
    if (column.sortable === false || !column.sortValue) return
    if (sortId === column.id) {
      setSortDir((current) => (current === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortId(column.id)
      setSortDir('desc')
    }
    setPage(0)
  }

  function onHeaderKey(event: KeyboardEvent<HTMLTableCellElement>, column: DataTableColumn<T>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleSort(column)
    }
  }

  const pageNumbers = Array.from({ length: pages }, (_, index) => index)

  return (
    <>
      <div className="cp-table-wrap">
        <table className="cp-table">
          <thead>
            <tr>
              {columns.map((column) => {
                const sortable = column.sortable !== false && Boolean(column.sortValue)
                const isSorted = sortId === column.id
                return (
                  <th
                    key={column.id}
                    className={[
                      sortable ? 'is-sortable' : '',
                      isSorted ? 'is-sorted' : '',
                      column.align === 'right' ? 'is-right' : '',
                      column.align === 'center' ? 'is-center' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={() => toggleSort(column)}
                    onKeyDown={(event) => onHeaderKey(event, column)}
                    tabIndex={sortable ? 0 : undefined}
                    aria-sort={
                      isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    {column.label}
                    {isSorted ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td className="cp-empty" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            ) : (
              pageItems.map((item, index) => (
                <tr
                  key={getRowId(item)}
                  className={onRowClick ? 'is-clickable' : undefined}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={
                        column.align === 'right'
                          ? 'is-right'
                          : column.align === 'center'
                            ? 'is-center'
                            : undefined
                      }
                    >
                      {column.render(item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="cp-pager">
        <span className="cp-pager__label">
          {sorted.length === 0
            ? 'Showing 0 of 0'
            : `Showing ${start} - ${end} of ${sorted.length}`}
        </span>
        <div className="cp-pager__actions">
          <button
            type="button"
            className="cp-page-btn"
            disabled={safePage <= 0}
            aria-label="Previous page"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            ‹
          </button>
          {pageNumbers.map((index) => (
            <button
              key={index}
              type="button"
              className={`cp-page-btn${safePage === index ? ' is-active' : ''}`}
              aria-label={`Page ${index + 1}`}
              aria-current={safePage === index ? 'page' : undefined}
              onClick={() => setPage(index)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            className="cp-page-btn"
            disabled={safePage >= pages - 1}
            aria-label="Next page"
            onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
          >
            ›
          </button>
        </div>
      </div>
    </>
  )
}

import { useId, useMemo, useState, type ChangeEvent } from 'react'
import {
  EuiFieldSearch,
  EuiFormControlButton,
  EuiFormControlLayout,
  EuiInputPopover,
  EuiNotificationBadge,
  EuiSelectable,
} from '@elastic/eui'
import type { EuiSelectableOption } from '@elastic/eui'
import { FormField } from './FormField'

export function FilterPopover({
  label,
  placeholder,
  options,
  value,
  onChange,
  compressed = true,
  fullWidth = true,
  hideLabel = false,
}: {
  label: string
  placeholder: string
  options: string[]
  value: string
  onChange: (value: string) => void
  compressed?: boolean
  fullWidth?: boolean
  hideLabel?: boolean
}) {
  const reactId = useId()
  const popoverId = `popover-${reactId.replace(/:/g, '')}`
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectableOptions: EuiSelectableOption[] = useMemo(() => {
    const query = search.trim().toLowerCase()
    const next: EuiSelectableOption[] = [
      { label: placeholder, checked: value === '' ? 'on' : undefined },
      ...options.map((option) => ({
        label: option,
        checked: option === value ? ('on' as const) : undefined,
      })),
    ]
    if (!query) return next
    return next.filter((option) => option.label.toLowerCase().includes(query))
  }, [options, placeholder, search, value])

  function close() {
    setIsOpen(false)
    setSearch('')
  }

  const control = (
    <EuiFormControlLayout
      compressed={compressed}
      fullWidth={fullWidth}
      isDropdown
      clear={value ? { onClick: () => onChange('') } : undefined}
    >
      <EuiInputPopover
        ownFocus
        fullWidth={fullWidth}
        hasArrow={false}
        repositionOnScroll
        isOpen={isOpen}
        panelPaddingSize="none"
        panelMinWidth={220}
        closePopover={close}
        input={
          <EuiFormControlButton
            compressed={compressed}
            fullWidth={fullWidth}
            value={value || undefined}
            placeholder={placeholder}
            role="combobox"
            aria-label={label}
            aria-expanded={isOpen}
            aria-controls={popoverId}
            onClick={() => setIsOpen((open) => !open)}
          >
            <EuiNotificationBadge color={value ? 'success' : 'subdued'}>
              {value ? 1 : options.length}
            </EuiNotificationBadge>
          </EuiFormControlButton>
        }
      >
        <EuiFieldSearch
          compressed
          fullWidth
          incremental
          placeholder="Search"
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        />
        <EuiSelectable
          id={popoverId}
          singleSelection="always"
          options={selectableOptions}
          listProps={{ onFocusBadge: false, bordered: false }}
          onChange={(next) => {
            const selected = next.find((option) => option.checked === 'on')
            onChange(
              selected && selected.label !== placeholder ? selected.label : '',
            )
            close()
          }}
        >
          {(list) => list}
        </EuiSelectable>
      </EuiInputPopover>
    </EuiFormControlLayout>
  )

  if (hideLabel) {
    return <div className="cp-filter">{control}</div>
  }

  return (
    <FormField className="cp-filter" label={label} fullWidth={fullWidth}>
      {control}
    </FormField>
  )
}

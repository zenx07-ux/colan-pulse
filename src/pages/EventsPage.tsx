import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EuiButton,
  EuiDatePicker,
  EuiFieldText,
  EuiForm,
  EuiIcon,
  EuiSelect,
  EuiTextArea,
} from '@elastic/eui'
import type { Moment } from 'moment'
import moment from 'moment'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { FilterPopover } from '../components/FilterPopover'
import { FormField } from '../components/FormField'
import { employees } from '../data/employees'
import {
  EVENT_ASSIGN,
  EVENT_CLASSIFICATIONS,
  EVENT_REPEATS,
  EVENT_STATUS_LABELS,
  calendarEvents as seedEvents,
  eventCategories as seedCategories,
} from '../data/events'
import type { CalendarEvent, EventCategory, EventStatus } from '../types'

type TabId = 'events' | 'categories'

const ASSIGN_OPTIONS = EVENT_ASSIGN.map((value) => ({ value, text: value }))
const STATUS_FILTERS = ['Scheduled', 'Cancelled', 'Completed']

function requiredLabel(label: string) {
  return (
    <>
      {label} <span className="cp-req">*</span>
    </>
  )
}

function selectOptions(values: string[], placeholder = '-- Select --') {
  return [{ value: '', text: placeholder }, ...values.map((value) => ({ value, text: value }))]
}

function emptyEvent(): CalendarEvent {
  return {
    id: `evt-${Date.now()}`,
    name: '',
    type: '',
    classification: '',
    repeat: '',
    date: '',
    startTime: '',
    endTime: '',
    assignTo: '',
    notes: '',
    scope: '',
    createdBy: 'CIPL0000',
    status: 'scheduled',
  }
}

function emptyCategory(): EventCategory {
  return {
    id: `cat-${Date.now()}`,
    name: '',
    classification: '',
    status: 'Active',
  }
}

function durationLabel(startTime: string, endTime: string) {
  const start = moment(startTime, 'HH:mm')
  const end = moment(endTime, 'HH:mm')
  if (!start.isValid() || !end.isValid()) return '—'
  const mins = Math.max(0, end.diff(start, 'minutes'))
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

function scopeLabel(event: CalendarEvent) {
  if (event.assignTo.startsWith('All') || event.scope === 'Organization') {
    return `${employees.length} employee(s)`
  }
  const count = employees.filter(
    (item) => item.department === event.assignTo || item.department === event.scope,
  ).length
  return count > 0 ? `${count} employee(s)` : event.scope || '—'
}

function classificationTone(value: string) {
  if (value === 'Productive') return 'cp-status--active'
  if (value === 'Break' || value === 'Non-productive') return 'cp-status--idle'
  return 'cp-status--neutral'
}

function statusTone(status: EventStatus) {
  if (status === 'scheduled') return 'cp-status--active'
  if (status === 'cancelled') return 'cp-status--offline'
  return 'cp-status--idle'
}

export function EventsPage() {
  const [tab, setTab] = useState<TabId>('events')
  const [events, setEvents] = useState(seedEvents)
  const [categories, setCategories] = useState(seedCategories)
  const [fromDate, setFromDate] = useState<Moment | null>(null)
  const [toDate, setToDate] = useState<Moment | null>(null)
  const [category, setCategory] = useState('')
  const [classification, setClassification] = useState('')
  const [status, setStatus] = useState('')
  const [applied, setApplied] = useState({
    from: null as Moment | null,
    to: null as Moment | null,
    category: '',
    classification: '',
    status: '',
  })
  const [eventDraft, setEventDraft] = useState<CalendarEvent | null>(null)
  const [categoryDraft, setCategoryDraft] = useState<EventCategory | null>(null)
  const [isCreate, setIsCreate] = useState(true)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const categoryNames = categories.map((item) => item.name)
  const typeOptions = selectOptions(categoryNames)

  const filtered = useMemo(() => {
    return events.filter((item) => {
      const date = moment(item.date)
      if (applied.from && date.isBefore(applied.from, 'day')) return false
      if (applied.to && date.isAfter(applied.to, 'day')) return false
      if (applied.category && item.type !== applied.category) return false
      if (applied.classification && item.classification !== applied.classification) return false
      if (applied.status && EVENT_STATUS_LABELS[item.status] !== applied.status) return false
      return true
    })
  }, [applied, events])

  function clearCloseTimer() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
  }

  function closeDrawers() {
    if ((!eventDraft && !categoryDraft) || closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      setEventDraft(null)
      setCategoryDraft(null)
      setClosing(false)
      closeTimer.current = null
    }, 200)
  }

  function openCreateEvent() {
    clearCloseTimer()
    setIsCreate(true)
    setClosing(false)
    setCategoryDraft(null)
    setEventDraft(emptyEvent())
  }

  function openEditEvent(item: CalendarEvent) {
    clearCloseTimer()
    setIsCreate(false)
    setClosing(false)
    setCategoryDraft(null)
    setEventDraft({ ...item })
  }

  function openCreateCategory() {
    clearCloseTimer()
    setIsCreate(true)
    setClosing(false)
    setEventDraft(null)
    setCategoryDraft(emptyCategory())
  }

  function openEditCategory(item: EventCategory) {
    clearCloseTimer()
    setIsCreate(false)
    setClosing(false)
    setEventDraft(null)
    setCategoryDraft({ ...item })
  }

  const eventColumns: Array<DataTableColumn<CalendarEvent>> = [
    {
      id: 'name',
      label: 'Event',
      sortValue: (item) => item.name,
      render: (item) => <strong style={{ color: 'var(--cp-heading)' }}>{item.name}</strong>,
    },
    {
      id: 'type',
      label: 'Category',
      sortValue: (item) => item.type,
      render: (item) => item.type || '—',
    },
    {
      id: 'classification',
      label: 'Classification',
      sortValue: (item) => item.classification,
      render: (item) => (
        <span className={`cp-status ${classificationTone(item.classification)}`}>
          <span className="cp-status__dot" />
          {item.classification}
        </span>
      ),
    },
    {
      id: 'date',
      label: 'Date',
      sortValue: (item) => item.date,
      render: (item) => moment(item.date).format('DD MMM YYYY'),
    },
    {
      id: 'time',
      label: 'Time',
      sortValue: (item) => item.startTime,
      render: (item) => `${item.startTime} – ${item.endTime}`,
    },
    {
      id: 'duration',
      label: 'Duration',
      sortValue: (item) => item.startTime,
      render: (item) => durationLabel(item.startTime, item.endTime),
    },
    {
      id: 'scope',
      label: 'Team/Scope',
      sortValue: (item) => item.scope,
      render: (item) => scopeLabel(item),
    },
    {
      id: 'createdBy',
      label: 'Created By',
      sortValue: (item) => item.createdBy,
      render: (item) => <span className="cp-mono">{item.createdBy}</span>,
    },
    {
      id: 'status',
      label: 'Status',
      sortValue: (item) => item.status,
      render: (item) => (
        <span className={`cp-status ${statusTone(item.status)}`}>
          <span className="cp-status__dot" />
          {EVENT_STATUS_LABELS[item.status]}
        </span>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (item) => (
        <span className="cp-action-pair">
          <button
            type="button"
            className="cp-eye-btn"
            aria-label={`Edit ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              openEditEvent(item)
            }}
          >
            <EuiIcon type="pencil" size="s" />
          </button>
          <button
            type="button"
            className="cp-eye-btn cp-eye-btn--danger"
            aria-label={`Delete ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              setEvents((current) => current.filter((row) => row.id !== item.id))
            }}
          >
            <EuiIcon type="trash" size="s" />
          </button>
        </span>
      ),
    },
  ]

  const categoryColumns: Array<DataTableColumn<EventCategory>> = [
    {
      id: 'name',
      label: 'Category Name',
      sortValue: (item) => item.name,
      render: (item) => <strong style={{ color: 'var(--cp-heading)' }}>{item.name}</strong>,
    },
    {
      id: 'classification',
      label: 'Default Classification',
      sortValue: (item) => item.classification,
      render: (item) => (
        <span className={`cp-status ${classificationTone(item.classification)}`}>
          <span className="cp-status__dot" />
          {item.classification}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortValue: (item) => item.status,
      render: (item) => (
        <span
          className={`cp-dept-status${item.status === 'Inactive' ? ' cp-dept-status--inactive' : ''}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      id: 'action',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (item) => (
        <span className="cp-action-pair">
          <button
            type="button"
            className="cp-eye-btn"
            aria-label={`Edit ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              openEditCategory(item)
            }}
          >
            <EuiIcon type="pencil" size="s" />
          </button>
          <button
            type="button"
            className="cp-eye-btn cp-eye-btn--danger"
            aria-label={`Delete ${item.name}`}
            onClick={(event) => {
              event.stopPropagation()
              setCategories((current) => current.filter((row) => row.id !== item.id))
            }}
          >
            <EuiIcon type="trash" size="s" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <section className="cp-event-page">
      <div className="cp-incident-head">
        <h1 className="cp-activity-title">Event Management</h1>
        <div className="cp-incident-head__action">
          {tab === 'events' ? (
            <EuiButton size="s" fill color="success" iconType="plus" onClick={openCreateEvent}>
              Create Event
            </EuiButton>
          ) : (
            <EuiButton size="s" fill color="success" iconType="plus" onClick={openCreateCategory}>
              Add Category
            </EuiButton>
          )}
        </div>
      </div>

      <div className="cp-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`cp-tab${tab === 'events' ? ' is-active' : ''}`}
          onClick={() => setTab('events')}
        >
          Events
        </button>
        <button
          type="button"
          role="tab"
          className={`cp-tab${tab === 'categories' ? ' is-active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Event Categories
        </button>
      </div>

      {tab === 'events' ? (
        <>
          <section className="cp-card cp-event-filters">
            <EuiForm css={{ margin: 0 }}>
              <div className="cp-event-filters__grid">
                <FormField label="From" className="cp-filter">
                  <EuiDatePicker
                    compressed
                    fullWidth
                    selected={fromDate}
                    onChange={setFromDate}
                    onClear={() => setFromDate(null)}
                    placeholder="dd-mm-yyyy"
                    dateFormat="DD-MM-YYYY"
                  />
                </FormField>
                <FormField label="To" className="cp-filter">
                  <EuiDatePicker
                    compressed
                    fullWidth
                    selected={toDate}
                    onChange={setToDate}
                    onClear={() => setToDate(null)}
                    placeholder="dd-mm-yyyy"
                    dateFormat="DD-MM-YYYY"
                    minDate={fromDate ?? undefined}
                  />
                </FormField>
                <FilterPopover
                  label="Category"
                  placeholder="All"
                  options={categoryNames}
                  value={category}
                  onChange={setCategory}
                />
                <FilterPopover
                  label="Classification"
                  placeholder="All"
                  options={EVENT_CLASSIFICATIONS}
                  value={classification}
                  onChange={setClassification}
                />
                <FilterPopover
                  label="Status"
                  placeholder="All"
                  options={STATUS_FILTERS}
                  value={status}
                  onChange={setStatus}
                />
                <EuiButton
                  size="s"
                  fill
                  onClick={() =>
                    setApplied({
                      from: fromDate,
                      to: toDate,
                      category,
                      classification,
                      status,
                    })
                  }
                >
                  Apply
                </EuiButton>
                <EuiButton
                  size="s"
                  onClick={() => {
                    setFromDate(null)
                    setToDate(null)
                    setCategory('')
                    setClassification('')
                    setStatus('')
                    setApplied({
                      from: null,
                      to: null,
                      category: '',
                      classification: '',
                      status: '',
                    })
                  }}
                >
                  Clear
                </EuiButton>
              </div>
            </EuiForm>
          </section>

          <section className="cp-card cp-master-table">
            <DataTable
              items={filtered}
              columns={eventColumns}
              getRowId={(item) => item.id}
              pageSize={8}
              defaultSort={{ id: 'date', direction: 'asc' }}
              empty="No events match. Try clearing filters or widening the date range."
            />
          </section>
        </>
      ) : (
        <section className="cp-card cp-master-table">
          <DataTable
            items={categories}
            columns={categoryColumns}
            getRowId={(item) => item.id}
            pageSize={10}
            defaultSort={{ id: 'name', direction: 'asc' }}
            empty="No event categories yet. Use Add Category to create one."
          />
        </section>
      )}

      {eventDraft ? (
        <EventDrawer
          key={eventDraft.id}
          event={eventDraft}
          isCreate={isCreate}
          closing={closing}
          typeOptions={typeOptions}
          onClose={closeDrawers}
          onSave={(next) => {
            setEvents((current) => {
              const exists = current.some((item) => item.id === next.id)
              return exists
                ? current.map((item) => (item.id === next.id ? next : item))
                : [next, ...current]
            })
            closeDrawers()
          }}
        />
      ) : null}

      {categoryDraft ? (
        <CategoryDrawer
          key={categoryDraft.id}
          category={categoryDraft}
          isCreate={isCreate}
          closing={closing}
          onClose={closeDrawers}
          onSave={(next) => {
            setCategories((current) => {
              const exists = current.some((item) => item.id === next.id)
              return exists
                ? current.map((item) => (item.id === next.id ? next : item))
                : [next, ...current]
            })
            closeDrawers()
          }}
        />
      ) : null}
    </section>
  )
}

function EventDrawer({
  event,
  isCreate,
  closing,
  typeOptions,
  onClose,
  onSave,
}: {
  event: CalendarEvent
  isCreate: boolean
  closing: boolean
  typeOptions: Array<{ value: string; text: string }>
  onClose: () => void
  onSave: (event: CalendarEvent) => void
}) {
  const [draft, setDraft] = useState(event)
  const date = moment(draft.date, 'YYYY-MM-DD')
  const start = moment(`${draft.date || moment().format('YYYY-MM-DD')} ${draft.startTime}`, 'YYYY-MM-DD HH:mm')
  const end = moment(`${draft.date || moment().format('YYYY-MM-DD')} ${draft.endTime}`, 'YYYY-MM-DD HH:mm')
  const canSave =
    draft.name.trim().length > 0 &&
    draft.type.length > 0 &&
    draft.classification.length > 0 &&
    draft.repeat.length > 0 &&
    draft.startTime.length > 0 &&
    draft.endTime.length > 0 &&
    draft.assignTo.length > 0

  function patch(next: Partial<CalendarEvent>) {
    setDraft((current) => ({ ...current, ...next }))
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`cp-overlay${closing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className={`cp-drawer${closing ? ' is-closing' : ''}`}
        role="dialog"
        aria-labelledby="event-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-drawer__head">
          <div className="cp-drawer__head-copy">
            <div className="cp-drawer__title" id="event-drawer-title">
              {isCreate ? 'Create Event' : 'Edit Event'}
            </div>
          </div>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cp-drawer__body">
          <EuiForm className="cp-form-stack" css={{ margin: 0 }} component="form">
            <FormField label={requiredLabel('Event Name')}>
              <EuiFieldText
                compressed
                fullWidth
                value={draft.name}
                placeholder="e.g. Daily Scrum"
                onChange={(event) => patch({ name: event.target.value })}
              />
            </FormField>
            <div className="cp-form-grid">
              <FormField label={requiredLabel('Event Type')}>
                <EuiSelect
                  compressed
                  fullWidth
                  options={typeOptions}
                  value={draft.type}
                  onChange={(event) => patch({ type: event.target.value })}
                />
              </FormField>
              <FormField label={requiredLabel('Classification')}>
                <EuiSelect
                  compressed
                  fullWidth
                  options={selectOptions(EVENT_CLASSIFICATIONS)}
                  value={draft.classification}
                  onChange={(event) => patch({ classification: event.target.value })}
                />
              </FormField>
            </div>
            <FormField label={requiredLabel('Repeat')}>
              <EuiSelect
                compressed
                fullWidth
                options={selectOptions(EVENT_REPEATS)}
                value={draft.repeat}
                onChange={(event) => patch({ repeat: event.target.value })}
              />
            </FormField>
            <div className="cp-form-grid cp-form-grid--3">
              <FormField label="Date">
                <EuiDatePicker
                  compressed
                  fullWidth
                  selected={date.isValid() ? date : null}
                  onChange={(value) => patch({ date: value ? value.format('YYYY-MM-DD') : '' })}
                  placeholder="dd-mm-yyyy"
                  dateFormat="DD-MM-YYYY"
                />
              </FormField>
              <FormField label={requiredLabel('Start Time')}>
                <EuiDatePicker
                  compressed
                  fullWidth
                  showTimeSelect
                  showTimeSelectOnly
                  selected={draft.startTime && start.isValid() ? start : null}
                  onChange={(value) =>
                    patch({ startTime: value ? value.format('HH:mm') : '' })
                  }
                  placeholder="--:--"
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                />
              </FormField>
              <FormField label={requiredLabel('End Time')}>
                <EuiDatePicker
                  compressed
                  fullWidth
                  showTimeSelect
                  showTimeSelectOnly
                  selected={draft.endTime && end.isValid() ? end : null}
                  onChange={(value) => patch({ endTime: value ? value.format('HH:mm') : '' })}
                  placeholder="--:--"
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                />
              </FormField>
            </div>
            <p className="cp-dept-form__note">
              Times are entered and stored in UTC.
            </p>
            <FormField label={requiredLabel('Assign To')}>
              <EuiSelect
                compressed
                fullWidth
                options={[{ value: '', text: '-- Select --' }, ...ASSIGN_OPTIONS]}
                value={draft.assignTo}
                onChange={(event) =>
                  patch({
                    assignTo: event.target.value,
                    scope:
                      event.target.value === EVENT_ASSIGN[0] || event.target.value === ''
                        ? 'Organization'
                        : event.target.value,
                  })
                }
              />
            </FormField>
            <FormField label="Description / Notes">
              <EuiTextArea
                compressed
                fullWidth
                rows={3}
                placeholder="Optional notes"
                value={draft.notes}
                onChange={(event) => patch({ notes: event.target.value })}
              />
            </FormField>
          </EuiForm>
        </div>
        <div className="cp-drawer__foot cp-drawer__foot--end">
          <EuiButton onClick={onClose}>Cancel</EuiButton>
          <EuiButton
            fill
            color="success"
            isDisabled={!canSave}
            onClick={() => onSave({ ...draft, name: draft.name.trim() })}
          >
            {isCreate ? 'Create' : 'Save Changes'}
          </EuiButton>
        </div>
      </aside>
    </div>
  )
}

function CategoryDrawer({
  category,
  isCreate,
  closing,
  onClose,
  onSave,
}: {
  category: EventCategory
  isCreate: boolean
  closing: boolean
  onClose: () => void
  onSave: (category: EventCategory) => void
}) {
  const [draft, setDraft] = useState(category)
  const canSave = draft.name.trim().length > 0 && draft.classification.length > 0

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`cp-overlay${closing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className={`cp-drawer${closing ? ' is-closing' : ''}`}
        role="dialog"
        aria-labelledby="event-category-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-drawer__head">
          <div className="cp-drawer__head-copy">
            <div className="cp-drawer__title" id="event-category-title">
              {isCreate ? 'Add Event Category' : 'Edit Event Category'}
            </div>
          </div>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cp-drawer__body">
          <EuiForm className="cp-form-stack" css={{ margin: 0 }} component="form">
            <FormField label={requiredLabel('Category Name')}>
              <EuiFieldText
                compressed
                fullWidth
                value={draft.name}
                placeholder="e.g. Scrum Meeting"
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              />
            </FormField>
            <FormField label={requiredLabel('Default Classification')}>
              <EuiSelect
                compressed
                fullWidth
                options={selectOptions(EVENT_CLASSIFICATIONS)}
                value={draft.classification}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, classification: event.target.value }))
                }
              />
            </FormField>
          </EuiForm>
        </div>
        <div className="cp-drawer__foot cp-drawer__foot--end">
          <EuiButton onClick={onClose}>Cancel</EuiButton>
          <EuiButton
            fill
            color="success"
            isDisabled={!canSave}
            onClick={() => onSave({ ...draft, name: draft.name.trim() })}
          >
            {isCreate ? 'Create' : 'Save Changes'}
          </EuiButton>
        </div>
      </aside>
    </div>
  )
}

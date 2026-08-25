import { useMemo, useState } from 'react'
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiDatePicker,
  EuiFieldText,
  EuiForm,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiSelect,
  EuiTextArea,
} from '@elastic/eui'
import type { Moment } from 'moment'
import moment from 'moment'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { FormField } from '../components/FormField'
import {
  EVENT_ASSIGN,
  EVENT_CLASSIFICATIONS,
  EVENT_REPEATS,
  EVENT_TYPES,
  calendarEvents as seedEvents,
} from '../data/events'
import type { CalendarEvent, EventStatus } from '../types'

type TabId = 'events' | 'holidays'

const ASSIGN_OPTIONS = EVENT_ASSIGN.map((value) => ({ value, text: value }))
const TYPE_OPTIONS = EVENT_TYPES.map((value) => ({ value, text: value }))
const CLASS_OPTIONS = EVENT_CLASSIFICATIONS.map((value) => ({ value, text: value }))
const REPEAT_OPTIONS = EVENT_REPEATS.map((value) => ({ value, text: value }))

function emptyEvent(): CalendarEvent {
  return {
    id: `evt-${Date.now()}`,
    name: '',
    type: 'Office Event',
    classification: 'Productive',
    repeat: "Doesn't repeat",
    date: moment().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '10:00',
    assignTo: EVENT_ASSIGN[0],
    notes: '',
    scope: 'All applicable employees',
    createdBy: 'Colan Admin',
    status: 'scheduled',
  }
}

export function EventsPage() {
  const [tab, setTab] = useState<TabId>('events')
  const [events, setEvents] = useState(seedEvents)
  const [fromDate, setFromDate] = useState<Moment | null>(null)
  const [appliedFrom, setAppliedFrom] = useState<Moment | null>(null)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [isCreate, setIsCreate] = useState(false)

  const filtered = useMemo(() => {
    if (!appliedFrom) return events
    const start = appliedFrom.clone().startOf('day')
    return events.filter((item) => !moment(item.date).isBefore(start, 'day'))
  }, [appliedFrom, events])

  const columns: Array<DataTableColumn<CalendarEvent>> = [
    {
      id: 'name',
      label: 'Event',
      sortValue: (item) => item.date,
      render: (item) => (
        <div className="cp-cell-stack">
          <strong style={{ color: 'var(--cp-heading)' }}>{item.name}</strong>
          <span className="cp-emp-id">
            {moment(item.date).format('DD MMM YYYY')} · {item.startTime}–{item.endTime} UTC
          </span>
        </div>
      ),
    },
    {
      id: 'scope',
      label: 'Scope',
      sortValue: (item) => item.scope,
      render: (item) => item.scope,
    },
    {
      id: 'createdBy',
      label: 'Created By',
      sortValue: (item) => item.createdBy,
      render: (item) => item.createdBy,
    },
    {
      id: 'status',
      label: 'Status',
      sortValue: (item) => item.status,
      render: (item) => <EventStatusPill status={item.status} />,
    },
    {
      id: 'action',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (item) => (
        <span className="cp-action-pair">
          <EuiButtonIcon
            iconType="pencil"
            aria-label={`Edit ${item.name}`}
            onClick={() => {
              setIsCreate(false)
              setEditing(item)
            }}
          />
          <EuiButtonIcon
            iconType="trash"
            color="danger"
            aria-label={`Delete ${item.name}`}
            onClick={() =>
              setEvents((current) => current.filter((event) => event.id !== item.id))
            }
          />
        </span>
      ),
    },
  ]

  return (
    <section className="cp-event-page">
      <div className="cp-incident-head">
        <h1 className="cp-activity-title">Event Management</h1>
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
          className={`cp-tab${tab === 'holidays' ? ' is-active' : ''}`}
          onClick={() => setTab('holidays')}
        >
          Holidays
        </button>
      </div>

      {tab === 'holidays' ? (
        <section className="cp-card" style={{ padding: 24 }}>
          <div className="cp-card-sub">
            Holiday calendars will appear here. Use Events to schedule office and team
            activities.
          </div>
        </section>
      ) : (
        <>
          <div className="cp-event-toolbar">
            <div className="cp-event-toolbar__filters">
              <FormField label="From" fullWidth={false} className="cp-event-toolbar__from">
                <EuiDatePicker
                  compressed
                  fullWidth
                  selected={fromDate}
                  onChange={setFromDate}
                  onClear={() => setFromDate(null)}
                  placeholder="Date"
                  dateFormat="DD-MM-YYYY"
                />
              </FormField>
              <EuiButton size="s" fill onClick={() => setAppliedFrom(fromDate)}>
                Apply
              </EuiButton>
              <EuiButton
                size="s"
                onClick={() => {
                  setFromDate(null)
                  setAppliedFrom(null)
                }}
              >
                Clear
              </EuiButton>
            </div>
            <EuiButton
              size="s"
              fill
              color="success"
              iconType="plus"
              onClick={() => {
                setIsCreate(true)
                setEditing(emptyEvent())
              }}
            >
              Create Event
            </EuiButton>
          </div>

          <section className="cp-card">
            <DataTable
              items={filtered}
              columns={columns}
              getRowId={(item) => item.id}
              pageSize={8}
              defaultSort={{ id: 'name', direction: 'asc' }}
              empty="No events in this range"
            />
          </section>
        </>
      )}

      {editing ? (
        <EventFormModal
          key={editing.id}
          event={editing}
          isCreate={isCreate}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            setEvents((current) => {
              const exists = current.some((item) => item.id === next.id)
              return exists
                ? current.map((item) => (item.id === next.id ? next : item))
                : [next, ...current]
            })
            setEditing(null)
          }}
        />
      ) : null}
    </section>
  )
}

function EventStatusPill({ status }: { status: EventStatus }) {
  const label = status === 'scheduled' ? 'Scheduled' : status === 'cancelled' ? 'Cancelled' : 'Completed'
  const tone =
    status === 'scheduled' ? 'cp-status--active' : status === 'cancelled' ? 'cp-status--offline' : 'cp-status--idle'
  return (
    <span className={`cp-status ${tone}`}>
      <span className="cp-status__dot" />
      {label}
    </span>
  )
}

function EventFormModal({
  event,
  isCreate,
  onClose,
  onSave,
}: {
  event: CalendarEvent
  isCreate: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
}) {
  const [draft, setDraft] = useState(event)
  const date = moment(draft.date, 'YYYY-MM-DD')
  const start = moment(`${draft.date} ${draft.startTime}`, 'YYYY-MM-DD HH:mm')
  const end = moment(`${draft.date} ${draft.endTime}`, 'YYYY-MM-DD HH:mm')

  function patch(next: Partial<CalendarEvent>) {
    setDraft((current) => ({ ...current, ...next }))
  }

  return (
    <EuiModal className="cp-event-modal" onClose={onClose} maxWidth={640}>
      <div className="cp-event-modal__head">
        <h2>{isCreate ? 'Create Event' : 'Edit Event'}</h2>
      </div>
      <EuiModalBody className="cp-event-modal__body">
        <EuiForm className="cp-form-stack" css={{ margin: 0 }}>
          <FormField label="Event Name *">
            <EuiFieldText
              compressed
              fullWidth
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value })}
            />
          </FormField>
          <div className="cp-form-grid">
            <FormField label="Event Type *">
              <EuiSelect
                compressed
                fullWidth
                options={TYPE_OPTIONS}
                value={draft.type}
                onChange={(event) => patch({ type: event.target.value })}
              />
            </FormField>
            <FormField label="Classification *">
              <EuiSelect
                compressed
                fullWidth
                options={CLASS_OPTIONS}
                value={draft.classification}
                onChange={(event) => patch({ classification: event.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Repeat *">
            <EuiSelect
              compressed
              fullWidth
              options={REPEAT_OPTIONS}
              value={draft.repeat}
              onChange={(event) => patch({ repeat: event.target.value })}
            />
          </FormField>
          <div>
            <div className="cp-form-grid cp-form-grid--3">
              <FormField label="Date *">
                <EuiDatePicker
                  compressed
                  fullWidth
                  selected={date.isValid() ? date : null}
                  onChange={(value) => patch({ date: value ? value.format('YYYY-MM-DD') : draft.date })}
                  dateFormat="DD-MM-YYYY"
                />
              </FormField>
              <FormField label="Start Time *">
                <EuiDatePicker
                  compressed
                  fullWidth
                  showTimeSelect
                  showTimeSelectOnly
                  selected={start.isValid() ? start : null}
                  onChange={(value) =>
                    patch({ startTime: value ? value.format('HH:mm') : draft.startTime })
                  }
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                />
              </FormField>
              <FormField label="End Time *">
                <EuiDatePicker
                  compressed
                  fullWidth
                  showTimeSelect
                  showTimeSelectOnly
                  selected={end.isValid() ? end : null}
                  onChange={(value) =>
                    patch({ endTime: value ? value.format('HH:mm') : draft.endTime })
                  }
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                />
              </FormField>
            </div>
            <p className="cp-card-sub" style={{ margin: '10px 0 0' }}>
              Times are entered and stored in UTC; displayed elsewhere in the app's configured
              timezone.
            </p>
          </div>
          <FormField label="Assign To *">
            <EuiSelect
              compressed
              fullWidth
              options={ASSIGN_OPTIONS}
              value={draft.assignTo}
              onChange={(event) =>
                patch({
                  assignTo: event.target.value,
                  scope:
                    event.target.value === EVENT_ASSIGN[0]
                      ? 'All applicable employees'
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
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton fill color="success" onClick={() => onSave(draft)} isDisabled={!draft.name.trim()}>
          {isCreate ? 'Create Event' : 'Update Event'}
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
}

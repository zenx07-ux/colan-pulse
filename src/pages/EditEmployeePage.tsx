import { useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCheckbox,
  EuiFieldSearch,
  EuiFieldText,
  EuiForm,
  EuiIcon,
  EuiSelect,
} from '@elastic/eui'
import { FormField } from '../components/FormField'
import { PageHeading } from '../components/PageHeading'
import {
  DEPARTMENT_FUNCTIONS,
  departmentRecords,
} from '../data/departments'
import { employees, jobFunction } from '../data/employees'

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const HOURS = ['4 hours', '6 hours', '8 hours', '8.5 hours', '9 hours']
const LOCATIONS = ['Chennai', 'Bengaluru', 'Hyderabad', 'Coimbatore']
const WORK_MODES = ['WFO', 'Hybrid', 'Remote', 'Unspecified']
const STATUSES = ['Active', 'Inactive']
const WORK_MODE_OPTIONS = [
  { value: '', text: '-- Select --' },
  { value: 'Office', text: 'WFO' },
  { value: 'Hybrid', text: 'Hybrid' },
  { value: 'Remote', text: 'WFH' },
]
const PROJECTS = ['ColanPulse EUI', 'Agent heartbeat v2', 'Support portal']

const DESIGNATIONS = Array.from(new Set(employees.map((item) => item.role))).sort()
const DEPARTMENT_OPTIONS = unique([
  ...departmentRecords.map((item) => item.name),
  ...employees.map((item) => item.department),
])
const FUNCTION_OPTIONS = unique([
  ...DEPARTMENT_FUNCTIONS,
  ...departmentRecords.flatMap((item) => item.functions),
  ...employees.map(jobFunction),
  'Motion / Visual Design',
  'UX Design',
])

const LEADS = unique([
  ...employees.map((item) => item.teamLead).filter(Boolean),
  ...employees.filter((item) => /lead|manager|sre/i.test(item.role)).map((item) => item.name),
])
const MANAGERS = unique([
  ...employees.map((item) => item.manager).filter(Boolean),
  'Vishnu K',
  'Meera Nair',
  'Deepa Krishnan',
  'Karthik Raja',
])

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  )
}

function slug(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
}

function selectOptions(values: string[], placeholder = '-- Select --') {
  return [{ value: '', text: placeholder }, ...values.map((value) => ({ value, text: value }))]
}

function hoursForGender(gender: string) {
  if (gender === 'Female') return '8 hours'
  if (gender === 'Male') return '9 hours'
  return '9 hours'
}

function functionsForDepartments(deptNames: string[]) {
  const next = new Set<string>()
  deptNames.forEach((name) => {
    const record = departmentRecords.find((item) => item.name === name)
    record?.functions.forEach((fn) => next.add(fn))
    if (name === 'UI/UX') {
      ;['Design', 'UI Design', 'UX Research', 'Visual Design', 'Design System'].forEach((fn) =>
        next.add(fn),
      )
    }
  })
  return Array.from(next).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

function personLabel(name: string) {
  const match = employees.find((item) => item.name === name)
  return match ? `${match.name} (${match.id})` : name
}

function reportingOptions(names: string[]) {
  const seen = new Set<string>()
  const list: Array<{ value: string; label: string }> = []

  function add(name: string) {
    if (!name || seen.has(name)) return
    seen.add(name)
    list.push({ value: name, label: personLabel(name) })
  }

  employees.forEach((item) => add(item.name))
  names.forEach(add)
  return list.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
}

function requiredLabel(label: string) {
  return (
    <>
      {label} <span className="cp-req">*</span>
    </>
  )
}

export function EditEmployeePage() {
  const { employeeId = '' } = useParams()
  const navigate = useNavigate()
  const isNew = employeeId === 'new'
  const employee = employees.find((item) => item.id === employeeId)

  const [employeeCode, setEmployeeCode] = useState(employee?.id ?? '')
  const [name, setName] = useState(employee?.name ?? '')
  const [gender, setGender] = useState('')
  const [email, setEmail] = useState(employee?.email ?? '')
  const [designation, setDesignation] = useState(employee?.role ?? '')
  const [hours, setHours] = useState(employee ? '9 hours' : '')
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    employee ? [employee.department] : [],
  )
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(
    employee ? [jobFunction(employee)] : [],
  )
  const [teamLeads, setTeamLeads] = useState<string[]>(
    employee?.teamLead ? [employee.teamLead] : [],
  )
  const [managers, setManagers] = useState<string[]>(employee?.manager ? [employee.manager] : [])
  const [projects, setProjects] = useState<string[]>([])
  const [location, setLocation] = useState(employee?.location ?? '')
  const [workMode, setWorkMode] = useState(employee?.workMode ?? '')
  const [accountStatus, setAccountStatus] = useState('Active')
  const [devices, setDevices] = useState<string[]>([])
  const [hostname, setHostname] = useState('')
  const [passwordReset, setPasswordReset] = useState(false)

  const teamLeadOptions = useMemo(() => reportingOptions(LEADS), [])
  const managerOptions = useMemo(() => reportingOptions(MANAGERS), [])
  const functionChoices = useMemo(
    () => (isNew ? functionsForDepartments(selectedDepartments) : FUNCTION_OPTIONS),
    [isNew, selectedDepartments],
  )
  const username =
    name.trim().split(/\s+/)[0] || email.split('@')[0] || employeeCode.trim() || '—'

  const passwordCopy = passwordReset
    ? 'A new password will be set when you save. The employee must use it to sign in.'
    : 'CUSTOM — has been changed/reset, not the Employee ID anymore. Use Reset Password below to set a new one.'

  if (!isNew && !employee) {
    return <Navigate to="/user-management" replace />
  }

  function goBack() {
    navigate('/user-management')
  }

  function handleGender(next: string) {
    setGender(next)
    setHours((current) => {
      const previousDefault = hoursForGender(gender)
      if (!current || current === previousDefault) return hoursForGender(next)
      return current
    })
  }

  function addHostname() {
    const next = hostname.trim()
    if (!next) return
    const exists = devices.some((item) => item.toLowerCase() === next.toLowerCase())
    if (exists) {
      setHostname('')
      return
    }
    setDevices((current) => [...current, next])
    setHostname('')
  }

  return (
    <section className="cp-page cp-edit-page">
      <PageHeading
        title={isNew ? 'Create Employee' : 'Edit Employee'}
        description="Employee Master — one record for every person, regardless of designation."
        extra={
          <EuiButtonEmpty size="s" iconType="arrowLeft" onClick={goBack}>
            Back to Employee Master
          </EuiButtonEmpty>
        }
      />

      <EuiForm component="form" onSubmit={(event) => event.preventDefault()}>
        <FormCard title="Employee details">
          <div className="cp-form-stack">
            <div className="cp-form-grid cp-form-grid--3">
              <FormField label={requiredLabel('Employee ID')} fullWidth>
                <EuiFieldText
                  compressed
                  fullWidth
                  value={employeeCode}
                  placeholder={isNew ? 'e.g. EMP-001' : 'e.g. CIPL073'}
                  onChange={(event) => setEmployeeCode(event.target.value)}
                />
              </FormField>
              <FormField label={requiredLabel('Employee Name')} fullWidth>
                <EuiFieldText
                  compressed
                  fullWidth
                  value={name}
                  placeholder="Full name"
                  onChange={(event) => setName(event.target.value)}
                />
              </FormField>
              <FormField label={requiredLabel('Gender')} fullWidth>
                <EuiSelect
                  compressed
                  fullWidth
                  options={selectOptions(GENDERS)}
                  value={gender}
                  onChange={(event) => handleGender(event.target.value)}
                />
              </FormField>
            </div>
            <FormField
              label="Email"
              helpText={isNew ? undefined : 'Used for agent install mail and portal login.'}
            >
              <EuiFieldText
                compressed
                fullWidth
                value={email}
                placeholder={
                  isNew
                    ? 'email@org.com (defaults from Employee ID if blank)'
                    : 'email@org.com'
                }
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard title="Designation & Expected Working Hours">
          <div className="cp-form-grid">
            <FormField
              label={requiredLabel('Designation')}
              fullWidth
              helpText="Determines this person's portal login role automatically (Management → Super Admin access, Manager → Manager access, Team Lead → Team Lead access, everything else → standard employee access)."
            >
              <EuiSelect
                compressed
                fullWidth
                options={selectOptions(DESIGNATIONS)}
                value={designation}
                onChange={(event) => setDesignation(event.target.value)}
              />
            </FormField>
            <FormField
              label={requiredLabel('Expected Working Hours')}
              fullWidth
              helpText="Defaults from Gender (Male: 9, Female: 8) — change freely if this person's actual hours differ."
            >
              <EuiSelect
                compressed
                fullWidth
                options={selectOptions(HOURS)}
                value={hours}
                onChange={(event) => setHours(event.target.value)}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard title="Department & Function">
          <div className="cp-form-grid">
            <FormField label={requiredLabel('Department(s)')} fullWidth>
              <CheckboxPicker
                id="emp-dept"
                items={DEPARTMENT_OPTIONS.map((value) => ({ value, label: value }))}
                selected={selectedDepartments}
                onChange={(next) => {
                  setSelectedDepartments(next)
                  if (!isNew) return
                  const allowed = new Set(functionsForDepartments(next))
                  setSelectedFunctions((current) => current.filter((fn) => allowed.has(fn)))
                }}
                searchPlaceholder="Search department..."
                emptyText="No departments match your search."
              />
            </FormField>
            <FormField label={requiredLabel('Function(s)')} fullWidth>
              <CheckboxPicker
                id="emp-fn"
                items={functionChoices.map((value) => ({ value, label: value }))}
                selected={selectedFunctions}
                onChange={setSelectedFunctions}
                searchPlaceholder="Search function..."
                emptyText={
                  isNew && selectedDepartments.length === 0
                    ? 'Select a Department first.'
                    : 'No functions match your search.'
                }
                disabled={isNew && selectedDepartments.length === 0}
                disabledText="Select a Department first."
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard title="Team Lead & Manager">
          <div className="cp-form-grid">
            <FormField label={isNew ? 'Team Lead(s)' : 'Team Lead(s) — Management'} fullWidth>
              <CheckboxPicker
                id="emp-tl"
                items={teamLeadOptions}
                selected={teamLeads}
                onChange={setTeamLeads}
                searchPlaceholder="Search team lead..."
                emptyText="No team leads match your search."
              />
            </FormField>
            <FormField label={isNew ? 'Manager(s)' : 'Manager(s) — Management'} fullWidth>
              <CheckboxPicker
                id="emp-mgr"
                items={managerOptions}
                selected={managers}
                onChange={setManagers}
                searchPlaceholder="Search manager..."
                emptyText="No managers match your search."
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard title="Location & Work Mode">
          <div className="cp-form-grid">
            <FormField label={requiredLabel('Location')} fullWidth>
              <EuiSelect
                compressed
                fullWidth
                options={selectOptions(LOCATIONS)}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </FormField>
            <FormField label={requiredLabel('Work Mode')} fullWidth>
              <EuiSelect
                compressed
                fullWidth
                options={WORK_MODE_OPTIONS}
                value={workMode}
                onChange={(event) => setWorkMode(event.target.value)}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard title={isNew ? 'Device Management' : 'Allocation / Project'}>
          <div className="cp-form-stack">
            {!isNew ? (
              <FormField label="Project(s)" fullWidth>
                <CheckboxPicker
                  id="emp-proj"
                  items={PROJECTS.map((value) => ({ value, label: value }))}
                  selected={projects}
                  onChange={setProjects}
                  searchPlaceholder="Search project..."
                  emptyText="No projects match your search."
                />
              </FormField>
            ) : null}

            {isNew && employeeCode.trim() === '' ? (
              <div className="cp-device-empty">
                Enter an Employee ID above to see or add devices.
              </div>
            ) : devices.length === 0 ? (
              <div className="cp-device-empty">
                No devices registered yet for this Employee ID. Add a hostname below or it will
                register itself automatically the first time the agent runs.
              </div>
            ) : (
              <div className="cp-device-list">
                {devices.map((device) => (
                  <div key={device} className="cp-device-row">
                    <span className="cp-mono">{device}</span>
                    <EuiButtonEmpty
                      size="s"
                      color="danger"
                      onClick={() =>
                        setDevices((current) => current.filter((item) => item !== device))
                      }
                    >
                      Remove
                    </EuiButtonEmpty>
                  </div>
                ))}
              </div>
            )}

            {(!isNew || employeeCode.trim() !== '') && (
              <>
                <FormField label="Add a hostname" fullWidth>
                  <div className="cp-func-add">
                    <EuiFieldText
                      compressed
                      fullWidth
                      value={hostname}
                      placeholder="e.g. DESKTOP-AB12CD3"
                      onChange={(event) => setHostname(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addHostname()
                        }
                      }}
                    />
                    <EuiButton
                      size="s"
                      fill
                      color="success"
                      iconType="plus"
                      onClick={addHostname}
                      isDisabled={!hostname.trim()}
                    >
                      Add
                    </EuiButton>
                  </div>
                </FormField>
                <p className="cp-dept-form__note">
                  Hostnames must be unique to one employee. Reassigning a device here unlinks it
                  from anyone else.
                </p>
              </>
            )}
          </div>
        </FormCard>

        {isNew ? (
          <FormCard title="Login Credentials">
            <p className="cp-login-copy">
              A portal login will be created automatically when this employee is saved — Username
              and Password will both be set to the Employee ID.
            </p>
            <p className="cp-login-copy">
              An administrator reset never retrieves or displays the employee's existing password —
              only a brand new one is set.
            </p>
          </FormCard>
        ) : (
          <FormCard title="Login Information">
            <div className="cp-login-rows">
              <div className="cp-login-key">Username</div>
              <div className="cp-login-val">{username}</div>
              <div className="cp-login-key">Password</div>
              <div className="cp-login-val">
                <div className="cp-login-val__row">
                  <span>{passwordCopy}</span>
                  {accountStatus === 'Active' ? (
                    <span className="cp-dept-status">Active</span>
                  ) : (
                    <span className="cp-dept-status cp-dept-status--inactive">Inactive</span>
                  )}
                </div>
                <EuiButtonEmpty
                  className="cp-login-reset"
                  size="s"
                  flush="left"
                  onClick={() => setPasswordReset(true)}
                >
                  Reset Password
                </EuiButtonEmpty>
              </div>
            </div>
            <p className="cp-dept-form__note">
              Administrators cannot retrieve passwords — only set a new one.
            </p>
          </FormCard>
        )}

        <FormCard title="Status">
          <FormField
            className="cp-field--narrow"
            label={requiredLabel('Status')}
            helpText="Deactivating also revokes portal login access and stops the agent from reporting for this employee. Historical productivity data is never deleted by deactivation."
          >
            <EuiSelect
              compressed
              fullWidth
              options={STATUSES.map((value) => ({ value, text: value }))}
              value={accountStatus}
              onChange={(event) => setAccountStatus(event.target.value)}
            />
          </FormField>
        </FormCard>
      </EuiForm>

      <div className="cp-form-foot">
        <EuiButton onClick={goBack}>Cancel</EuiButton>
        <EuiButton fill color="success" onClick={goBack}>
          {isNew ? 'Create Employee' : 'Save Changes'}
        </EuiButton>
      </div>
    </section>
  )
}

function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cp-card cp-form-card">
      <h2 className="cp-form-card__title">{title}</h2>
      {children}
    </section>
  )
}

function CheckboxPicker({
  id,
  items,
  selected,
  onChange,
  searchPlaceholder,
  emptyText,
  disabled = false,
  disabledText,
}: {
  id: string
  items: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (next: string[]) => void
  searchPlaceholder: string
  emptyText: string
  disabled?: boolean
  disabledText?: string
}) {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLowerCase()
  const filtered = items.filter((item) =>
    `${item.label} ${item.value}`.toLowerCase().includes(normalized),
  )
  const selectedItems = selected.map(
    (value) => items.find((item) => item.value === value) ?? { value, label: value },
  )
  const message = disabled ? (disabledText ?? emptyText) : filtered.length === 0 ? emptyText : null

  function toggle(value: string) {
    if (disabled) return
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  return (
    <div className="cp-picker">
      {disabled ? null : (
        <EuiFieldSearch
          compressed
          fullWidth
          incremental
          isClearable
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={searchPlaceholder}
        />
      )}
      <div
        className={['cp-picker__list', message ? 'cp-picker__list--message' : '']
          .filter(Boolean)
          .join(' ')}
        role="group"
      >
        {message ? (
          <div className="cp-func-check-empty">{message}</div>
        ) : (
          filtered.map((item) => (
            <EuiCheckbox
              key={item.value}
              id={`${id}-${slug(item.value)}`}
              label={item.label}
              checked={selected.includes(item.value)}
              onChange={() => toggle(item.value)}
            />
          ))
        )}
      </div>
      {!disabled && selectedItems.length > 0 ? (
        <div className="cp-picker__chips">
          {selectedItems.map((item) => (
            <button
              key={item.value}
              type="button"
              className="cp-func-tag cp-picker-chip"
              onClick={() => toggle(item.value)}
              aria-label={`Remove ${item.label}`}
            >
              {item.label}
              <EuiIcon type="cross" size="s" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

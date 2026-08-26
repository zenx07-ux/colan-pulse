import { useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  EuiButton,
  EuiButtonEmpty,
  EuiComboBox,
  EuiFieldText,
  EuiForm,
  EuiSelect,
  EuiText,
} from '@elastic/eui'
import type { EuiComboBoxOptionOption } from '@elastic/eui'
import { FormField } from '../components/FormField'
import { departments } from '../data/departments'
import { employees } from '../data/employees'

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const HOURS = ['4 hours', '6 hours', '8 hours', '8.5 hours', '9 hours']
const LOCATIONS = ['Chennai', 'Bengaluru', 'Hyderabad', 'Coimbatore']
const WORK_MODES = ['WFO', 'Hybrid', 'Remote', 'Unspecified']
const STATUSES = ['Active', 'Inactive']
const FUNCTION_MAP: Record<string, string[]> = {
  'UI/UX': ['Design', 'Research', 'Visual'],
  Engineering: ['Development', 'Architecture', 'Platform'],
  'Quality Assurance': ['QA', 'Automation'],
  DevOps: ['Infrastructure', 'SRE', 'Release'],
  Support: ['Support', 'Success'],
}

const DESIGNATIONS = Array.from(new Set(employees.map((item) => item.role))).sort()
const LEADS = employees
  .filter((item) => /lead|manager|sre/i.test(item.role))
  .map((item) => item.name)
const MANAGERS = ['Vishnu K', 'Meera Nair', 'Deepa Krishnan', 'Karthik Raja']

function options(values: string[]): EuiComboBoxOptionOption[] {
  return values.map((label) => ({ label }))
}

function selectOptions(values: string[], placeholder = '-- Select --') {
  return [{ value: '', text: placeholder }, ...values.map((value) => ({ value, text: value }))]
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
  const [hours, setHours] = useState(employee ? '8 hours' : '')
  const [selectedDepartments, setSelectedDepartments] = useState<EuiComboBoxOptionOption[]>(
    employee ? [{ label: employee.department }] : [],
  )
  const [selectedFunctions, setSelectedFunctions] = useState<EuiComboBoxOptionOption[]>([])
  const [teamLeads, setTeamLeads] = useState<EuiComboBoxOptionOption[]>([])
  const [managers, setManagers] = useState<EuiComboBoxOptionOption[]>([])
  const [location, setLocation] = useState(employee?.location ?? '')
  const [workMode, setWorkMode] = useState(employee?.workMode ?? '')
  const [accountStatus, setAccountStatus] = useState('Active')
  const [devices, setDevices] = useState<string[]>(
    employee ? [`CIPL-ATC${employee.id.replace(/\D/g, '').padStart(5, '0')}`] : [],
  )

  const departmentNames = selectedDepartments.map((item) => item.label)
  const functionChoices = useMemo(() => {
    const next = new Set<string>()
    departmentNames.forEach((department) => {
      FUNCTION_MAP[department]?.forEach((item) => next.add(item))
    })
    return Array.from(next)
  }, [departmentNames])

  if (!isNew && !employee) {
    return <Navigate to="/user-management" replace />
  }

  function goBack() {
    navigate('/user-management')
  }

  return (
    <section className="cp-edit-page">
      <div className="cp-incident-head">
        <div className="cp-page-lead">
          <h1 className="cp-activity-title">{isNew ? 'Add Employee' : 'Edit Employee'}</h1>
          <div className="cp-card-sub">
            Employee Master — one record for every person, regardless of designation.
          </div>
        </div>
        <EuiButtonEmpty
          className="cp-incident-head__action"
          size="s"
          iconType="arrowLeft"
          onClick={goBack}
        >
          Back to Employee Master
        </EuiButtonEmpty>
      </div>

      <EuiForm component="form" onSubmit={(event) => event.preventDefault()}>
        <FormCard index={1} title="Personal Information">
          <div className="cp-form-stack">
            <div className="cp-form-grid cp-form-grid--3">
              <FormField label="Employee ID *" fullWidth>
                <EuiFieldText
                  compressed
                  fullWidth
                  value={employeeCode}
                  placeholder="e.g. EMP-001"
                  onChange={(event) => setEmployeeCode(event.target.value)}
                />
              </FormField>
              <FormField label="Employee Name *" fullWidth>
                <EuiFieldText
                  compressed
                  fullWidth
                  value={name}
                  placeholder="Full name"
                  onChange={(event) => setName(event.target.value)}
                />
              </FormField>
              <FormField label="Gender *" fullWidth>
                <EuiSelect
                  compressed
                  fullWidth
                  options={selectOptions(GENDERS)}
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                />
              </FormField>
            </div>
            <FormField
              label="Email"
              helpText="email@org.com (defaults from Employee ID if blank)"
            >
              <EuiFieldText
                compressed
                fullWidth
                value={email}
                placeholder="email@org.com (defaults from Employee ID if blank)"
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard index={2} title="Employment Information">
          <div className="cp-form-grid">
            <FormField
              label="Designation *"
              fullWidth
              helpText="Maps the person into role-based views and reporting."
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
              label="Expected Working Hours *"
              fullWidth
              helpText="Defaults can follow gender-based org policy; override per employee."
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

        <FormCard index={3} title="Department & Function">
          <div className="cp-form-grid">
            <FormField label="Department(s) *" fullWidth>
              <EuiComboBox
                compressed
                fullWidth
                placeholder="Search department..."
                options={options(departments.map((item) => item.name))}
                selectedOptions={selectedDepartments}
                onChange={(next) => {
                  setSelectedDepartments(next)
                  setSelectedFunctions((current) =>
                    current.filter((item) =>
                      next.some((department) =>
                        FUNCTION_MAP[department.label]?.includes(item.label),
                      ),
                    ),
                  )
                }}
              />
            </FormField>
            <FormField
              label="Function(s)"
              fullWidth
              helpText={
                selectedDepartments.length === 0 ? 'Select a Department first.' : undefined
              }
            >
              <EuiComboBox
                compressed
                fullWidth
                isDisabled={selectedDepartments.length === 0}
                placeholder={
                  selectedDepartments.length === 0
                    ? 'Select a Department first.'
                    : 'Search function...'
                }
                options={options(functionChoices)}
                selectedOptions={selectedFunctions}
                onChange={setSelectedFunctions}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard index={4} title="Reporting Line">
          <div className="cp-form-grid">
            <FormField label="Team Lead(s)" fullWidth>
              <EuiComboBox
                compressed
                fullWidth
                placeholder={LEADS.length === 0 ? 'No Team Leads found.' : 'Search team lead...'}
                options={options(LEADS)}
                selectedOptions={teamLeads}
                onChange={setTeamLeads}
                noSuggestions={LEADS.length === 0}
              />
            </FormField>
            <FormField label="Manager(s)" fullWidth>
              <EuiComboBox
                compressed
                fullWidth
                placeholder={
                  MANAGERS.length === 0 ? 'No Managers found.' : 'Search manager...'
                }
                options={options(MANAGERS)}
                selectedOptions={managers}
                onChange={setManagers}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard index={5} title="Location & Work Mode">
          <div className="cp-form-grid">
            <FormField label="Location *" fullWidth>
              <EuiSelect
                compressed
                fullWidth
                options={selectOptions(LOCATIONS)}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </FormField>
            <FormField label="Work Mode *" fullWidth>
              <EuiSelect
                compressed
                fullWidth
                options={selectOptions(WORK_MODES)}
                value={workMode}
                onChange={(event) => setWorkMode(event.target.value)}
              />
            </FormField>
          </div>
        </FormCard>

        <FormCard index={6} title="Device Management">
          {employeeCode.trim() === '' ? (
            <div className="cp-device-empty">
              Enter an Employee ID above to see or add devices.
            </div>
          ) : (
            <div className="cp-device-list">
              {devices.length === 0 ? (
                <div className="cp-card-sub">No devices linked yet.</div>
              ) : (
                devices.map((device) => (
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
                ))
              )}
              <EuiButtonEmpty
                size="s"
                iconType="plus"
                onClick={() =>
                  setDevices((current) => [
                    ...current,
                    `CIPL-ATC${String(10000 + current.length).slice(-5)}`,
                  ])
                }
              >
                Add device
              </EuiButtonEmpty>
            </div>
          )}
        </FormCard>

        <FormCard index={7} title="Login & Security">
          <EuiText size="s" color="subdued">
            <p className="cp-flush">Only a Manager or Super Admin can manage portal login access.</p>
          </EuiText>
        </FormCard>

        <FormCard index={8} title="Account Status">
          <FormField
            className="cp-field--narrow"
            label="Status *"
            helpText="Deactivating also revokes portal login access and stops the agent from reporting. Historical productivity data is preserved."
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
          Save Changes
        </EuiButton>
      </div>
    </section>
  )
}

function FormCard({
  index,
  title,
  children,
}: {
  index: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="cp-card cp-form-card">
      <h2 className="cp-form-card__title">
        <span>{index}.</span> {title}
      </h2>
      {children}
    </section>
  )
}

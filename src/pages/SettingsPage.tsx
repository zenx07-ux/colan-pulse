import { useRef, useState, type ReactNode } from 'react'
import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiIcon,
  EuiSelect,
  EuiSwitch,
} from '@elastic/eui'
import { useColorMode } from '../theme/ColorModeContext'
import { PageHeading } from '../components/PageHeading'

export function SettingsPage() {
  const { colorMode, toggleColorMode } = useColorMode()
  const importRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [siteTitle, setSiteTitle] = useState('ColanPulse')
  const [tagline, setTagline] = useState('Workforce activity, idle, and agent health')
  const [forceHttps, setForceHttps] = useState(true)
  const [sso, setSso] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('8 hours')
  const [passwordMin, setPasswordMin] = useState('10 characters')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smtpHost, setSmtpHost] = useState('smtp.colaninfotech.net')
  const [slackWebhook, setSlackWebhook] = useState('')
  const [ingestKey, setIngestKey] = useState('cp_live_7f3a9c2e')
  const [idleThreshold, setIdleThreshold] = useState('15 minutes')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [shotRetention, setShotRetention] = useState('14 days')
  const [maintenance, setMaintenance] = useState(false)
  const [backup, setBackup] = useState('Daily')
  const [backupDest, setBackupDest] = useState('Azure Blob')
  const [includeIdle, setIncludeIdle] = useState(true)
  const [reportRange, setReportRange] = useState('Last 7 days')
  const [logLevel, setLogLevel] = useState('Error')
  const [logRetention, setLogRetention] = useState('30 days')
  const [cookieBanner, setCookieBanner] = useState(true)
  const [anonymize, setAnonymize] = useState(false)

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 4000)
  }

  function save(label = 'Settings saved.') {
    showNotice(label)
  }

  return (
    <section className="cp-page cp-settings-page">
      <PageHeading
        title="Settings"
        description="Organization defaults for the agent, portal, and reporting. Super Admin only."
      />

      <EuiForm
        className="cp-settings-form"
        component="form"
        onSubmit={(event) => event.preventDefault()}
      >
        <SettingsSection title="Site information">
          <SettingRow
            title="Site title"
            description="Shown in the header, browser tab, and exported reports."
          >
            <EuiFieldText
              compressed
              fullWidth
              value={siteTitle}
              onChange={(event) => setSiteTitle(event.target.value)}
            />
          </SettingRow>
          <SettingRow
            title="Tagline"
            description="Short line under the product name on login and reports."
          >
            <EuiFieldText
              compressed
              fullWidth
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Security">
          <SettingRow
            title="Require HTTPS"
            description="Redirect portal and agent ingest traffic to TLS."
          >
            <EuiSwitch
              label={forceHttps ? 'On' : 'Off'}
              checked={forceHttps}
              onChange={(event) => setForceHttps(event.target.checked)}
            />
          </SettingRow>
          <SettingRow
            title="SSO"
            description="Allow Google / Microsoft sign-in for portal users. Local Employee ID login still works."
          >
            <EuiSwitch
              label={sso ? 'On' : 'Off'}
              checked={sso}
              onChange={(event) => setSso(event.target.checked)}
            />
          </SettingRow>
          <SettingRow
            title="Session timeout"
            description="Idle Super Admin and Manager sessions are signed out after this period."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['4 hours', '8 hours', '12 hours', '24 hours'].map((value) => ({
                value,
                text: value,
              }))}
              value={sessionTimeout}
              onChange={(event) => setSessionTimeout(event.target.value)}
            />
          </SettingRow>
          <SettingRow
            title="Password minimum"
            description="Applied when an admin resets an employee portal password."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['8 characters', '10 characters', '12 characters'].map((value) => ({
                value,
                text: value,
              }))}
              value={passwordMin}
              onChange={(event) => setPasswordMin(event.target.value)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Communication">
          <SettingRow
            title="Email notifications"
            description="Incident and agent-install mail to managers."
          >
            <EuiSwitch
              label={emailAlerts ? 'On' : 'Off'}
              checked={emailAlerts}
              onChange={(event) => setEmailAlerts(event.target.checked)}
            />
          </SettingRow>
          <SettingRow
            title="SMTP host"
            description="Outbound mail server for agent install and password reset."
          >
            <div className="cp-func-add">
              <EuiFieldText
                compressed
                fullWidth
                value={smtpHost}
                onChange={(event) => setSmtpHost(event.target.value)}
              />
              <EuiButton size="s" onClick={() => save('SMTP host updated.')}>
                Update
              </EuiButton>
            </div>
          </SettingRow>
          <SettingRow
            title="Slack webhook"
            description="Optional incident fan-out. Leave blank to disable."
          >
            <EuiFieldText
              compressed
              fullWidth
              placeholder="https://hooks.slack.com/services/…"
              value={slackWebhook}
              onChange={(event) => setSlackWebhook(event.target.value)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="API settings">
          <SettingRow
            title="Agent ingest key"
            description="Desktop agents use this key. Rotating disconnects agents until they are updated."
          >
            <div className="cp-func-add">
              <EuiFieldText compressed fullWidth readOnly value={ingestKey} />
              <EuiButton
                size="s"
                onClick={() => {
                  setIngestKey(`cp_live_${Math.random().toString(36).slice(2, 10)}`)
                  save('Ingest key rotated.')
                }}
              >
                Rotate
              </EuiButton>
            </div>
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingRow
            title="Color mode"
            description="Default for this browser. The header toggle still switches instantly."
          >
            <EuiSelect
              compressed
              fullWidth
              options={[
                { value: 'light', text: 'Light' },
                { value: 'dark', text: 'Dark' },
              ]}
              value={colorMode}
              onChange={(event) => {
                if (event.target.value !== colorMode) toggleColorMode()
              }}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="System config">
          <SettingRow
            title="Idle threshold"
            description="Needs Attention flags employees idle at or above this duration today."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['10 minutes', '15 minutes', '20 minutes', '30 minutes'].map((value) => ({
                value,
                text: value,
              }))}
              value={idleThreshold}
              onChange={(event) => setIdleThreshold(event.target.value)}
            />
          </SettingRow>
          <SettingRow
            title="Timezone"
            description="Used when displaying event times and log timestamps."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['UTC', 'Asia/Kolkata', 'Asia/Dubai', 'Europe/London'].map((value) => ({
                value,
                text: value,
              }))}
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            />
          </SettingRow>
          <SettingRow
            title="Screenshot retention"
            description="Older captures are dropped from storage. Historical scores stay."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['7 days', '14 days', '30 days', '90 days'].map((value) => ({
                value,
                text: value,
              }))}
              value={shotRetention}
              onChange={(event) => setShotRetention(event.target.value)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Maintenance mode">
          <SettingRow
            title="Maintenance mode"
            description="Managers see a banner; desktop agents keep polling. Super Admin can still sign in."
          >
            <EuiSwitch
              label={maintenance ? 'On' : 'Off'}
              checked={maintenance}
              onChange={(event) => setMaintenance(event.target.checked)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Backup">
          <SettingRow
            title="Schedule"
            description="Automated snapshot of Employee Master, categories, and event rules."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['Off', 'Daily', 'Weekly'].map((value) => ({ value, text: value }))}
              value={backup}
              onChange={(event) => setBackup(event.target.value)}
            />
          </SettingRow>
          <SettingRow
            title="Destination"
            description="Where scheduled backups are written."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['Azure Blob', 'Local disk', 'S3'].map((value) => ({ value, text: value }))}
              value={backupDest}
              onChange={(event) => setBackupDest(event.target.value)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Report settings">
          <SettingRow
            title="Include idle in productivity"
            description="When off, exported productivity reports hide idle minutes."
          >
            <EuiSwitch
              label={includeIdle ? 'On' : 'Off'}
              checked={includeIdle}
              onChange={(event) => setIncludeIdle(event.target.checked)}
            />
          </SettingRow>
          <SettingRow
            title="Default range"
            description="Pre-selected window on Reports and Employee Productivity."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['Today', 'Last 7 days', 'Last 30 days', 'Quarter to date'].map((value) => ({
                value,
                text: value,
              }))}
              value={reportRange}
              onChange={(event) => setReportRange(event.target.value)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Import / export">
          <SettingRow
            title="Employee Master"
            description="CSV of Employee ID, name, department, and reporting line."
          >
            <div className="cp-head-actions">
              <EuiButton size="s" onClick={() => save('Employee Master export started.')}>
                Export CSV
              </EuiButton>
              <EuiButton size="s" onClick={() => importRef.current?.click()}>
                Import CSV
              </EuiButton>
              <input
                ref={importRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) save(`Imported ${file.name}.`)
                }}
              />
            </div>
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Logs configuration">
          <SettingRow
            title="Log level"
            description="Minimum severity written to System Logs. Agent crashes are always kept."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['Error', 'Warning', 'Info'].map((value) => ({ value, text: value }))}
              value={logLevel}
              onChange={(event) => setLogLevel(event.target.value)}
            />
          </SettingRow>
          <SettingRow
            title="Retention"
            description="Technical logs older than this are purged. Historical productivity is not."
          >
            <EuiSelect
              compressed
              fullWidth
              options={['7 days', '14 days', '30 days', '90 days'].map((value) => ({
                value,
                text: value,
              }))}
              value={logRetention}
              onChange={(event) => setLogRetention(event.target.value)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Privacy">
          <SettingRow
            title="Cookie banner"
            description="Show a notice on the portal login page for GDPR / DPDP."
          >
            <EuiSwitch
              label={cookieBanner ? 'On' : 'Off'}
              checked={cookieBanner}
              onChange={(event) => setCookieBanner(event.target.checked)}
            />
          </SettingRow>
          <SettingRow
            title="Anonymize unidentified hosts"
            description="Hide machine names in System Logs when the employee cannot be resolved."
          >
            <EuiSwitch
              label={anonymize ? 'On' : 'Off'}
              checked={anonymize}
              onChange={(event) => setAnonymize(event.target.checked)}
            />
          </SettingRow>
        </SettingsSection>
      </EuiForm>

      <div className="cp-form-foot">
        <EuiButton fill color="success" onClick={() => save()}>
          Save changes
        </EuiButton>
      </div>

      {notice ? (
        <div className="cp-toast" role="status">
          <EuiIcon type="check" size="s" color="success" />
          <span>{notice}</span>
        </div>
      ) : null}
    </section>
  )
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cp-card cp-settings-card">
      <h2 className="cp-settings-kicker">{title}</h2>
      {children}
    </section>
  )
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="cp-setting">
      <div className="cp-setting__copy">
        <div className="cp-setting__title">{title}</div>
        <div className="cp-card-sub">{description}</div>
      </div>
      <div className="cp-setting__control">{children}</div>
    </div>
  )
}

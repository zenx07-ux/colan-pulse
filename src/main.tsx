import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { EuiProvider } from '@elastic/eui'
import { EuiThemeBorealis } from '@elastic/eui-theme-borealis'
import App from './App'
import './iconCache'
import './index.css'
import './theme/app.css'
import { ColorModeProvider, useColorMode } from './theme/ColorModeContext'
import { euiModify } from './theme/euiModify'

function ThemedApp() {
  const { colorMode } = useColorMode()

  return (
    <EuiProvider colorMode={colorMode} theme={EuiThemeBorealis} modify={euiModify}>
      <div className="cp-app" data-theme={colorMode}>
        <HashRouter>
          <App />
        </HashRouter>
      </div>
    </EuiProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <ColorModeProvider>
    <ThemedApp />
  </ColorModeProvider>,
)

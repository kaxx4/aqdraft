import './styles/aq-design-system.css'
import './styles/v6.css'
// NOTE: studio-mode.css was imported here but is dead — it is scoped entirely
// to body[data-mode="studio"], which nothing in the app ever sets. Removing the
// import drops ~17 KB of always-loaded CSS off first paint. (The brand display
// font NeutralFace is declared in v6.css, not here, so headlines are unaffected.)
import ReactDOM from 'react-dom/client'
import { inject } from '@vercel/analytics'
import App from './App'
import './index.css'

inject()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)

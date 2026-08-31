import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { I18nProvider } from './i18n'
import { HomePage } from './pages/HomePage'
import { LegalPage } from './pages/LegalPage'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <I18nProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/legal/:slug" element={<LegalPage />} />
          </Routes>
        </I18nProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

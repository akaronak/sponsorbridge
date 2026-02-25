import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './shared/ProtectedRoute';
import LoadingSpinner from './shared/LoadingSpinner';

// â"€â"€â"€ Marketing / Public Pages (eager) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// â"€â"€â"€ Marketing Pages (lazy) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Security = lazy(() => import('./pages/Security'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));

// â"€â"€â"€ Organizer Dashboard (lazy â€" code-split) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const DashboardLayout = lazy(() => import('./dashboard/layout/DashboardLayout'));
const Overview = lazy(() => import('./dashboard/pages/Overview'));
const Events = lazy(() => import('./dashboard/pages/Events'));
const Sponsors = lazy(() => import('./dashboard/pages/Sponsors'));
const Messages = lazy(() => import('./dashboard/pages/Messages'));
const Analytics = lazy(() => import('./dashboard/pages/Analytics'));
const Settings = lazy(() => import('./dashboard/pages/Settings'));
const AIAssistant = lazy(() => import('./dashboard/modules/ai/AIAssistant'));
const Payments = lazy(() => import('./dashboard/pages/Payments'));

// â"€â"€â"€ Company Dashboard (lazy â€" code-split) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const CompanyLayout = lazy(() => import('./company/layout/CompanyLayout'));
const CompanyOverview = lazy(() => import('./company/pages/CompanyOverview'));
const CompanyEvents = lazy(() => import('./company/pages/CompanyEvents'));
const CompanyApplications = lazy(() => import('./company/pages/CompanyApplications'));
const CompanyDeals = lazy(() => import('./company/pages/CompanyDeals'));
const CompanyMessages = lazy(() => import('./company/pages/CompanyMessages'));
const CompanyAnalytics = lazy(() => import('./company/pages/CompanyAnalytics'));
const CompanySettings = lazy(() => import('./company/pages/CompanySettings'));
const CompanyPayments = lazy(() => import('./company/pages/CompanyPayments'));

// â"€â"€â"€ Shared â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const NotFound = lazy(() => import('./shared/NotFound'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* â•â•â•â•â•â•â•â• Public / Marketing Routes â•â•â•â•â•â•â•â• */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/security" element={<Security />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            {/* â•â•â•â•â•â•â•â• Organizer Dashboard (Authenticated) â•â•â•â•â•â•â•â• */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="events" element={<Events />} />
              <Route path="sponsors" element={<Sponsors />} />
              <Route path="messages" element={<Messages />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="payments" element={<Payments />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* â•â•â•â•â•â•â•â• Company Dashboard (Authenticated) â•â•â•â•â•â•â•â• */}
            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <CompanyLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CompanyOverview />} />
              <Route path="events" element={<CompanyEvents />} />
              <Route path="applications" element={<CompanyApplications />} />
              <Route path="deals" element={<CompanyDeals />} />
              <Route path="payments" element={<CompanyPayments />} />
              <Route path="messages" element={<CompanyMessages />} />
              <Route path="analytics" element={<CompanyAnalytics />} />
              <Route path="settings" element={<CompanySettings />} />
            </Route>

            {/* â•â•â•â•â•â•â•â• 404 â•â•â•â•â•â•â•â• */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;

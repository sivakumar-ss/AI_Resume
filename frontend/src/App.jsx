import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import DashboardLayout from './components/layout/DashboardLayout'
import PublicLayout from './components/layout/PublicLayout'
import { GuestRoute, ProtectedRoute } from './components/layout/RouteGuards'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LandingPage from './pages/LandingPage'
import LearningRoadmapPage from './pages/LearningRoadmapPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import RecommendationsPage from './pages/RecommendationsPage'
import RegisterPage from './pages/RegisterPage'
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage'
import SkillAssessmentPage from './pages/SkillAssessmentPage'
import SkillGapPage from './pages/SkillGapPage'
import StudentDashboardPage from './pages/StudentDashboardPage'

/** Scroll to in-page anchors, otherwise reset to the top on navigation. */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<DashboardLayout role="student" />}>
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
            <Route path="/skill-assessment" element={<SkillAssessmentPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<LearningRoadmapPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<DashboardLayout role="admin" />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

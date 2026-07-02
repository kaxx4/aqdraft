import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import HomePage from '../public/HomePage'
import HomeIntro from '../components/HomeIntro'

const HomeRoute = () => {
  const { member, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--bg)' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (isAuthenticated && member) {
    switch (member.status) {
      case 'active':
        return <><HomeIntro /><HomePage /></>
      case 'pending_approval':
        return <Navigate to="/pending" replace />
      case 'rejected':
      case 'suspended':
        return <Navigate to="/rejected" replace />
    }
  }

  return <><HomeIntro /><HomePage /></>
}

export default HomeRoute

import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import TicketListPage from './pages/TicketListPage'
import { useAuth } from './context/AuthContext'
import TicketDetailPage from './pages/TicketDetailPage'
import NewTicketPage from './pages/NewTicketPage'

function ProtectedRoute({ children }) {
  const {user,loading} = useAuth()
  if(loading) return <div className='flex justify-center items-center h-screen'><div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand'></div>Loading...</div>
  if(!user) return <Navigate to ="/login" />          
  return children     
}
export default function App() {
 

  return ( 
    <>
    
    <Routes>
      <Route path="/" element = {<Navigate   to ="/login" />} />
      <Route path="/login" element ={<LoginPage />} />
        <Route path="/tickets/new" element ={<ProtectedRoute><NewTicketPage /></ProtectedRoute>}/>
      <Route path="/tickets" element = { <ProtectedRoute><TicketListPage /></ProtectedRoute> } />
      <Route path ="/tickets/:id" element ={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>}/>
      
    </Routes>
  
    </>
  )
}

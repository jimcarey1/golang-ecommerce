import { Route, Routes } from 'react-router-dom'

import LoginScreen from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'

function App() {

  return (
    <div>
      <Routes>
        <Route path="/auth/login" element={<LoginScreen />} />
        <Route path="/auth/register" element={<RegistrationPage />} />
      </Routes>
    </div>
  )
}

export default App

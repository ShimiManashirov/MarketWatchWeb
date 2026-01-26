import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/" element={<div><h1>Protected Home (Todo)</h1></div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

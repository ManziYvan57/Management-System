import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated, setUser }) => {
  const [form, setForm] = useState({
    email: 'serge@trinityexpress',
    password: 'password123'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with actual API call
      const mockUser = { 
        firstName: 'Serge',
        email: form.email
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setIsAuthenticated(true);
      setUser(mockUser);
      navigate('/');
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="login-container">
      {/* Your login form JSX */}
    </div>
  );
};

export default Login;
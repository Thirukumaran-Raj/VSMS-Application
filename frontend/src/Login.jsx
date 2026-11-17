
import { useState } from 'react';
import API from './api';
import './Login.css';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const response = await API.post('/auth/login', {
                username,
                password
            });

            if (response.data.success) {
                onLogin(response.data.token, response.data.admin);
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Login failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-logo">
                    <div className="login-logo-icon">V</div>
                    <h2>VSMS</h2>
                </div>

                <div className="login-heading">
                    <h1>Welcome Back!</h1>
                    <p>Sign in to access your admin dashboard.</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="login-input-group">
                        <label>Username</label>

                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <label>Password</label>

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                </form>

                <div className="login-footer">
                    <p>Vehicle Service Management System</p>
                    <span>Admin Portal</span>
                </div>

            </div>

        </div>
    );
}

export default Login;

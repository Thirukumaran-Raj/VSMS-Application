
import { useEffect, useState } from 'react';
import './App.css';
import API from './api';

import Login from './Login';

import Customers from './Customers';
import Vehicles from './Vehicles';
import Services from './Services';
import Bookings from './Bookings';
import Invoices from './Invoices';
import BookingLogs from './BookingLogs';
import Payments from './Payments';
import Reports from './Reports';

// Animated number component
function AnimatedNumber({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = Number(value) || 0;

    if (target === 0) {
      const timer = setTimeout(() => setCount(0), 0);
      return () => clearTimeout(timer);
    }

    const step = Math.max(1, Math.ceil(target / 40));

    const timer = setInterval(() => {
      current += step;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      setCount(current);
    }, 25);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

function App() {
  // Authentication states
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const [adminInfo, setAdminInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || 'null');
    } catch {
      return null;
    }
  });

  const [customers, setCustomers] = useState(0);
  const [vehicles, setVehicles] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [invoices, setInvoices] = useState(0);

  const [bookingList, setBookingList] = useState([]);

  const [activePage, setActivePage] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle successful login
  const handleLogin = (newToken, admin) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('admin', JSON.stringify(admin));

    setToken(newToken);
    setAdminInfo(admin);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');

    setToken(null);
    setAdminInfo(null);

    setActivePage('Dashboard');
    setMobileMenuOpen(false);

    setCustomers(0);
    setVehicles(0);
    setBookings(0);
    setInvoices(0);
    setBookingList([]);
  };

  // Load dashboard data after login
  useEffect(() => {
    if (!token) return;

    let isActive = true;

    const loadDashboard = async () => {
      try {
        const customerRes = await API.get('/customers');
        const vehicleRes = await API.get('/vehicles');
        const bookingRes = await API.get('/bookings');
        const invoiceRes = await API.get('/invoices');

        if (!isActive) return;

        setCustomers(customerRes.data.count || 0);
        setVehicles(vehicleRes.data.count || 0);
        setBookings(bookingRes.data.count || 0);
        setInvoices(invoiceRes.data.count || 0);

        setBookingList(bookingRes.data.bookings || []);

      } catch (error) {
        console.error('Dashboard API Error:', error);
      }
    };

    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [token]);

  // Sidebar navigation
  const handleNavigation = (e, page) => {
    e.preventDefault();
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  // Sidebar menu items
  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Customers', icon: '👥' },
    { name: 'Vehicles', icon: '🚗' },
    { name: 'Services', icon: '🔧' },
    { name: 'Bookings', icon: '📅' },
    { name: 'Invoices', icon: '📄' },
    { name: 'Booking Logs', icon: '📋' },
    { name: 'Payments', icon: '💳' },
    { name: 'Reports', icon: '📈' }
  ];

  // Page descriptions
  const pageDetails = {
    Dashboard: 'Vehicle Service Management System',
    Customers: 'Manage registered customers',
    Vehicles: 'Manage registered vehicles',
    Services: 'Manage available vehicle services',
    Bookings: 'Manage vehicle service bookings',
    Invoices: 'View invoice and payment details',
    'Booking Logs': 'Track booking status history',
    Payments: 'Manage invoice payments',
    Reports: 'View business reports and performance analytics'
  };

  // Booking status counts
  const getStatusCount = (status) => {
    return bookingList.filter(
      (booking) =>
        String(booking.booking_status || '')
          .toUpperCase()
          .replaceAll(' ', '_') === status
    ).length;
  };

  // Latest bookings
  const recentBookings = [...bookingList]
    .sort((a, b) => Number(b.booking_id) - Number(a.booking_id))
    .slice(0, 5);

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString('en-IN');
  };

  // Show login page if admin is not logged in
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>

        <div className="sidebar-brand">
          <div className="brand-icon">🚘</div>

          <div>
            <h2>VSMS</h2>
            <p>Vehicle Management</p>
          </div>

          {/* Mobile Close Button */}
          <button
            className="sidebar-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="nav-label">MAIN MENU</div>

        <nav>
          {menuItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className={activePage === item.name ? 'active' : ''}
              onClick={(e) => handleNavigation(e, item.name)}
              aria-current={activePage === item.name ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>

              {activePage === item.name && (
                <span className="nav-indicator">●</span>
              )}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">⚙️</div>

          <div>
            <h4>VSMS Admin</h4>
            <p>Management Panel</p>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="main">

        {/* Mobile Hamburger Button */}
        <button
          className="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Header */}
        <header className="header">
          <div>
            <h1>
              {activePage === 'Payments'
                ? 'Payment Management'
                : activePage}
            </h1>

            <p>{pageDetails[activePage]}</p>
          </div>

          <div className="admin">
            <span>👤</span>
            <span>{adminInfo?.username || 'Admin'}</span>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout from VSMS"
            >
              ↪ Logout
            </button>
          </div>
        </header>

        {/* Dashboard */}
        {activePage === 'Dashboard' && (
          <div className="dashboard-content">

            {/* Welcome Section */}
            <section className="welcome dashboard-welcome">
              <div>
                <span className="welcome-tag">ADMIN DASHBOARD</span>

                <h2>Welcome to VSMS 👋</h2>

                <p>
                  Here's what's happening in your vehicle service center today.
                </p>
              </div>

              <div className="welcome-illustration">🚘</div>
            </section>

            {/* Statistics Cards */}
            <section className="cards dashboard-stats">

              <div className="card stat-card stat-customers">
                <div className="stat-top">
                  <div className="stat-icon">👥</div>
                  <span className="stat-label">CUSTOMERS</span>
                </div>

                <h1><AnimatedNumber value={customers} /></h1>
                <p>Total registered customers</p>
              </div>

              <div className="card stat-card stat-vehicles">
                <div className="stat-top">
                  <div className="stat-icon">🚗</div>
                  <span className="stat-label">VEHICLES</span>
                </div>

                <h1><AnimatedNumber value={vehicles} /></h1>
                <p>Total registered vehicles</p>
              </div>

              <div className="card stat-card stat-bookings">
                <div className="stat-top">
                  <div className="stat-icon">📅</div>
                  <span className="stat-label">BOOKINGS</span>
                </div>

                <h1><AnimatedNumber value={bookings} /></h1>
                <p>Total service bookings</p>
              </div>

              <div className="card stat-card stat-invoices">
                <div className="stat-top">
                  <div className="stat-icon">📄</div>
                  <span className="stat-label">INVOICES</span>
                </div>

                <h1><AnimatedNumber value={invoices} /></h1>
                <p>Total generated invoices</p>
              </div>

            </section>

            {/* Booking Status Overview */}
            <section className="content dashboard-section">

              <div className="section-heading">
                <div>
                  <h2>Booking Overview</h2>
                  <p>Current status of your service bookings</p>
                </div>

                <button
                  className="view-all-btn"
                  onClick={() => setActivePage('Bookings')}
                >
                  View Bookings →
                </button>
              </div>

              <div className="status-grid">

                <div className="status-card status-pending">
                  <span>⏳</span>
                  <div>
                    <h3>{getStatusCount('PENDING')}</h3>
                    <p>Pending</p>
                  </div>
                </div>

                <div className="status-card status-confirmed">
                  <span>✅</span>
                  <div>
                    <h3>{getStatusCount('CONFIRMED')}</h3>
                    <p>Confirmed</p>
                  </div>
                </div>

                <div className="status-card status-progress">
                  <span>🔧</span>
                  <div>
                    <h3>{getStatusCount('IN_PROGRESS')}</h3>
                    <p>In Progress</p>
                  </div>
                </div>

                <div className="status-card status-completed">
                  <span>🎉</span>
                  <div>
                    <h3>{getStatusCount('COMPLETED')}</h3>
                    <p>Completed</p>
                  </div>
                </div>

                <div className="status-card status-cancelled">
                  <span>❌</span>
                  <div>
                    <h3>{getStatusCount('CANCELLED')}</h3>
                    <p>Cancelled</p>
                  </div>
                </div>

              </div>
            </section>

            {/* Recent Bookings */}
            <section className="content dashboard-section recent-section">

              <div className="section-heading">
                <div>
                  <h2>Recent Bookings</h2>
                  <p>Your latest service booking records</p>
                </div>

                <button
                  className="view-all-btn"
                  onClick={() => setActivePage('Bookings')}
                >
                  View All →
                </button>
              </div>

              <div className="recent-table-wrapper">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Vehicle</th>
                      <th>Service</th>
                      <th>Service Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => {
                        const status = String(
                          booking.booking_status || 'PENDING'
                        )
                          .toUpperCase()
                          .replaceAll(' ', '_');

                        return (
                          <tr key={booking.booking_id}>
                            <td>#{booking.booking_id}</td>
                            <td>{booking.customer_name || '-'}</td>
                            <td>{booking.vehicle_number || '-'}</td>
                            <td>{booking.service_name || '-'}</td>
                            <td>{formatDate(booking.service_date)}</td>
                            <td>
                              <span className={`booking-status status-${status.toLowerCase()}`}>
                                {status.replaceAll('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-bookings">
                          No bookings available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </section>

          </div>
        )}

        {/* Other Pages */}
        {activePage === 'Customers' && <Customers />}
        {activePage === 'Vehicles' && <Vehicles />}
        {activePage === 'Services' && <Services />}
        {activePage === 'Bookings' && <Bookings />}
        {activePage === 'Invoices' && <Invoices />}
        {activePage === 'Booking Logs' && <BookingLogs />}
        {activePage === 'Payments' && <Payments />}
        {activePage === 'Reports' && <Reports />}

      </main>
    </div>
  );
}

export default App;

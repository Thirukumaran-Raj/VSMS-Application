
import { useEffect, useState } from 'react';
import API from './api';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    service_id: '',
    service_date: ''
  });

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const response = await API.get('/bookings');
      setBookings(response.data.bookings || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await API.get('/customers');
      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await API.get('/vehicles');
      setVehicles(response.data.vehicles || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await API.get('/services');
      setServices(response.data.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load all data
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchBookings();
      fetchCustomers();
      fetchVehicles();
      fetchServices();
    });
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'customer_id' ? { vehicle_id: '' } : {})
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      customer_id: '',
      vehicle_id: '',
      service_id: '',
      service_date: ''
    });
  };

  // Add new booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await API.post('/bookings', {
        customer_id: Number(formData.customer_id),
        vehicle_id: Number(formData.vehicle_id),
        service_id: Number(formData.service_id),
        service_date: formData.service_date
      });

      alert('Booking created successfully!');

      resetForm();
      setShowForm(false);
      fetchBookings();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Update booking status
  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);

    try {
      await API.post('/update-booking-status', {
        booking_id: bookingId,
        new_status: newStatus
      });

      alert('Booking status updated successfully!');
      await fetchBookings();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update booking status');
      await fetchBookings();
    } finally {
      setUpdatingId(null);
    }
  };

  // Format booking date
  const formatDate = (date) => {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.toLowerCase();

    const matchesSearch = [
      booking.booking_id,
      booking.customer_name,
      booking.customer_id,
      booking.vehicle_number,
      booking.vehicle_id,
      booking.service_name,
      booking.service_id
    ].some((value) =>
      String(value || '').toLowerCase().includes(searchText)
    );

    const matchesStatus =
      statusFilter === 'ALL' ||
      booking.booking_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Booking statistics
  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.booking_status === 'PENDING'
  ).length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.booking_status === 'CONFIRMED'
  ).length;

  const inProgressBookings = bookings.filter(
    (booking) => booking.booking_status === 'IN_PROGRESS'
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.booking_status === 'COMPLETED'
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.booking_status === 'CANCELLED'
  ).length;

  // Status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'pending';

      case 'CONFIRMED':
        return 'confirmed';

      case 'IN_PROGRESS':
        return 'in-progress';

      case 'COMPLETED':
        return 'completed';

      case 'CANCELLED':
        return 'cancelled';

      default:
        return 'pending';
    }
  };

  // Status display name
  const getStatusName = (status) => {
    return status
      ? status.replace('_', ' ')
      : 'UNKNOWN';
  };

  return (
    <div className="content bookings-page">

      {/* Page Header */}
      <div className="bookings-header">
        <div>
          <span className="page-subtitle">BOOKING MANAGEMENT</span>
          <h2>Service Bookings</h2>
          <p>Manage vehicle service appointments and track their progress.</p>
        </div>

        <button
          className="add-booking-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Booking'}
        </button>
      </div>

      {/* Statistics */}
      <div className="booking-stats">

        <div className="booking-stat-card">
          <div className="booking-stat-icon blue">📋</div>
          <div>
            <span>Total Bookings</span>
            <h3>{totalBookings}</h3>
            <p>All appointments</p>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon orange">⏳</div>
          <div>
            <span>Pending</span>
            <h3>{pendingBookings}</h3>
            <p>Waiting for confirmation</p>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon purple">🔧</div>
          <div>
            <span>In Progress</span>
            <h3>{inProgressBookings}</h3>
            <p>Currently servicing</p>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon green">✓</div>
          <div>
            <span>Completed</span>
            <h3>{completedBookings}</h3>
            <p>Successfully completed</p>
          </div>
        </div>

      </div>

      {/* Booking Status Overview */}
      <div className="booking-overview">
        <div>
          <span className="overview-dot confirmed-dot"></span>
          Confirmed <strong>{confirmedBookings}</strong>
        </div>

        <div>
          <span className="overview-dot pending-dot"></span>
          Pending <strong>{pendingBookings}</strong>
        </div>

        <div>
          <span className="overview-dot progress-dot"></span>
          In Progress <strong>{inProgressBookings}</strong>
        </div>

        <div>
          <span className="overview-dot completed-dot"></span>
          Completed <strong>{completedBookings}</strong>
        </div>

        <div>
          <span className="overview-dot cancelled-dot"></span>
          Cancelled <strong>{cancelledBookings}</strong>
        </div>
      </div>

      {/* Add Booking Form */}
      {showForm && (
        <div className="booking-form-card">

          <div className="booking-form-heading">
            <div>
              <h3>Create New Booking</h3>
              <p>Enter the details to schedule a vehicle service.</p>
            </div>

            <div className="booking-form-icon">📅</div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">

            <div className="booking-form-grid">

              <div className="form-group">
                <label>Select Customer</label>

                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a customer</option>

                  {customers.map((customer) => (
                    <option
                      key={customer.customer_id}
                      value={customer.customer_id}
                    >
                      {customer.customer_name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Vehicle</label>

                <select
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.customer_id}
                >
                  <option value="">
                    {formData.customer_id
                      ? 'Choose a vehicle'
                      : 'Select customer first'}
                  </option>

                  {vehicles
                    .filter((vehicle) =>
                      String(vehicle.customer_id) === formData.customer_id
                    )
                    .map((vehicle) => (
                      <option
                        key={vehicle.vehicle_id}
                        value={vehicle.vehicle_id}
                      >
                        {vehicle.vehicle_number} - {vehicle.brand} {vehicle.model}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Service</label>

                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a service</option>

                  {services.map((service) => (
                    <option
                      key={service.service_id}
                      value={service.service_id}
                    >
                      {service.service_name} - ₹{service.service_price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Service Date</label>

                <input
                  type="date"
                  name="service_date"
                  value={formData.service_date}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString('en-CA')}
                  required
                />
              </div>

            </div>

            <div className="booking-form-actions">
              <button
                type="button"
                className="booking-cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="booking-save-btn"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : '✓ Create Booking'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Booking List */}
      <div className="booking-list-card">

        <div className="booking-list-header">
          <div>
            <h3>All Bookings</h3>
            <p>View and update your vehicle service appointments.</p>
          </div>

          <button
            className="booking-refresh-btn"
            onClick={() => {
              setLoading(true);
              fetchBookings();
            }}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Search and Filter */}
        <div className="booking-toolbar">

          <div className="booking-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search booking, customer, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="booking-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

        </div>

        {/* Loading */}
        {loading ? (
          <div className="booking-message">
            <div className="booking-loader"></div>
            <p>Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="booking-message booking-error">
            <p>{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchBookings();
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="booking-table-wrapper">

            <table className="booking-table">

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
                {filteredBookings.map((booking) => (
                  <tr key={booking.booking_id}>

                    <td>
                      <span className="booking-id">
                        #{booking.booking_id}
                      </span>
                    </td>

                    <td>
                      <div className="booking-customer-cell">
                        <div className="booking-avatar">
                          {(booking.customer_name || 'C')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>
                          {booking.customer_name || booking.customer_id}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="booking-vehicle-cell">
                        🚘 {booking.vehicle_number || booking.vehicle_id}
                      </span>
                    </td>

                    <td>
                      {booking.service_name || booking.service_id}
                    </td>

                    <td>
                      <span className="booking-date">
                        {formatDate(booking.service_date)}
                      </span>
                    </td>

                    <td>
                      <div className="booking-status-cell">

                        <span
                          className={`booking-status-badge ${getStatusClass(
                            booking.booking_status
                          )}`}
                        >
                          {getStatusName(booking.booking_status)}
                        </span>

                        <select
                          className="booking-status-select"
                          value={booking.booking_status || 'PENDING'}
                          disabled={updatingId === booking.booking_id}
                          onChange={(e) =>
                            handleStatusChange(
                              booking.booking_id,
                              e.target.value
                            )
                          }
                          aria-label={`Update status for booking ${booking.booking_id}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

            {filteredBookings.length === 0 && (
              <div className="booking-empty">
                <div>📋</div>
                <h3>No bookings found</h3>
                <p>
                  {search || statusFilter !== 'ALL'
                    ? 'Try changing your search or status filter.'
                    : 'Create your first vehicle service booking.'}
                </p>
              </div>
            )}

          </div>
        )}

        {!loading && !error && filteredBookings.length > 0 && (
          <div className="booking-list-footer">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        )}

      </div>

    </div>
  );
}

export default Bookings;

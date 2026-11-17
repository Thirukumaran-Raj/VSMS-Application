
import { useEffect, useState } from 'react';
import API from './api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await API.get('/customers');
      setCustomers(response.data.customers || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCustomers();
    });
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await API.post('/customers', formData);

      alert('Customer added successfully!');

      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        address: ''
      });

      setShowForm(false);
      await fetchCustomers();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete customer
  const handleDelete = async (customerId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this customer?'
    );

    if (!confirmDelete) return;

    setDeletingId(customerId);

    try {
      await API.delete(`/customers/${customerId}`);

      alert('Customer deleted successfully!');
      await fetchCustomers();

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || 'Failed to delete customer'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Search customers
  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.customer_name?.toLowerCase().includes(searchText) ||
      customer.phone?.toString().includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText) ||
      customer.address?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="content customers-page">

      {/* Page Header */}
      <div className="customers-header">
        <div>
          <span className="page-subtitle">CUSTOMER MANAGEMENT</span>
          <h2>Customers</h2>
          <p>Manage and view all your registered customers.</p>
        </div>

        <button
          className="add-customer-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Customer'}
        </button>
      </div>

      {/* Customer Summary */}
      <div className="customer-summary">
        <div className="customer-summary-icon">👥</div>

        <div>
          <span>Total Customers</span>
          <h3>{customers.length}</h3>
        </div>
      </div>

      {/* Add Customer Form */}
      {showForm && (
        <div className="customer-form-card">
          <div className="customer-form-heading">
            <div>
              <h3>Add New Customer</h3>
              <p>Enter the customer details below.</p>
            </div>
            <span className="form-icon">＋</span>
          </div>

          <form onSubmit={handleSubmit} className="customer-form">

            <div className="customer-form-grid">

              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  placeholder="Enter customer name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="customer-form-actions">
              <button
                type="button"
                className="cancel-form-btn"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-customer-btn"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : '✓ Save Customer'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Customer List */}
      <div className="customer-list-card">

        <div className="customer-list-header">
          <div>
            <h3>All Customers</h3>
            <p>Customer information and contact details</p>
          </div>

          <div className="customer-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="customer-message">
            <div className="customer-loader"></div>
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="customer-message customer-error">
            <p>{error}</p>
            <button onClick={fetchCustomers}>Try Again</button>
          </div>
        ) : (
          <div className="customer-table-wrapper">

            <table className="customer-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>
                      <span className="customer-id">
                        #{customer.customer_id}
                      </span>
                    </td>

                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.customer_name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <strong>{customer.customer_name}</strong>
                      </div>
                    </td>

                    <td>{customer.phone}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.address || '-'}</td>

                    <td>
                      <button
                        className="delete-customer-btn"
                        onClick={() => handleDelete(customer.customer_id)}
                        disabled={deletingId === customer.customer_id}
                      >
                        {deletingId === customer.customer_id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="customer-empty">
                <div>🔍</div>
                <h3>No customers found</h3>
                <p>
                  {search
                    ? 'Try searching with a different name or phone number.'
                    : 'Add your first customer to get started.'}
                </p>
              </div>
            )}

          </div>
        )}

        {!loading && !error && customers.length > 0 && (
          <div className="customer-list-footer">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        )}

      </div>

    </div>
  );
}

export default Customers;

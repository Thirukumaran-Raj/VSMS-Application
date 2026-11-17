
import { useEffect, useState } from 'react';
import API from './api';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_number: '',
    brand: '',
    model: '',
    vehicle_type: '',
    manufacturing_year: ''
  });

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await API.get('/vehicles');
      setVehicles(response.data.vehicles || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load vehicles. Please try again.');
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

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchVehicles();
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

  // Reset form
  const resetForm = () => {
    setFormData({
      customer_id: '',
      vehicle_number: '',
      brand: '',
      model: '',
      vehicle_type: '',
      manufacturing_year: ''
    });
  };

  // Add vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await API.post('/vehicles', {
        ...formData,
        customer_id: Number(formData.customer_id),
        manufacturing_year: Number(formData.manufacturing_year)
      });

      alert('Vehicle added successfully!');

      resetForm();
      setShowForm(false);
      await fetchVehicles();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete vehicle
  const handleDelete = async (vehicleId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this vehicle?'
    );

    if (!confirmDelete) return;

    setDeletingId(vehicleId);

    try {
      await API.delete(`/vehicles/${vehicleId}`);

      alert('Vehicle deleted successfully!');
      await fetchVehicles();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setDeletingId(null);
    }
  };

  // Search vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchText = search.toLowerCase();

    const customer = customers.find(
      (item) => item.customer_id === vehicle.customer_id
    );

    return (
      vehicle.vehicle_number?.toLowerCase().includes(searchText) ||
      vehicle.brand?.toLowerCase().includes(searchText) ||
      vehicle.model?.toLowerCase().includes(searchText) ||
      vehicle.vehicle_type?.toLowerCase().includes(searchText) ||
      vehicle.manufacturing_year?.toString().includes(searchText) ||
      vehicle.customer_id?.toString().includes(searchText) ||
      customer?.customer_name?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="content vehicles-page">

      {/* Page Header */}
      <div className="vehicles-header">
        <div>
          <span className="page-subtitle">VEHICLE MANAGEMENT</span>
          <h2>Vehicles</h2>
          <p>Manage all registered customer vehicles.</p>
        </div>

        <button
          className="add-vehicle-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {/* Vehicle Summary */}
      <div className="vehicle-summary">
        <div className="vehicle-summary-icon">🚗</div>

        <div>
          <span>Total Vehicles</span>
          <h3>{vehicles.length}</h3>
        </div>
      </div>

      {/* Add Vehicle Form */}
      {showForm && (
        <div className="vehicle-form-card">

          <div className="vehicle-form-heading">
            <div>
              <h3>Register New Vehicle</h3>
              <p>Enter the vehicle and customer details below.</p>
            </div>

            <span className="vehicle-form-icon">🚘</span>
          </div>

          <form onSubmit={handleSubmit} className="vehicle-form">

            <div className="vehicle-form-grid">

              <div className="form-group">
                <label>Select Customer *</label>

                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Customer</option>

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
                <label>Vehicle Number *</label>

                <input
                  type="text"
                  name="vehicle_number"
                  placeholder="e.g. TN30AB1234"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Brand *</label>

                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Hyundai"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Model *</label>

                <input
                  type="text"
                  name="model"
                  placeholder="e.g. i20"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type</label>

                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Manufacturing Year *</label>

                <input
                  type="number"
                  name="manufacturing_year"
                  placeholder="e.g. 2024"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.manufacturing_year}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="vehicle-form-actions">

              <button
                type="button"
                className="vehicle-cancel-btn"
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
                className="vehicle-save-btn"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : '✓ Save Vehicle'}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Vehicle List */}
      <div className="vehicle-list-card">

        <div className="vehicle-list-header">

          <div>
            <h3>All Vehicles</h3>
            <p>Vehicle information and ownership details</p>
          </div>

          <div className="vehicle-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>

        {loading ? (
          <div className="vehicle-message">
            <div className="vehicle-loader"></div>
            <p>Loading vehicles...</p>
          </div>
        ) : error ? (
          <div className="vehicle-message vehicle-error">
            <p>{error}</p>
            <button onClick={fetchVehicles}>Try Again</button>
          </div>
        ) : (
          <div className="vehicle-table-wrapper">

            <table className="vehicle-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer ID</th>
                  <th>Vehicle Number</th>
                  <th>Brand & Model</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicle_id}>

                    <td>
                      <span className="vehicle-id">
                        #{vehicle.vehicle_id}
                      </span>
                    </td>

                    <td>
                      <span className="vehicle-customer-id">
                        #{vehicle.customer_id}
                      </span>
                    </td>

                    <td>
                      <div className="vehicle-number-cell">
                        <div className="vehicle-mini-icon">
                          {vehicle.vehicle_type === 'Bike' ? '🏍️' : '🚗'}
                        </div>

                        <strong>{vehicle.vehicle_number}</strong>
                      </div>
                    </td>

                    <td>
                      <div className="vehicle-model-cell">
                        <strong>{vehicle.brand}</strong>
                        <span>{vehicle.model}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`vehicle-type ${
                          vehicle.vehicle_type === 'Bike'
                            ? 'bike-type'
                            : vehicle.vehicle_type === 'Car'
                              ? 'car-type'
                              : 'other-type'
                        }`}
                      >
                        {vehicle.vehicle_type || 'Other'}
                      </span>
                    </td>

                    <td>{vehicle.manufacturing_year || '-'}</td>

                    <td>
                      <button
                        className="vehicle-delete-btn"
                        onClick={() => handleDelete(vehicle.vehicle_id)}
                        disabled={deletingId === vehicle.vehicle_id}
                      >
                        {deletingId === vehicle.vehicle_id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

            {filteredVehicles.length === 0 && (
              <div className="vehicle-empty">
                <div>🚘</div>
                <h3>No vehicles found</h3>

                <p>
                  {search
                    ? 'Try searching with a different vehicle number, brand, or customer name.'
                    : 'Add your first vehicle to get started.'}
                </p>
              </div>
            )}

          </div>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <div className="vehicle-list-footer">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        )}

      </div>

    </div>
  );
}

export default Vehicles;

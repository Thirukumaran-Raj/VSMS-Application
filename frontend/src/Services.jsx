
import { useEffect, useState } from 'react';
import API from './api';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await API.get('/services');
      setServices(response.data.services || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchServices();
    });
  }, []);

  // Search services
  const filteredServices = services.filter((service) => {
    const searchText = search.toLowerCase();

    return (
      service.service_name?.toLowerCase().includes(searchText) ||
      service.description?.toLowerCase().includes(searchText)
    );
  });

  // Calculate service statistics
  const totalValue = services.reduce(
    (total, service) => total + Number(service.service_price || 0),
    0
  );

  const averagePrice = services.length
    ? totalValue / services.length
    : 0;

  // Service icons
  const getServiceIcon = (name) => {
    const serviceName = name?.toLowerCase() || '';

    if (serviceName.includes('oil')) return '🛢️';
    if (serviceName.includes('wash')) return '🚿';
    if (serviceName.includes('repair')) return '🔧';
    if (serviceName.includes('full')) return '🚘';
    if (serviceName.includes('general')) return '🛠️';

    return '⚙️';
  };

  return (
    <div className="content services-page">

      {/* Page Header */}
      <div className="services-header">
        <div>
          <span className="page-subtitle">SERVICE MANAGEMENT</span>
          <h2>Our Services</h2>
          <p>Explore available vehicle maintenance and repair services.</p>
        </div>

        <div className="services-header-icon">
          🛠️
        </div>
      </div>

      {/* Statistics */}
      <div className="services-stats">

        <div className="service-stat-card">
          <div className="service-stat-icon blue">⚙️</div>
          <div>
            <span>Total Services</span>
            <h3>{services.length}</h3>
            <p>Available services</p>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-icon green">₹</div>
          <div>
            <span>Total Service Value</span>
            <h3>₹{totalValue.toLocaleString('en-IN')}</h3>
            <p>Combined service prices</p>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-icon purple">📊</div>
          <div>
            <span>Average Price</span>
            <h3>₹{Math.round(averagePrice).toLocaleString('en-IN')}</h3>
            <p>Average per service</p>
          </div>
        </div>

      </div>

      {/* Services List */}
      <div className="services-list-card">

        <div className="services-list-header">
          <div>
            <h3>Available Services</h3>
            <p>Choose the service that suits your vehicle.</p>
          </div>

          <div className="services-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="services-message">
            <div className="services-loader"></div>
            <p>Loading services...</p>
          </div>
        ) : error ? (
          <div className="services-message services-error">
            <p>{error}</p>
            <button onClick={fetchServices}>Try Again</button>
          </div>
        ) : (
          <div className="services-grid">

            {filteredServices.map((service) => (
              <div className="service-card" key={service.service_id}>

                <div className="service-card-top">
                  <div className="service-card-icon">
                    {getServiceIcon(service.service_name)}
                  </div>

                  <span className="service-id">
                    #{service.service_id}
                  </span>
                </div>

                <h3>{service.service_name}</h3>

                <p className="service-description">
                  {service.description || 'Professional vehicle service.'}
                </p>

                <div className="service-card-bottom">
                  <div>
                    <span className="service-price-label">Service Price</span>
                    <h2>
                      ₹{Number(service.service_price || 0).toLocaleString('en-IN')}
                    </h2>
                  </div>

                  <div className="service-price-icon">
                    ₹
                  </div>
                </div>

              </div>
            ))}

          </div>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="services-empty">
            <div>🔍</div>
            <h3>No services found</h3>
            <p>
              {search
                ? 'Try searching with a different service name.'
                : 'No services are currently available.'}
            </p>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="services-list-footer">
            Showing {filteredServices.length} of {services.length} services
          </div>
        )}

      </div>

    </div>
  );
}

export default Services;

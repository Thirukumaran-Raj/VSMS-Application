
import { useEffect, useState } from 'react';
import API from './api';

function Reports() {
    const [bookings, setBookings] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReports = async () => {
        try {
            setError('');

            const [bookingRes, invoiceRes, serviceRes] = await Promise.all([
                API.get('/bookings'),
                API.get('/invoices'),
                API.get('/services')
            ]);

            setBookings(bookingRes.data.bookings || []);
            setInvoices(invoiceRes.data.invoices || []);
            setServices(serviceRes.data.services || []);
        } catch {
            setError('Unable to load reports. Please check your backend connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(fetchReports);
    }, []);

    const totalBookings = bookings.length;

    const completedBookings = bookings.filter(
        (b) => b.booking_status === 'COMPLETED'
    ).length;

    const pendingBookings = bookings.filter(
        (b) => b.booking_status === 'PENDING'
    ).length;

    const inProgressBookings = bookings.filter(
        (b) => b.booking_status === 'IN_PROGRESS'
    ).length;

    const paidInvoices = invoices.filter(
        (i) => i.payment_status === 'PAID'
    );

    const unpaidInvoices = invoices.filter(
        (i) => i.payment_status === 'UNPAID'
    );

    const totalRevenue = paidInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount || 0),
        0
    );

    const pendingRevenue = unpaidInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount || 0),
        0
    );

    const completionRate = totalBookings
        ? Math.round((completedBookings / totalBookings) * 100)
        : 0;

    const serviceStats = services.map((service) => {
        const count = bookings.filter(
            (booking) =>
                Number(booking.service_id) === Number(service.service_id)
        ).length;

        return {
            name: service.service_name,
            count
        };
    }).sort((a, b) => b.count - a.count);

    const maxServiceCount = Math.max(
        ...serviceStats.map((service) => service.count),
        1
    );

    const monthlyStats = {};

    bookings.forEach((booking) => {
        if (!booking.service_date) return;

        const date = new Date(booking.service_date);

        if (Number.isNaN(date.getTime())) return;

        const month = date.toLocaleDateString('en-IN', {
            month: 'short',
            year: '2-digit'
        });

        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    const monthlyData = Object.entries(monthlyStats).slice(-6);

    const maxMonthlyCount = Math.max(
        ...monthlyData.map((item) => item[1]),
        1
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="reports-loading">
                <div className="reports-spinner"></div>
                <p>Preparing your business reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reports-error">
                <p>{error}</p>
                <button onClick={() => {
                    setLoading(true);
                    fetchReports();
                }}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="reports-container">

            {/* Header */}
            <div className="reports-header">
                <div>
                    <h2>Reports & Analytics</h2>
                    <p>Track your vehicle service business performance.</p>
                </div>

                <button
                    className="reports-refresh-btn"
                    onClick={() => {
                        setLoading(true);
                        fetchReports();
                    }}
                >
                    ↻ Refresh Reports
                </button>
            </div>

            {/* Summary Cards */}
            <div className="reports-summary">

                <div className="reports-card blue">
                    <div className="reports-card-icon">📋</div>
                    <p>Total Bookings</p>
                    <h2>{totalBookings}</h2>
                    <span>All service bookings</span>
                </div>

                <div className="reports-card green">
                    <div className="reports-card-icon">💰</div>
                    <p>Total Revenue</p>
                    <h2>{formatCurrency(totalRevenue)}</h2>
                    <span>Successfully collected</span>
                </div>

                <div className="reports-card orange">
                    <div className="reports-card-icon">⏳</div>
                    <p>Pending Payments</p>
                    <h2>{formatCurrency(pendingRevenue)}</h2>
                    <span>{unpaidInvoices.length} unpaid invoices</span>
                </div>

                <div className="reports-card purple">
                    <div className="reports-card-icon">🏆</div>
                    <p>Completion Rate</p>
                    <h2>{completionRate}%</h2>
                    <span>{completedBookings} completed bookings</span>
                </div>

            </div>

            {/* Booking Status */}
            <div className="reports-section">
                <div className="reports-section-header">
                    <div>
                        <h3>Booking Status Overview</h3>
                        <p>Current status of all bookings</p>
                    </div>
                </div>

                <div className="reports-status-grid">

                    <div className="reports-status-item">
                        <span className="reports-status-dot pending"></span>
                        <div>
                            <h3>{pendingBookings}</h3>
                            <p>Pending</p>
                        </div>
                    </div>

                    <div className="reports-status-item">
                        <span className="reports-status-dot progress"></span>
                        <div>
                            <h3>{inProgressBookings}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>

                    <div className="reports-status-item">
                        <span className="reports-status-dot completed"></span>
                        <div>
                            <h3>{completedBookings}</h3>
                            <p>Completed</p>
                        </div>
                    </div>

                    <div className="reports-status-item">
                        <span className="reports-status-dot confirmed"></span>
                        <div>
                            <h3>
                                {bookings.filter(
                                    (b) => b.booking_status === 'CONFIRMED'
                                ).length}
                            </h3>
                            <p>Confirmed</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Charts */}
            <div className="reports-charts">

                {/* Monthly Bookings */}
                <div className="reports-section reports-chart-card">
                    <div className="reports-section-header">
                        <div>
                            <h3>Monthly Bookings</h3>
                            <p>Bookings grouped by service month</p>
                        </div>
                    </div>

                    {monthlyData.length === 0 ? (
                        <p className="reports-no-data">No booking data available.</p>
                    ) : (
                        <div className="reports-bar-chart">
                            {monthlyData.map(([month, count]) => (
                                <div className="reports-bar-item" key={month}>
                                    <div className="reports-bar-value">{count}</div>
                                    <div className="reports-bar-track">
                                        <div
                                            className="reports-bar-fill"
                                            style={{
                                                height: `${(count / maxMonthlyCount) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span>{month}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Service Performance */}
                <div className="reports-section reports-chart-card">
                    <div className="reports-section-header">
                        <div>
                            <h3>Service Performance</h3>
                            <p>Bookings by service type</p>
                        </div>
                    </div>

                    {serviceStats.length === 0 ? (
                        <p className="reports-no-data">No service data available.</p>
                    ) : (
                        <div className="reports-service-list">
                            {serviceStats.map((service, index) => (
                                <div className="reports-service-item" key={index}>
                                    <div className="reports-service-info">
                                        <span>{service.name}</span>
                                        <strong>{service.count}</strong>
                                    </div>

                                    <div className="reports-progress-track">
                                        <div
                                            className="reports-progress-fill"
                                            style={{
                                                width: `${(service.count / maxServiceCount) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Payment Overview */}
            <div className="reports-section reports-payment-section">
                <div className="reports-section-header">
                    <div>
                        <h3>Payment Overview</h3>
                        <p>Invoice payment summary</p>
                    </div>
                </div>

                <div className="reports-payment-grid">

                    <div>
                        <span>Total Invoices</span>
                        <h2>{invoices.length}</h2>
                    </div>

                    <div>
                        <span>Paid Invoices</span>
                        <h2 className="reports-paid-text">
                            {paidInvoices.length}
                        </h2>
                    </div>

                    <div>
                        <span>Unpaid Invoices</span>
                        <h2 className="reports-unpaid-text">
                            {unpaidInvoices.length}
                        </h2>
                    </div>

                </div>

                <div className="reports-payment-progress">
                    <div
                        className="reports-payment-paid"
                        style={{
                            width: `${invoices.length
                                ? (paidInvoices.length / invoices.length) * 100
                                : 0}%`
                        }}
                    ></div>
                </div>

                <div className="reports-payment-legend">
                    <span>🟢 Paid: {paidInvoices.length}</span>
                    <span>🟠 Unpaid: {unpaidInvoices.length}</span>
                </div>
            </div>

        </div>
    );
}

export default Reports;

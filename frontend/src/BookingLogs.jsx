
import { useEffect, useState } from 'react';
import API from './api';

function BookingLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await API.get('/booking-logs');
            setLogs(response.data.logs || []);
        } catch (error) {
            console.error('Booking Logs Error:', error);
            setError('Failed to load booking logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchLogs();
        });
    }, []);

    const isPaymentLog = (log) =>
        log.old_status === 'UNPAID' &&
        log.new_status === 'PAID';

    const paymentCount = logs.filter(isPaymentLog).length;
    const bookingCount = logs.length - paymentCount;

    const filteredLogs = logs.filter((log) => {
        const matchesSearch = [
            log.log_id,
            log.booking_id,
            log.old_status,
            log.new_status,
            log.remarks
        ].some((value) =>
            String(value || '').toLowerCase().includes(search.toLowerCase())
        );

        const matchesFilter =
            filter === 'ALL' ||
            (filter === 'PAYMENT' && isPaymentLog(log)) ||
            (filter === 'BOOKING' && !isPaymentLog(log));

        return matchesSearch && matchesFilter;
    });

    const formatDate = (date) => {
        if (!date) return '-';

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return '-';

        return parsedDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="page">
                <div className="booking-logs-loading">
                    <div className="booking-logs-spinner"></div>
                    <p>Loading activity logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page booking-logs-page">

            <div className="booking-logs-header">
                <div>
                    <span className="booking-logs-subtitle">
                        SYSTEM ACTIVITY
                    </span>
                    <h2>Booking Logs</h2>
                    <p>
                        Track booking updates and customer payment activities.
                    </p>
                </div>

                <button
                    className="booking-logs-refresh"
                    onClick={fetchLogs}
                >
                    ↻ Refresh
                </button>
            </div>

            {error && (
                <div className="booking-logs-error">
                    {error}
                    <button onClick={fetchLogs}>Try Again</button>
                </div>
            )}

            <div className="booking-logs-stats">

                <div className="booking-logs-stat-card">
                    <div className="booking-logs-stat-icon total">
                        📋
                    </div>
                    <div>
                        <span>Total Activities</span>
                        <h3>{logs.length}</h3>
                    </div>
                </div>

                <div className="booking-logs-stat-card">
                    <div className="booking-logs-stat-icon booking">
                        🚗
                    </div>
                    <div>
                        <span>Booking Updates</span>
                        <h3>{bookingCount}</h3>
                    </div>
                </div>

                <div className="booking-logs-stat-card">
                    <div className="booking-logs-stat-icon payment">
                        💳
                    </div>
                    <div>
                        <span>Payment Activities</span>
                        <h3>{paymentCount}</h3>
                    </div>
                </div>

            </div>

            <div className="booking-logs-content">

                <div className="booking-logs-toolbar">
                    <div>
                        <h3>Activity History</h3>
                        <p>Complete record of system activities</p>
                    </div>

                    <input
                        type="text"
                        placeholder="Search booking ID, remarks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="booking-logs-filters">
                    <button
                        className={filter === 'ALL' ? 'active' : ''}
                        onClick={() => setFilter('ALL')}
                    >
                        All Activities
                    </button>

                    <button
                        className={filter === 'BOOKING' ? 'active' : ''}
                        onClick={() => setFilter('BOOKING')}
                    >
                        Booking Updates
                    </button>

                    <button
                        className={filter === 'PAYMENT' ? 'active' : ''}
                        onClick={() => setFilter('PAYMENT')}
                    >
                        Payments
                    </button>
                </div>

                <div className="booking-logs-table-wrapper">
                    <table className="booking-logs-table">
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>Booking ID</th>
                                <th>Activity</th>
                                <th>Old Status</th>
                                <th>New Status</th>
                                <th>Date & Time</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredLogs.map((log) => {
                                const payment = isPaymentLog(log);

                                return (
                                    <tr key={log.log_id}>
                                        <td>
                                            <span className="booking-logs-id">
                                                #{log.log_id}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>#{log.booking_id}</strong>
                                        </td>

                                        <td>
                                            <span className={`booking-logs-type ${payment ? 'payment' : 'booking'}`}>
                                                {payment ? '💳 Payment' : '🚗 Booking'}
                                            </span>
                                        </td>

                                        <td>
                                            {log.old_status || '-'}
                                        </td>

                                        <td>
                                            <span className={`booking-logs-status ${payment ? 'paid' : 'normal'}`}>
                                                {log.new_status || '-'}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(log.changed_at)}
                                        </td>

                                        <td>
                                            {log.remarks || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredLogs.length === 0 && (
                        <div className="booking-logs-empty">
                            <div>📭</div>
                            <h3>No activities found</h3>
                            <p>Try changing your search or filter.</p>
                        </div>
                    )}
                </div>

                <div className="booking-logs-footer">
                    Showing {filteredLogs.length} of {logs.length} activities
                </div>

            </div>
        </div>
    );
}

export default BookingLogs;

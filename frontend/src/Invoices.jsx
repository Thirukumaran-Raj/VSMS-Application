
import { useEffect, useState } from 'react';
import API from './api';

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [processingId, setProcessingId] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState('');

    const fetchInvoices = async () => {
        try {
            setLoading(true);

            const response = await API.get('/invoices');

            setInvoices(response.data.invoices || []);
            setError('');
        } catch (error) {
            console.error('Invoice Error:', error);
            setError('Failed to load invoices. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchInvoices();
        });
    }, []);

    // MARK INVOICE AS PAID
    const handleMarkAsPaid = async (invoice) => {
        const confirmPayment = window.confirm(
            `Are you sure you want to mark Invoice INV-${invoice.invoice_id} as PAID?`
        );

        if (!confirmPayment) return;

        try {
            setProcessingId(invoice.invoice_id);
            setPaymentMessage('');
            setError('');

            const response = await API.post('/payments', {
                invoice_id: invoice.invoice_id
            });

            setPaymentMessage(
                response.data.message || 'Payment updated successfully!'
            );

            await fetchInvoices();

        } catch (error) {
            console.error('Payment Error:', error);

            setPaymentMessage(
                error.response?.data?.message ||
                'Failed to update payment. Please try again.'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const totalInvoices = invoices.length;

    const paidInvoices = invoices.filter(
        (invoice) => invoice.payment_status === 'PAID'
    );

    const unpaidInvoices = invoices.filter(
        (invoice) => invoice.payment_status === 'UNPAID'
    );

    const totalRevenue = paidInvoices.reduce(
        (total, invoice) => total + Number(invoice.total_amount || 0),
        0
    );

    const pendingAmount = unpaidInvoices.reduce(
        (total, invoice) => total + Number(invoice.total_amount || 0),
        0
    );

    const filteredInvoices = invoices.filter((invoice) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            String(invoice.invoice_id).toLowerCase().includes(searchValue) ||
            String(invoice.booking_id).toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === 'ALL' ||
            invoice.payment_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 2
        });
    };

    const formatDate = (date) => {
        if (!date) return '-';

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return '-';

        return parsedDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="page invoice-page">

            {/* PAGE HEADER */}
            <div className="invoice-header">
                <div>
                    <h2>Invoices</h2>
                    <p>Manage and monitor all vehicle service payments.</p>
                </div>

                <button
                    className="invoice-refresh-btn"
                    onClick={fetchInvoices}
                    disabled={loading || processingId !== null}
                >
                    ↻ {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="invoice-summary">

                <div className="invoice-summary-card">
                    <div className="invoice-summary-icon total-icon">▤</div>
                    <div>
                        <p>Total Invoices</p>
                        <h3>{totalInvoices}</h3>
                    </div>
                </div>

                <div className="invoice-summary-card">
                    <div className="invoice-summary-icon paid-icon">✓</div>
                    <div>
                        <p>Paid Invoices</p>
                        <h3>{paidInvoices.length}</h3>
                    </div>
                </div>

                <div className="invoice-summary-card">
                    <div className="invoice-summary-icon unpaid-icon">◷</div>
                    <div>
                        <p>Unpaid Invoices</p>
                        <h3>{unpaidInvoices.length}</h3>
                    </div>
                </div>

                <div className="invoice-summary-card">
                    <div className="invoice-summary-icon revenue-icon">₹</div>
                    <div>
                        <p>Total Revenue</p>
                        <h3>₹{formatAmount(totalRevenue)}</h3>
                    </div>
                </div>

            </div>

            {/* PENDING PAYMENT */}
            <div className="invoice-pending-card">
                <div>
                    <span>Pending Payment Amount</span>
                    <h2>₹{formatAmount(pendingAmount)}</h2>
                    <p>Amount yet to be collected from customers</p>
                </div>

                <div className="invoice-pending-icon">₹</div>
            </div>

            {/* INVOICE TABLE SECTION */}
            <div className="invoice-content">

                <div className="invoice-table-header">
                    <div>
                        <h3>All Invoices</h3>
                        <p>View and track invoice payment details.</p>
                    </div>

                    <span className="invoice-count">
                        {filteredInvoices.length} Records
                    </span>
                </div>

                {/* PAYMENT MESSAGE */}
                {paymentMessage && (
                    <div className="invoice-payment-message">
                        {paymentMessage}
                    </div>
                )}

                {/* SEARCH AND FILTER */}
                <div className="invoice-controls">

                    <div className="invoice-search">
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Search invoice ID or booking ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="invoice-filter"
                    >
                        <option value="ALL">All Payments</option>
                        <option value="PAID">Paid</option>
                        <option value="UNPAID">Unpaid</option>
                    </select>

                </div>

                {/* LOADING */}
                {loading && (
                    <div className="invoice-message">
                        <div className="invoice-spinner"></div>
                        <p>Loading invoices...</p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="invoice-message invoice-error">
                        <p>{error}</p>
                        <button onClick={fetchInvoices}>Try Again</button>
                    </div>
                )}

                {/* TABLE */}
                {!loading && !error && (
                    <div className="invoice-table-wrapper">
                        <table className="invoice-table">

                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Booking ID</th>
                                    <th>Total Amount</th>
                                    <th>Payment Status</th>
                                    <th>Payment Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.invoice_id}>
                                        <td>
                                            <span className="invoice-id">
                                                INV-{invoice.invoice_id}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="invoice-booking-id">
                                                #{invoice.booking_id}
                                            </span>
                                        </td>

                                        <td>
                                            <strong className="invoice-amount">
                                                ₹{formatAmount(invoice.total_amount)}
                                            </strong>
                                        </td>

                                        <td>
                                            <span
                                                className={`invoice-status ${
                                                    invoice.payment_status === 'PAID'
                                                        ? 'invoice-paid'
                                                        : 'invoice-unpaid'
                                                }`}
                                            >
                                                <span className="invoice-status-dot"></span>
                                                {invoice.payment_status}
                                            </span>
                                        </td>

                                        <td>{formatDate(invoice.payment_date)}</td>

                                        <td>
                                            {invoice.payment_status === 'UNPAID' ? (
                                                <button
                                                    className="invoice-pay-btn"
                                                    onClick={() => handleMarkAsPaid(invoice)}
                                                    disabled={processingId !== null}
                                                >
                                                    {processingId === invoice.invoice_id
                                                        ? 'Processing...'
                                                        : '✓ Mark as Paid'}
                                                </button>
                                            ) : (
                                                <span className="invoice-completed">
                                                    ✓ Completed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                        {filteredInvoices.length === 0 && (
                            <div className="invoice-empty">
                                <div>▤</div>
                                <h3>No invoices found</h3>
                                <p>
                                    {search || statusFilter !== 'ALL'
                                        ? 'Try changing your search or filter.'
                                        : 'Invoices will appear here when they are created.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

            </div>

        </div>
    );
}

export default Invoices;

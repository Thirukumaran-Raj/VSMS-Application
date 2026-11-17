
import { useEffect, useState } from 'react';
import API from './api';

function Payments() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');
    const [paymentMessage, setPaymentMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const fetchInvoices = async () => {
        try {
            setLoading(true);

            const response = await API.get('/invoices');

            setInvoices(response.data.invoices || []);
            setError('');
        } catch (error) {
            console.error('Payment Error:', error);
            setError('Failed to load payment details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchInvoices();
        });
    }, []);

    function formatAmount(amount) {
        return Number(amount || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 2
        });
    }

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

    const paidInvoices = invoices.filter(
        (invoice) => invoice.payment_status === 'PAID'
    );

    const pendingInvoices = invoices.filter(
        (invoice) => invoice.payment_status === 'UNPAID'
    );

    const totalCollected = paidInvoices.reduce(
        (total, invoice) => total + Number(invoice.total_amount || 0),
        0
    );

    const pendingAmount = pendingInvoices.reduce(
        (total, invoice) => total + Number(invoice.total_amount || 0),
        0
    );

    const filteredInvoices = invoices.filter((invoice) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            String(invoice.invoice_id).toLowerCase().includes(searchValue) ||
            String(invoice.booking_id).toLowerCase().includes(searchValue);

        const matchesTab =
            activeTab === 'ALL' ||
            invoice.payment_status === activeTab;

        return matchesSearch && matchesTab;
    });

    const handlePayment = async (invoice) => {
        const confirmed = window.confirm(
            `Confirm payment of ₹${formatAmount(invoice.total_amount)} for Invoice INV-${invoice.invoice_id}?`
        );

        if (!confirmed) return;

        try {
            setProcessingId(invoice.invoice_id);
            setPaymentMessage('');
            setMessageType('');
            setError('');

            const response = await API.post('/payments', {
                invoice_id: invoice.invoice_id
            });

            setPaymentMessage(
                response.data.message || 'Payment completed successfully!'
            );
            setMessageType('success');

            await fetchInvoices();
        } catch (error) {
            console.error('Payment Error:', error);

            setPaymentMessage(
                error.response?.data?.message ||
                'Payment failed. Please try again.'
            );
            setMessageType('error');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="page payment-page">

            {/* HEADER */}
            <div className="payment-header">
                <div>
                    <span className="payment-eyebrow">
                        FINANCIAL MANAGEMENT
                    </span>
                    <h2>Payments</h2>
                    <p>Process pending payments and monitor collected revenue.</p>
                </div>

                <button
                    className="payment-refresh-btn"
                    onClick={fetchInvoices}
                    disabled={loading || processingId !== null}
                >
                    ↻ {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="payment-summary">

                <div className="payment-summary-card payment-highlight-card">
                    <div className="payment-summary-icon payment-total-icon">
                        ₹
                    </div>
                    <div>
                        <p>Total Revenue Collected</p>
                        <h3>₹{formatAmount(totalCollected)}</h3>
                        <span>From completed payments</span>
                    </div>
                </div>

                <div className="payment-summary-card">
                    <div className="payment-summary-icon payment-unpaid-icon">
                        ◷
                    </div>
                    <div>
                        <p>Awaiting Payment</p>
                        <h3>₹{formatAmount(pendingAmount)}</h3>
                        <span>{pendingInvoices.length} pending payments</span>
                    </div>
                </div>

                <div className="payment-summary-card">
                    <div className="payment-summary-icon payment-paid-icon">
                        ✓
                    </div>
                    <div>
                        <p>Successful Payments</p>
                        <h3>{paidInvoices.length}</h3>
                        <span>Completed transactions</span>
                    </div>
                </div>

                <div className="payment-summary-card">
                    <div className="payment-summary-icon payment-total-icon">
                        ▤
                    </div>
                    <div>
                        <p>Total Transactions</p>
                        <h3>{invoices.length}</h3>
                        <span>All payment records</span>
                    </div>
                </div>

            </div>

            {/* PAYMENT PROGRESS */}
            <div className="payment-progress-panel">
                <div className="payment-progress-heading">
                    <div>
                        <h3>Payment Collection Overview</h3>
                        <p>Collected revenue compared with outstanding payments.</p>
                    </div>

                    <strong>
                        {invoices.length > 0
                            ? `${Math.round((paidInvoices.length / invoices.length) * 100)}%`
                            : '0%'}
                    </strong>
                </div>

                <div className="payment-progress-track">
                    <div
                        className="payment-progress-fill"
                        style={{
                            width: invoices.length > 0
                                ? `${(paidInvoices.length / invoices.length) * 100}%`
                                : '0%'
                        }}
                    />
                </div>

                <div className="payment-progress-footer">
                    <span>✓ {paidInvoices.length} Paid</span>
                    <span>◷ {pendingInvoices.length} Pending</span>
                </div>
            </div>

            {/* PAYMENT MESSAGE */}
            {paymentMessage && (
                <div className={`payment-message payment-message-${messageType}`}>
                    {messageType === 'success' ? '✓ ' : '⚠ '}
                    {paymentMessage}
                </div>
            )}

            {/* TRANSACTION SECTION */}
            <div className="payment-content">

                <div className="payment-table-header">
                    <div>
                        <h3>Transaction Center</h3>
                        <p>Manage customer payment activity.</p>
                    </div>

                    <span className="payment-count">
                        {filteredInvoices.length} Records
                    </span>
                </div>

                {/* TABS */}
                <div className="payment-tabs">
                    <button
                        className={activeTab === 'PENDING' ? 'active' : ''}
                        onClick={() => setActiveTab('PENDING')}
                    >
                        Pending
                        <span>{pendingInvoices.length}</span>
                    </button>

                    <button
                        className={activeTab === 'PAID' ? 'active' : ''}
                        onClick={() => setActiveTab('PAID')}
                    >
                        Completed
                        <span>{paidInvoices.length}</span>
                    </button>

                    <button
                        className={activeTab === 'ALL' ? 'active' : ''}
                        onClick={() => setActiveTab('ALL')}
                    >
                        All Transactions
                        <span>{invoices.length}</span>
                    </button>
                </div>

                {/* SEARCH */}
                <div className="payment-controls">
                    <div className="payment-search">
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Search invoice ID or booking ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="payment-message-box">
                        <div className="payment-spinner"></div>
                        <p>Loading transactions...</p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="payment-message-box payment-error">
                        <p>{error}</p>
                        <button onClick={fetchInvoices}>Try Again</button>
                    </div>
                )}

                {/* TRANSACTION LIST */}
                {!loading && !error && (
                    <div className="payment-table-wrapper">

                        <table className="payment-table">
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Booking</th>
                                    <th>Payment Amount</th>
                                    <th>Status</th>
                                    <th>Payment Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.invoice_id}>
                                        <td>
                                            <div className="payment-transaction-info">
                                                <div className="payment-transaction-icon">
                                                    ₹
                                                </div>
                                                <div>
                                                    <strong>
                                                        INV-{invoice.invoice_id}
                                                    </strong>
                                                    <span>
                                                        Invoice payment
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="payment-booking-id">
                                                #{invoice.booking_id}
                                            </span>
                                        </td>

                                        <td>
                                            <strong className="payment-amount">
                                                ₹{formatAmount(invoice.total_amount)}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className={`payment-status ${
                                                invoice.payment_status === 'PAID'
                                                    ? 'payment-status-paid'
                                                    : 'payment-status-unpaid'
                                            }`}>
                                                <span className="payment-status-dot"></span>
                                                {invoice.payment_status}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(invoice.payment_date)}
                                        </td>

                                        <td>
                                            {invoice.payment_status === 'UNPAID' ? (
                                                <button
                                                    className="payment-pay-btn"
                                                    onClick={() => handlePayment(invoice)}
                                                    disabled={processingId !== null}
                                                >
                                                    {processingId === invoice.invoice_id
                                                        ? 'Processing...'
                                                        : 'Complete Payment →'}
                                                </button>
                                            ) : (
                                                <span className="payment-completed">
                                                    ✓ Payment Received
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredInvoices.length === 0 && (
                            <div className="payment-empty">
                                <div>₹</div>
                                <h3>No transactions found</h3>
                                <p>
                                    {search
                                        ? 'Try another invoice ID or booking ID.'
                                        : activeTab === 'PENDING'
                                            ? 'There are no pending payments.'
                                            : activeTab === 'PAID'
                                                ? 'No completed payments yet.'
                                                : 'No payment records available.'}
                                </p>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}

export default Payments;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Clock, MapPin, CheckCircle, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

const OrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingScore, setRatingScore] = useState(5);
    const [ratingComment, setRatingComment] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmitRating = async () => {
        try {
            await axios.post('http://localhost:5000/api/ratings', {
                orderId: selectedOrder.id,
                rating: ratingScore,
                comment: ratingComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Rating Submitted! Thank you.");
            setShowRatingModal(false);
            fetchOrders();
        } catch (error) {
            alert("Error submitting rating: " + error.response?.data?.message);
        }
    };

    const handlePayment = async (orderId, totalAmount) => {
        const halfAmount = Number(totalAmount) / 2;
        const confirmPay = window.confirm(`Confirm payment of UGX ${halfAmount.toLocaleString()} (50% Commitment)?`);

        if (confirmPay) {
            try {
                await axios.post('http://localhost:5000/api/wallet/pay-order', {
                    orderId,
                    amount: halfAmount
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Payment Successful! Service Provider Notified.");
                fetchOrders(); // Refresh status
            } catch (error) {
                console.error(error);
                alert("Payment Failed: " + (error.response?.data?.message || "Check your wallet balance."));
                navigate('/wallet'); // Redirect to topup
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                    <p className="text-gray-500 mt-1">View and manage all your service requests</p>
                </div>
                <button
                    onClick={() => navigate('/make-order')}
                    className="bg-[#5b4d9d] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#4a3e80] transition-all flex items-center gap-2 font-bold"
                >
                    <Plus size={20} /> Make an Order
                </button>
            </div>

            {loading ? (
                <p>Loading your orders...</p>
            ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm text-center">
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Requests Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first service request to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#5b4d9d]/20 transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-gray-400 text-sm flex items-center gap-1">
                                            <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{order.serviceType} Service</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{order.description}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1"><MapPin size={16} /> {order.locationName}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-bold text-[#5b4d9d]">
                                        {order.quotationsList?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                                        Quotes Received
                                    </div>
                                </div>
                            </div>

                            {/* Quotes Expansion (Simple Toggle) */}
                            {order.quotationsList?.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h4 className="font-bold text-gray-700 mb-3">Received Quotations</h4>
                                    <div className="space-y-3">
                                        {order.quotationsList.map(quote => (
                                            <div key={quote.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                                <div>
                                                    <span className="font-bold text-gray-800">UGX {Number(quote.totalAmount).toLocaleString()}</span>
                                                    <span className="text-gray-500 text-xs ml-2">Assessment + Service</span>
                                                </div>
                                                {/* Only show pay button if pending */}
                                                {quote.status === 'PENDING' && order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handlePayment(order.id, quote.totalAmount)}
                                                        className="text-[#5b4d9d] font-bold text-sm bg-white border border-[#5b4d9d]/20 px-4 py-2 rounded-lg hover:bg-[#5b4d9d] hover:text-white transition-all"
                                                    >
                                                        Pay 50% (UGX {(Number(quote.totalAmount) / 2).toLocaleString()})
                                                    </button>
                                                )}
                                                {order.status === 'IN_PROGRESS' && (
                                                    <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                                                        <CheckCircle size={14} /> Paid & Started
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
            {/* Rating Modal */}
            {showRatingModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
                        <div className="mb-4 text-[#5b4d9d]">
                            <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                            <h2 className="text-2xl font-bold">Rate Service</h2>
                            <p className="text-gray-500">How was your experience?</p>
                        </div>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRatingScore(star)}
                                    className={`text-3xl transition-all hover:scale-110 ${ratingScore >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full border rounded-xl p-3 text-sm mb-4 bg-gray-50"
                            placeholder="Write a comment..."
                            rows="3"
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleSubmitRating}
                                className="flex-1 py-3 bg-[#5b4d9d] text-white font-bold rounded-xl hover:bg-[#4a3e80]"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default OrdersPage;

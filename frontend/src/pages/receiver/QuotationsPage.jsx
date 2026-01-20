import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FileText, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const QuotationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrdersWithQuotes();
    }, []);

    const fetchOrdersWithQuotes = async () => {
        try {
            // Reusing my-orders endpoint as it includes quotations
            const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter orders that actually have quotations
            const ordersWithQuotes = res.data.filter(order => order.quotationsList && order.quotationsList.length > 0);
            setOrders(ordersWithQuotes);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handlePayment = async (orderId, totalAmount) => {
        // Redirection logic to pay or open modal could go here, 
        // For now, redirecting to orders page where payment logic resides or replicating it.
        // It's better to keep payment logic central, so let's redirect to specific order in orders page ideally.
        navigate('/orders');
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Quotations</h1>
                <p className="text-gray-500 mt-1">Review and approve estimates from service providers</p>
            </div>

            {loading ? (
                <p>Loading quotations...</p>
            ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">No Quotations Received</h3>
                    <p className="text-gray-500 mt-2">When providers respond to your requests, their quotes will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-800">{order.serviceType} Service</h3>
                                    <p className="text-xs text-gray-500">Ref: {order.id.slice(0, 8)} • <Clock size={10} className="inline" /> {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Quotations List */}
                            <div className="p-4 space-y-3">
                                {order.quotationsList.map(quote => (
                                    <div key={quote.id} className="flex flex-col md:flex-row justify-between items-center bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-all">
                                        <div className="mb-3 md:mb-0">
                                            <p className="font-bold text-lg text-[#5b4d9d]">UGX {Number(quote.totalAmount).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">Includes Assessment & Service Fees</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {quote.status === 'ACCEPTED' ? (
                                                <span className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg">
                                                    <CheckCircle size={18} /> Accepted
                                                </span>
                                            ) : quote.status === 'REJECTED' ? (
                                                <span className="flex items-center gap-2 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg">
                                                    <XCircle size={18} /> Rejected
                                                </span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {/* In a real app, 'View' would open details. For now, we link to Orders to pay */}
                                                    <button
                                                        onClick={() => navigate('/orders')}
                                                        className="px-4 py-2 bg-[#5b4d9d] text-white text-sm font-bold rounded-lg hover:bg-[#4a3e80] transition-colors"
                                                    >
                                                        Review & Pay
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default QuotationsPage;

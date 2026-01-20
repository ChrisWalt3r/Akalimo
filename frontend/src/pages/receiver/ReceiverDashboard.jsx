import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Clock,
    CheckCircle,
    CreditCard,
    Plus,
    ShoppingCart,
    MapPin
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const ReceiverDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        pending: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token} ` }
            });
            const allOrders = res.data;
            setOrders(allOrders);

            // Calculate Stats
            const active = allOrders.filter(o => o.status === 'IN_PROGRESS').length;
            const completed = allOrders.filter(o => o.status === 'COMPLETED').length;
            const pending = allOrders.filter(o => o.status === 'PENDING').length;

            setStats({
                total: allOrders.length,
                active,
                completed,
                pending
            });

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            {/* Header / Welcome */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {(user?.name || user?.user?.name || 'User').split(' ')[0]}</p>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/make-order')}
                        className="bg-[#5b4d9d] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#4a3e80] transition-all flex items-center gap-2 font-bold"
                    >
                        <Plus size={20} /> Make an Order
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Requests</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Pending</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.pending}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">In Progress</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.active}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Wallet Balance</p>
                        {/* Mock Balance or fetch from wallet API if available */}
                        <h3 className="text-2xl font-bold text-gray-800">UGX 0</h3>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                    <button
                        onClick={() => navigate('/orders')}
                        className="text-[#5b4d9d] font-bold text-sm hover:underline"
                    >
                        View All
                    </button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                        <p className="text-gray-500">No recent activity found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.slice(0, 3).map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Briefcase size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{order.serviceType} Service</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span><Clock size={12} className="inline mr-1" />{new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span><MapPin size={12} className="inline mr-1" />{order.locationName}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className={`px - 3 py - 1 rounded - full text - xs font - bold uppercase tracking - wider ${order.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} `}>
                                    {order.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </DashboardLayout>
    );
};

export default ReceiverDashboard;

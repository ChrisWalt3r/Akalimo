import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, Settings, Lock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const WalletPage = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('deposit'); // deposit, withdraw, settings

    // Form States
    const [amount, setAmount] = useState('');
    const [withdrawPhone, setWithdrawPhone] = useState(user?.contact || '');
    const [withdrawPin, setWithdrawPin] = useState('');

    // PIN Management
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWallet(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!amount) return;
        try {
            await axios.post('http://localhost:5000/api/wallet/deposit', { amount: parseFloat(amount) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Deposit Successful!");
            setAmount('');
            fetchWallet();
        } catch (error) {
            alert("Deposit Failed: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    const handleWithdraw = async () => {
        if (!amount || !withdrawPhone || !withdrawPin) {
            alert("Please fill in all fields (Amount, Phone, PIN)");
            return;
        }
        // Mock API call for now as backend might not support it yet
        alert(`Withdrawal of UGX ${parseFloat(amount).toLocaleString()} to ${withdrawPhone} initiated.`);
        setAmount('');
        setWithdrawPin('');
    };

    const handleChangePin = async () => {
        if (!currentPin || !newPin) return;
        alert("PIN Change functionality mock.");
        setCurrentPin('');
        setNewPin('');
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 font-medium">Loading Wallet...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
                <p className="text-gray-500 mt-1">Manage your funds and transactions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Balance & Actions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Balance Card */}
                    <div className="bg-[#5b4d9d] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className="relative z-10">
                            <p className="opacity-80 mb-2 font-medium">Total Available Balance</p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">UGX {Number(wallet?.balance || 0).toLocaleString()}</h2>
                        </div>

                        <div className="relative z-10 flex gap-4 mt-4">
                            <button
                                onClick={() => setActiveTab('deposit')}
                                className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'deposit' ? 'bg-white text-[#5b4d9d]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                <ArrowDownCircle size={18} /> Deposit
                            </button>
                            <button
                                onClick={() => setActiveTab('withdraw')}
                                className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'withdraw' ? 'bg-white text-[#5b4d9d]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                <ArrowUpCircle size={18} /> Withdraw
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-white text-[#5b4d9d]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        <Wallet className="absolute -bottom-8 -right-8 text-white/5 w-64 h-64 rotate-12" />
                    </div>

                    {/* Action Forms */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        {activeTab === 'deposit' && (
                            <div>
                                <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                                    <ArrowDownCircle className="text-green-500" /> Deposit Funds
                                </h3>
                                <div className="max-w-md">
                                    <label className="text-sm font-bold text-gray-600 mb-2 block">Amount (UGX)</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5b4d9d]"
                                            placeholder="e.g. 50,000"
                                        />
                                        <button
                                            onClick={handleDeposit}
                                            className="bg-[#5b4d9d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4a3e80] transition-colors"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Payments processed securely via Mobile Money or Card.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'withdraw' && (
                            <div>
                                <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                                    <ArrowUpCircle className="text-red-500" /> Withdraw Funds
                                </h3>
                                <div className="max-w-md space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 mb-2 block">Amount (UGX)</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5b4d9d]"
                                            placeholder="e.g. 20,000"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 mb-2 block">Mobile Money Number</label>
                                        <input
                                            type="text"
                                            value={withdrawPhone}
                                            onChange={(e) => setWithdrawPhone(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5b4d9d]"
                                            placeholder="+256..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 mb-2 block">Wallet PIN</label>
                                        <input
                                            type="password"
                                            value={withdrawPin}
                                            onChange={(e) => setWithdrawPin(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5b4d9d]"
                                            placeholder="****"
                                        />
                                    </div>
                                    <button
                                        onClick={handleWithdraw}
                                        className="w-full bg-[#5b4d9d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4a3e80] transition-colors"
                                    >
                                        Request Withdrawal
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div>
                                <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                                    <Lock className="text-gray-500" /> Security Settings
                                </h3>
                                <div className="max-w-md space-y-4">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Change Wallet PIN</h4>
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 mb-2 block">Current PIN</label>
                                        <input
                                            type="password"
                                            value={currentPin}
                                            onChange={(e) => setCurrentPin(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5b4d9d]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-600 mb-2 block">New PIN</label>
                                        <input
                                            type="password"
                                            value={newPin}
                                            onChange={(e) => setNewPin(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5b4d9d]"
                                        />
                                    </div>
                                    <button
                                        onClick={handleChangePin}
                                        className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors"
                                    >
                                        Update PIN
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Transaction History */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <History size={20} /> Transaction History
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {wallet?.transactions?.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                                <History size={32} className="mb-2 opacity-50" />
                                <p>No transactions yet.</p>
                            </div>
                        ) : (
                            wallet?.transactions?.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-3">
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">{tx.description || tx.type}</p>
                                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`font-bold text-sm ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-500'}`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'} {Number(tx.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WalletPage;

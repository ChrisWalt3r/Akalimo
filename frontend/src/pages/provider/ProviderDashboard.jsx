import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Bell, MapPin, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import QuotationForm from '../../components/QuotationForm'; // We will build this next

const ProviderDashboard = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null); // Notification/Order object
    const [showQuoteForm, setShowQuoteForm] = useState(false);

    const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'jobs'
    const [myJobs, setMyJobs] = useState([]);
    const [updateDescription, setUpdateDescription] = useState('');
    const [updatePhotos, setUpdatePhotos] = useState([]);

    useEffect(() => {
        fetchNotifications();
        fetchMyJobs();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/orders/provider-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyJobs(res.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handlePostUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('description', updateDescription);
        Array.from(updatePhotos).forEach(file => formData.append('photos', file));

        try {
            await axios.post(`http://localhost:5000/api/orders/${selectedJob.id}/update`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Update Posted!");
            setShowQuoteForm(false); // Using same state for modal verify logic later logic separated
            fetchMyJobs();
        } catch (error) {
            alert("Failed to post update");
        }
    };

    const handleCompleteJob = async (id) => {
        if (window.confirm("Are you sure you want to mark this job as complete?")) {
            try {
                await axios.post(`http://localhost:5000/api/orders/${id}/complete`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Job Marked Complete!");
                fetchMyJobs();
            } catch (error) {
                alert("Error completing job");
            }
        }
    }

    const handleViewJob = (note) => {
        // ideally fetch full order details using note.metadata.orderId
        // For now, let's just use the note message/title as context
        setSelectedJob(note);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Provider Dashboard</h1>
            <p className="text-gray-500 mb-8">Welcome back, {user?.name}</p>

            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('alerts')}
                    className={`pb-2 px-4 font-bold ${activeTab === 'alerts' ? 'text-[#5b4d9d] border-b-2 border-[#5b4d9d]' : 'text-gray-400'}`}
                >
                    New Job Alerts
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`pb-2 px-4 font-bold ${activeTab === 'jobs' ? 'text-[#5b4d9d] border-b-2 border-[#5b4d9d]' : 'text-gray-400'}`}
                >
                    My Active Jobs
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Content based on Tab */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'alerts' ? (
                        loading ? (
                            <p>Loading alerts...</p>
                        ) : notifications.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-400">
                                No new job alerts yet.
                            </div>
                        ) : (
                            notifications.map(note => (
                                <div
                                    key={note.id}
                                    className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${note.isRead ? 'border-gray-300 opacity-70' : 'border-[#5b4d9d]'} hover:shadow-md transition-all cursor-pointer`}
                                    onClick={() => handleViewJob(note)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{note.title}</h3>
                                            <p className="text-gray-600 mt-1">{note.message}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> Today</span>
                                                {/* We could calculate distance if we had geodata here */}
                                            </div>
                                        </div>
                                        {!note.isRead && (
                                            <span className="bg-[#5b4d9d] text-white text-xs px-2 py-1 rounded-full">New</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        // MY JOBS LIST
                        myJobs.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl text-center text-gray-400">No active jobs.</div>
                        ) : (
                            myJobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${job.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {job.status}
                                            </span>
                                            <h3 className="font-bold text-lg mt-2">{job.serviceType}</h3>
                                            <p className="text-gray-500 text-sm">{job.description}</p>
                                        </div>
                                        {job.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => handleCompleteJob(job.id)}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Area for IN_PROGRESS */}
                                    {job.status === 'IN_PROGRESS' && (
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <h4 className="font-bold text-sm text-gray-700 mb-2">Post Work Update</h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Bought materials..."
                                                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                                    value={selectedJob?.id === job.id ? updateDescription : ''}
                                                    onChange={(e) => {
                                                        setSelectedJob(job);
                                                        setUpdateDescription(e.target.value);
                                                    }}
                                                />
                                                <label className="bg-white border px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <span className="text-xs">📷</span>
                                                    <input type="file" hidden onChange={e => setUpdatePhotos(e.target.files)} />
                                                </label>
                                                <button
                                                    onClick={handlePostUpdate}
                                                    className="bg-[#5b4d9d] text-white px-4 py-2 rounded-lg text-sm font-bold"
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Updates Log */}
                                    {job.updates && job.updates.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {job.updates.map(u => (
                                                <div key={u.id} className="text-sm text-gray-600 border-l-2 border-gray-300 pl-3">
                                                    <p>{u.description}</p>
                                                    <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )
                    )}
                </div>

                {/* RIGHT: Selected Job Details & Actions */}
                <div className="lg:col-span-1">
                    {selectedJob ? (
                        <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8">
                            <h2 className="text-xl font-bold mb-4 border-b pb-4">Job Details</h2>

                            <div className="space-y-4">
                                <p className="text-gray-600">{selectedJob.message}</p>

                                <div className="bg-blue-50 p-4 rounded-xl space-y-2 text-sm text-blue-800">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} /> <span>Location: 5km away (Pinned)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} /> <span>Est. Base Fare: 1,500 UGX</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button
                                        onClick={() => setShowQuoteForm(true)}
                                        className="w-full py-3 bg-[#5b4d9d] text-white rounded-xl font-bold hover:bg-[#4a3e80] transition-all"
                                    >
                                        Accept & Quote
                                    </button>
                                    <button
                                        className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50"
                                    >
                                        Ignore
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-100 p-8 rounded-2xl text-center text-gray-400 border-2 border-dashed border-gray-300">
                            Select a job to view details
                        </div>
                    )}
                </div>

            </div>

            {/* Modal for Quotation (Placeholder) */}
            {showQuoteForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Create Quotation</h2>
                            <button onClick={() => setShowQuoteForm(false)} className="text-gray-500 hover:text-gray-800">Close</button>
                        </div>
                        {/* We will insert QuotationForm component here */}
                        <QuotationForm
                            orderId={selectedJob.metadata?.orderId}
                            onSuccess={() => {
                                setShowQuoteForm(false);
                                alert("Quote Sent!");
                                fetchNotifications();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;

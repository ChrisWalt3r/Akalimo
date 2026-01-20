import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    ArrowRight, MapPin, Maximize2, Upload, Calendar, Clock, ArrowLeft,
    CheckCircle, Briefcase, Ruler, DollarSign, Home, Wrench, Scissors, HardHat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationPickerModal from '../../components/LocationPickerModal';
import DashboardLayout from '../../components/DashboardLayout';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast, { Toaster } from 'react-hot-toast';

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper Components ---
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

const ClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const ServiceRequestPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    // --- State Management ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Form Data State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [location, setLocation] = useState({ lat: -1.2921, lng: 36.8219 });
    const [showMapModal, setShowMapModal] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const { register, handleSubmit, watch, trigger, setValue, formState: { errors } } = useForm();
    const watchedPhotos = watch('photos');

    // Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/services/categories', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCategories();
    }, [token]);

    // --- Steps Logic ---

    const handleNext = async () => {
        // Validation per step
        if (step === 1) {
            if (!selectedCategory) {
                toast.error("Please select a service category");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            const valid = await trigger(['description']);
            if (valid) setStep(3);
        } else if (step === 3) {
            const valid = await trigger(['quotations']); // Ensure quotes selected
            if (!location) {
                toast.error("Please pin a location");
                return;
            }
            if (valid) setStep(4);
        } else if (step === 4) {
            const valid = await trigger(['scheduledDate', 'scheduledTime']);
            if (valid) setStep(5); // Move to review/submit
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading('Creating Order...');

        try {
            const formData = new FormData();
            formData.append('categoryId', selectedCategory);
            formData.append('serviceType', 'General'); // Default based on screenshot simplicity
            formData.append('quotations', data.quotations || 1);
            formData.append('description', data.description || '');
            formData.append('scheduledDate', data.scheduledDate);
            formData.append('scheduledTime', data.scheduledTime);
            formData.append('lat', location.lat);
            formData.append('lng', location.lng);
            formData.append('locationName', 'Pinned Location'); // Ideally reverse geocode

            if (data.photos && data.photos.length > 0) {
                for (let i = 0; i < data.photos.length; i++) {
                    formData.append('photos', data.photos[i]);
                }
            }

            const res = await axios.post('http://localhost:5000/api/orders', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setOrderId(res.data.order.id);
            toast.success('Service Requested!', { id: toastId });
            setStep(6); // Success Step
        } catch (error) {
            console.error("Order Error", error);
            const msg = error.response?.data?.message || "Failed to create order";
            toast.error(msg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // --- Render Steps ---

    // Phase 1: Category Selection Grid
    const renderStep1 = () => (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 uppercase tracking-wide">TECHNICAL SERVICES</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`aspect-square flex flex-col items-center justify-center p-4 rounded-xl transition-all shadow-md hover:shadow-lg border-2 
                            ${selectedCategory === cat.id ? 'bg-[#5b4d9d] text-white border-[#5b4d9d]' : 'bg-[#4DA1D6] text-white border-transparent hover:scale-105'}`}
                    >
                        {/* Icons Mapping (Mock logic for now) */}
                        <div className="mb-4">
                            {cat.name.includes("Inst") ? <Wrench size={40} /> :
                                cat.name.includes("Fash") ? <Scissors size={40} /> :
                                    cat.name.includes("Build") ? <HardHat size={40} /> :
                                        cat.name.includes("Home") ? <Home size={40} /> :
                                            <Briefcase size={40} />}
                        </div>
                        <span className="font-bold text-sm md:text-base leading-tight">{cat.name}</span>
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={handleNext}
                className="w-full max-w-sm mx-auto h-14 bg-[#4DA1D6] text-white font-bold text-xl rounded-none shadow-lg hover:bg-[#3B8AC0] transition-colors flex items-center justify-center gap-2"
            >
                SHOP
            </button>
        </div>
    );

    // Phase 2: Description & Photos
    const renderStep2 = () => (
        <div className="max-w-xl mx-auto">
            <h2 className="text-center text-white bg-[#5b4d9d] py-3 text-lg font-bold uppercase tracking-widest mb-8 -mx-6 md:mx-0 rounded-none md:rounded-t-lg">ORDER</h2>

            <div className="mb-6">
                <textarea
                    {...register('description', { required: "Description is required" })}
                    rows={5}
                    placeholder="Describe what needs repair?"
                    className="w-full border border-gray-400 p-4 text-gray-700 outline-none focus:border-[#5b4d9d] transition-colors"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-3">Upload a photo (Optional)</label>
                <div className="grid grid-cols-3 gap-4">
                    {/* Visual placeholders for upload slots */}
                    {[1, 2, 3, 4, 5, 6].map((slot, index) => (
                        <div key={slot} className="aspect-square border-2 border-gray-300 flex items-center justify-center bg-gray-50 relative overflow-hidden">
                            {watchedPhotos && watchedPhotos[index] ? (
                                <img
                                    src={URL.createObjectURL(watchedPhotos[index])}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-gray-300">
                                    <Upload size={24} strokeWidth={1.5} />
                                </div>
                            )}
                            {/* Actual Input Overlay (Only works for the first empty slot logically, but for simplicity filling generically) */}
                            {index === 0 && (
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    {...register('photos')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={handleNext}
                    className="w-16 h-16 bg-[#5b4d9d] rounded-full text-white flex items-center justify-center shadow-lg hover:bg-[#4a3e80] transition-transform hover:scale-110"
                >
                    <ArrowRight size={32} />
                </button>
            </div>
        </div>
    );

    // Phase 3: Specs & Location
    const renderStep3 = () => (
        <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-center text-white bg-[#5b4d9d] py-3 text-lg font-bold uppercase tracking-widest mb-6 -mx-6 md:mx-0 rounded-none md:rounded-t-lg">SPECIFICATIONS</h2>

            {/* Dropdowns Mockups based on screenshot */}
            <div className="space-y-4">
                <div className="relative">
                    <select className="w-full h-12 px-4 rounded-full border border-gray-400 bg-white appearance-none text-gray-700 focus:outline-none focus:border-[#5b4d9d]">
                        <option>Size</option>
                        <option>Large</option>
                        <option>Medium</option>
                        <option>Small</option>
                    </select>
                </div>
                <div className="relative">
                    <select className="w-full h-12 px-4 rounded-full border border-gray-400 bg-white appearance-none text-gray-700 focus:outline-none focus:border-[#5b4d9d]">
                        <option>No. of Items</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3+</option>
                    </select>
                </div>
            </div>

            {/* Map Section */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">Pin Location</label>
                <div className="relative h-48 w-full border-4 border-[#5b4d9d] bg-gray-200 overflow-hidden">
                    {/* Mini Map */}
                    <MapContainer
                        center={location}
                        zoom={13}
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <RecenterAutomatically lat={location.lat} lng={location.lng} />
                        <Marker position={location} />
                    </MapContainer>
                    <button
                        type="button"
                        onClick={() => setShowMapModal(true)}
                        className="absolute inset-0 bg-transparent z-[500] cursor-pointer" // Overlay to open modal
                    />
                </div>
            </div>

            {/* Quotations Count */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">How many quotations would you want?</label>
                <div className="relative w-32 ml-auto">
                    <select
                        {...register('quotations')}
                        className="w-full h-12 px-4 rounded-full border border-gray-400 bg-white appearance-none text-center text-gray-700 focus:outline-none focus:border-[#5b4d9d]"
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button
                    type="button"
                    onClick={handleNext}
                    className="w-16 h-16 bg-[#5b4d9d] rounded-full text-white flex items-center justify-center shadow-lg hover:bg-[#4a3e80] transition-transform hover:scale-110"
                >
                    <ArrowRight size={32} />
                </button>
            </div>
        </div>
    );

    // Phase 4: Styling like the gradient screenshot
    const renderStep4 = () => (
        <div className="max-w-sm mx-auto bg-gradient-to-b from-[#4DA1D6] to-[#5b4d9d] p-8 rounded-lg shadow-2xl min-h-[500px] flex flex-col items-center">

            <div className="w-full flex justify-between gap-4 mb-8">
                <div className="bg-white rounded-full px-6 py-3 flex-1 text-center">
                    <input
                        type="date"
                        {...register('scheduledDate', { required: true })}
                        className="w-full bg-transparent outline-none text-gray-700 text-sm font-bold text-center uppercase"
                    />
                </div>
                <div className="bg-white rounded-full px-6 py-3 flex-1 text-center">
                    <input
                        type="time"
                        {...register('scheduledTime', { required: true })}
                        className="w-full bg-transparent outline-none text-gray-700 text-sm font-bold text-center"
                    />
                </div>
            </div>

            <div className="w-full bg-white p-4 h-32 mb-4 rounded-sm flex items-start justify-start">
                <div className="text-gray-800 font-bold text-sm">Payment Info</div>
            </div>

            <div className="w-full bg-white p-4 h-32 mb-12 rounded-sm flex items-start justify-start">
                <div className="text-gray-800 font-bold text-sm">Service Info</div>
            </div>

            <div className="flex gap-4 w-full">
                <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="flex-1 py-4 bg-[#5b4d9d] text-white font-bold rounded-full shadow-lg text-sm tracking-wider uppercase disabled:opacity-70"
                >
                    {loading ? "..." : "ORDER"}
                </button>
                <button
                    type="button"
                    className="flex-1 py-4 bg-[#5b4d9d] text-white font-bold rounded-full shadow-lg text-sm tracking-wider uppercase opacity-50 cursor-not-allowed"
                >
                    BOOK
                </button>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Request Sent!</h2>
            <p className="text-gray-500 mb-8">Your order ID is #{orderId}. Providers will react shortly.</p>
            <button
                onClick={() => navigate('/receiver-dashboard')}
                className="bg-[#5b4d9d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4a3e80] shadow-lg"
            >
                Back to Dashboard
            </button>
        </div>
    );

    return (
        <DashboardLayout>
            <Toaster position="top-right" />

            {showMapModal && (
                <LocationPickerModal
                    onClose={() => setShowMapModal(false)}
                    onConfirm={(pos) => { setLocation(pos); setShowMapModal(false); }}
                    initialPosition={location}
                />
            )}

            {/* Back Arrow for sub-steps */}
            {step > 1 && step < 6 && (
                <button onClick={handleBack} className="mb-4 text-gray-500 hover:text-[#5b4d9d] flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </button>
            )}

            <div className="py-8 px-4">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 6 && renderSuccess()}
            </div>
        </DashboardLayout>
    );
};

export default ServiceRequestPage;

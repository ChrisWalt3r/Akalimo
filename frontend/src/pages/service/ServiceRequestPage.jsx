import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, MapPin, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationPickerModal from '../../components/LocationPickerModal';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to keep map centered on location change
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

// Component to handle clicks on the mini map
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

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const defaultCenter = { lat: -1.2921, lng: 36.8219 }; // Nairobi
    const [location, setLocation] = useState(defaultCenter);
    const [showMapModal, setShowMapModal] = useState(false);

    // Form
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/services/categories', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(res.data);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        fetchCategories();
    }, [token]);

    // Handle pin drag on mini map
    const onMarkerDragEnd = (e) => {
        setLocation(e.target.getLatLng());
    };

    const onSubmit = (data) => {
        console.log("Form Data:", { ...data, location });
        alert("Service Request Captured! Proceeding to Quote...");
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">

            {/* Modal */}
            {showMapModal && (
                <LocationPickerModal
                    onClose={() => setShowMapModal(false)}
                    onConfirm={(pos) => { setLocation(pos); setShowMapModal(false); }}
                    initialPosition={location}
                />
            )}

            {/* Header */}
            <div className="h-24 w-full bg-[#5b4d9d] flex items-center px-6 md:px-12 shadow-md shrink-0">
                <div className="text-white font-bold text-2xl">Request Service</div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 md:py-12">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

                        {/* Details Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Category</label>
                                <select
                                    {...register('categoryId')}
                                    className="w-full rounded-full border border-gray-300 bg-white px-6 py-4 text-gray-700 shadow-sm focus:border-[#5b4d9d] focus:ring-2 focus:ring-[#5b4d9d]/20 focus:outline-none transition-all"
                                >
                                    <option value="">Select Service Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Service Type / Size</label>
                                <div className="relative">
                                    <select
                                        {...register('serviceType')}
                                        className="w-full rounded-full border border-gray-300 bg-white px-6 py-4 text-gray-700 shadow-sm focus:border-[#5b4d9d] focus:ring-2 focus:ring-[#5b4d9d]/20 focus:outline-none transition-all appearance-none"
                                    >
                                        <option value="sofa">No of Sofas</option>
                                        <option value="room">No of Rooms</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <span className="font-bold text-gray-400">2</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">How many quotations?</label>
                                <select
                                    {...register('quotations')}
                                    className="w-full md:w-1/2 rounded-full border border-gray-300 bg-white px-6 py-4 font-bold text-gray-700 shadow-sm focus:border-[#5b4d9d] focus:ring-2 focus:ring-[#5b4d9d]/20 focus:outline-none transition-all"
                                    defaultValue="1"
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                        </div>

                        {/* Map Column */}
                        <div className="space-y-6">
                            <div className="space-y-2 relative">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Pin Location</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowMapModal(true)}
                                        className="text-[#5b4d9d] text-sm font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <Maximize2 size={16} /> Expand Map
                                    </button>
                                </div>

                                {/* Interactive Mini Map */}
                                <div className="relative h-64 w-full overflow-hidden rounded-2xl border-2 border-[#5b4d9d]/30 shadow-lg bg-white z-0">
                                    <MapContainer
                                        center={location}
                                        zoom={13}
                                        scrollWheelZoom={true}
                                        className="h-full w-full"
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                        {/* Sync view when location changes externally (e.g. from modal) */}
                                        <RecenterAutomatically lat={location.lat} lng={location.lng} />

                                        {/* Allow clicking map to move pin */}
                                        <ClickHandler onLocationSelect={setLocation} />

                                        <Marker
                                            position={location}
                                            draggable={true}
                                            eventHandlers={{
                                                dragend: onMarkerDragEnd
                                            }}
                                        />
                                    </MapContainer>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Tap map or drag pin to adjust. Use "Expand Map" for search.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-center md:justify-end">
                        <button
                            type="submit"
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5b4d9d] text-white shadow-xl hover:shadow-2xl hover:bg-[#4a3e80] transition-all hover:scale-105 focus:ring-4 focus:ring-[#5b4d9d]/30"
                        >
                            <ArrowRight size={32} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceRequestPage;

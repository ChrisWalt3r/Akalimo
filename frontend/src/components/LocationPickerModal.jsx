import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Search, X, Check } from 'lucide-react';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
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

// Search Component to be added to Map
const SearchField = () => {
    const map = useMap();
    useEffect(() => {
        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            showMarker: true,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Search location...',
        });
        map.addControl(searchControl);
        return () => map.removeControl(searchControl);
    }, [map]);
    return null;
};

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 15);
        },
        // Listen for search results logic could go here if we want to sync state cleanly
        // But GeoSearchControl handles the view move.
    });

    // We can listen to geosearch/showlocation event if needed, but manual click works.

    useEffect(() => {
        map.locate();
    }, [map]);

    return position === null ? null : (
        <Marker position={position} draggable={true} eventHandlers={{
            dragend: (e) => {
                setPosition(e.target.getLatLng());
            }
        }}></Marker>
    );
};

const LocationPickerModal = ({ onClose, onConfirm, initialPosition }) => {
    const [position, setPosition] = useState(initialPosition);

    return (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-white sm:bg-black/50 sm:p-8 items-center justify-center">
            {/* Container: Fullscreen on Mobile, Modal on Desktop */}
            <div className="relative flex h-full w-full flex-col bg-white sm:h-[80vh] sm:w-[90vw] sm:max-w-4xl sm:rounded-2xl sm:overflow-hidden sm:shadow-2xl">

                {/* Header */}
                <div className="flex h-16 items-center justify-between bg-[#5b4d9d] px-4 text-white shrink-0">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                    <h2 className="text-lg font-bold">Pick Location</h2>
                    <button onClick={() => onConfirm(position)} disabled={!position} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50">
                        <Check size={24} />
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={[-1.2921, 36.8219]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <SearchField />
                        <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>

                    {/* Floating info for user */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg text-xs font-medium text-gray-700 pointer-events-none z-[1000]">
                        Map: Drag marker to adjust
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;

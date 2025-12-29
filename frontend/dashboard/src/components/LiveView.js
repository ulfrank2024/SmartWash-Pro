import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useTranslation } from 'react-i18next';
// import supabase from '../db/supabase'; // Removed direct Supabase import

const LiveView = () => {
    const { t } = useTranslation();
    const [connectionStatus, setConnectionStatus] = useState(t('disconnected_iot_service'));
    const [servicePoints, setServicePoints] = useState([]);
    const [selectedServicePointId, setSelectedServicePointId] = useState('');
    const [washingStations, setWashingStations] = useState({}); // Stores status for washing stations within selected SP
    const [loadingServicePoints, setLoadingServicePoints] = useState(true);
    const [loadingStations, setLoadingStations] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to get status display properties
    const getStatusDisplay = (status) => {
        let text = t('unknown_status');
        let classes = 'text-gray-800 bg-gray-200'; // Default unknown status

        switch (status) {
            case 'AVAILABLE':
                text = t('status_available');
                classes = 'text-white bg-green-500';
                break;
            case 'BUSY':
                text = t('status_busy');
                classes = 'text-white bg-amber-500';
                break;
            case 'OFFLINE':
                text = t('status_offline');
                classes = 'text-white bg-gray-500';
                break;
            case 'ERROR':
                text = t('status_error');
                classes = 'text-white bg-red-500';
                break;
            default:
                break;
        }
        return { text, classes };
    };

    // Fetch Service Points on component mount
    useEffect(() => {
        const fetchServicePoints = async () => {
            setError(null);
            setLoadingServicePoints(true);
            try {
                // Fetch service points from project-service API
                const response = await fetch('/api/v1/projects/service-points'); // Assuming this endpoint exists
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message_en || 'Failed to fetch service points');
                }

                setServicePoints(data);
                if (data.length > 0) {
                    setSelectedServicePointId(data[0].id); // Select the first one by default
                }
            } catch (err) {
                console.error('Error fetching service points:', err);
                setError(t('error_fetching_service_points'));
            } finally {
                setLoadingServicePoints(false);
            }
        };

        fetchServicePoints();
    }, [t]);

    // Fetch Washing Stations for selected Service Point
    useEffect(() => {
        if (!selectedServicePointId) {
            setWashingStations({});
            return;
        }

        const fetchWashingStations = async () => {
            setError(null);
            setLoadingStations(true);
            try {
                // Fetch washing stations for the selected service point from iot-service API
                const response = await fetch(`/api/v1/iot/service-points/${selectedServicePointId}/data`); // Endpoint from iot-service
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message_en || 'Failed to fetch washing station data');
                }

                // Initialize station status from fetched data
                const initialStationsStatus = {};
                if (data.washingStations) {
                    data.washingStations.forEach(ws => {
                        initialStationsStatus[ws.id] = { ...ws, name: ws.name, status: ws.status };
                    });
                }
                setWashingStations(initialStationsStatus);

            } catch (err) {
                console.error('Error fetching washing stations for service point:', err);
                setError(t('error_fetching_washing_stations_for_sp'));
            } finally {
                setLoadingStations(false);
            }
        };

        fetchWashingStations();

        // Socket.IO connection for real-time updates
        const socket = io('http://localhost:5003'); // Replace with your actual IoT service URL

        socket.on('connect', () => {
            setConnectionStatus(t('connected_iot_service'));
            console.log(t('connected_iot_service'));
        });

        socket.on('disconnect', () => {
            setConnectionStatus(t('disconnected_iot_service'));
            console.log(t('disconnected_iot_service'));
        });

        // Listen for status updates
        socket.on('iotStatusUpdate', (data) => {
            console.log('IoT Status Update received via Socket.io:', data);
            setWashingStations(prevStations => {
                // Only update if the station belongs to the currently selected service point
                if (data.station_id in prevStations) { 
                    return {
                        ...prevStations,
                        [data.station_id]: {
                            ...prevStations[data.station_id],
                            status: data.status,
                            last_heartbeat: new Date().toISOString() // Update heartbeat as well
                        }
                    };
                }
                return prevStations;
            });
        });

        // Listen for new transactions (optional, if you want to show transaction count live)
        socket.on('iotTransaction', (data) => {
            console.log('IoT Transaction received via Socket.io:', data);
            // You might want to update a transaction count or similar for the station
        });

        return () => {
            socket.disconnect();
        };
    }, [selectedServicePointId, t]); // Re-run when selectedServicePointId changes

    if (loadingServicePoints) {
        return <div className="text-center p-4">{t('loading_service_points')}</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('live_status_link')}</h1>

            {/* Service Point Selector */}
            <div className="mb-4">
                <label htmlFor="servicePointSelector" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('select_service_point')}:
                </label>
                <select
                    id="servicePointSelector"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={selectedServicePointId}
                    onChange={(e) => setSelectedServicePointId(e.target.value)}
                    disabled={servicePoints.length === 0}
                >
                    {servicePoints.length === 0 ? (
                        <option value="">{t('no_service_points_available')}</option>
                    ) : (
                        servicePoints.map(sp => (
                            <option key={sp.id} value={sp.id}>{sp.name}</option>
                        ))
                    )}
                </select>
            </div>

            <p className="mb-4">{t('connection_status')} <span className={connectionStatus.includes(t('connected_iot_service')) ? 'text-green-500' : 'text-red-500'}>{connectionStatus}</span></p>

            {loadingStations ? (
                <div className="text-center text-gray-500">{t('loading_washing_stations')}</div>
            ) : Object.keys(washingStations).length === 0 ? (
                <div className="text-center text-gray-500">{t('no_washing_stations_found')}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(washingStations).map((ws) => {
                        const { text, classes } = getStatusDisplay(ws.status);
                        return (
                            <div key={ws.id} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
                                <div className={`w-4 h-4 rounded-full ${classes.split(' ').filter(c => c.startsWith('bg-'))[0]}`}></div> {/* Color indicator */}
                                <div>
                                    <h2 className="text-lg font-semibold">{t('station')}: {ws.name}</h2>
                                    <p className="text-gray-700">{t('status')}: <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${classes}`}>{text}</span></p>
                                    <p className="text-gray-500 text-sm">{t('type')}: {ws.type}</p>
                                    <p className="text-gray-500 text-sm">{t('last_update')}: {new Date(ws.last_heartbeat).toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LiveView;

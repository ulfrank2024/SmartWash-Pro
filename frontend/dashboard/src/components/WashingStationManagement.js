import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import supabase from '../db/supabase'; // Removed direct Supabase import

const WashingStationManagement = () => {
    const { t } = useTranslation();
    const [washingStations, setWashingStations] = useState([]);
    const [servicePoints, setServicePoints] = useState([]);
    const [newWashingStation, setNewWashingStation] = useState({
        name: '',
        service_point_id: '',
        type: ''
    });
    const [editingWashingStation, setEditingWashingStation] = useState(null);
    const [editWashingStation, setEditWashingStation] = useState({
        name: '',
        service_point_id: '',
        type: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Service Points
            const spResponse = await fetch('/api/v1/projects/service-points');
            const spData = await spResponse.json();

            if (!spResponse.ok) {
                throw new Error(spData.message_en || t('error_fetching_service_points'));
            }
            setServicePoints(spData);

            // Fetch Washing Stations
            // Assuming a GET /washing-stations endpoint that returns all washing stations with service point name
            const wsResponse = await fetch('/api/v1/projects/washing-stations'); // This endpoint needs to be implemented in project-service
            const wsData = await wsResponse.json();

            if (!wsResponse.ok) {
                throw new Error(wsData.message_en || t('error_fetching_washing_stations'));
            }
            // Manually add service point name to washing stations for display
            const washingStationsWithSpNames = wsData.map(ws => ({
                ...ws,
                ServicePoints: { name: spData.find(sp => sp.id === ws.service_point_id)?.name || 'Unknown' }
            }));
            setWashingStations(washingStationsWithSpNames);

        } catch (err) {
            console.error('Unexpected error fetching data:', err);
            setError(err.message || t('error_fetching_data_unexpected'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddWashingStation = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newWashingStation.name || !newWashingStation.service_point_id || !newWashingStation.type) {
            setError(t('fill_all_fields'));
            return;
        }
        try {
            const response = await fetch(`/api/v1/projects/service-points/${newWashingStation.service_point_id}/washing-stations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newWashingStation),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message_en || t('error_adding_washing_station'));
            }
            const addedWsWithSpName = {
                ...data.washingStation,
                ServicePoints: { name: servicePoints.find(sp => sp.id === data.washingStation.service_point_id)?.name || 'Unknown' }
            };
            setWashingStations([...washingStations, addedWsWithSpName]);
            setNewWashingStation({ name: '', service_point_id: '', type: '' });
        } catch (err) {
            console.error('Error adding washing station:', err);
            setError(err.message || t('error_adding_washing_station_unexpected'));
        }
    };

    const handleEditWashingStation = (ws) => {
        setEditingWashingStation(ws);
        setEditWashingStation({
            name: ws.name,
            service_point_id: ws.service_point_id,
            type: ws.type
        });
    };

    const handleUpdateWashingStation = async (e) => {
        e.preventDefault();
        setError(null);
        if (!editWashingStation.name || !editWashingStation.service_point_id || !editWashingStation.type) {
            setError(t('fill_all_fields'));
            return;
        }
        try {
            const response = await fetch(`/api/v1/projects/washing-stations/${editingWashingStation.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editWashingStation),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message_en || t('error_updating_washing_station'));
            }
            const updatedWsWithSpName = {
                ...data.washingStation,
                ServicePoints: { name: servicePoints.find(sp => sp.id === data.washingStation.service_point_id)?.name || 'Unknown' }
            };
            setWashingStations(washingStations.map(ws => (ws.id === editingWashingStation.id ? updatedWsWithSpName : ws)));
            setEditingWashingStation(null);
            setEditWashingStation({ name: '', service_point_id: '', type: '' });
        } catch (err) {
            console.error('Error updating washing station:', err);
            setError(err.message || t('error_updating_washing_station_unexpected'));
        }
    };

    const handleDeleteWashingStation = async (wsId) => {
        if (!window.confirm(t('confirm_delete_washing_station'))) {
            return;
        }
        setError(null);
        try {
            const response = await fetch(`/api/v1/projects/washing-stations/${wsId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message_en || t('error_deleting_washing_station'));
            }
            setWashingStations(washingStations.filter(ws => ws.id !== wsId));
        } catch (err) {
            console.error('Error deleting washing station:', err);
            setError(err.message || t('error_deleting_washing_station_unexpected'));
        }
    };

    if (loading) {
        return <div className="text-center p-4">{t('loading_washing_stations')}</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('washing_station_management_title')}</h1>

            {/* Add New Washing Station Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">{t('add_new_washing_station')}</h2>
                <form onSubmit={handleAddWashingStation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('washing_station_name_placeholder')}
                        value={newWashingStation.name}
                        onChange={(e) => setNewWashingStation({ ...newWashingStation, name: e.target.value })}
                        required
                    />
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={newWashingStation.service_point_id}
                        onChange={(e) => setNewWashingStation({ ...newWashingStation, service_point_id: e.target.value })}
                        required
                    >
                        <option value="">{t('select_service_point_placeholder')}</option>
                        {servicePoints.map(sp => (
                            <option key={sp.id} value={sp.id}>{sp.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('washing_station_type_placeholder')}
                        value={newWashingStation.type}
                        onChange={(e) => setNewWashingStation({ ...newWashingStation, type: e.target.value })}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline md:col-span-2"
                    >
                        {t('add_washing_station_button')}
                    </button>
                </form>
            </div>

            {/* List of Washing Stations */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">{t('existing_washing_stations')}</h2>
                {washingStations.length === 0 ? (
                    <p>{t('no_washing_stations_found')}</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {washingStations.map((ws) => (
                            <li key={ws.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                                {editingWashingStation && editingWashingStation.id === ws.id ? (
                                    <form onSubmit={handleUpdateWashingStation} className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={editWashingStation.name}
                                            onChange={(e) => setEditWashingStation({ ...editWashingStation, name: e.target.value })}
                                            required
                                        />
                                        <select
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={editWashingStation.service_point_id}
                                            onChange={(e) => setEditWashingStation({ ...editWashingStation, service_point_id: e.target.value })}
                                            required
                                        >
                                            {servicePoints.map(sp => (
                                                <option key={sp.id} value={sp.id}>{sp.name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder={t('washing_station_type_placeholder')}
                                            value={editWashingStation.type}
                                            onChange={(e) => setEditWashingStation({ ...editWashingStation, type: e.target.value })}
                                            required
                                        />
                                        <div className="flex space-x-2">
                                            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('save_button')}</button>
                                            <button type="button" onClick={() => setEditingWashingStation(null)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('cancel_button')}</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex-grow">
                                            <p className="text-lg font-semibold">{ws.name} ({ws.ServicePoints.name}) - Type: {ws.type}</p>
                                            <p className="text-sm text-gray-500">ID: {ws.id}</p>
                                        </div>
                                        <div className="flex space-x-2 mt-2 md:mt-0">
                                            <button onClick={() => handleEditWashingStation(ws)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('edit_button')}</button>
                                            <button onClick={() => handleDeleteWashingStation(ws.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('delete_button')}</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default WashingStationManagement;


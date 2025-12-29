import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import supabase from '../db/supabase'; // Removed direct Supabase import

const ServicePointManagement = () => {
    const { t } = useTranslation();
    const [servicePoints, setServicePoints] = useState([]);
    const [cities, setCities] = useState([]);
    const [newServicePoint, setNewServicePoint] = useState({
        name: '',
        city_id: '',
        address: '',
        budget_prev: '',
        status_construction: ''
    });
    const [editingServicePoint, setEditingServicePoint] = useState(null);
    const [editServicePoint, setEditServicePoint] = useState({
        name: '',
        city_id: '',
        address: '',
        budget_prev: '',
        status_construction: ''
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
            // Fetch Cities
            const citiesResponse = await fetch('/api/v1/projects/cities');
            const citiesData = await citiesResponse.json();

            if (!citiesResponse.ok) {
                throw new Error(citiesData.message_en || t('error_fetching_cities'));
            }
            setCities(citiesData);

            // Fetch Service Points
            const spResponse = await fetch('/api/v1/projects/service-points'); // Assuming this endpoint now returns City name if needed
            const spData = await spResponse.json();

            if (!spResponse.ok) {
                throw new Error(spData.message_en || t('error_fetching_service_points'));
            }
            // Manually add city name to service points for display
            const servicePointsWithCityNames = spData.map(sp => ({
                ...sp,
                Cities: { name: citiesData.find(city => city.id === sp.city_id)?.name || 'Unknown' }
            }));
            setServicePoints(servicePointsWithCityNames);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || t('error_fetching_data_unexpected'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddServicePoint = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newServicePoint.name || !newServicePoint.city_id || !newServicePoint.address || newServicePoint.budget_prev === '' || !newServicePoint.status_construction) {
            setError(t('fill_all_fields'));
            return;
        }
        try {
            const response = await fetch('/api/v1/projects/service-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newServicePoint),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message_en || t('error_adding_service_point'));
            }
            // Find city name for the new service point
            const addedSpWithCityName = {
                ...data.servicePoint,
                Cities: { name: cities.find(city => city.id === data.servicePoint.city_id)?.name || 'Unknown' }
            };
            setServicePoints([...servicePoints, addedSpWithCityName]);
            setNewServicePoint({ name: '', city_id: '', address: '', budget_prev: '', status_construction: '' });
        } catch (err) {
            console.error('Error adding service point:', err);
            setError(err.message || t('error_adding_service_point_unexpected'));
        }
    };

    const handleEditServicePoint = (sp) => {
        setEditingServicePoint(sp);
        setEditServicePoint({
            name: sp.name,
            city_id: sp.city_id,
            address: sp.address,
            budget_prev: sp.budget_prev,
            status_construction: sp.status_construction
        });
    };

    const handleUpdateServicePoint = async (e) => {
        e.preventDefault();
        setError(null);
        if (!editServicePoint.name || !editServicePoint.city_id || !editServicePoint.address || editServicePoint.budget_prev === '' || !editServicePoint.status_construction) {
            setError(t('fill_all_fields'));
            return;
        }
        try {
            const response = await fetch(`/api/v1/projects/service-points/${editingServicePoint.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editServicePoint),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message_en || t('error_updating_service_point'));
            }
            const updatedSpWithCityName = {
                ...data.servicePoint,
                Cities: { name: cities.find(city => city.id === data.servicePoint.city_id)?.name || 'Unknown' }
            };
            setServicePoints(servicePoints.map(sp => (sp.id === editingServicePoint.id ? updatedSpWithCityName : sp)));
            setEditingServicePoint(null);
            setEditServicePoint({ name: '', city_id: '', address: '', budget_prev: '', status_construction: '' });
        } catch (err) {
            console.error('Error updating service point:', err);
            setError(err.message || t('error_updating_service_point_unexpected'));
        }
    };

    const handleDeleteServicePoint = async (spId) => {
        if (!window.confirm(t('confirm_delete_service_point'))) {
            return;
        }
        setError(null);
        try {
            const response = await fetch(`/api/v1/projects/service-points/${spId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message_en || t('error_deleting_service_point'));
            }
            setServicePoints(servicePoints.filter(sp => sp.id !== spId));
        } catch (err) {
            console.error('Error deleting service point:', err);
            setError(err.message || t('error_deleting_service_point_unexpected'));
        }
    };

    if (loading) {
        return <div className="text-center p-4">{t('loading_service_points')}</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('service_point_management_title')}</h1>

            {/* Add New Service Point Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">{t('add_new_service_point')}</h2>
                <form onSubmit={handleAddServicePoint} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('service_point_name_placeholder')}
                        value={newServicePoint.name}
                        onChange={(e) => setNewServicePoint({ ...newServicePoint, name: e.target.value })}
                        required
                    />
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={newServicePoint.city_id}
                        onChange={(e) => setNewServicePoint({ ...newServicePoint, city_id: e.target.value })}
                        required
                    >
                        <option value="">{t('select_city_placeholder')}</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('service_point_address_placeholder')}
                        value={newServicePoint.address}
                        onChange={(e) => setNewServicePoint({ ...newServicePoint, address: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('budget_prev_placeholder')}
                        value={newServicePoint.budget_prev}
                        onChange={(e) => setNewServicePoint({ ...newServicePoint, budget_prev: parseFloat(e.target.value) || 0 })}
                        required
                    />
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('status_construction_placeholder')}
                        value={newServicePoint.status_construction}
                        onChange={(e) => setNewServicePoint({ ...newServicePoint, status_construction: e.target.value })}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline md:col-span-2"
                    >
                        {t('add_service_point_button')}
                    </button>
                </form>
            </div>

            {/* List of Service Points */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">{t('existing_service_points')}</h2>
                {servicePoints.length === 0 ? (
                    <p>{t('no_service_points_found')}</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {servicePoints.map((sp) => (
                            <li key={sp.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                                {editingServicePoint && editingServicePoint.id === sp.id ? (
                                    <form onSubmit={handleUpdateServicePoint} className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={editServicePoint.name}
                                            onChange={(e) => setEditServicePoint({ ...editServicePoint, name: e.target.value })}
                                            required
                                        />
                                        <select
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={editServicePoint.city_id}
                                            onChange={(e) => setEditServicePoint({ ...editServicePoint, city_id: e.target.value })}
                                            required
                                        >
                                            {cities.map(city => (
                                                <option key={city.id} value={city.id}>{city.name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder={t('service_point_address_placeholder')}
                                            value={editServicePoint.address}
                                            onChange={(e) => setEditServicePoint({ ...editServicePoint, address: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="number"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder={t('budget_prev_placeholder')}
                                            value={editServicePoint.budget_prev}
                                            onChange={(e) => setEditServicePoint({ ...editServicePoint, budget_prev: parseFloat(e.target.value) || 0 })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder={t('status_construction_placeholder')}
                                            value={editServicePoint.status_construction}
                                            onChange={(e) => setEditServicePoint({ ...editServicePoint, status_construction: e.target.value })}
                                            required
                                        />
                                        <div className="flex space-x-2">
                                            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('save_button')}</button>
                                            <button type="button" onClick={() => setEditingServicePoint(null)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('cancel_button')}</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex-grow">
                                            <p className="text-lg font-semibold">{sp.name} ({sp.Cities.name})</p>
                                            <p className="text-sm text-gray-500">{sp.address}</p>
                                            <p className="text-sm text-gray-500">{t('budget')}: {sp.budget_prev} {t('cfa')}</p>
                                            <p className="text-sm text-gray-500">{t('status_construction')}: {sp.status_construction}</p>
                                        </div>
                                        <div className="flex space-x-2 mt-2 md:mt-0">
                                            <button onClick={() => handleEditServicePoint(sp)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('edit_button')}</button>
                                            <button onClick={() => handleDeleteServicePoint(sp.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('delete_button')}</button>
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

export default ServicePointManagement;
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// import supabase from '../db/supabase'; // Removed direct Supabase import

const CityManagement = () => {
    const { t } = useTranslation();
    const [cities, setCities] = useState([]);
    const [newCityName, setNewCityName] = useState('');
    const [newCityCountry, setNewCityCountry] = useState('');
    const [editingCity, setEditingCity] = useState(null); // City being edited
    const [editCityName, setEditCityName] = useState('');
    const [editCityCountry, setEditCityCountry] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/v1/projects/cities');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message_en || t('error_fetching_cities'));
            }
            setCities(data);
        } catch (err) {
            console.error('Error fetching cities:', err);
            setError(err.message || t('error_fetching_cities_unexpected'));
        } finally {
            setLoading(false);
        }
    }, [t, setCities, setLoading, setError]); // Add dependencies for useCallback

    useEffect(() => {
        fetchCities();
    }, [fetchCities]); // Add fetchCities as a dependency

    const handleAddCity = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newCityName || !newCityCountry) {
            setError(t('fill_all_fields'));
            return;
        }
        try {
            const response = await fetch('/api/v1/projects/cities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newCityName, country: newCityCountry }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message_en || t('error_adding_city'));
            }
            fetchCities(); // Re-fetch cities to update the list
            setNewCityName('');
            setNewCityCountry('');
        } catch (err) {
            console.error('Error adding city:', err);
            setError(err.message || t('error_adding_city_unexpected'));
        }
    };

    const handleEditCity = (city) => {
        setEditingCity(city);
        setEditCityName(city.name);
        setEditCityCountry(city.country);
    };

    const handleUpdateCity = async (e) => {
        e.preventDefault();
        setError(null);
        if (!editCityName || !editCityCountry) {
            setError(t('fill_all_fields'));
            return;
        }
        try {
            const response = await fetch(`/api/v1/projects/cities/${editingCity.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editCityName, country: editCityCountry }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message_en || t('error_updating_city'));
            }
            fetchCities(); // Re-fetch cities to update the list
            setEditingCity(null);
            setEditCityName('');
            setEditCityCountry('');
        } catch (err) {
            console.error('Error updating city:', err);
            setError(err.message || t('error_updating_city_unexpected'));
        }
    };

    const handleDeleteCity = async (cityId) => {
        if (!window.confirm(t('confirm_delete_city'))) {
            return;
        }
        setError(null);
        try {
            const response = await fetch(`/api/v1/projects/cities/${cityId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json(); // Attempt to parse error message
                throw new Error(errorData.message_en || t('error_deleting_city'));
            }
            fetchCities(); // Re-fetch cities to update the list
        } catch (err) {
            console.error('Error deleting city:', err);
            setError(err.message || t('error_deleting_city_unexpected'));
        }
    };

    if (loading) {
        return <div className="text-center p-4">{t('loading_cities')}</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('city_management_title')}</h1>

            {/* Add New City Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">{t('add_new_city')}</h2>
                <form onSubmit={handleAddCity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('city_name_placeholder')}
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={t('city_country_placeholder')}
                        value={newCityCountry}
                        onChange={(e) => setNewCityCountry(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline md:col-span-2"
                    >
                        {t('add_city_button')}
                    </button>
                </form>
            </div>

            {/* List of Cities */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">{t('existing_cities')}</h2>
                {cities.length === 0 ? (
                    <p>{t('no_cities_found')}</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {cities.map((city) => (
                            <li key={city.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                                {editingCity && editingCity.id === city.id ? (
                                    <form onSubmit={handleUpdateCity} className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={editCityName}
                                            onChange={(e) => setEditCityName(e.target.value)}
                                            required
                                        />
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={editCityCountry}
                                            onChange={(e) => setEditCityCountry(e.target.value)}
                                            required
                                        />
                                        <div className="flex space-x-2">
                                            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('save_button')}</button>
                                            <button type="button" onClick={() => setEditingCity(null)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('cancel_button')}</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex-grow">
                                            <p className="text-lg font-semibold">{city.name}, {city.country}</p>
                                            <p className="text-sm text-gray-500">ID: {city.id}</p>
                                        </div>
                                        <div className="flex space-x-2 mt-2 md:mt-0">
                                            <button onClick={() => handleEditCity(city)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('edit_button')}</button>
                                            <button onClick={() => handleDeleteCity(city.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline">{t('delete_button')}</button>
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

export default CityManagement;

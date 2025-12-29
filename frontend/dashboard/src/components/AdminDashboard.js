import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-6">{t('admin_dashboard_title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/admin/cities" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center">
                    <svg className="w-12 h-12 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 20h6M9 4h6M8 20h8"></path></svg>
                    <h2 className="text-lg font-semibold">{t('city_management_link')}</h2>
                    <p className="text-gray-600 text-sm">{t('manage_cities_description')}</p>
                </Link>

                <Link to="/admin/service-points" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center">
                    <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <h2 className="text-lg font-semibold">{t('service_point_management_link')}</h2>
                    <p className="text-gray-600 text-sm">{t('manage_service_points_description')}</p>
                </Link>
                
                <Link to="/admin/washing-stations" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center">
                    <svg className="w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 8a8 8 0 01-8-8 8 8 0 0116 0c0 1.34-1.34 3.73-3.04 5.34L12 17l-3.96-3.66C6.34 13.73 5 11.34 5 10a8 8 0 0116 0z"></path></svg>
                    <h2 className="text-lg font-semibold">{t('washing_station_management_link')}</h2>
                    <p className="text-gray-600 text-sm">{t('manage_washing_stations_description')}</p>
                </Link>
                
                <Link to="/admin/user-assignments" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center">
                    <svg className="w-12 h-12 text-purple-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354c.333-.333.667-.333 1 0l3.042 3.041a5 5 0 011.373 3.333V15a2 2 0 01-2 2H7a2 2 0 01-2-2v-4.272a5 5 0 011.373-3.333L11 4.354z"></path></svg>
                    <h2 className="text-lg font-semibold">{t('user_assignment_management_title')}</h2>
                    <p className="text-gray-600 text-sm">{t('manage_user_assignments')}</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next'; // Import useTranslation
// import supabase from '../db/supabase'; // Removed direct Supabase import

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const FinanceCharts = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const [revenues, setRevenues] = useState({ daily: {}, monthly: {} });
    const [servicePoints, setServicePoints] = useState([]);
    const [selectedServicePointId, setSelectedServicePointId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingServicePoints, setLoadingServicePoints] = useState(true);

    // Fetch Service Points on component mount
    useEffect(() => {
        const fetchServicePoints = async () => {
            setError(null);
            setLoadingServicePoints(true);
            try {
                // Fetch service points from project-service API
                const response = await axios.get('http://localhost:5002/api/v1/projects/service-points'); // Assuming this endpoint exists
                
                setServicePoints(response.data);
                if (response.data.length > 0) {
                    setSelectedServicePointId(response.data[0].id); // Select the first one by default
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


    useEffect(() => {
        if (!selectedServicePointId) {
            setRevenues({ daily: {}, monthly: {} });
            setLoading(false);
            return;
        }

        const fetchRevenues = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5004/api/v1/finance/revenues?service_point_id=${selectedServicePointId}`);
                setRevenues(response.data);
            } catch (err) {
                setError(t('error_loading_financial_data'));
                console.error('Error fetching revenues:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenues();
    }, [selectedServicePointId, t]); // Re-run when selectedServicePointId changes

    if (loadingServicePoints) {
        return <div className="text-center p-4">{t('loading_service_points')}</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    // Préparation des données pour les graphiques
    const dailyLabels = Object.keys(revenues.daily).sort();
    const dailyData = dailyLabels.map(label => revenues.daily[label]);

    const monthlyLabels = Object.keys(revenues.monthly).sort();
    const monthlyData = monthlyLabels.map(label => revenues.monthly[label]);

    const dailyChartData = {
        labels: dailyLabels,
        datasets: [
            {
                label: t('daily_revenues') + ' (CFA)',
                data: dailyData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    const monthlyChartData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: t('monthly_revenues') + ' (CFA)',
                data: monthlyData,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('finance_charts_title')}</h1>

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

            {loading ? (
                 <div className="text-center text-gray-500">{t('fetching_financial_data')}</div>
            ) : (
                <>
                    <div className="mb-8">
                        <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('daily_revenues')}</h2>
                        {dailyLabels.length > 0 ? (
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <Line data={dailyChartData} />
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">{t('no_daily_revenue_data')}</div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('monthly_revenues')}</h2>
                        {monthlyLabels.length > 0 ? (
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <Line data={monthlyChartData} />
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">{t('no_monthly_revenue_data')}</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default FinanceCharts;

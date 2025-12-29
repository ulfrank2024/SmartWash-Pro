import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Assuming you have a way to get the current user's assigned service point, e.g., from an auth context
// For now, we'll hardcode a dummy service point ID for demonstration
const MOCK_USER_ASSIGNED_SERVICE_POINT_ID = 'b736735e-c35d-4f01-90c7-1d5d36e76879'; // Replace with a valid UUID from your Supabase


const CashAuditView = () => {
    const { t } = useTranslation();
    const [declaredAmount, setDeclaredAmount] = useState('');
    const [digitalAmount, setDigitalAmount] = useState(0);
    const [discrepancy, setDiscrepancy] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [assignedServicePointId, setAssignedServicePointId] = useState(MOCK_USER_ASSIGNED_SERVICE_POINT_ID);
    const [servicePointName, setServicePointName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [auditPeriodStart, setAuditPeriodStart] = useState('');
    const [auditPeriodEnd, setAuditPeriodEnd] = useState('');

    useEffect(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
        setAuditPeriodStart(startOfToday);
        setAuditPeriodEnd(endOfToday);

        const fetchAuditData = async () => {
            if (!assignedServicePointId) {
                setError(t('no_assigned_service_point'));
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // Fetch service point name
                const spResponse = await fetch(`/api/v1/projects/service-points/${assignedServicePointId}`);
                const spData = await spResponse.json();
                if (!spResponse.ok) {
                    throw new Error(spData.message_en || 'Failed to fetch service point details');
                }
                setServicePointName(spData.name);

                // Fetch electronic total for the service point for the current audit period
                const financeResponse = await fetch(`/api/v1/finance/report?service_point_id=${assignedServicePointId}&start_date=${startOfToday}&end_date=${endOfToday}`);
                const financeData = await financeResponse.json();

                if (!financeResponse.ok) {
                    throw new Error(financeData.message_en || 'Failed to fetch electronic total');
                }
                setDigitalAmount(financeData.report.totalRevenue);

            } catch (err) {
                console.error('Error fetching audit data:', err);
                setError(t('error_fetching_audit_data') + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAuditData();
    }, [assignedServicePointId, auditPeriodStart, auditPeriodEnd, t]);

    const handleDeclaredAmountChange = (e) => {
        const amount = parseFloat(e.target.value);
        setDeclaredAmount(e.target.value);
        if (!isNaN(amount)) {
            setDiscrepancy(amount - digitalAmount);
        } else {
            setDiscrepancy(0);
        }
    };

    const handleSubmitAudit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!assignedServicePointId) {
            setError(t('no_assigned_service_point'));
            return;
        }

        try {
            const response = await fetch('/api/v1/finance/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    declared_cash: parseFloat(declaredAmount),
                    service_point_id: assignedServicePointId,
                    period_start: auditPeriodStart,
                    period_end: auditPeriodEnd
                }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message_en || 'Failed to submit audit');
            }

            alert(t('audit_submitted_successfully'));
            // Optionally re-fetch data to reflect changes or clear form
            setDeclaredAmount('');
            setDiscrepancy(0);
        } catch (err) {
            console.error('Error submitting audit:', err);
            setError(t('error_submitting_audit') + err.message);
        }
    };

    const discrepancyClass = discrepancy === 0 ? 'text-gray-700' :
                             discrepancy > 0 ? 'text-green-500' : 'text-red-500';

    if (loading) {
        return <div className="text-center p-4">{t('loading')}</div>; // Assuming a generic loading translation
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('cash_audit_title')}</h1>
            {assignedServicePointId && servicePointName && (
                <p className="mb-4 text-lg">{t('audit_for_service_point')} <span className="font-semibold">{servicePointName}</span></p>
            )}
            
            <form onSubmit={handleSubmitAudit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                <div className="mb-4">
                    <label htmlFor="digitalAmount" className="block text-gray-700 text-sm font-bold mb-2">
                        {t('digital_recorded_amount')}:
                    </label>
                    <input
                        type="text"
                        id="digitalAmount"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                        value={`${digitalAmount} ${t('cfa')}`}
                        readOnly
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="declaredAmount" className="block text-gray-700 text-sm font-bold mb-2">
                        {t('declared_cash_amount')}:
                    </label>
                    <input
                        type="number"
                        id="declaredAmount"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={declaredAmount}
                        onChange={handleDeclaredAmountChange}
                        placeholder={t('enter_declared_amount')}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        {t('discrepancy')}:
                    </label>
                    <p className={`text-lg font-bold ${discrepancyClass}`}>
                        {discrepancy} {t('cfa')}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {t('submit_audit')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CashAuditView;
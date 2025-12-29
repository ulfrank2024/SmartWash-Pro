import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import supabase from '../db/supabase'; // Removed direct Supabase import

const UserAssignmentManagement = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [servicePoints, setServicePoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const ROLES = ['Admin', 'Investor', 'Manager', 'Employee', 'CashCollector', 'MaintenancePersonnel'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Users (from profiles table, including role and assigned_service_point_id)
            const usersResponse = await fetch('/api/v1/auth/users'); // Assuming this endpoint exists in auth-service
            const usersData = await usersResponse.json();

            if (!usersResponse.ok) {
                throw new Error(usersData.message_en || t('error_fetching_users'));
            }
            setUsers(usersData);

            // Fetch Service Points
            const spResponse = await fetch('/api/v1/projects/service-points');
            const spData = await spResponse.json();

            if (!spResponse.ok) {
                throw new Error(spData.message_en || t('error_fetching_service_points'));
            }
            setServicePoints(spData);
        } catch (err) {
            console.error('Unexpected error fetching data:', err);
            setError(err.message || t('error_fetching_data_unexpected'));
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setError(null);
        try {
            // Call auth-service API to update user role
            const response = await fetch(`/api/v1/auth/users/${userId}/role`, { // Adjust API endpoint based on your setup
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message_en || 'Failed to update user role');
            }

            setUsers(users.map(user =>
                user.user_id === userId ? { ...user, role: newRole } : user
            ));
            alert(t('user_role_updated_successfully'));
        } catch (err) {
            console.error('Error updating user role:', err);
            setError(t('error_updating_user_role') + err.message);
        }
    };

    const handleServicePointAssignment = async (userId, newServicePointId) => {
        setError(null);
        try {
            // Call auth-service API to assign/unassign service point
            const response = await fetch(`/api/v1/auth/users/${userId}/assign-service-point`, { // Adjust API endpoint
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ service_point_id: newServicePointId || null }), // Pass null to unassign
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message_en || 'Failed to assign service point');
            }

            setUsers(users.map(user =>
                user.user_id === userId ? { ...user, assigned_service_point_id: newServicePointId } : user
            ));
            alert(t('user_service_point_assigned_successfully'));
        } catch (err) {
            console.error('Error assigning service point:', err);
            setError(t('error_assigning_service_point') + err.message);
        }
    };

    if (loading) {
        return <div className="text-center p-4">{t('loading_users')}</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('user_assignment_management_title')}</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">{t('manage_user_assignments')}</h2>
                {users.length === 0 ? (
                    <p>{t('no_users_found')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user_email')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user_role')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('assigned_service_point')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.user_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                value={user.role || ''}
                                                onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">{t('select_role_placeholder')}</option>
                                                {ROLES.map(role => (
                                                    <option key={role} value={role}>{t(`role_${role.toLowerCase()}`)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                value={user.assigned_service_point_id || ''}
                                                onChange={(e) => handleServicePointAssignment(user.user_id, e.target.value || null)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">{t('unassigned_service_point')}</option>
                                                {servicePoints.map(sp => (
                                                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Action buttons if any, e.g., reset password, delete user (requires more auth service endpoints) */}
                                            {/* <button className="text-indigo-600 hover:text-indigo-900">{t('view_details')}</button> */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAssignmentManagement;

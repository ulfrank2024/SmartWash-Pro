import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const InvestorView = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Remplacer par l'URL réelle de votre service de projet
                const response = await axios.get('http://localhost:5002/api/v1/projects');
                setProjects(response.data);
            } catch (err) {
                setError(t('error_loading_projects'));
                console.error('Error fetching projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [t]);

    if (loading) {
        return <div className="text-center p-4">{t('loading_projects')}</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('investor_view_title')}</h1>
            {projects.length === 0 ? (
                <div className="text-center text-gray-500">{t('no_projects_found')}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white p-4 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                            <p className="text-gray-700">{t('description')}: {project.description}</p>
                            <p className="text-gray-700">{t('budget')}: {project.budget_amount} {t('cfa')}</p>
                            {/* Ajoutez ici plus de détails sur le projet si nécessaire */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestorView;

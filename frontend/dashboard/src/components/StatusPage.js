import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Données factices pour la simulation
const initialEvents = [
  { id: 1, name: 'Lancement machine #3', status: 'archived' },
  { id: 2, name: 'Erreur capteur de pression', status: 'not_archived' },
  { id: 3, name: 'Maintenance pompe #1', status: 'not_archived' },
  { id: 4, name: 'Cycle de lavage terminé', status: 'archived' },
  { id: 5, name: 'Alerte niveau de savon bas', status: 'not_archived' },
];

const StatusBadge = ({ status }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const isArchived = status === 'archived';
  const label = isArchived ? t('archived_status') : t('not_archived_status');
  const color = isArchived ? 'bg-red-500' : 'bg-green-500';

  return (
    <span className={`px-2 py-1 text-white text-sm rounded-full ${color}`}>
      {label}
    </span>
  );
};

const StatusPage = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [events, setEvents] = useState(initialEvents);
  const [filter, setFilter] = useState('');

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-100 min-h-screen"> {/* Adjusted padding */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg"> {/* Adjusted padding */}
        <h1 className="text-xl sm:text-2xl font-bold mb-4">{t('event_management_status')}</h1> {/* Adjusted font size */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t('filter_events_placeholder')}
            value={filter}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <ul>
          {filteredEvents.map(event => (
            <li key={event.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
              <span className="text-gray-800">{event.name}</span>
              <StatusBadge status={event.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatusPage;

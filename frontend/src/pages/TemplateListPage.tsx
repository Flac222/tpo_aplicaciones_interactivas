// src/pages/TemplateListPage.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { TaskTemplate } from '../types/templates';
import { TemplateCard } from '../components/TemplateComponets';

const BASE_URL = 'http://localhost:3000';

export function TemplateListPage() {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    
    // Construcción de URL con filtros para el backend
    const url = useMemo(() => {
        const params = new URLSearchParams();
        if (teamFilter) params.append('teamId', teamFilter);
        if (searchTerm) params.append('search', searchTerm);
        // params.append('limit', '50'); // Opcional, paginación
        return `${BASE_URL}/api/tasktemplates?${params.toString()}`;
    }, [teamFilter, searchTerm]);

    const { data, loading, error, refetch } = useFetch<{ templates: TaskTemplate[], total: number }>(
        token ? url : null,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta plantilla?")) return;
        try {
            const res = await fetch(`${BASE_URL}/api/tasktemplates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Error al eliminar");
            refetch();
        } catch (err) {
            alert("No se pudo eliminar la plantilla");
        }
    };

    return (
        <div className="main-content">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 className="card-title">Mis Templates</h2>
                    <Link to="/templates/new">
                        <button>+ Nueva Template</button>
                    </Link>
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', flex: 1 }}
                    />
                    {/* Nota: Idealmente cargarías los equipos del usuario para llenar este select */}
                    <input 
                        type="text" 
                        placeholder="ID de Equipo (Opcional)" 
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        style={{ padding: '0.5rem' }}
                    />
                </div>

                {loading && <p>Cargando templates...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                {!loading && data?.templates.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666' }}>No hay templates. ¡Crea la primera!</p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {data?.templates.map(tpl => (
                        <TemplateCard key={tpl.id} template={tpl} onDelete={handleDelete} />
                    ))}
                </div>
            </div>
        </div>
    );
}
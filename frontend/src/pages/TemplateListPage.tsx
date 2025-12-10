// src/pages/TemplateListPage.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
// Asumo que estos tipos están definidos en tu proyecto
import { TaskTemplate, EquipoSimple } from '../types/templates'; 
import { TemplateCard } from '../components/TemplateComponets';

const BASE_URL = 'http://localhost:3000';

export function TemplateListPage() {
    const { token, usuario } = useAuth();
    const userId = usuario?.id;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState(''); // Contiene el ID del equipo

    // 💡 SOLUCIÓN 1: Memoizar las opciones de fetch para evitar recargas constantes
    const fetchOptions: RequestInit = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]); 

    // 2. Fetch de la lista de equipos del usuario (para el filtro)
    const teamUrl = (token && userId) 
        ? `${BASE_URL}/api/equipos/equipos/${userId}` 
        : null;

    const { data: userTeams, loading: loadingTeams } = useFetch<EquipoSimple[]>(
        teamUrl,
        fetchOptions // Usamos opciones memoizadas
    );
    
    // 3. Construcción de URL de Templates (memoizada)
    const templateUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (teamFilter) params.append('teamId', teamFilter);
        if (searchTerm) params.append('search', searchTerm);
        return `${BASE_URL}/api/tasktemplates?${params.toString()}`;
    }, [teamFilter, searchTerm]); 

    // 4. Fetch de las Templates
    const { data, loading, error, refetch } = useFetch<{ templates: TaskTemplate[], total: number }>(
        token ? templateUrl : null, 
        fetchOptions // Usamos opciones memoizadas
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
                        placeholder="Buscar por nombre/descripción..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', flex: 1 }}
                    />
                    
                    {/* 💡 CAMBIO 3: Selector desplegable para filtrar por Equipo */}
                    <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        style={{ padding: '0.5rem', minWidth: '200px' }}
                        disabled={loadingTeams}
                    >
                        <option value="">{loadingTeams ? 'Cargando equipos...' : 'Filtrar por Equipo (Todos)'}</option>
                        {/* Se llena con los equipos cargados */}
                        {userTeams?.map(team => (
                            <option key={team.id} value={team.id}>{team.nombre}</option>
                        ))}
                    </select>
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
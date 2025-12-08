// src/pages/TemplateUsePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TaskPreFillDTO } from '../types/templates';

const BASE_URL = 'http://localhost:3000';

export function TemplateUsePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [previewData, setPreviewData] = useState<TaskPreFillDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Campos personalizables antes de aplicar
    const [customTitle, setCustomTitle] = useState('');
    const [customTeamId, setCustomTeamId] = useState('');

    useEffect(() => {
        if (!id || !token) return;

        // Fetch al endpoint de preview (Requisito 3 API)
        fetch(`${BASE_URL}/api/tasktemplates/${id}/preview`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
            if (!res.ok) throw new Error("Error cargando preview");
            const data: TaskPreFillDTO = await res.json();
            setPreviewData(data);
            setCustomTitle(data.title); // Prellenar con el nombre de la template
            setCustomTeamId(data.teamId || '');
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));

    }, [id, token]);

    const handleApply = () => {
        if (!customTeamId) {
            alert("Debes ingresar el ID del equipo donde crearás la tarea.");
            return;
        }

        // Construimos el objeto de datos finales
        const finalData = {
            ...previewData,
            title: customTitle,
            teamId: customTeamId,
            // Importante: El originTemplateId ya viene en previewData
        };

        // REDIRECCIÓN: Vamos a la página del equipo y pasamos los datos en el 'state'
        // El EquipoPage deberá leer este state y abrir el modal.
        navigate(`/equipo/${customTeamId}`, { 
            state: { prefillTask: finalData } 
        });
    };

    if (loading) return <div className="main-content"><p>Cargando vista previa...</p></div>;
    if (error) return <div className="main-content"><p>Error: {error}</p></div>;
    if (!previewData) return null;

    return (
        <div className="main-content">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="card-title">Usar Template</h2>
                <p>Personaliza la tarea antes de crearla.</p>

                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Vista Previa</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Título de la Tarea</label>
                        <input 
                            type="text" 
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Equipo Destino (ID)</label>
                        <input 
                            type="text" 
                            value={customTeamId}
                            onChange={(e) => setCustomTeamId(e.target.value)}
                            placeholder={previewData.teamId || "Pega el UUID del equipo"}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>

                    <p><strong>Descripción:</strong> {previewData.description || 'Sin descripción'}</p>
                    <p><strong>Prioridad:</strong> {previewData.priority}</p>
                    <p><strong>Etiquetas (IDs):</strong> {previewData.tagIds.length} seleccionadas</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="secondary" onClick={() => navigate('/templates')}>Cancelar</button>
                    <button onClick={handleApply}>Confirmar y Crear Tarea</button>
                </div>
            </div>
        </div>
    );
}
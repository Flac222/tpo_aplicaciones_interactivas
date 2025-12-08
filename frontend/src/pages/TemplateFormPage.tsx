// src/pages/TemplateFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { PrioridadTarea, Etiqueta } from '../types/tareas';
import { TaskTemplateCreateDTO } from '../types/templates';
import { TagSelector } from '../components/TemplateComponets';

const BASE_URL = 'http://localhost:3000';

export function TemplateFormPage() {
    const { id } = useParams(); // Si hay ID, es edición
    const navigate = useNavigate();
    const { token, usuario } = useAuth();
    const isEditing = !!id;

    // Estados del formulario
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
    const [teamId, setTeamId] = useState(''); // Opcional
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Cargar equipos (para el select) y etiquetas (para el selector)
    // Nota: Para simplificar, cargamos etiquetas del primer equipo del usuario o globales si tu API lo permite.
    // Aquí asumimos que obtenemos las etiquetas de algun endpoint general o del equipo seleccionado.
    // *Para cumplir la consigna rápido*: Usaremos las etiquetas del equipo si se selecciona uno.
    const [availableTags, setAvailableTags] = useState<Etiqueta[]>([]);

    // Fetch de datos si es edición
    useEffect(() => {
        if (isEditing && token) {
            fetch(`${BASE_URL}/api/tasktemplates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                setName(data.name);
                setDescription(data.description || '');
                setPriority(data.priority);
                setTeamId(data.teamId || '');
                // Map tags objects to IDs
                setSelectedTagIds(data.tags.map((t: any) => t.id));
            })
            .catch(err => setFormError("Error al cargar la template."));
        }
    }, [isEditing, id, token]);

    // Efecto simulado para cargar etiquetas cuando cambia el teamId
    // (En una app real, harías fetch a /api/etiquetas/equipos/:teamId)
    useEffect(() => {
        if (teamId && token) {
            fetch(`${BASE_URL}/api/etiquetas/equipos/${teamId}/etiquetas`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => setAvailableTags(data));
        }
    }, [teamId, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim()) {
            setFormError("El nombre es requerido.");
            return;
        }

        setSaving(true);
        const payload: TaskTemplateCreateDTO = {
            name,
            description,
            priority,
            teamId: teamId || undefined,
            tagIds: selectedTagIds
        };

        try {
            const url = isEditing 
                ? `${BASE_URL}/api/tasktemplates/${id}` 
                : `${BASE_URL}/api/tasktemplates`;
            
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                // Manejo de errores sin ALERT (Consigna: "name duplicado, no utilizar alert")
                throw new Error(data.message || "Error al guardar");
            }

            navigate('/templates'); // Éxito: Redirigir a lista
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="main-content">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>{isEditing ? 'Editar Template' : 'Nueva Template'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Nombre *</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            style={{ width: '100%', padding: '0.5rem' }}
                            placeholder="Ej: Reporte de Bug"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label>Descripción</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            style={{ width: '100%', minHeight: '80px', padding: '0.5rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label>Prioridad</label>
                            <select 
                                value={priority} 
                                onChange={e => setPriority(e.target.value as PrioridadTarea)}
                                style={{ width: '100%', padding: '0.5rem' }}
                            >
                                {Object.values(PrioridadTarea).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>ID Equipo (para cargar etiquetas)</label>
                            <input 
                                type="text"
                                value={teamId}
                                onChange={e => setTeamId(e.target.value)}
                                placeholder="UUID del equipo"
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                            <small style={{ color: '#666' }}>Pega el ID de un equipo para ver sus etiquetas</small>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', border: '1px solid #eee', padding: '1rem', borderRadius: '8px' }}>
                        <label>Etiquetas</label>
                        {availableTags.length === 0 ? (
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Ingresa un ID de equipo válido para cargar etiquetas.</p>
                        ) : (
                            <TagSelector 
                                allTags={availableTags}
                                selectedTagIds={selectedTagIds}
                                onChange={setSelectedTagIds}
                            />
                        )}
                    </div>

                    {formError && (
                        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                            {formError}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={() => navigate('/templates')} className="secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// src/components/TemplateComponents.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { TaskTemplate } from '../types/templates';
import { Etiqueta, getPriorityColor } from '../types/tareas';

// --- TagSelector (Sin cambios) ---
interface TagSelectorProps {
    allTags: Etiqueta[];
    selectedTagIds: string[];
    onChange: (newIds: string[]) => void;
    disabled?: boolean; 
}

export const TagSelector: React.FC<TagSelectorProps> = ({ allTags, selectedTagIds, onChange, disabled = false }) => {
    const handleToggle = (tagId: string) => {
        if (disabled) return;
        if (selectedTagIds.includes(tagId)) {
            onChange(selectedTagIds.filter(id => id !== tagId));
        } else {
            onChange([...selectedTagIds, tagId]);
        }
    };

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {allTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                    <span
                        key={tag.id}
                        onClick={() => handleToggle(tag.id)}
                        style={{
                            cursor: disabled ? 'default' : 'pointer',
                            padding: '4px 10px',
                            borderRadius: '15px',
                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--bg-tertiary)',
                            backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            opacity: disabled ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                            fontSize: '0.8rem',
                        }}
                    >
                        {tag.nombre}
                    </span>
                );
            })}
        </div>
    );
};

// --- TemplateTagDisplay ---
interface TemplateTagDisplayProps {
    tags: Etiqueta[];
}

export const TemplateTagDisplay: React.FC<TemplateTagDisplayProps> = ({ tags }) => {
    return (
        <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem', 
            marginTop: '0.5rem', 
            maxHeight: '4rem', 
            overflowY: 'auto',
            paddingRight: '5px'
        }}>
            {tags.length === 0 ? (
                <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin etiquetas.</span>
            ) : (
                tags.map(tag => (
                    <span 
                        key={tag.id} 
                        style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            backgroundColor: '#e2e8f0', 
                            color: '#2d3748', 
                            border: '1px solid #cbd5e0'
                        }}
                        title={tag.nombre}
                    >
                        {tag.nombre}
                    </span>
                ))
            )}
        </div>
    );
};

// --- TemplateCard  ---
interface TemplateCardProps {
    template: TaskTemplate;
    onDelete: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDelete }) => {
    return (
        <div className="card" style={{ 
            padding: '1rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderLeft: `5px solid ${getPriorityColor(template.priority)}` 
        }}>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {template.name}
                <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: getPriorityColor(template.priority), color: '#fff' }}>
                    {template.priority}
                </span>
            </h3>
            
            <p style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)', 
                marginTop: '0.5rem', 
                whiteSpace: 'pre-wrap',
                maxHeight: '3rem',
                overflowY: 'hidden'
            }}>
                {template.description || "Sin descripción."}
            </p>
            
            {/* Información del equipo */}
            <div style={{ fontSize: '0.85rem', marginTop: '0.8rem' }}>
                Equipo: <span style={{ fontWeight: 'bold' }}>{template.teamName || 'Global'}</span>
            </div>

            {/*DISPLAY DE ETIQUETAS ASOCIADAS A LA TEMPLATE */}
            <div style={{ marginTop: '0.8rem' }}>
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Etiquetas de la Template:</h4>
                <TemplateTagDisplay tags={template.tags} />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                
                {/* Botón de 'Editar'*/}
                <Link to={`/templates/${template.id}/edit`} style={{ textDecoration: 'none', fontSize: '1.2rem', color: 'var(--text-secondary)' }} title="Editar Template">
                    ⚙️
                </Link>

                {/* Botón principal 'Usar' */}
                <Link 
                    to={`/templates/${template.id}`} 
                    className="button-primary" 
                    style={{ 
                        textDecoration: 'none', 
                        fontSize: '0.8rem', 
                        padding: '0.3rem 0.6rem', 
                        backgroundColor: 'var(--color-success)', 
                        fontWeight: 'bold' 
                    }}
                >
                    🚀 Usar
                </Link>

                <button 
                    onClick={() => onDelete(template.id)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-error)' }}
                    title="Eliminar"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};
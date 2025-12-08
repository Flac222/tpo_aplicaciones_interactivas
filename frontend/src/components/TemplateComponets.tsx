// src/components/TemplateComponents.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TaskTemplate } from '../types/templates';
import { Etiqueta, getPriorityColor } from '../types/tareas';

// --- TagSelector ---
interface TagSelectorProps {
    allTags: Etiqueta[];
    selectedTagIds: string[];
    onChange: (newIds: string[]) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ allTags, selectedTagIds, onChange }) => {
    const handleToggle = (tagId: string) => {
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
                            cursor: 'pointer',
                            padding: '4px 10px',
                            borderRadius: '15px',
                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid #ccc',
                            backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                            color: isSelected ? 'var(--color-primary-dark)' : 'inherit',
                            fontWeight: isSelected ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tag.nombre} {isSelected ? '✓' : '+'}
                    </span>
                );
            })}
        </div>
    );
};

// --- TemplateCard ---
interface TemplateCardProps {
    template: TaskTemplate;
    onDelete: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDelete }) => {
    return (
        <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: 'var(--bg-lightest)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            position: 'relative'
        }}>
            <div style={{ borderLeft: `4px solid ${getPriorityColor(template.priority)}`, paddingLeft: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{template.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
                    {template.description || 'Sin descripción'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>
                        {template.teamName ? `Equipo: ${template.teamName}` : 'Personal'}
                    </span>
                    <span style={{ backgroundColor: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>
                        🏷️ {template.tags.length} tags
                    </span>
                </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                 {/* Botón Aplicar (Redirige al flujo de uso) */}
                <Link to={`/templates/${template.id}/use`} className="button-primary" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                    🚀 Usar
                </Link>
                <Link to={`/templates/${template.id}`} className="button-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.3rem 0.6rem', border: '1px solid #ccc', borderRadius:'4px' }}>
                    Ver
                </Link>
                <Link to={`/templates/${template.id}/edit`} style={{ textDecoration: 'none', fontSize: '1.2rem' }} title="Editar">
                    ✏️
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
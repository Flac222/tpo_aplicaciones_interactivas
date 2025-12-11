
import React from 'react';
import { Watcher } from '../types/watchers';
import { useWatchers } from '../hooks/useWatchers';

// Styles could be moved to CSS, inline for speed as per style
const styles = {
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#CBD5E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        color: '#2D3748',
        border: '2px solid white',
        fontWeight: 'bold',
    },
    skeleton: {
        backgroundColor: '#E2E8F0',
        animation: 'pulse 1.5s infinite',
        borderRadius: '4px',
    }
};

interface WatcherAvatarProps {
    watcher: Watcher;
}

export const WatcherAvatar: React.FC<WatcherAvatarProps> = ({ watcher }) => {
    return (
        <div style={styles.avatar} title={watcher.name}>
            {watcher.avatar || watcher.name.charAt(0).toUpperCase()}
        </div>
    );
};

interface WatcherAvatarGroupProps {
    taskId: string;
    limit?: number;
}

export const WatcherAvatarGroup: React.FC<WatcherAvatarGroupProps> = ({ taskId, limit = 5 }) => {
    const { watchers, loading } = useWatchers(taskId);

    if (loading) {
        return (
            <div style={{ display: 'flex', gap: '-8px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ ...styles.avatar, ...styles.skeleton, border: 'none' }} />
                ))}
            </div>
        );
    }

    if (watchers.length === 0) {
        return <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sin observadores</span>;
    }

    const displayWatchers = watchers.slice(0, limit);
    const extraCount = watchers.length - limit;

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', marginLeft: '10px' }}>
                {displayWatchers.map((w, index) => (
                    <div key={w.id} style={{ marginLeft: index === 0 ? 0 : '-10px', zIndex: 10 + index }}>
                        <WatcherAvatar watcher={w} />
                    </div>
                ))}
                {extraCount > 0 && (
                    <div style={{ ...styles.avatar, marginLeft: '-10px', backgroundColor: '#718096', color: 'white', zIndex: 20 }}>
                        +{extraCount}
                    </div>
                )}
            </div>
        </div>
    );
};

interface WatchToggleButtonProps {
    taskId: string;
    isSubscribed: boolean;
    onToggle: () => void;
    loading?: boolean;
}

export const WatchToggleButton: React.FC<WatchToggleButtonProps> = ({ isSubscribed, onToggle, loading }) => {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            disabled={loading}
            style={{
                padding: '5px 10px',
                borderRadius: '4px',
                border: '1px solid var(--color-primary)',
                backgroundColor: isSubscribed ? 'var(--bg-lightest)' : 'var(--color-primary)',
                color: isSubscribed ? 'var(--color-primary)' : 'white',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                opacity: loading ? 0.7 : 1
            }}
        >
            {loading ? '...' : (isSubscribed ? '👁️ Dejar de seguir' : '👁️ Seguir')}
        </button>
    );
};

export const TaskWatcherSection: React.FC<{ taskId: string, currentUserId: string }> = ({ taskId, currentUserId }) => {
    const { watchers, loading, subscribing, subscribe, unsubscribe, isUserWatching } = useWatchers(taskId);
    const isSubscribed = isUserWatching(currentUserId);

    const handleToggle = () => {
        if (isSubscribed) unsubscribe();
        else subscribe();
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Observadores:</span>
                {loading && watchers.length === 0 ? (
                    <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>Cargando...</span>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {watchers.length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nadie sigue esta tarea aún.</span>
                        ) : (
                            <div style={{ display: 'flex', marginLeft: '10px' }}>
                                {watchers.slice(0, 5).map((w, index) => (
                                    <div key={w.id} style={{ marginLeft: index === 0 ? 0 : '-10px', zIndex: 10 + index }}>
                                        <WatcherAvatar watcher={w} />
                                    </div>
                                ))}
                                {watchers.length > 5 && (
                                    <div style={{ ...styles.avatar, marginLeft: '-10px', backgroundColor: '#718096', color: 'white', zIndex: 20 }}>
                                        +{watchers.length - 5}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <WatchToggleButton
                taskId={taskId}
                isSubscribed={isSubscribed}
                onToggle={handleToggle}
                loading={subscribing}
            />
        </div>
    );
};

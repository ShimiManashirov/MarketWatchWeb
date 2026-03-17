import { useState } from 'react';
import { Image } from 'react-bootstrap';
import { User } from 'lucide-react';
import { getImageUrl } from '../services/api';

interface AvatarProps {
    src?: string | null;
    username?: string;
    size?: number;
    className?: string;
    border?: boolean;
}

const Avatar = ({ src, username, size = 40, className = '', border = false }: AvatarProps) => {
    const [error, setError] = useState(false);

    // Reset error when source changes
    useEffect(() => {
        setError(false);
    }, [src]);

    // Reset error if src changes
    const hasImage = src && src !== 'null' && src !== 'undefined' && src !== '' && !src.includes('undefined');

    if (hasImage && !error) {
        return (
            <div 
                className={`rounded-circle overflow-hidden d-flex align-items-center justify-content-center ${className} ${border ? 'border' : ''}`}
                style={{ width: `${size}px`, height: `${size}px` }}
            >
                <Image
                    src={getImageUrl(src)}
                    width={size}
                    height={size}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={() => setError(true)}
                    alt={username || 'User avatar'}
                />
            </div>
        );
    }

    // Fallback: Initials or Icon
    const initials = username ? username[0].toUpperCase() : null;

    return (
        <div 
            className={`rounded-circle d-flex align-items-center justify-content-center ${className} ${border ? 'border' : ''}`}
            style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                backgroundColor: initials ? 'rgba(13, 110, 253, 0.1)' : '#f8f9fa',
                color: initials ? '#0d6efd' : '#6c757d'
            }}
        >
            {initials ? (
                <span className="fw-bold" style={{ fontSize: `${size * 0.4}px` }}>{initials}</span>
            ) : (
                <User size={size * 0.6} />
            )}
        </div>
    );
};

export default Avatar;

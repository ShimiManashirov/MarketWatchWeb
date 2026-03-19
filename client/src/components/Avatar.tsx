import { useState, useEffect } from 'react';
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
    const hasImage = src && 
        src !== 'null' && 
        src !== 'undefined' && 
        src !== '' && 
        !src.includes('undefined') && 
        !src.includes('null');

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

    // Fallback: Initials or Icon with premium dynamic colors
    const initials = username ? username[0].toUpperCase() : null;
    
    // Generate a consistent color based on username
    const colors = [
        { bg: 'rgba(13, 110, 253, 0.1)', text: '#0d6efd' }, // Blue
        { bg: 'rgba(102, 16, 242, 0.1)', text: '#6610f2' }, // Indigo
        { bg: 'rgba(111, 66, 193, 0.1)', text: '#6f42c1' }, // Purple
        { bg: 'rgba(214, 51, 132, 0.1)', text: '#d63384' }, // Pink
        { bg: 'rgba(253, 126, 20, 0.1)', text: '#fd7e14' }, // Orange
        { bg: 'rgba(25, 135, 84, 0.1)', text: '#198754' }   // Green
    ];
    
    const colorIndex = username ? username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
    const selectedColor = colors[colorIndex];

    return (
        <div 
            className={`rounded-circle d-flex align-items-center justify-content-center ${className} ${border ? 'border' : ''}`}
            style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                backgroundColor: initials ? selectedColor.bg : '#f2f2f2',
                color: initials ? selectedColor.text : '#6c757d',
                fontSize: `${size * 0.4}px`,
                fontWeight: 600
            }}
        >
            {initials ? initials : <User size={size * 0.6} />}
        </div>
    );
};

export default Avatar;

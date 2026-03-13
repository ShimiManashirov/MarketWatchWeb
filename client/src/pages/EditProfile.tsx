import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import { Upload, User as UserIcon } from 'lucide-react';
import { getImageUrl } from '../services/api';

const EditProfile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.username || '');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image ? getImageUrl(user.image)! : null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setPreviewUrl(user.image ? getImageUrl(user.image)! : null);
        }
    }, [user]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData();
        if (username !== user?.username) {
            formData.append('username', username);
        }
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await updateProfile(formData);
            // Update auth context with new user data
            // Assuming response.data is the user object
            setUser(response.data);
            setSuccess('Profile updated successfully');
            setTimeout(() => navigate('/profile'), 1500); // Redirect to profile or home
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Card className="border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: '600px' }}>
                <Card.Body className="p-4">
                    <h3 className="fw-bold mb-4">Edit Profile</h3>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <div className="d-flex flex-column align-items-center mb-4">
                            <div className="position-relative mb-3">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        roundedCircle
                                        width={120}
                                        height={120}
                                        className="border"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '120px', height: '120px' }}>
                                        <UserIcon size={48} className="text-muted" />
                                    </div>
                                )}
                                <Form.Label
                                    htmlFor="profile-image-upload"
                                    className="position-absolute bottom-0 end-0 bg-white shadow-sm p-2 rounded-circle border cursor-pointer m-0"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Upload size={16} className="text-primary" />
                                </Form.Label>
                                <Form.Control
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="d-none"
                                />
                            </div>
                            <span className="text-muted small">Click camera icon to update photo</span>
                        </div>

                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label className="fw-medium">Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex gap-2 justify-content-end mt-4">
                            <Button variant="light" onClick={() => navigate(-1)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading} className="px-4">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditProfile;

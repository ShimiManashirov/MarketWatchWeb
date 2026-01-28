import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Container, Form, Button, Card, Alert, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { createPost } from '../services/postService';

const CreatePost = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            setError('Title and Content are required');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            await createPost(formData);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Card className="shadow-sm border-0 rounded-4 mx-auto" style={{ maxWidth: '600px' }}>
                <Card.Body className="p-4">
                    <h3 className="fw-bold mb-4">Create New Post</h3>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="postTitle">
                            <Form.Label className="fw-medium">Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="postContent">
                            <Form.Label className="fw-medium">Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-medium">Image (Optional)</Form.Label>

                            {!previewUrl ? (
                                <div className="border rounded-3 p-4 text-center bg-light" style={{ borderStyle: 'dashed' }}>
                                    <Form.Label htmlFor="image-upload" className="cursor-pointer mb-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ cursor: 'pointer' }}>
                                        <Upload className="text-muted mb-2" size={32} />
                                        <span className="text-muted">Click to upload image</span>
                                    </Form.Label>
                                    <Form.Control
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="d-none"
                                    />
                                </div>
                            ) : (
                                <div className="position-relative">
                                    <Image src={previewUrl} fluid rounded className="w-100" style={{ maxHeight: '300px', objectFit: 'cover' }} />
                                    <Button
                                        variant="dark"
                                        size="sm"
                                        className="position-absolute top-0 end-0 m-2 rounded-circle p-1 d-flex align-items-center justify-content-center"
                                        style={{ width: '30px', height: '30px' }}
                                        onClick={removeImage}
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            )}
                        </Form.Group>

                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="light" onClick={() => navigate('/')} disabled={loading}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={loading} className="px-4">
                                {loading ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreatePost;

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Card, Spinner, Button, Form, Dropdown } from 'react-bootstrap';
import { getPostById, updatePost, deletePost, type Post } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import CommentSection from '../components/CommentSection';
import { ArrowLeft, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import Avatar from '../components/Avatar';

const PostDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const response = await getPostById(id);
                setPost(response.data);
                setEditTitle(response.data.title || '');
                setEditContent(response.data.content || '');
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleDelete = async () => {
        if (!post || !window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePost(post._id);
            navigate('/');
        } catch (err: any) {
            console.error("Failed to delete post", err);
            alert("Failed to delete post");
        }
    };

    const handleUpdate = async () => {
        if (!post) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', editTitle);
            formData.append('content', editContent);
            const response = await updatePost(post._id, formData);
            setPost(response.data);
            setIsEditing(false);
        } catch (err: any) {
            console.error("Failed to update post", err);
            alert("Failed to update post");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <Container className="py-5 text-center">
                <h4 className="text-danger">{error || 'Post not found'}</h4>
                <Button variant="link" onClick={() => navigate(-1)}>Go Back</Button>
            </Container>
        );
    }

    return (
        <Container className="py-4" style={{ maxWidth: '800px' }}>
            <Button
                variant="link"
                className="text-decoration-none text-muted mb-3 p-0 d-flex align-items-center gap-1"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={18} /> Back
            </Button>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Header className="bg-white border-0 p-3 d-flex align-items-center gap-2">
                    <Avatar src={post.owner?.image} username={post.owner?.username} size={40} />
                    <div className="d-flex flex-column flex-grow-1">
                        <span className="fw-bold text-dark">{post.owner?.username || 'Unknown User'}</span>
                        <span className="text-muted small">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>

                    {user && String(user._id) === String(post.owner?._id) && !isEditing && (
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="p-0 text-muted no-arrow" style={{ opacity: 0.7 }}>
                                <MoreVertical size={20} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3 p-1">
                                <Dropdown.Item onClick={() => setIsEditing(true)} className="small d-flex align-items-center gap-2 rounded-2">
                                    <Edit2 size={16} /> Edit Post
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleDelete} className="small d-flex align-items-center gap-2 text-danger rounded-2">
                                    <Trash2 size={16} /> Delete Post
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </Card.Header>

                {post.image && (
                    <Card.Img
                        variant="top"
                        src={getImageUrl(post.image)}
                        className="rounded-0"
                        style={{ maxHeight: '600px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                    />
                )}

                <Card.Body className="p-4">
                    {isEditing ? (
                        <div className="d-flex flex-column gap-3">
                            <Form.Control
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="fw-bold fs-5"
                                placeholder="Post Title"
                            />
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Post Content"
                            />
                            <div className="d-flex justify-content-end gap-2 mt-2">
                                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSubmitting} className="d-flex align-items-center gap-1">
                                    <X size={16} /> Cancel
                                </Button>
                                <Button variant="primary" onClick={handleUpdate} disabled={isSubmitting || !editTitle.trim() || !editContent.trim()} className="d-flex align-items-center gap-1">
                                    {isSubmitting ? <Spinner size="sm" animation="border" /> : <><Check size={16} /> Save Changes</>}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Card.Title className="h4 mb-3">{post.title}</Card.Title>
                            <Card.Text className="text-dark fs-5" style={{ whiteSpace: 'pre-wrap' }}>
                                {post.content}
                            </Card.Text>
                        </>
                    )}
                </Card.Body>
            </Card>

            <CommentSection postId={post._id} />
        </Container>
    );
};

export default PostDetails;

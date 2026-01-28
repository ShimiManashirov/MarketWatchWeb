import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Card, Image, Spinner, Button } from 'react-bootstrap';
import { getPostById, type Post } from '../services/postService';
import CommentSection from '../components/CommentSection';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

const PostDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const response = await getPostById(id);
                setPost(response.data);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

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
                    {post.owner?.image ? (
                        <Image
                            src={post.owner.image}
                            roundedCircle
                            width={40}
                            height={40}
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                            <UserIcon size={24} className="text-muted" />
                        </div>
                    )}
                    <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{post.owner?.username || 'Unknown User'}</span>
                        <span className="text-muted small">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </Card.Header>

                {post.image && (
                    <Card.Img
                        variant="top"
                        src={`http://localhost:3000/${post.image}`}
                        className="rounded-0"
                        style={{ maxHeight: '600px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                    />
                )}

                <Card.Body className="p-4">
                    <Card.Title className="h4 mb-3">{post.title}</Card.Title>
                    <Card.Text className="text-dark fs-5" style={{ whiteSpace: 'pre-wrap' }}>
                        {post.content}
                    </Card.Text>
                </Card.Body>
            </Card>

            <CommentSection postId={post._id} />
        </Container>
    );
};

export default PostDetails;

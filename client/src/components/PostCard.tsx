import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Image } from 'react-bootstrap';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { type Post, likePost, unlikePost } from '../services/postService';
import { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
    post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [liked, setLiked] = useState((post.likes || []).includes(user?._id || ''));
    const [likesCount, setLikesCount] = useState((post.likes || []).length);

    const handleLike = async () => {
        if (!user) return;

        // Optimistic update
        const isLiking = !liked;
        setLiked(isLiking);
        setLikesCount(prev => isLiking ? prev + 1 : prev - 1);

        try {
            if (isLiking) {
                await likePost(post._id);
            } else {
                await unlikePost(post._id);
            }
        } catch (error) {
            // Revert on error
            setLiked(!isLiking);
            setLikesCount(prev => isLiking ? prev - 1 : prev + 1);
            console.error("Failed to toggle like", error);
        }
    };

    const openPost = () => navigate(`/post/${post._id}`);

    return (
        <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden hover-shadow transition-all">
            <Card.Header className="bg-white border-0 p-3 d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={openPost}>
                <Image
                    src={post.owner?.image || 'https://via.placeholder.com/40'}
                    roundedCircle
                    width={40}
                    height={40}
                    style={{ objectFit: 'cover' }}
                />
                <div className="d-flex flex-column">
                    <span className="fw-bold text-dark">{post.owner?.username || 'Unknown User'}</span>
                    <span className="text-muted small">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
            </Card.Header>

            {post.image && (
                <Card.Img
                    variant="top"
                    src={getImageUrl(post.image)}
                    className="rounded-0"
                    style={{ maxHeight: '500px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={openPost}
                />
            )}

            <Card.Body className="p-3">
                <Card.Text className="text-dark mb-3" style={{ cursor: 'pointer' }} onClick={openPost}>
                    {post.content || post.title}
                </Card.Text>

                <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                    <div className="d-flex gap-3 align-items-center">
                        <Button
                            variant="light"
                            className={`p-2 rounded-circle d-flex align-items-center justify-content-center border-0 ${liked ? 'text-danger bg-danger-subtle' : 'text-muted bg-transparent'}`}
                            onClick={handleLike}
                            style={{ width: '40px', height: '40px' }}
                        >
                            <Heart size={20} fill={liked ? "currentColor" : "none"} />
                        </Button>
                        <span className="text-muted small fw-medium">{likesCount}</span>

                        <Button
                            variant="light"
                            className="p-2 rounded-circle d-flex align-items-center justify-content-center border-0 text-muted bg-transparent"
                            style={{ width: '40px', height: '40px' }}
                            onClick={openPost}
                            title="View comments"
                        >
                            <MessageCircle size={20} />
                        </Button>
                        <span className="text-muted small fw-medium">{(post.comments || []).length}</span>

                        <Button variant="light" className="p-2 rounded-circle d-flex align-items-center justify-content-center border-0 text-muted bg-transparent ms-auto" style={{ width: '40px', height: '40px' }}>
                            <Share2 size={20} />
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default PostCard;


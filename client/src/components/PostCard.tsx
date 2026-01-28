import { useState } from 'react';
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
    const [liked, setLiked] = useState(post.likes.includes(user?._id || ''));
    const [likesCount, setLikesCount] = useState(post.likes.length);

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

    return (
        <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
            <Card.Header className="bg-white border-0 p-3 d-flex align-items-center gap-2">
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
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
            )}

            <Card.Body className="p-3">
                <Card.Text className="text-dark mb-3">
                    {post.content || post.title}
                </Card.Text>

                <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                    <div className="d-flex gap-3">
                        <Button
                            variant="white"
                            className={`p-0 d-flex align-items-center gap-1 border-0 ${liked ? 'text-danger' : 'text-muted'}`}
                            onClick={handleLike}
                        >
                            <Heart size={24} fill={liked ? "currentColor" : "none"} />
                            <span className="fw-medium">{likesCount}</span>
                        </Button>

                        <Button variant="white" className="p-0 d-flex align-items-center gap-1 border-0 text-muted">
                            <MessageCircle size={24} />
                            <span className="fw-medium">{post.comments.length}</span>
                        </Button>

                        <Button variant="white" className="p-0 d-flex align-items-center gap-1 border-0 text-muted">
                            <Share2 size={24} />
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default PostCard;

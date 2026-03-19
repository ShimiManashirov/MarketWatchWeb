import { useState, useEffect, type FormEvent } from 'react';
import { Card, Button, Form, Spinner, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getComments, createComment, deleteComment, updateComment, type Comment } from '../services/commentService';
import { Send, MoreVertical, Trash2, Edit2, X, Check } from 'lucide-react';
import Avatar from './Avatar';

interface CommentSectionProps {
    postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const fetchComments = async (currentPage = 1, append = false) => {
        try {
            const response = await getComments(postId, currentPage);
            const data = response.data;
            if (append) {
                setComments(prev => [...prev, ...data.comments]);
            } else {
                setComments(data.comments);
            }
            setHasMore(data.pagination.hasNextPage);
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(1);
    }, [postId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage, true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await createComment(postId, newComment);
            setComments(prev => [...prev, response.data]); // Append at end (or prepend if sort order changed)
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await deleteComment(commentId);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const startEdit = (comment: Comment) => {
        setEditingId(comment._id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleUpdate = async (commentId: string) => {
        if (!editContent.trim()) return;
        try {
            const response = await updateComment(commentId, editContent);
            setComments(prev => prev.map(c => c._id === commentId ? response.data : c));
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update comment", error);
        }
    };

    return (
        <div className="mt-4">
            <h5 className="mb-3">Comments</h5>

            {/* Comment Form */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
                <Card.Body className="p-3">
                    <Form onSubmit={handleSubmit} className="d-flex gap-2">
                        <Avatar src={user?.image} username={user?.username} size={32} border />
                        <Form.Control
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-light border-0 rounded-pill px-3"
                            disabled={submitting}
                        />
                        <Button
                            variant="primary"
                            type="submit"
                            className="rounded-circle d-flex align-items-center justify-content-center p-0"
                            style={{ width: '38px', height: '38px' }}
                            disabled={submitting || !newComment.trim()}
                        >
                            <Send size={18} className={submitting ? 'd-none' : ''} />
                            {submitting && <Spinner size="sm" animation="border" />}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* Comments List */}
            {loading ? (
                <div className="text-center py-3">
                    <Spinner animation="border" variant="primary" size="sm" />
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {comments.map(comment => (
                        <div key={comment._id} className="d-flex gap-2">
                            <Avatar src={comment.owner?.image} username={comment.owner?.username} size={32} className="mt-1" border />
                            <div className="flex-grow-1">
                                <div className="bg-white p-3 rounded-4 shadow-sm position-relative group">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <span className="fw-bold small">{comment.owner?.username || 'Unknown'}</span>
                                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {editingId === comment._id ? (
                                        <div className="d-flex gap-2 align-items-center">
                                            <Form.Control
                                                size="sm"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                            />
                                            <Button variant="success" size="sm" className="p-1 rounded-circle" onClick={() => handleUpdate(comment._id)}>
                                                <Check size={14} />
                                            </Button>
                                            <Button variant="danger" size="sm" className="p-1 rounded-circle" onClick={cancelEdit}>
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="mb-0 small text-dark">{comment.content}</p>
                                    )}

                                    {/* Actions Dropdown */}
                                    {user && String(user._id) === String(comment.owner?._id) && editingId !== comment._id && (
                                        <div className="position-absolute top-0 end-0 mt-2 me-2">
                                            <Dropdown align="end">
                                                <Dropdown.Toggle variant="link" className="p-0 text-muted no-arrow after-none" style={{ opacity: 0.5 }}>
                                                    <MoreVertical size={14} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="shadow border-0 rounded-3 p-1" style={{ minWidth: '120px' }}>
                                                    <Dropdown.Item onClick={() => startEdit(comment)} className="small d-flex align-items-center gap-2 rounded-2">
                                                        <Edit2 size={14} /> Edit
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleDelete(comment._id)} className="small d-flex align-items-center gap-2 text-danger rounded-2">
                                                        <Trash2 size={14} /> Delete
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <p className="text-center text-muted small">No comments yet. Be the first to share your thoughts!</p>
                    )}

                    {hasMore && (
                        <div className="text-center">
                            <Button variant="link" size="sm" onClick={handleLoadMore}>Load more comments</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentSection;

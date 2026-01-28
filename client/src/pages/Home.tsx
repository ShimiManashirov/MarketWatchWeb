import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import PostCard from '../components/PostCard';
import { getAllPosts, type Post } from '../services/postService';

const Home = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (currentPage: number, isRefreshing = false) => {
        try {
            if (currentPage === 1) setLoading(true);
            else setLoadingMore(true);

            const response = await getAllPosts(currentPage);
            // Check structure based on new interface
            const newPosts = response.data.posts || [];
            const pagination = response.data.pagination;

            if (isRefreshing || currentPage === 1) {
                setPosts(newPosts);
            } else {
                setPosts(prev => [...prev, ...newPosts]);
            }

            setHasMore(pagination?.hasNextPage ?? false);
        } catch (err) {
            console.error(err);
            setError('Failed to load posts');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPosts(1, true);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    {loading ? (
                        <div className="d-flex justify-content-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-danger py-5">{error}</div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {posts.map(post => (
                                <PostCard key={post._id} post={post} />
                            ))}
                            {posts.length === 0 && (
                                <div className="text-center text-muted py-5">
                                    <h4>No posts yet</h4>
                                    <p>Follow users or create a post to see updates.</p>
                                </div>
                            )}

                            {hasMore && posts.length > 0 && (
                                <div className="text-center py-3">
                                    <button
                                        className="btn btn-link text-decoration-none"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Loading...' : 'Load More'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Home;

import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Image, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getPostsByOwner, type Post } from '../services/postService';
import api, { getImageUrl } from '../services/api';
import PostCard from '../components/PostCard';
import { User as UserIcon, Edit2, Grid, List as ListIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const UserProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { user: authUser } = useAuth();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const isOwnProfile = !id || id === authUser?._id;

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // Determine user to display
                let targetUserId = authUser?._id;

                if (id && id !== authUser?._id) {
                    const userResponse = await api.get(`/user/${id}`);
                    setProfileUser(userResponse.data);
                    targetUserId = id;
                } else if (authUser) {
                    setProfileUser(authUser);
                }

                if (targetUserId) {
                    const response = await getPostsByOwner(targetUserId);
                    const fetchedPosts = response.data.posts || (Array.isArray(response.data) ? response.data : []);
                    setPosts(fetchedPosts);
                }
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };

        if (authUser || id) {
            fetchProfileData();
        }
    }, [id, authUser]);

    if (!profileUser && !loading) {
        return (
            <Container className="py-5 text-center">
                <h3>User not found</h3>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Profile Header */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="bg-primary" style={{ height: '120px', opacity: 0.1 }}></div>
                <Card.Body className="position-relative pt-0 px-4 pb-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end">
                        <div className="d-flex flex-column align-items-center align-items-md-start" style={{ marginTop: '-60px' }}>
                            {profileUser?.image ? (
                                <Image
                                    src={getImageUrl(profileUser.image)}
                                    roundedCircle
                                    width={120}
                                    height={120}
                                    className="border border-4 border-white shadow-sm mb-3"
                                    style={{ objectFit: 'cover', backgroundColor: '#fff' }}
                                />
                            ) : (
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border border-4 border-white shadow-sm mb-3" style={{ width: '120px', height: '120px', backgroundColor: '#fff' }}>
                                    <UserIcon size={48} className="text-muted" />
                                </div>
                            )}
                            <div className="text-center text-md-start">
                                <h2 className="fw-bold mb-0">{profileUser?.username}</h2>
                                <p className="text-muted">{profileUser?.email}</p>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <div className="mt-3 mt-md-0 mb-2">
                                <Link to="/profile/edit" className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-4">
                                    <Edit2 size={16} /> Edit Profile
                                </Link>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Posts Section */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h4 className="fw-bold mb-0">
                    {isOwnProfile ? 'My Posts' : `${profileUser?.username || 'User'}'s Posts`}
                </h4>
                <div className="d-flex gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'primary' : 'light'}
                        className="p-2 rounded-circle d-flex align-items-center justify-content-center border-0"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid size={20} />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'primary' : 'light'}
                        className="p-2 rounded-circle d-flex align-items-center justify-content-center border-0"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => setViewMode('list')}
                    >
                        <ListIcon size={20} />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : posts.length > 0 ? (
                viewMode === 'list' ? (
                    <div className="d-flex flex-column gap-3 mx-auto" style={{ maxWidth: '700px' }}>
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {posts.map(post => (
                            <Col key={post._id}>
                                <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition-all">
                                    <div className="position-relative" style={{ paddingTop: '75%' }}>
                                        {post.image ? (
                                            <Card.Img
                                                variant="top"
                                                src={getImageUrl(post.image)}
                                                className="position-absolute top-0 start-0 w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <Card.Body>
                                        <Card.Title className="text-truncate">{post.title || 'Untitled'}</Card.Title>
                                        <Card.Text className="small text-muted text-truncate">
                                            {post.content}
                                        </Card.Text>
                                        <Link to={`/post/${post._id}`} className="stretched-link"></Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )
            ) : (
                <div className="text-center py-5 bg-light rounded-4">
                    <div className="mb-3 text-muted">
                        <Grid size={48} />
                    </div>
                    <h5>No posts yet</h5>
                    {isOwnProfile ? (
                        <>
                            <p className="text-muted mb-4">Share your first market insight to verify the flow.</p>
                            <Link to="/create-post" className="btn btn-primary rounded-pill px-4">
                                Create Post
                            </Link>
                        </>
                    ) : (
                        <p className="text-muted mb-0">This user hasn't posted anything yet.</p>
                    )}
                </div>
            )}
        </Container>
    );
};

export default UserProfile;

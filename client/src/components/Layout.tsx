import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Container, Nav, Dropdown, Image } from 'react-bootstrap';
import { User, LogOut, PlusSquare, Search } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <Navbar expand="lg" className="bg-white border-bottom sticky-top shadow-sm" style={{ minHeight: '60px' }}>
                <Container>
                    <Link to="/" className="navbar-brand fw-bold text-primary fs-4">
                        MarketWatch
                    </Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto">
                            {/* Center Search Bar or Links can go here in future */}
                        </Nav>
                        <Nav className="d-flex align-items-center gap-3">
                            {/* AI Search Link - To be implemented fully in Task 7 */}
                            <Link to="/search" className="nav-link d-flex align-items-center gap-1 text-dark">
                                <Search size={20} />
                                <span className="d-lg-none">Search</span>
                            </Link>

                            <Link
                                to="/create-post"
                                className="btn btn-light d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                                style={{ width: '40px', height: '40px' }}
                            >
                                <PlusSquare size={24} />
                            </Link>

                            <Dropdown align="end">
                                <Dropdown.Toggle variant="transparent" className="p-0 border-0 no-arrow after-none">
                                    {user?.image ? (
                                        <Image
                                            src={user.image}
                                            roundedCircle
                                            width={40}
                                            height={40}
                                            className="border"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{ width: '40px', height: '40px' }}>
                                            <User size={24} className="text-muted" />
                                        </div>
                                    )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="shadow border-0 rounded-4 mt-2 p-2">
                                    <Dropdown.Header className="fw-bold text-dark">{user?.username || 'User'}</Dropdown.Header>
                                    <Dropdown.Divider />
                                    <Link to="/profile" className="dropdown-item rounded-2 px-3 py-2">Profile</Link>
                                    <Dropdown.Item onClick={handleLogout} className="text-danger rounded-2 px-3 py-2 d-flex align-items-center gap-2">
                                        <LogOut size={16} /> Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="py-4" style={{ minHeight: 'calc(100vh - 60px)' }}>
                <Outlet />
            </Container>
        </>
    );
};

export default Layout;

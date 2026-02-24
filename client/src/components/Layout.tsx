import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Navbar, Nav, Dropdown, Image } from 'react-bootstrap';
import { LogOut, Search, PlusCircle, Home, TrendingUp, User, Bell } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            {/* Navbar */}
            <Navbar expand="lg" className="sticky-top bg-white shadow-sm" style={{ minHeight: '70px' }}>
                <Container>
                    <Link to="/" className="navbar-brand fs-4 fw-bold d-flex align-items-center gap-2">
                        <TrendingUp size={24} className="text-primary" />
                        MarketWatch
                    </Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {user && (
                            <Nav className="mx-auto gap-1">
                                <Link
                                    to="/"
                                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${isActive('/') ? 'bg-primary bg-opacity-10 text-primary fw-medium' : ''}`}
                                >
                                    <Home size={18} /> Feed
                                </Link>
                                <Link
                                    to="/watchlist"
                                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${isActive('/watchlist') ? 'bg-primary bg-opacity-10 text-primary fw-medium' : ''}`}
                                >
                                    <TrendingUp size={18} /> Watchlist
                                </Link>
                                <Link
                                    to="/alerts"
                                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${isActive('/alerts') ? 'bg-primary bg-opacity-10 text-primary fw-medium' : ''}`}
                                >
                                    <Bell size={18} /> Alerts
                                </Link>
                                <Link
                                    to="/search"
                                    className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${isActive('/search') ? 'bg-primary bg-opacity-10 text-primary fw-medium' : ''}`}
                                >
                                    <Search size={18} /> Smart Search
                                </Link>
                            </Nav>
                        )}
                        <Nav className="d-flex align-items-center gap-3">
                            <Link
                                to="/create-post"
                                className="btn btn-light d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                                style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)' }}
                            >
                                <PlusCircle size={20} className="text-dark" />
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

            {/* Main Content */}
            <Container className="flex-grow-1 py-4">
                <Outlet />
            </Container>
        </div>
    );
};

export default Layout;

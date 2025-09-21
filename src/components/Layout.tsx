import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, LogOut, User, PenSquare, MessageSquare, Home } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="wireframe-container">
          <div className="flex items-center justify-between py-4">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-semibold">
                Otaku Forum
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link to="/forum" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>Forum</span>
                </Link>
                {isAuthenticated && (
                  <Link to="/create-article" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                    <PenSquare className="w-4 h-4" />
                    <span>Write</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </form>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to={`/profile/${user?.id}`}>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user?.username}</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="wireframe-container">
          <div className="py-8 text-center text-muted-foreground">
            <p>&copy; 2024 Otaku Forum. Built with React, TypeScript & Flask.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
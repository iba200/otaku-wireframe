import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi } from '@/services/api';
import { UserProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Globe, Calendar, Edit, Heart, Eye, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser && userProfile && currentUser.id === userProfile.user.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        const response = await usersApi.getUser(parseInt(id));
        setUserProfile(response);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="wireframe-container">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="lg:col-span-2 h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="wireframe-container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">User Not Found</h1>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { user, recent_articles, recent_topics, stats } = userProfile;

  return (
    <div className="wireframe-container">
      {/* Profile Header */}
      <Card className="wireframe-card mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-2xl font-semibold">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.username}</h1>
                  <Badge variant="outline" className="mt-1">
                    {user.role}
                  </Badge>
                </div>
                
                {isOwnProfile && (
                  <Link to="/profile/edit">
                    <Button variant="outline" className="mt-2 sm:mt-0">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
              
              {user.bio && (
                <p className="text-muted-foreground mb-4">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {user.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </span>
                )}
                {user.website && (
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 hover:text-primary"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.created_at))} ago</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card className="wireframe-card">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Articles</span>
                  <span className="font-semibold">{stats.articles_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Forum Topics</span>
                  <span className="font-semibold">{stats.topics_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-semibold">{stats.comments_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Likes Received</span>
                  <span className="font-semibold">{stats.likes_received}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="articles">Articles ({recent_articles.length})</TabsTrigger>
              <TabsTrigger value="topics">Forum Topics ({recent_topics.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="articles" className="space-y-4 mt-6">
              {recent_articles.length === 0 ? (
                <Card className="wireframe-card">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No articles published yet.</p>
                  </CardContent>
                </Card>
              ) : (
                recent_articles.map((article) => (
                  <Card key={article.id} className="wireframe-card hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary">{article.category}</Badge>
                            {article.featured && (
                              <Badge>Featured</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">
                            <Link 
                              to={`/articles/${article.id}`}
                              className="hover:text-primary transition-colors line-clamp-2"
                            >
                              {article.title}
                            </Link>
                          </h3>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {article.excerpt || article.content.substring(0, 150) + '...'}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{formatDistanceToNow(new Date(article.created_at))} ago</span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{article.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{article.likes}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="topics" className="space-y-4 mt-6">
              {recent_topics.length === 0 ? (
                <Card className="wireframe-card">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No forum topics created yet.</p>
                  </CardContent>
                </Card>
              ) : (
                recent_topics.map((topic) => (
                  <Card key={topic.id} className="wireframe-card hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{topic.category}</Badge>
                            {topic.is_pinned && (
                              <Badge variant="secondary">Pinned</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">
                            <Link 
                              to={`/forum/topics/${topic.id}`}
                              className="hover:text-primary transition-colors line-clamp-2"
                            >
                              {topic.title}
                            </Link>
                          </h3>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {topic.content.substring(0, 150)}...
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{topic.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{topic.replies_count}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
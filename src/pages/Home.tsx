import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, forumApi } from '@/services/api';
import { Article, Topic } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, MessageSquare, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [popularTopics, setPopularTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [articlesResponse, topicsResponse] = await Promise.all([
          articlesApi.getArticles({ per_page: 6, sort: 'created_at', order: 'desc' }),
          forumApi.getTopics({ limit: 5, sort: 'views' })
        ]);
        
        setArticles(articlesResponse.items);
        setPopularTopics(topicsResponse.topics);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleLikeArticle = async (articleId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like articles.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await articlesApi.likeArticle(articleId);
      setArticles(articles.map(article => 
        article.id === articleId 
          ? { ...article, user_liked: response.liked, likes: response.likes_count }
          : article
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like article. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="wireframe-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="wireframe-card">
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wireframe-container">
      {/* Hero Section */}
      <section className="py-12 text-center border-b border-border">
        <h1 className="text-4xl font-bold mb-4">Welcome to Otaku Forum</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover amazing articles, engage in discussions, and connect with fellow otaku enthusiasts.
        </p>
        {!isAuthenticated && (
          <div className="space-x-4">
            <Link to="/register">
              <Button size="lg">Join the Community</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        )}
      </section>

      <div className="py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Articles */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Latest Articles</h2>
            <Link to="/articles">
              <Button variant="ghost" className="flex items-center space-x-1">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="wireframe-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{article.category}</Badge>
                    {article.featured && (
                      <Badge>Featured</Badge>
                    )}
                  </div>
                  <CardTitle>
                    <Link 
                      to={`/articles/${article.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {article.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {article.excerpt || article.content.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views}</span>
                      </span>
                      <button
                        onClick={() => handleLikeArticle(article.id)}
                        className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                          article.user_liked ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${article.user_liked ? 'fill-current' : ''}`} />
                        <span>{article.likes}</span>
                      </button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      by {article.author.username}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Popular Topics */}
          <Card className="wireframe-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Popular Topics</span>
                <Link to="/forum">
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularTopics.map((topic) => (
                  <div key={topic.id} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <Link 
                      to={`/forum/topics/${topic.id}`}
                      className="block hover:text-primary transition-colors"
                    >
                      <h3 className="font-medium line-clamp-2 mb-2">{topic.title}</h3>
                    </Link>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{topic.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{topic.replies_count}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="wireframe-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/create-article" className="block">
                      <Button className="w-full justify-start">
                        <span>Write Article</span>
                      </Button>
                    </Link>
                    <Link to="/forum" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <span>Browse Forum</span>
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="block">
                      <Button className="w-full justify-start">
                        <span>Join Community</span>
                      </Button>
                    </Link>
                    <Link to="/login" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <span>Sign In</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
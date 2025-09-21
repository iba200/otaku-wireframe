import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { forumApi } from '@/services/api';
import { Topic, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, MessageSquare, PlusCircle, Pin, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const Forum = () => {
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTopics = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 20,
        sort: sortBy,
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await forumApi.getTopics(params);
      setTopics(response.topics);
      setTotalPages(response.pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load topics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await forumApi.getCategories();
      setCategories(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTopics(), fetchCategories()]);
      setLoading(false);
    };

    loadData();
  }, [currentPage, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="wireframe-container">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="wireframe-card">
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground">Discuss your favorite anime, manga, and more</p>
        </div>
        
        {isAuthenticated && (
          <Link to="/forum/create-topic">
            <Button className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4" />
              <span>New Topic</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name} ({category.topics_count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest</SelectItem>
              <SelectItem value="updated_at">Recent Activity</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="replies_count">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.length === 0 ? (
          <Card className="wireframe-card">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No topics found in this category.</p>
              {isAuthenticated && (
                <Link to="/forum/create-topic">
                  <Button>Create the First Topic</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          topics.map((topic) => (
            <Card key={topic.id} className="wireframe-card hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{topic.category}</Badge>
                      {topic.is_pinned && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Pin className="w-3 h-3" />
                          <span>Pinned</span>
                        </Badge>
                      )}
                      {topic.is_locked && (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">
                      <Link 
                        to={`/forum/topics/${topic.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {topic.title}
                      </Link>
                    </h3>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {topic.content.substring(0, 200)}...
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <Link 
                        to={`/profile/${topic.author.id}`}
                        className="hover:text-foreground"
                      >
                        by {topic.author.username}
                      </Link>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                      {topic.last_reply && (
                        <>
                          <span>•</span>
                          <span>
                            Last reply by{' '}
                            <Link 
                              to={`/profile/${topic.last_reply.author.id}`}
                              className="hover:text-foreground"
                            >
                              {topic.last_reply.author.username}
                            </Link>{' '}
                            {formatDistanceToNow(new Date(topic.last_reply.created_at))} ago
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Categories Sidebar */}
      {categories.length > 0 && (
        <Card className="wireframe-card mt-8">
          <CardHeader>
            <CardTitle>Forum Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <p className="text-xs text-muted-foreground">{category.topics_count} topics</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Forum;
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { articlesApi, forumApi } from '@/services/api';
import { Article, Topic } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, Eye, Heart, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const [articlesResponse, topicsResponse] = await Promise.all([
        articlesApi.getArticles({ search: searchTerm, per_page: 20 }),
        forumApi.getTopics({ limit: 20 })
      ]);
      
      setArticles(articlesResponse.items);
      // Filter topics by search term on client side since API might not support search
      const filteredTopics = topicsResponse.topics.filter(topic =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTopics(filteredTopics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  };

  const totalResults = articles.length + topics.length;

  return (
    <div className="wireframe-container">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>
        
        {hasSearched && (
          <p className="text-muted-foreground mt-4">
            {loading ? 'Searching...' : `Found ${totalResults} results for "${query}"`}
          </p>
        )}
      </div>

      {/* Search Results */}
      {hasSearched && !loading && (
        <div>
          {totalResults === 0 ? (
            <Card className="wireframe-card">
              <CardContent className="pt-6 text-center">
                <div className="max-w-md mx-auto">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No results found</h2>
                  <p className="text-muted-foreground mb-4">
                    Try different keywords or check your spelling.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Use simpler or more general terms</p>
                    <p>• Try different synonyms</p>
                    <p>• Check for typos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
                <TabsTrigger value="articles">Articles ({articles.length})</TabsTrigger>
                <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6 mt-6">
                {/* Articles */}
                {articles.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Articles</h2>
                    <div className="space-y-4">
                      {articles.slice(0, 5).map((article) => (
                        <Card key={`article-${article.id}`} className="wireframe-card hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                                
                                <h3 className="text-lg font-semibold mb-2">
                                  <Link 
                                    to={`/articles/${article.id}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {article.title}
                                  </Link>
                                </h3>
                                
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                  {article.excerpt || article.content.substring(0, 150) + '...'}
                                </p>
                                
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <Link to={`/profile/${article.author.id}`} className="hover:text-foreground">
                                    by {article.author.username}
                                  </Link>
                                  <span>•</span>
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics */}
                {topics.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Forum Topics</h2>
                    <div className="space-y-4">
                      {topics.slice(0, 5).map((topic) => (
                        <Card key={`topic-${topic.id}`} className="wireframe-card hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <Badge variant="outline" className="mb-2">{topic.category}</Badge>
                                
                                <h3 className="text-lg font-semibold mb-2">
                                  <Link 
                                    to={`/forum/topics/${topic.id}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {topic.title}
                                  </Link>
                                </h3>
                                
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                  {topic.content.substring(0, 150)}...
                                </p>
                                
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <Link to={`/profile/${topic.author.id}`} className="hover:text-foreground">
                                    by {topic.author.username}
                                  </Link>
                                  <span>•</span>
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
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="articles" className="space-y-4 mt-6">
                {articles.length === 0 ? (
                  <Card className="wireframe-card">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No articles found for this search.</p>
                    </CardContent>
                  </Card>
                ) : (
                  articles.map((article) => (
                    <Card key={article.id} className="wireframe-card hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                            
                            <h3 className="text-lg font-semibold mb-2">
                              <Link 
                                to={`/articles/${article.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {article.title}
                              </Link>
                            </h3>
                            
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                              {article.excerpt || article.content.substring(0, 150) + '...'}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <Link to={`/profile/${article.author.id}`} className="hover:text-foreground">
                                by {article.author.username}
                              </Link>
                              <span>•</span>
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
                {topics.length === 0 ? (
                  <Card className="wireframe-card">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No topics found for this search.</p>
                    </CardContent>
                  </Card>
                ) : (
                  topics.map((topic) => (
                    <Card key={topic.id} className="wireframe-card hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className="mb-2">{topic.category}</Badge>
                            
                            <h3 className="text-lg font-semibold mb-2">
                              <Link 
                                to={`/forum/topics/${topic.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {topic.title}
                              </Link>
                            </h3>
                            
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                              {topic.content.substring(0, 150)}...
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <Link to={`/profile/${topic.author.id}`} className="hover:text-foreground">
                                by {topic.author.username}
                              </Link>
                              <span>•</span>
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
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card className="wireframe-card">
          <CardContent className="pt-6 text-center">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Search the Community</h2>
            <p className="text-muted-foreground">
              Find articles, forum topics, and discussions that interest you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articlesApi, commentsApi } from '@/services/api';
import { Article, Comment } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Eye, MessageSquare, Edit, Trash2, Reply, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isModerator } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        const response = await articlesApi.getArticle(parseInt(id));
        setArticle(response.article);
        setComments(response.comments);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load article. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]);

  const handleLikeArticle = async () => {
    if (!article || !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like articles.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await articlesApi.likeArticle(article.id);
      setArticle({
        ...article,
        user_liked: response.liked,
        likes: response.likes_count
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !article) {
      toast({
        title: "Login Required",
        description: "Please log in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!commentContent.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await commentsApi.createComment({
        content: commentContent,
        article_id: article.id
      });
      
      setComments([newComment, ...comments]);
      setCommentContent('');
      toast({
        title: "Success",
        description: "Comment posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to reply.",
        variant: "destructive",
      });
      return;
    }

    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const newReply = await commentsApi.replyToComment(commentId, replyContent);
      
      // Update the comments list to include the new reply
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: "Success",
        description: "Reply posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await commentsApi.likeComment(commentId);
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, user_liked: response.liked, likes: response.likes_count }
          : comment
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsApi.deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleModerateComment = async (commentId: number, action: 'hide' | 'restore' | 'flag') => {
    try {
      await commentsApi.moderateComment(commentId, action);
      toast({
        title: "Success",
        description: `Comment ${action}ed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canEditArticle = user && article && (user.id === article.author.id || isModerator);
  const canDeleteArticle = user && article && (user.id === article.author.id || isModerator);

  if (loading) {
    return (
      <div className="wireframe-container">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="wireframe-container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Article Not Found</h1>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wireframe-container">
      <div className="max-w-4xl mx-auto">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            {canEditArticle && (
              <div className="flex items-center space-x-2">
                <Link to={`/articles/${article.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                {canDeleteArticle && (
                  <Button variant="outline" size="sm" onClick={() => {
                    if (window.confirm('Are you sure you want to delete this article?')) {
                      articlesApi.deleteArticle(article.id).then(() => {
                        toast({ title: "Success", description: "Article deleted successfully." });
                        navigate('/');
                      });
                    }
                  }}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center justify-between text-muted-foreground mb-6">
            <div className="flex items-center space-x-4">
              <Link to={`/profile/${article.author.id}`} className="hover:text-foreground">
                {article.author.username}
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(article.created_at))} ago</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{article.views}</span>
              </span>
              <button
                onClick={handleLikeArticle}
                className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                  article.user_liked ? 'text-red-500' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${article.user_liked ? 'fill-current' : ''}`} />
                <span>{article.likes}</span>
              </button>
              <span className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <Card className="wireframe-card mb-8">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{article.content}</div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Comments ({comments.length})</h2>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <Card className="wireframe-card">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitComment}>
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="mb-4"
                    rows={3}
                  />
                  <Button type="submit" disabled={submitting || !commentContent.trim()}>
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="wireframe-card">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Please log in to comment</p>
                <Link to="/login">
                  <Button>Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="wireframe-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link to={`/profile/${comment.author.id}`} className="font-medium hover:text-primary">
                        {comment.author.username}
                      </Link>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {(user?.id === comment.author.id || isModerator) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {isModerator && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleModerateComment(comment.id, 'flag')}
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap mb-4">{comment.content}</div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center space-x-1 text-sm hover:text-red-500 transition-colors ${
                        comment.user_liked ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${comment.user_liked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                    
                    {isAuthenticated && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 pl-4 border-l-2 border-border">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-2"
                        rows={2}
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleReply(comment.id)}
                          disabled={submitting || !replyContent.trim()}
                        >
                          {submitting ? 'Posting...' : 'Reply'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Link to={`/profile/${reply.author.id}`} className="font-medium text-sm hover:text-primary">
                              {reply.author.username}
                            </Link>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground text-sm">
                              {formatDistanceToNow(new Date(reply.created_at))} ago
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{reply.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
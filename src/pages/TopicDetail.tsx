import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumApi } from '@/services/api';
import { Topic, Reply } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pin, Lock, Eye, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isModerator } = useAuth();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;
      
      try {
        const response = await forumApi.getTopic(parseInt(id));
        setTopic(response.topic);
        setReplies(response.replies);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load topic. Please try again.",
          variant: "destructive",
        });
        navigate('/forum');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id, navigate]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !topic) {
      toast({
        title: "Login Required",
        description: "Please log in to reply.",
        variant: "destructive",
      });
      return;
    }

    if (!replyContent.trim()) return;

    if (topic.is_locked && !isModerator) {
      toast({
        title: "Topic Locked",
        description: "This topic is locked and no longer accepts replies.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newReply = await forumApi.createReply(topic.id, replyContent);
      setReplies([...replies, newReply]);
      setReplyContent('');
      
      // Update topic reply count
      setTopic({
        ...topic,
        replies_count: topic.replies_count + 1
      });
      
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

  const handleDeleteTopic = async () => {
    if (!topic || !window.confirm('Are you sure you want to delete this topic?')) return;

    try {
      await forumApi.deleteTopic(topic.id);
      toast({
        title: "Success",
        description: "Topic deleted successfully.",
      });
      navigate('/forum');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canEditTopic = user && topic && (user.id === topic.author.id || isModerator);
  const canDeleteTopic = user && topic && (user.id === topic.author.id || isModerator);

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

  if (!topic) {
    return (
      <div className="wireframe-container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Topic Not Found</h1>
          <Link to="/forum">
            <Button>Return to Forum</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wireframe-container">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/forum" className="text-muted-foreground hover:text-foreground">
            Forum
          </Link>
          <span className="mx-2 text-muted-foreground">›</span>
          <span>{topic.category}</span>
        </div>

        {/* Topic Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
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
            
            {canEditTopic && (
              <div className="flex items-center space-x-2">
                <Link to={`/forum/topics/${topic.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                {canDeleteTopic && (
                  <Button variant="outline" size="sm" onClick={handleDeleteTopic}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
          
          <div className="flex items-center space-x-4 text-muted-foreground">
            <Link to={`/profile/${topic.author.id}`} className="hover:text-foreground">
              {topic.author.username}
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

        {/* Topic Content */}
        <Card className="wireframe-card mb-8">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{topic.content}</div>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Replies ({replies.length})</h2>
          </div>

          {/* Reply Form */}
          {isAuthenticated && !topic.is_locked ? (
            <Card className="wireframe-card">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitReply}>
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="mb-4"
                    rows={4}
                  />
                  <Button type="submit" disabled={submitting || !replyContent.trim()}>
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : topic.is_locked ? (
            <Card className="wireframe-card">
              <CardContent className="pt-6 text-center">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">This topic is locked and no longer accepts replies.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="wireframe-card">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">Please log in to reply</p>
                <Link to="/login">
                  <Button>Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Replies List */}
          <div className="space-y-4">
            {replies.length === 0 ? (
              <Card className="wireframe-card">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
                </CardContent>
              </Card>
            ) : (
              replies.map((reply, index) => (
                <Card key={reply.id} className="wireframe-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link to={`/profile/${reply.author.id}`} className="font-medium hover:text-primary">
                          {reply.author.username}
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground text-sm">
                          #{index + 1} • {formatDistanceToNow(new Date(reply.created_at))} ago
                        </span>
                      </div>
                      
                      {(user?.id === reply.author.id || isModerator) && (
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{reply.content}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;
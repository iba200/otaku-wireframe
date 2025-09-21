import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesApi, forumApi } from '@/services/api';
import { Article } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const CreateArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    image_url: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingArticle, setExistingArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await forumApi.getCategories();
        setCategories(response.map(cat => cat.name));
      } catch (error) {
        // Use default categories if API fails
        setCategories(['Anime', 'Manga', 'Light Novel', 'Gaming', 'News', 'Review', 'Discussion']);
      }
    };

    const fetchArticle = async () => {
      if (id) {
        setIsEditMode(true);
        try {
          const response = await articlesApi.getArticle(parseInt(id));
          const article = response.article;
          setExistingArticle(article);
          setFormData({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt || '',
            category: article.category,
            image_url: article.image_url || '',
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load article for editing.",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    };

    fetchCategories();
    fetchArticle();
  }, [id, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && id) {
        const updatedArticle = await articlesApi.updateArticle(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Article updated successfully.",
        });
        navigate(`/articles/${updatedArticle.id}`);
      } else {
        const newArticle = await articlesApi.createArticle(formData);
        toast({
          title: "Success",
          description: "Article published successfully.",
        });
        navigate(`/articles/${newArticle.id}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save article';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleCancel = () => {
    if (isEditMode && existingArticle) {
      navigate(`/articles/${existingArticle.id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="wireframe-container">
      <div className="max-w-4xl mx-auto">
        <Card className="wireframe-card">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEditMode ? 'Edit Article' : 'Create New Article'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleChange('category', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Optional brief description of your article"
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="Optional image URL for your article"
                  value={formData.image_url}
                  onChange={(e) => handleChange('image_url', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your article content here..."
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={20}
                  required
                  disabled={isLoading}
                  className="min-h-[400px]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                
                <div className="space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading 
                      ? (isEditMode ? 'Updating...' : 'Publishing...') 
                      : (isEditMode ? 'Update Article' : 'Publish Article')
                    }
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateArticle;
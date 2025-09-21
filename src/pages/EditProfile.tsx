import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    website: '',
    avatar_url: '',
    cover_image_url: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Pre-populate form with existing user data
    setFormData({
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatar_url: user.avatar_url || '',
      cover_image_url: user.cover_image_url || '',
    });
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      const updatedUser = await usersApi.updateProfile(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      navigate(`/profile/${updatedUser.id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
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
    if (user) {
      navigate(`/profile/${user.id}`);
    } else {
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="wireframe-container">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to edit your profile.</p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wireframe-container">
      <div className="max-w-2xl mx-auto">
        <Card className="wireframe-card">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
            <p className="text-muted-foreground">
              Update your profile information to personalize your account.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Where are you from?"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://your-website.com"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => handleChange('avatar_url', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Provide a URL to your profile picture.
                </p>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input
                  id="cover_image_url"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.cover_image_url}
                  onChange={(e) => handleChange('cover_image_url', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Provide a URL to your cover image.
                </p>
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
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
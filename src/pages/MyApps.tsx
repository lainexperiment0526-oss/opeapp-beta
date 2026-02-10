import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { useUpdateApp, useDeleteApp, useAddScreenshot, useDeleteScreenshot } from '@/hooks/useApps';
import { App, Category, Screenshot } from '@/types/app';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Clock, CheckCircle, XCircle, ArrowLeft, Upload, Image } from 'lucide-react';
import { AppIcon } from '@/components/AppIcon';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MyApps() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  
  const updateApp = useUpdateApp();
  const deleteApp = useDeleteApp();
  const addScreenshot = useAddScreenshot();
  const deleteScreenshot = useDeleteScreenshot();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<(App & { category?: Category; screenshots?: Screenshot[] }) | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    website_url: '',
    category_id: '',
    tags: '',
    version: '1.0',
    developer_name: '',
    age_rating: '4+',
    whats_new: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's apps
  const { data: myApps, isLoading: appsLoading } = useQuery({
    queryKey: ['my-apps', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('apps')
        .select('*, category:categories(*), screenshots:app_screenshots(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (App & { category?: Category; screenshots?: Screenshot[] })[];
    },
    enabled: !!user,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data as Category[];
    },
  });

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in Required</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to view your apps.</p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </main>
      </div>
    );
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage.from('app-assets').upload(fileName, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('app-assets').getPublicUrl(fileName);
    return publicUrl;
  };

  const openEditDialog = (app: App & { category?: Category; screenshots?: Screenshot[] }) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      tagline: app.tagline || '',
      description: app.description || '',
      website_url: app.website_url,
      category_id: app.category_id || '',
      tags: app.tags?.join(', ') || '',
      version: app.version,
      developer_name: app.developer_name || '',
      age_rating: app.age_rating || '4+',
      whats_new: app.whats_new || '',
    });
    setLogoFile(null);
    setScreenshotFiles([]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setIsSubmitting(true);
    try {
      let logo_url = editingApp.logo_url;
      
      if (logoFile) {
        logo_url = await uploadFile(logoFile, 'logos');
      }

      await updateApp.mutateAsync({
        id: editingApp.id,
        name: formData.name,
        tagline: formData.tagline || null,
        description: formData.description || null,
        website_url: formData.website_url,
        category_id: formData.category_id || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        version: formData.version,
        logo_url,
        developer_name: formData.developer_name || null,
        age_rating: formData.age_rating,
        whats_new: formData.whats_new || null,
      });

      // Upload new screenshots
      for (let i = 0; i < screenshotFiles.length; i++) {
        const imageUrl = await uploadFile(screenshotFiles[i], 'screenshots');
        await addScreenshot.mutateAsync({
          app_id: editingApp.id,
          image_url: imageUrl,
          display_order: (editingApp.screenshots?.length || 0) + i,
        });
      }

      toast.success('App updated successfully');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['my-apps'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update app');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this app?')) return;
    
    try {
      await deleteApp.mutateAsync(id);
      toast.success('App deleted');
      queryClient.invalidateQueries({ queryKey: ['my-apps'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteScreenshot = async (id: string) => {
    try {
      await deleteScreenshot.mutateAsync(id);
      toast.success('Screenshot deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Apps</h1>
            <p className="text-muted-foreground">Manage your submitted apps</p>
          </div>
          <Link to="/submit">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Submit App
            </Button>
          </Link>
        </div>

        {appsLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : myApps && myApps.length > 0 ? (
          <div className="space-y-4">
            {myApps.map((app) => (
              <div key={app.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card">
                <AppIcon src={app.logo_url} name={app.name} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{app.name}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{app.tagline}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.category?.name || 'Uncategorized'} • v{app.version}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(app)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(app.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No apps yet</h2>
            <p className="text-muted-foreground mb-4">Submit your first app to get started</p>
            <Link to="/submit">
              <Button>Submit App</Button>
            </Link>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit App</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div className="space-y-2">
              <Label>App Icon</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 app-icon overflow-hidden bg-secondary">
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : editingApp?.logo_url || ''}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-2 transition-colors hover:border-primary">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Change icon</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">App Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="developer_name">Developer Name</Label>
              <Input
                id="developer_name"
                value={formData.developer_name}
                onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whats_new">What's New</Label>
              <Textarea
                id="whats_new"
                value={formData.whats_new}
                onChange={(e) => setFormData({ ...formData, whats_new: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            {/* Screenshots */}
            <div className="space-y-2">
              <Label>Screenshots</Label>
              
              {editingApp?.screenshots && editingApp.screenshots.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {editingApp.screenshots.map((ss) => (
                    <div key={ss.id} className="relative group">
                      <img
                        src={ss.image_url}
                        alt="Screenshot"
                        className="h-24 w-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteScreenshot(ss.id)}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {screenshotFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {screenshotFiles.map((file, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="New screenshot"
                        className="h-24 w-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setScreenshotFiles(files => files.filter((_, idx) => idx !== i))}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 transition-colors hover:border-primary">
                <Image className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add screenshots</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setScreenshotFiles([...screenshotFiles, ...Array.from(e.target.files)]);
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  }
}

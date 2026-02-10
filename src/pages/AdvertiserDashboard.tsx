import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePiNetwork } from '@/hooks/usePiNetwork';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useUserCampaigns, useCreateCampaign, useDeleteCampaign, useUpdateCampaign } from '@/hooks/useAdCampaigns';
import { useUserApiKeys, useCreateApiKey, useDeleteApiKey } from '@/hooks/useApiKeys';
import { MediaUpload } from '@/components/MediaUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Copy, Key, Megaphone, Pause, Play, Eye, MousePointerClick, Gift } from 'lucide-react';

export default function AdvertiserDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { piUser, authenticateWithPi, createPiPayment } = usePiNetwork();
  const { data: campaigns, isLoading } = useUserCampaigns();
  const { data: apiKeys } = useUserApiKeys();
  const createCampaign = useCreateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const updateCampaign = useUpdateCampaign();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [form, setForm] = useState({
    name: '',
    ad_type: 'banner' as string,
    media_url: '',
    media_type: 'image' as string,
    destination_url: '',
    title: '',
    description: '',
    daily_budget: 0,
    total_budget: 0,
    skip_after_seconds: 5,
    reward_amount: 0,
    duration_days: 1,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [loading, navigate, user]);

  if (!loading && !user) {
    return null;
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const baseAdFee = 10;
      const durationCostMap: Record<number, number> = { 1: 10, 2: 20, 3: 50 };
      const durationCost = durationCostMap[form.duration_days] ?? 10;
      const totalCost = baseAdFee + durationCost;

      let activePiUser = piUser;
      if (!activePiUser) {
        activePiUser = await authenticateWithPi();
      }
      if (!activePiUser) {
        toast.error('Pi authentication required to create ads');
        return;
      }

      await createPiPayment(totalCost, 'Ad campaign fee', {
        type: 'ad_campaign',
        ad_type: form.ad_type,
        duration_days: form.duration_days,
        user_id: activePiUser.uid,
        name: form.name,
      });

      await createCampaign.mutateAsync({
        ...form,
        user_id: user.id,
        total_budget: totalCost,
        daily_budget: Number((totalCost / form.duration_days).toFixed(2)),
      });
      toast.success('Campaign created! It will be reviewed by admins.');
      setIsCreateOpen(false);
      setForm({
        name: '',
        ad_type: 'banner',
        media_url: '',
        media_type: 'image',
        destination_url: '',
        title: '',
        description: '',
        daily_budget: 0,
        total_budget: 0,
        skip_after_seconds: 5,
        reward_amount: 0,
        duration_days: 1,
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateApiKey = async () => {
    if (!user || !newKeyName.trim()) return;
    try {
      await createApiKey.mutateAsync({ user_id: user.id, app_name: newKeyName.trim() });
      toast.success('API key created!');
      setNewKeyName('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied!');
  };

  const togglePause = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateCampaign.mutateAsync({ id, status: newStatus });
      toast.success(`Campaign ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'approved': return 'bg-blue-500/10 text-blue-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      case 'paused': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Advertiser Dashboard</h1>
            <p className="text-muted-foreground">Create and manage your ad campaigns</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Campaign</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Ad Campaign</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new ad campaign.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
                  <p>Pricing: 10 Pi per ad + duration fee (1 day: 10 Pi, 2 days: 20 Pi, 3 days: 50 Pi).</p>
                </div>
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Ad Type</Label>
                  <Select value={form.ad_type} onValueChange={v => setForm({...form, ad_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="interstitial">Interstitial</SelectItem>
                      <SelectItem value="rewarded">Rewarded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <MediaUpload
                  value={form.media_url}
                  mediaType={form.media_type}
                  onUpload={(url, detectedType) => setForm({...form, media_url: url, media_type: detectedType})}
                  onClear={() => setForm({...form, media_url: '', media_type: 'image'})}
                />
                <div className="space-y-2">
                  <Label>Destination URL</Label>
                  <Input value={form.destination_url} onChange={e => setForm({...form, destination_url: e.target.value})} required placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={String(form.duration_days)}
                    onValueChange={(v) => setForm({ ...form, duration_days: Number(v) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day (10 Pi)</SelectItem>
                      <SelectItem value="2">2 days (20 Pi)</SelectItem>
                      <SelectItem value="3">3 days (50 Pi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title (optional)</Label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
                </div>
                {form.ad_type === 'rewarded' && (
                  <div className="space-y-2">
                    <Label>Reward Amount</Label>
                    <Input type="number" value={form.reward_amount} onChange={e => setForm({...form, reward_amount: Number(e.target.value)})} />
                  </div>
                )}
                {(form.ad_type === 'interstitial' || form.ad_type === 'rewarded') && (
                  <div className="space-y-2">
                    <Label>Skip After (seconds)</Label>
                    <Input type="number" value={form.skip_after_seconds} onChange={e => setForm({...form, skip_after_seconds: Number(e.target.value)})} />
                  </div>
                )}
                <div className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-foreground">
                  Total: {10 + ({ 1: 10, 2: 20, 3: 50 } as Record<number, number>)[form.duration_days]} Pi
                </div>
                <Button type="submit" className="w-full" disabled={createCampaign.isPending}>
                  {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="campaigns">
          <TabsList className="mb-4">
            <TabsTrigger value="campaigns"><Megaphone className="h-4 w-4 mr-1" /> Campaigns</TabsTrigger>
            <TabsTrigger value="apikeys"><Key className="h-4 w-4 mr-1" /> API Keys</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            {isLoading ? (
              <p className="text-muted-foreground py-8 text-center">Loading campaigns...</p>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.map(c => (
                  <div key={c.id} className="p-4 rounded-2xl bg-card flex items-center gap-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-muted overflow-hidden">
                      {c.media_type === 'image' ? (
                        <img src={c.media_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <video src={c.media_url} className="h-full w-full object-cover" muted />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                        <Badge className={statusColor(c.status)}>{c.status}</Badge>
                        <Badge variant="outline">{c.ad_type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.impressions_count}</span>
                        <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{c.clicks_count}</span>
                        {c.ad_type === 'rewarded' && <span className="flex items-center gap-1"><Gift className="h-3 w-3" />{c.rewards_count}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(c.status === 'active' || c.status === 'paused') && (
                        <Button size="sm" variant="outline" onClick={() => togglePause(c.id, c.status)}>
                          {c.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete this campaign?')) deleteCampaign.mutate(c.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No campaigns yet. Create your first one!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="apikeys">
            <div className="mb-4 flex gap-2">
              <Input placeholder="App name (e.g. My Game)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
              <Button onClick={handleCreateApiKey} disabled={!newKeyName.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Generate Key
              </Button>
            </div>
            {apiKeys && apiKeys.length > 0 ? (
              <div className="space-y-3">
                {apiKeys.map(k => (
                  <div key={k.id} className="p-4 rounded-2xl bg-card flex items-center gap-4">
                    <Key className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{k.app_name}</h3>
                      <p className="text-xs text-muted-foreground font-mono truncate">{k.api_key}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyKey(k.api_key)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete this API key?')) deleteApiKey.mutate(k.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No API keys yet. Generate one to integrate ads in your apps.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="integration">
            <div className="bg-card rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold text-foreground">Client Integration Guide</h2>
              <p className="text-sm text-muted-foreground">Base URL: <code className="bg-muted px-2 py-0.5 rounded text-foreground">{`${import.meta.env.VITE_SUPABASE_URL}/functions/v1`}</code></p>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Request an Ad</h3>
                <pre className="bg-muted rounded-xl p-4 text-sm overflow-x-auto text-foreground">
{`GET ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/servead?type=banner
Headers:
  x-api-key: YOUR_API_KEY

Response:
{
  "ad": {
    "id": "uuid",
    "media_url": "https://...",
    "media_type": "image",
    "destination_url": "https://...",
    "title": "Ad Title",
    "ad_type": "banner",
    "skip_after_seconds": 5,
    "reward_amount": 0
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Track Impression</h3>
                <pre className="bg-muted rounded-xl p-4 text-sm overflow-x-auto text-foreground">
{`POST ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/servead
Headers:
  x-api-key: YOUR_API_KEY
  Content-Type: application/json
Body: { "event": "impression", "ad_id": "ad-uuid-here" }`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Track Click</h3>
                <pre className="bg-muted rounded-xl p-4 text-sm overflow-x-auto text-foreground">
{`POST ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/servead
Headers:
  x-api-key: YOUR_API_KEY
  Content-Type: application/json
Body: { "event": "click", "ad_id": "ad-uuid-here" }`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">4. Track Reward Completion (Rewarded Ads)</h3>
                <pre className="bg-muted rounded-xl p-4 text-sm overflow-x-auto text-foreground">
{`POST ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/servead
Headers:
  x-api-key: YOUR_API_KEY
  Content-Type: application/json
Body: { "event": "reward_complete", "ad_id": "ad-uuid-here" }`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Ad Types</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">banner:</strong> Small ads displayed at top/bottom of screen. Best for passive monetization.</p>
                  <p><strong className="text-foreground">interstitial:</strong> Full-screen ads shown at natural breaks. Higher engagement.</p>
                  <p><strong className="text-foreground">rewarded:</strong> Users watch to earn in-app rewards. Highest engagement & revenue.</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Example: JavaScript/React Native</h3>
                <pre className="bg-muted rounded-xl p-4 text-sm overflow-x-auto text-foreground">
{`const API_KEY = "your-api-key";
const BASE = "${import.meta.env.VITE_SUPABASE_URL}/functions/v1";

// Fetch a banner ad
const res = await fetch(\`\${BASE}/servead?type=banner\`, {
  headers: { "x-api-key": API_KEY }
});
const { ad } = await res.json();

// Track impression when shown
await fetch(\`\${BASE}/servead\`, {
  method: "POST",
  headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ event: "impression", ad_id: ad.id })
});

// Track click when tapped
await fetch(\`\${BASE}/servead\`, {
  method: "POST",
  headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ event: "click", ad_id: ad.id })
});`}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

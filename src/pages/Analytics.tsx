import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsSummary } from '@/hooks/useCampaignAnalytics';
import { Eye, MousePointerClick, Gift, TrendingUp, Megaphone } from 'lucide-react';

export default function Analytics() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useAnalyticsSummary();

  if (!loading && !user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

        {isLoading ? (
          <p className="text-muted-foreground py-8 text-center">Loading analytics...</p>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Eye className="h-5 w-5" />} label="Impressions" value={data.totalImpressions.toLocaleString()} />
              <StatCard icon={<MousePointerClick className="h-5 w-5" />} label="Clicks" value={data.totalClicks.toLocaleString()} />
              <StatCard icon={<TrendingUp className="h-5 w-5" />} label="CTR" value={`${data.ctr}%`} />
              <StatCard icon={<Gift className="h-5 w-5" />} label="Rewards" value={data.totalRewards.toLocaleString()} />
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Campaign Breakdown</h2>
              <span className="text-sm text-muted-foreground">({data.activeCampaigns} active)</span>
            </div>

            {data.campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 pr-4 text-muted-foreground font-medium">Campaign</th>
                      <th className="py-3 pr-4 text-muted-foreground font-medium">Type</th>
                      <th className="py-3 pr-4 text-muted-foreground font-medium">Status</th>
                      <th className="py-3 pr-4 text-muted-foreground font-medium text-right">Views</th>
                      <th className="py-3 pr-4 text-muted-foreground font-medium text-right">Clicks</th>
                      <th className="py-3 text-muted-foreground font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map(c => {
                      const ctr = c.impressions_count > 0 ? ((c.clicks_count / c.impressions_count) * 100).toFixed(2) : '0.00';
                      return (
                        <tr key={c.id} className="border-b border-border">
                          <td className="py-3 pr-4 text-foreground font-medium">{c.name}</td>
                          <td className="py-3 pr-4 text-muted-foreground capitalize">{c.ad_type}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status === 'active' ? 'bg-green-500/10 text-green-500' :
                              c.status === 'paused' ? 'bg-muted text-muted-foreground' :
                              'bg-yellow-500/10 text-yellow-500'
                            }`}>{c.status}</span>
                          </td>
                          <td className="py-3 pr-4 text-right text-foreground">{c.impressions_count?.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-right text-foreground">{c.clicks_count?.toLocaleString()}</td>
                          <td className="py-3 text-right text-foreground">{ctr}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No campaigns yet</p>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="flex items-center gap-2 text-primary mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

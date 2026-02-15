import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Download, Star, DollarSign, TrendingUp, 
  Users, AlertCircle, Apple, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: apps = [] } = useQuery({
    queryKey: ["mobileApps"],
    queryFn: () => base44.entities.MobileApp.list()
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["appReviews"],
    queryFn: () => base44.entities.AppReview.list("-review_date", 100)
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["appAnalytics"],
    queryFn: () => base44.entities.AppAnalytics.list("-date", 30)
  });

  // Calculate KPIs
  const totalDownloads = apps.reduce((sum, app) => 
    sum + (app.downloads_ios || 0) + (app.downloads_android || 0), 0
  );
  
  const totalRevenue = apps.reduce((sum, app) => sum + (app.revenue_total || 0), 0);
  
  const avgRating = apps.length > 0 
    ? apps.reduce((sum, app) => {
        const ios = app.rating_ios || 0;
        const android = app.rating_android || 0;
        return sum + (ios + android) / 2;
      }, 0) / apps.length
    : 0;

  const publishedApps = apps.filter(a => a.status === 'published').length;
  const inReviewApps = apps.filter(a => a.status === 'review').length;

  // Recent analytics
  const last7DaysDownloads = analytics
    .filter(a => {
      const date = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .reduce((sum, a) => sum + (a.downloads || 0), 0);

  const recentReviews = reviews.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-indigo-600" />
            App Store Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Gestão de Apps iOS & Android</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <Badge variant="outline">{publishedApps} live</Badge>
              </div>
              <p className="text-3xl font-bold text-indigo-600">{apps.length}</p>
              <p className="text-sm text-slate-500">Total Apps</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Download className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-100 text-green-700">+{last7DaysDownloads}</Badge>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {(totalDownloads / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-slate-500">Downloads</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-amber-600" />
                <Badge variant="outline">{reviews.length} reviews</Badge>
              </div>
              <p className="text-3xl font-bold text-amber-600">{avgRating.toFixed(1)}</p>
              <p className="text-sm text-slate-500">Avg Rating</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                ${(totalRevenue / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-slate-500">Revenue</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Apps List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Seus Apps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apps.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                    {app.icon_url ? (
                      <img src={app.icon_url} alt={app.app_name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {app.app_name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{app.app_name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          {((app.rating_ios || 0) + (app.rating_android || 0)) / 2 || 0}
                        </span>
                        <span>•</span>
                        <span>{((app.downloads_ios || 0) + (app.downloads_android || 0)).toLocaleString()} downloads</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {(app.platform === 'ios' || app.platform === 'both') && (
                        <Badge variant="outline" className="bg-slate-900 text-white border-slate-900">
                          <Apple className="w-3 h-3" />
                        </Badge>
                      )}
                      {(app.platform === 'android' || app.platform === 'both') && (
                        <Badge variant="outline" className="bg-green-600 text-white border-green-600">
                          <Globe className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <Badge className={cn(
                      app.status === 'published' ? 'bg-green-100 text-green-700' :
                      app.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    )}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
                {apps.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum app cadastrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Reviews Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{review.user_name || 'Anônimo'}</p>
                        <Badge variant="outline" className="text-xs">{review.platform}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn(
                            "w-3 h-3",
                            i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"
                          )} />
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
                    <p className="text-sm text-slate-600 line-clamp-2">{review.review_text}</p>
                    {review.sentiment && (
                      <Badge className={cn(
                        "mt-2 text-xs",
                        review.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        review.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      )}>
                        {review.sentiment}
                      </Badge>
                    )}
                  </div>
                ))}
                {recentReviews.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma review ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {inReviewApps > 0 && (
          <Card className="border-0 shadow-sm mt-6 border-l-4 border-l-yellow-500">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm">
                <span className="font-semibold">{inReviewApps} app(s)</span> em revisão nas stores
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
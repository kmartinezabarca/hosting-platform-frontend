import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Globe, 
  CreditCard, 
  MessageSquare, 
  Activity, 
  TrendingUp
} from 'lucide-react';

function ClientDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your services today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button size="sm">
            <Server className="w-4 h-4 mr-2" />
            New Service
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Services
            </CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Running smoothly
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+2 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Domains
            </CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered domains
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+1 this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Spend
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$127.50</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current billing cycle
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">-$12.50 vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Support Tickets
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              1 open, 1 resolved
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">Response time: 2h avg</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Your Services
          </CardTitle>
          <CardDescription>
            Manage and monitor your active services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">Web Hosting Pro</h3>
                <p className="text-sm text-muted-foreground">Shared Hosting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <Badge variant="default">Active</Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Usage: 65%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">$29.99/month</div>
                <div className="text-xs text-muted-foreground">
                  Next: 2025-09-15
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">Minecraft Server</h3>
                <p className="text-sm text-muted-foreground">Game Server</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <Badge variant="default">Active</Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Usage: 45%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">$19.99/month</div>
                <div className="text-xs text-muted-foreground">
                  Next: 2025-09-10
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">VPS Cloud</h3>
                <p className="text-sm text-muted-foreground">Virtual Server</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <Badge variant="secondary">Maintenance</Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Usage: 80%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">$79.99/month</div>
                <div className="text-xs text-muted-foreground">
                  Next: 2025-09-20
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientDashboardPage;


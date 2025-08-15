import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Globe, 
  Gamepad2, 
  Database, 
  Settings, 
  Play,
  Pause,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

function ClientServicesPage() {
  const services = [
    {
      id: 1,
      name: "Web Hosting Pro",
      type: "Shared Hosting",
      status: "active",
      icon: Globe,
      plan: "Pro Plan",
      usage: {
        disk: 65,
        bandwidth: 45
      },
      specs: {
        disk: "50 GB SSD",
        bandwidth: "Unlimited",
        domains: "10 Domains",
        email: "Unlimited Email"
      },
      price: "$29.99/month",
      nextBilling: "2025-09-15",
      domain: "mywebsite.com"
    },
    {
      id: 2,
      name: "Minecraft Server",
      type: "Game Server",
      status: "active",
      icon: Gamepad2,
      plan: "Standard",
      usage: {
        ram: 45,
        cpu: 30,
        players: 12
      },
      specs: {
        ram: "4 GB RAM",
        cpu: "2 vCPU",
        storage: "25 GB SSD",
        players: "20 Max Players"
      },
      price: "$19.99/month",
      nextBilling: "2025-09-10",
      ip: "192.168.1.100:25565"
    },
    {
      id: 3,
      name: "VPS Cloud",
      type: "Virtual Server",
      status: "maintenance",
      icon: Server,
      plan: "VPS-2",
      usage: {
        ram: 80,
        cpu: 65,
        disk: 55
      },
      specs: {
        ram: "8 GB RAM",
        cpu: "4 vCPU",
        storage: "100 GB SSD",
        bandwidth: "5 TB"
      },
      price: "$79.99/month",
      nextBilling: "2025-09-20",
      ip: "192.168.1.200"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      case 'stopped': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'suspended': return 'Suspended';
      case 'stopped': return 'Stopped';
      default: return 'Unknown';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'maintenance': return 'secondary';
      case 'suspended': return 'destructive';
      case 'stopped': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Services</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all your active services
          </p>
        </div>
        <Button size="sm">
          <Server className="w-4 h-4 mr-2" />
          Order New Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.type} • {service.plan}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`}></div>
                  <Badge variant={getStatusBadgeVariant(service.status)}>
                    {getStatusText(service.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Usage Stats - Simplified */}
              <div className="space-y-3">
                {service.type === "Shared Hosting" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-accent/20 rounded">
                      <div className="font-semibold text-blue-600">{service.usage.disk}%</div>
                      <div className="text-muted-foreground">Disk Usage</div>
                    </div>
                    <div className="text-center p-2 bg-accent/20 rounded">
                      <div className="font-semibold text-green-600">{service.usage.bandwidth}%</div>
                      <div className="text-muted-foreground">Bandwidth</div>
                    </div>
                  </div>
                )}

                {service.type === "Game Server" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 bg-accent/20 rounded">
                      <div className="font-semibold text-purple-600">{service.usage.ram}%</div>
                      <div className="text-muted-foreground">RAM Usage</div>
                    </div>
                    <div className="text-center p-2 bg-accent/20 rounded">
                      <div className="font-semibold text-orange-600">{service.usage.players}/20</div>
                      <div className="text-muted-foreground">Players</div>
                    </div>
                  </div>
                )}

                {service.type === "Virtual Server" && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-accent/20 rounded">
                      <div className="font-semibold text-purple-600">{service.usage.ram}%</div>
                      <div className="text-muted-foreground">RAM</div>
                    </div>
                    <div className="text-center p-2 bg-accent/20 rounded">
                      <div className="font-semibold text-blue-600">{service.usage.cpu}%</div>
                      <div className="text-muted-foreground">CPU</div>
                    </div>
                    <div className="text-center p-2 bg-accent/20 rounded">
                      <div className="font-semibold text-green-600">{service.usage.disk}%</div>
                      <div className="text-muted-foreground">Disk</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(service.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                
                {service.domain && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Domain: </span>
                    <span className="font-medium">{service.domain}</span>
                  </div>
                )}
                
                {service.ip && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">IP: </span>
                    <span className="font-medium font-mono">{service.ip}</span>
                  </div>
                )}
              </div>

              {/* Pricing & Billing */}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{service.price}</div>
                    <div className="text-xs text-muted-foreground">
                      Next billing: {service.nextBilling}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="w-4 h-4 mr-1" />
                  Manage
                </Button>
                {service.status === 'active' ? (
                  <Button variant="outline" size="sm">
                    <Pause className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {service.domain && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and service management options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Server className="w-6 h-6" />
              <span>Order VPS</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Globe className="w-6 h-6" />
              <span>Register Domain</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Database className="w-6 h-6" />
              <span>Backup Services</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientServicesPage;



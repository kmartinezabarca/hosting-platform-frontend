import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, TrendingUp } from 'lucide-react';

export default {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export const Default = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Título de tarjeta</CardTitle>
        <CardDescription>Descripción breve del contenido</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Aquí va el contenido principal de la tarjeta.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Acción principal</Button>
      </CardFooter>
    </Card>
  ),
};

export const ServiceCard = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          VPS Pro — Plan Básico
        </CardTitle>
        <CardDescription>Servidor virtual privado</CardDescription>
        <CardAction>
          <Badge variant="default">Activo</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Próximo pago</span>
            <span>15 jul 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio</span>
            <span className="font-medium">$29.99/mes</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" className="flex-1">Administrar</Button>
        <Button size="sm" className="flex-1">Ver detalles</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatCard = {
  render: () => (
    <Card className="w-60">
      <CardHeader>
        <CardDescription>Ingresos del mes</CardDescription>
        <CardTitle className="text-3xl font-bold">$4,280</CardTitle>
        <CardAction>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <TrendingUp className="h-3 w-3 mr-1" />+12%
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
  ),
};

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    children: { control: 'text' },
  },
};

export const Default = {
  args: { children: 'Etiqueta' },
};

export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const ServiceStatus = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" /> Activo
      </Badge>
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle className="h-3 w-3 mr-1" /> Suspendido
      </Badge>
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" /> Pendiente
      </Badge>
      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
        <AlertTriangle className="h-3 w-3 mr-1" /> Vencido
      </Badge>
    </div>
  ),
};

export const TicketPriority = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="outline">Baja</Badge>
      <Badge variant="secondary">Media</Badge>
      <Badge variant="default">Alta</Badge>
      <Badge variant="destructive">Urgente</Badge>
    </div>
  ),
};

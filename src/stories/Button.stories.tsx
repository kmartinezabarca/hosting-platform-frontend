import { Button } from '@/components/ui/button';
import { Mail, Trash2, Plus, Loader2 } from 'lucide-react';

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export const Default = {
  args: { children: 'Botón' },
};

export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon"><Plus /></Button>
    </div>
  ),
};

export const WithIcon = {
  render: () => (
    <div className="flex gap-3">
      <Button><Mail className="mr-2 h-4 w-4" /> Enviar correo</Button>
      <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
      <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Agregar</Button>
    </div>
  ),
};

export const Loading = {
  render: () => (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Cargando...
    </Button>
  ),
};

export const Disabled = {
  args: { children: 'Deshabilitado', disabled: true },
};

// src/pages/admin/AdminAddOnsPage.jsx
import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  ChevronDown,
  Check
} from 'lucide-react';

// Hooks React Query (admin)
import {
  useAdminAddOns,
  useAdminServicePlans,
  useAdminCreateAddOn,
  useAdminUpdateAddOn,
  useAdminDeleteAddOn,
} from '@/hooks/useAdminAddOns';

const menuItemCls =
  'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-accent hover:text-foreground';

const menuContentCls =
  'min-w-[220px] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-md';

const triggerButtonCls =
  'inline-flex h-9 items-center justify-between gap-2 rounded-lg border bg-background px-3 text-sm font-medium text-foreground shadow-sm hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

const smallIcon = 'h-4 w-4';
const medIcon = 'h-5 w-5';

const AdminAddOnsPage = () => {
  /* ---------------- UI State ---------------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [page, setPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState(null);

  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    price: '',
    currency: 'MXN', // Usaremos DropdownMenu
    is_active: true,
    metadata: {},
    service_plans: [],
  });

  /* ---------------- Query Params ---------------- */
  const listParams = {
    search: searchTerm || undefined,
    is_active: statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,
    page,
    per_page: 20,
  };

  /* ---------------- Queries ---------------- */
  const { data: addOnsData, isLoading: isLoadingAddOns } = useAdminAddOns(listParams, {
    keepPreviousData: true,
  });

  const { data: plansData, isLoading: isLoadingPlans } = useAdminServicePlans();

  const addOns = addOnsData?.rows ?? [];
  const pagination = addOnsData?.meta ?? {};
  const servicePlans = plansData?.rows ?? [];

  /* ---------------- Mutations ---------------- */
  const createAddOn = useAdminCreateAddOn({
    onSuccess: () => {
      resetForm();
      setIsCreateModalOpen(false);
    },
  });

  const updateAddOn = useAdminUpdateAddOn({
    onSuccess: () => {
      resetForm();
      setIsEditModalOpen(false);
    },
  });

  const deleteAddOn = useAdminDeleteAddOn();

  /* ---------------- Handlers ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price || 0),
    };
    if (editingAddOn) {
      updateAddOn.mutate({ uuid: editingAddOn.uuid, data: payload });
    } else {
      createAddOn.mutate(payload);
    }
  };

  const handleDelete = (uuid) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este add-on?')) return;
    deleteAddOn.mutate(uuid);
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      name: '',
      description: '',
      price: '',
      currency: 'MXN',
      is_active: true,
      metadata: {},
      service_plans: [],
    });
    setEditingAddOn(null);
  };

  const openEditModal = (addOn) => {
    setEditingAddOn(addOn);
    setFormData({
      slug: addOn.slug ?? '',
      name: addOn.name ?? '',
      description: addOn.description ?? '',
      price: (addOn.price ?? '').toString(),
      currency: addOn.currency ?? 'MXN',
      is_active: Boolean(addOn.is_active),
      metadata: addOn.metadata ?? {},
      service_plans: addOn.plans?.map((p) => p.id) ?? [],
    });
    setIsEditModalOpen(true);
  };

  const handleServicePlanChange = (planId, checked) => {
    setFormData((prev) => ({
      ...prev,
      service_plans: checked
        ? [...prev.service_plans, planId]
        : prev.service_plans.filter((id) => id !== planId),
    }));
  };

  /* ---------------- Menús (DropdownMenu) ---------------- */
  const StatusDropdown = () => {
    const label =
      statusFilter === 'all' ? 'Todos los estados' : statusFilter === 'active' ? 'Activos' : 'Inactivos';

    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className={`${triggerButtonCls} w-48`}>
            <span className="truncate">{label}</span>
            <ChevronDown className={smallIcon} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" sideOffset={8} className={menuContentCls}>
            {[
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Activos' },
              { value: 'inactive', label: 'Inactivos' },
            ].map((opt) => (
              <DropdownMenu.Item
                key={opt.value}
                className={menuItemCls}
                onSelect={() => {
                  setStatusFilter(opt.value);
                  setPage(1);
                }}
              >
                <span className="flex-1">{opt.label}</span>
                {statusFilter === opt.value && <Check className={smallIcon} />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  };

  const CurrencyDropdown = () => {
    const currencies = [
      { value: 'MXN', label: 'MXN - Peso Mexicano' },
      { value: 'USD', label: 'USD - Dólar Americano' },
      { value: 'EUR', label: 'EUR - Euro' },
    ];

    const current = currencies.find((c) => c.value === formData.currency)?.label ?? formData.currency;

    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className={`${triggerButtonCls} w-full justify-between`}>
            <span className="truncate">{current}</span>
            <ChevronDown className={smallIcon} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" sideOffset={8} className={menuContentCls}>
            {currencies.map((c) => (
              <DropdownMenu.Item
                key={c.value}
                className={menuItemCls}
                onSelect={() => setFormData((p) => ({ ...p, currency: c.value }))}
              >
                <span className="flex-1">{c.label}</span>
                {formData.currency === c.value && <Check className={smallIcon} />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  };

  /* ---------------- Form ---------------- */
  const AddOnForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="ssl-certificate"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="Certificado SSL"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          placeholder="Descripción del add-on..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
            placeholder="29.99"
            required
          />
        </div>
        <div>
          <Label>Moneda</Label>
          <CurrencyDropdown />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: checked }))}
        />
        <Label htmlFor="is_active">Add-on Activo</Label>
      </div>

      <div>
        <Label className="text-base font-medium">Planes de Servicio Compatibles</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona los planes de servicio que pueden usar este add-on
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto rounded-lg border p-4">
          {isLoadingPlans ? (
            <div className="col-span-2 text-sm text-muted-foreground">Cargando planes...</div>
          ) : servicePlans.length ? (
            servicePlans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-2">
                <Checkbox
                  id={`plan-${plan.id}`}
                  checked={formData.service_plans.includes(plan.id)}
                  onCheckedChange={(checked) => handleServicePlanChange(plan.id, checked)}
                />
                <Label htmlFor={`plan-${plan.id}`} className="text-sm">
                  {plan.name}
                </Label>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-sm text-muted-foreground">No hay planes disponibles.</div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={createAddOn.isPending || updateAddOn.isPending}>
          {editingAddOn ? 'Actualizar' : 'Crear'} Add-on
        </Button>
      </div>
    </form>
  );

  /* ---------------- Loading ---------------- */
  if (isLoadingAddOns) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex h-64 items-center justify-center text-lg">Cargando add-ons...</div>
      </div>
    );
  }

  /* ---------------- Stats ---------------- */
  const activos = addOns.filter((a) => a.is_active).length;
  const avg =
    addOns.length > 0
      ? addOns.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0) / addOns.length
      : 0;

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-6 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add-ons</h1>
          <p className="text-muted-foreground">Gestiona los complementos disponibles para los planes</p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className={smallIcon} />
              Nuevo Add-on
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Add-on</DialogTitle>
            </DialogHeader>
            <AddOnForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid items-stretch gap-4 md:grid-cols-3">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Add-ons</CardTitle>
            <Package className={`${medIcon} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{addOns.length}</div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add-ons Activos</CardTitle>
            <Eye className={`${medIcon} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activos}</div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className={`${medIcon} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${avg.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar add-ons…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <StatusDropdown />
      </div>

      {/* List */}
      <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        {addOns.map((addOn) => (
          <Card key={addOn.id} className="relative h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <span className="truncate">{addOn.name}</span>
                    <Badge variant={addOn.is_active ? 'default' : 'secondary'}>
                      {addOn.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="truncate">{addOn.slug}</CardDescription>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {addOn.is_active ? (
                    <Eye className="text-green-500 h-4 w-4" />
                  ) : (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">
                  ${addOn.price} {addOn.currency}
                </div>
                <div className="text-sm text-muted-foreground">Precio mensual</div>
              </div>

              {addOn.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{addOn.description}</p>
              )}

              {!!addOn.plans?.length && (
                <div>
                  <div className="mb-2 text-sm font-medium">Planes compatibles:</div>
                  <div className="flex flex-wrap gap-1">
                    {addOn.plans.slice(0, 2).map((plan) => (
                      <Badge key={plan.id} variant="outline" className="text-xs">
                        {plan.name}
                      </Badge>
                    ))}
                    {addOn.plans.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{addOn.plans.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(addOn)} className="gap-2">
                  <Edit className={smallIcon} />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(addOn.uuid)}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className={smallIcon} />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {(pagination?.last_page || 1) > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, (p || 1) - 1))}
            disabled={(page || 1) <= 1}
          >
            Anterior
          </Button>
          <div className="text-sm text-muted-foreground">
            Página {pagination?.current_page || page} de {pagination?.last_page}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination?.last_page || 1, (p || 1) + 1))}
            disabled={(page || 1) >= (pagination?.last_page || 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Empty state */}
      {addOns.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-muted-foreground">No se encontraron add-ons</div>
        </div>
      )}

      {/* Edit modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Add-on</DialogTitle>
          </DialogHeader>
          <AddOnForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAddOnsPage;
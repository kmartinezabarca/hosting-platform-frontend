import React, { useState } from "react";
import {
  Receipt,
  CreditCard,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// --- Hooks de React Query ---
import {
  useInvoices,
  useInvoiceStats,
  usePaymentMethods,
  useTransactions,
  useProcessPayment,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from "../../hooks/useInvoices";

// --- Componentes de UI ---
import StatsCards from "../../components/invoices/StatsCards";
import InvoicesList from "../../components/invoices/InvoicesList";
import PaymentMethods from "../../components/invoices/PaymentMethods";
import Transactions from "../../components/invoices/Transactions";
import PaymentModal from "../../components/invoices/PaymentModal";
import InvoiceDetailModal from "../../components/invoices/InvoiceDetailModal";
import AddPaymentMethodModal from "../../components/invoices/AddPaymentMethodModal";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import { useToast } from '@/components/ToastProvider';

// --- Componentes Internos para Estados de Carga y Error ---

const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    {/* Skeleton del Header */}
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded-md" />
        <div className="h-5 w-72 bg-muted rounded-md" />
      </div>
    </div>
    {/* Skeleton de las Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-6 h-28"
        />
      ))}
    </div>
    {/* Skeleton del Contenedor de Pestañas */}
    <div className="bg-card border border-border rounded-2xl">
      <div className="h-14 border-b border-border" />
      <div className="p-6">
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="text-center bg-card border border-dashed border-destructive/30 rounded-2xl p-12">
      <div className="p-4 bg-destructive/10 rounded-full mb-4 inline-block">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Ocurrió un Error
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        No pudimos cargar los datos de facturación. Por favor, comprueba tu
        conexión e inténtalo de nuevo.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  </div>
);

const ClientInvoicesPage = () => {
  // --- Estado de la UI (lo único que gestionamos manualmente) ---
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("invoices");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    search: "",
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState(null);

  // --- Hooks para obtener datos ---
  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    isError: isErrorInvoices,
    refetch: refetchInvoices,
  } = useInvoices(filters);
  const { data: paymentMethods, isLoading: isLoadingMethods } =
    usePaymentMethods();
  const { data: transactions } = useTransactions(filters);
  const { data: invoiceStats, isLoading: isLoadingStats } = useInvoiceStats();

  // --- Hooks para las mutaciones ---
  const processPaymentMutation = useProcessPayment();
  const setDefaultMethodMutation = useSetDefaultPaymentMethod();
  const deleteMethodMutation = useDeletePaymentMethod();

  // --- Manejadores de eventos ---
  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = (invoiceId, paymentMethodId) => {
    processPaymentMutation.mutate(
      { invoice_id: invoiceId, payment_method_id: paymentMethodId },
      {
        onSuccess: () => {
          setShowPaymentModal(false);
          toast({
            title: 'Pago en proceso',
            description: 'Tu pago se está procesando. La factura se actualizará en breve.',
            variant: 'success',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error en el pago',
            description: error.message || 'No se pudo procesar el pago. Inténtalo de nuevo.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleSetDefaultPaymentMethod = (method) => {
    setDefaultMethodMutation.mutate(method.uuid, {
      onSuccess: () => {
        toast({
          title: 'Método de pago actualizado',
          description: `La tarjeta que termina en ${method.last4} es ahora tu método predeterminado.`,
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error al actualizar',
          description: error.message || 'No se pudo establecer el método como predeterminado.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleDeletePaymentMethod = (method) => {
    setMethodToDelete(method);
  };

  const confirmDelete = () => {
    if (methodToDelete) {
      deleteMethodMutation.mutate(methodToDelete.uuid, {
        onSuccess: () => {
          toast({
            title: 'Método de pago eliminado',
            description: `La tarjeta que termina en ${methodToDelete.last4} ha sido eliminada.`,
            variant: 'success',
          });
          setMethodToDelete(null); // Cierra el modal
        },
        onError: (error) => {
          toast({
            title: 'Error al eliminar',
            description: error.message || 'No se pudo eliminar el método de pago.',
            variant: 'destructive',
          });
          setMethodToDelete(null); // Cierra el modal también en caso de error
        },
      });
    }
  };

    const handlePaymentMethodAdded = () => {
    setShowAddPaymentModal(false);
    toast({
      title: 'Método de pago añadido',
      description: 'Tu nuevo método de pago está listo para usarse.',
      variant: 'success',
    });
  };

  const isLoading = isLoadingInvoices || isLoadingMethods || isLoadingStats;
  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isErrorInvoices) {
    return <ErrorState onRetry={refetchInvoices} />;
  }

  const TABS = [
    { id: "invoices", name: "Facturas", icon: Receipt },
    { id: "payments", name: "Métodos de Pago", icon: CreditCard },
    { id: "transactions", name: "Transacciones", icon: TrendingUp },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Facturas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus facturas, métodos de pago y transacciones
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <StatsCards
        invoiceStats={invoiceStats}
        paymentMethodCount={paymentMethods?.length || 0}
      />

      {/* Contenedor de Pestañas */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Navegación de Pestañas */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de las Pestañas */}
        <div className="p-6">
          {activeTab === "invoices" && (
            <InvoicesList
              invoices={invoices}
              filters={filters}
              setFilters={setFilters}
              onSelectInvoice={(invoice) => {
                setSelectedInvoice(invoice);
                setShowInvoiceModal(true);
              }}
              onPayInvoice={handlePayInvoice}
            />
          )}
          {activeTab === "payments" && (
            <PaymentMethods
              paymentMethods={paymentMethods}
              onAddMethod={() => setShowAddPaymentModal(true)}
              onSetDefault={handleSetDefaultPaymentMethod}
              onDeleteMethod={handleDeletePaymentMethod}
              loading={
                setDefaultMethodMutation.isPending ||
                deleteMethodMutation.isPending
              }
            />
          )}
          {activeTab === "transactions" && (
            <Transactions
              transactions={transactions}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        </div>
      </div>

      {/* Modales */}
      <PaymentModal
        show={showPaymentModal}
        invoice={selectedInvoice}
        paymentMethods={paymentMethods}
        onClose={() => setShowPaymentModal(false)}
        onPay={processPayment}
        isProcessing={processPaymentMutation.isPending}
      />
      <InvoiceDetailModal
        show={showInvoiceModal}
        invoice={selectedInvoice}
        onClose={() => setShowInvoiceModal(false)}
        onPay={(invoice) => {
          setShowInvoiceModal(false);
          handlePayInvoice(invoice);
        }}
      />
      <AddPaymentMethodModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSuccess={handlePaymentMethodAdded}
        isDefault={paymentMethods?.length === 0}
      />

      <ConfirmationModal
        isOpen={!!methodToDelete}
        onClose={() => setMethodToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Método de Pago"
        confirmText="Sí, eliminar"
        isConfirming={deleteMethodMutation.isPending}
      >
        <p>
          ¿Estás seguro de que deseas eliminar la tarjeta que termina en
          <strong className="text-foreground"> {methodToDelete?.last4}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </ConfirmationModal>
    </div>
  );
};

export default ClientInvoicesPage;

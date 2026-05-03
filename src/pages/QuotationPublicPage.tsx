import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicQuotation } from '@/hooks/useQuotations';
import quotationService from '@/services/quotationService';
import { Loader2, Download, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import logoROKE from '../assets/logo_v4.png';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount);

const fmtDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

const STATUS_LABEL: Record<string, string> = {
  draft:    'Borrador',
  sent:     'Enviada',
  viewed:   'Vista',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired:  'Expirada',
};

const STATUS_COLOR: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-700',
  sent:     'bg-blue-100 text-blue-700',
  viewed:   'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired:  'bg-orange-100 text-orange-700',
};

// ── Print styles injected once ────────────────────────────────────────────────

const PRINT_STYLES = `
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .print-break { page-break-before: always; }
  @page { margin: 1.5cm; }
}
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuotationPublicPage() {
  const { token } = useParams<{ token: string }>();
  const { data: quotation, isLoading, isError, error } = usePublicQuotation(token ?? '');
  const markedRef = useRef(false);

  // Inject print CSS once
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = PRINT_STYLES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Mark as viewed once on load
  useEffect(() => {
    if (!token || markedRef.current || !quotation) return;
    markedRef.current = true;
    quotationService.markViewed(token).catch(() => { /* silent */ });
  }, [token, quotation]);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Cargando cotización…</p>
      </div>
    );
  }

  // ── Error / Not found ────────────────────────────────────────────────────

  if (isError || !quotation) {
    const msg = (error as any)?.response?.data?.message ?? 'Esta cotización no existe o el enlace no es válido.';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Enlace no válido</h1>
          <p className="text-gray-500 text-sm">{msg}</p>
        </div>
      </div>
    );
  }

  // ── Expired ──────────────────────────────────────────────────────────────

  const expired = isExpired(quotation.expires_at);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Expiration banner */}
      {expired && (
        <div className="no-print max-w-4xl mx-auto mb-6">
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>
              Este enlace expiró el <strong>{fmtDate(quotation.expires_at)}</strong>.
              Contacta a ROKE Industries para solicitar un nuevo enlace.
            </span>
          </div>
        </div>
      )}

      {/* Download button */}
      <div className="no-print max-w-4xl mx-auto mb-4 flex justify-end">
        <Button
          onClick={() => window.print()}
          className="flex items-center gap-2 shadow-sm"
          disabled={expired}
        >
          <Download className="h-4 w-4" />
          Descargar PDF
        </Button>
      </div>

      {/* ── Quotation document ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logoROKE} alt="ROKE Industries" className="h-12 object-contain brightness-200" />
              <div>
                <p className="text-slate-300 text-xs uppercase tracking-widest font-medium">ROKE Industries</p>
                <p className="text-slate-400 text-xs mt-0.5">soporte@rokeindustries.com</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-xs uppercase tracking-widest mb-1">Cotización</p>
              <h1 className="text-2xl font-bold">{quotation.title}</h1>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[quotation.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABEL[quotation.status] ?? quotation.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meta bar */}
        <div className="bg-slate-50 border-b px-8 py-4">
          <div className="flex flex-wrap gap-6 text-sm text-slate-600">
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">Fecha de emisión</span>
              <span className="font-medium">{fmtDate(quotation.created_at)}</span>
            </div>
            {quotation.expires_at && (
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">Válida hasta</span>
                <span className={`font-medium flex items-center gap-1 ${expired ? 'text-orange-600' : 'text-green-600'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  {fmtDate(quotation.expires_at)}
                </span>
              </div>
            )}
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">Moneda</span>
              <span className="font-medium">{quotation.currency}</span>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">

          {/* Client info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">Para</p>
              <p className="font-bold text-lg text-slate-800">{quotation.client_name}</p>
              {quotation.client_company && (
                <p className="text-slate-500 text-sm">{quotation.client_company}</p>
              )}
              <p className="text-slate-500 text-sm">{quotation.client_email}</p>
              {quotation.client_phone && (
                <p className="text-slate-500 text-sm">{quotation.client_phone}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">De</p>
              <p className="font-bold text-lg text-slate-800">ROKE Industries</p>
              <p className="text-slate-500 text-sm">soporte@rokeindustries.com</p>
              <p className="text-slate-500 text-sm">rokeindustries.com</p>
            </div>
          </div>

          <Separator />

          {/* Items table */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-4">Servicios / Productos</p>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Descripción</th>
                    <th className="text-center px-4 py-3 font-medium w-20">Cant.</th>
                    <th className="text-right px-4 py-3 font-medium w-36">Precio Unit.</th>
                    <th className="text-right px-4 py-3 font-medium w-36">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(quotation.items ?? []).map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-slate-700">{item.description}</td>
                      <td className="px-4 py-3.5 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">
                        {fmt(item.unit_price, quotation.currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-800">
                        {fmt(item.subtotal ?? item.unit_price * item.quantity, quotation.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{fmt(quotation.subtotal, quotation.currency)}</span>
              </div>
              {quotation.discount_percent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({quotation.discount_percent}%)</span>
                  <span>−{fmt(quotation.discount_amount, quotation.currency)}</span>
                </div>
              )}
              {quotation.tax_percent > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>IVA ({quotation.tax_percent}%)</span>
                  <span>+{fmt(quotation.tax_amount, quotation.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg text-slate-800 pt-1">
                <span>Total</span>
                <span>{fmt(quotation.total, quotation.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-2">Notas</p>
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{quotation.notes}</p>
              </div>
            </>
          )}

          {/* Terms */}
          {quotation.terms && (
            <>
              <Separator />
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-2">Términos y condiciones</p>
                <p className="text-slate-500 text-xs whitespace-pre-wrap leading-relaxed">{quotation.terms}</p>
              </div>
            </>
          )}

          {/* Acceptance status */}
          {(quotation.status === 'accepted' || quotation.status === 'rejected') && (
            <>
              <Separator />
              <div className="flex items-center justify-center gap-3 py-4">
                {quotation.status === 'accepted' ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="text-green-700 font-semibold text-lg">Cotización aceptada</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-400" />
                    <span className="text-red-600 font-semibold text-lg">Cotización rechazada</span>
                  </>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t px-8 py-5">
          <p className="text-center text-slate-400 text-xs">
            Esta cotización fue generada por ROKE Industries · rokeindustries.com
            {quotation.expires_at && !expired && (
              <> · Válida hasta el {fmtDate(quotation.expires_at)}</>
            )}
          </p>
        </div>
      </div>

      {/* Bottom CTA for non-expired quotations */}
      {!expired && quotation.status !== 'accepted' && quotation.status !== 'rejected' && (
        <div className="no-print max-w-4xl mx-auto mt-6 text-center">
          <p className="text-slate-500 text-sm">
            ¿Tienes preguntas sobre esta cotización?{' '}
            <a
              href="mailto:soporte@rokeindustries.com"
              className="text-primary hover:underline font-medium"
            >
              Contáctanos
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Cloud,
  Database,
  Gamepad2,
  Globe,
  Info,
  Loader2,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBillingCycles } from "@application/hooks/useBillingCycles";
import { useCategories } from "@application/hooks/useCategories";
import { useServicePlans } from "@application/hooks/useServicePlans";

const iconMap = {
  Globe,
  Gamepad2,
  Cloud,
  Database,
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(value);

const getBillingPeriodLabel = (billingCycle: string) =>
  billingCycle === "monthly" ? "mes" : "periodo";

const getPlanPrice = (plan: any, billingCycle: string, discount = 0) => {
  const base = Number(plan.price?.[billingCycle] ?? 0);
  return {
    base,
    final: base * (1 - discount / 100),
  };
};

const orderPlans = (plans: any[]) => {
  const list = [...plans];
  const popularIndex = list.findIndex((plan) => plan.popular);
  if (list.length === 3 && popularIndex > -1 && popularIndex !== 1) {
    const [popularPlan] = list.splice(popularIndex, 1);
    list.splice(1, 0, popularPlan);
  }
  return list;
};

const ContractServicePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState("");
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: billingCycles = [], isLoading: billingCyclesLoading, error: billingCyclesError } = useBillingCycles();
  const { data: servicePlans = [], isLoading: servicePlansLoading, error: servicePlansError } = useServicePlans();

  const transformedCategories = useMemo(
    () =>
      categories.map((category) => ({
        id: category.slug,
        name: category.name,
        icon: iconMap[category.icon] || Globe,
        description: category.description,
        color: category.color || "text-blue-500",
        bgColor: category.bg_color || "bg-blue-500/15",
      })),
    [categories]
  );

  const transformedBillingCycles = useMemo(
    () =>
      billingCycles.map((cycle) => ({
        id: cycle.slug,
        name: cycle.name,
        discount: cycle.discount_percentage || 0,
      })),
    [billingCycles]
  );

  const plansByCategory = useMemo(() => {
    return servicePlans.reduce((acc, plan) => {
      const categorySlug = plan.category?.slug;
      if (!categorySlug) return acc;

      const pricing = {};
      if (Array.isArray(plan.pricing)) {
        plan.pricing.forEach((priceData) => {
          if (priceData.billing_cycle) {
            pricing[priceData.billing_cycle.slug] = parseFloat(priceData.price);
          }
        });
      }

      const features: any[] = [];
      if (Array.isArray(plan.features)) {
        plan.features
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .forEach((featureData) => {
            features.push(featureData.feature);
          });
      }

      if (!acc[categorySlug]) acc[categorySlug] = [];
      acc[categorySlug].push({
        id: plan.slug,
        name: plan.name,
        description: plan.description,
        price: pricing,
        popular: plan.is_popular || false,
        features,
        specs: plan.specifications || {},
      });

      return acc;
    }, {});
  }, [servicePlans]);

  const selectedCategoryInfo = transformedCategories.find((category) => category.id === selectedCategory);
  const currentDiscount = transformedBillingCycles.find((cycle) => cycle.id === billingCycle)?.discount ?? 0;
  const orderedPlans = orderPlans(plansByCategory[selectedCategory] || []);
  const selectedPlanPrice = selectedPlan ? getPlanPrice(selectedPlan, billingCycle, currentDiscount) : null;
  const visibleFeatures = selectedPlan?.features
    ? showAllFeatures
      ? selectedPlan.features
      : selectedPlan.features.slice(0, 6)
    : [];
  const hiddenFeatures = selectedPlan?.features ? Math.max(selectedPlan.features.length - visibleFeatures.length, 0) : 0;

  useEffect(() => {
    if (!selectedCategory && transformedCategories.length > 0) {
      setSelectedCategory(transformedCategories[0].id);
    }
  }, [selectedCategory, transformedCategories]);

  useEffect(() => {
    if (!billingCycle && transformedBillingCycles.length > 0) {
      setBillingCycle(transformedBillingCycles[0].id);
    }
  }, [billingCycle, transformedBillingCycles]);

  useEffect(() => {
    if (selectedPlan && !orderedPlans.some((plan) => plan.id === selectedPlan.id)) {
      setSelectedPlan(null);
    }
    setShowAllFeatures(false);
  }, [selectedCategory]);

  const handleProceedToCheckout = () => {
    if (!selectedPlan) return;

    navigate("/client/checkout", {
      state: { plan: selectedPlan, billingCycle, category: selectedCategory },
    });
  };

  const loading = categoriesLoading || billingCyclesLoading || servicePlansLoading;
  const error = categoriesError || billingCyclesError || servicePlansError;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando servicios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{(error as any)?.message ?? String(error)}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-[#0b0f14] dark:to-[#111827]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nuevo servicio</p>
            <h1 className="text-2xl font-bold text-foreground">Contratar servicio</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Configura lo esencial, compara los planes disponibles y revisa los detalles solo del plan que te interesa.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-[#101820] dark:text-slate-300">
            <Info className="h-4 w-4" />
            Soporte 24/7 incluido
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_340px]">
          <aside className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101820]">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso 1</p>
                <h2 className="text-base font-semibold text-foreground">Tipo de servicio</h2>
              </div>
              <div className="space-y-2">
                {transformedCategories.map((category) => {
                  const Icon = category.icon;
                  const active = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedPlan(null);
                      }}
                      className={[
                        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition",
                        active
                          ? "bg-[#222] text-white shadow-sm dark:bg-white dark:text-[#101214]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                      ].join(" ")}
                    >
                      <span className={`grid h-9 w-9 place-items-center rounded-lg ${active ? "bg-white/15 dark:bg-black/10" : category.bgColor}`}>
                        <Icon className={`h-4 w-4 ${active ? "text-current" : category.color}`} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{category.name}</span>
                        <span className={active ? "text-xs text-white/70 dark:text-black/60" : "text-xs text-slate-500 dark:text-slate-400"}>
                          {(plansByCategory[category.id] || []).length} planes
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101820]">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso 2</p>
                <h2 className="text-base font-semibold text-foreground">Facturación</h2>
              </div>
              {transformedBillingCycles.length > 0 && (
                <div className="space-y-2">
                  {transformedBillingCycles.map((cycle) => {
                    const active = billingCycle === cycle.id;

                    return (
                      <button
                        key={cycle.id}
                        type="button"
                        onClick={() => setBillingCycle(cycle.id)}
                        className={[
                          "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition",
                        active
                          ? "border-[#222] bg-[#222] text-white shadow-sm dark:border-white dark:bg-white dark:text-[#101214]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-[#101820] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                        ].join(" ")}
                      >
                        <span>
                          <span className="block text-sm font-semibold">{cycle.name}</span>
                          <span className={active ? "text-xs text-white/70 dark:text-black/60" : "text-xs text-slate-500 dark:text-slate-400"}>
                            {cycle.discount > 0 ? `Ahorra ${cycle.discount}%` : "Sin compromiso"}
                          </span>
                        </span>
                        {cycle.discount > 0 && (
                          <span
                            className={[
                              "rounded-full px-2 py-1 text-xs font-semibold",
                              active
                                ? "bg-white/15 text-white dark:bg-black/10 dark:text-[#101214]"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                            ].join(" ")}
                          >
                            -{cycle.discount}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {currentDiscount > 0 && (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                  Se aplicará {currentDiscount}% de descuento al precio mostrado.
                </p>
              )}
            </section>
          </aside>

          <main className="space-y-4">
            {selectedCategoryInfo && (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101820]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selectedCategoryInfo.name}</h2>
                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{selectedCategoryInfo.description}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {orderedPlans.length} planes disponibles
                  </span>
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#101820]">
              <div className="grid grid-cols-[1fr_132px_130px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 max-md:hidden">
                <span>Plan</span>
                <span>Precio</span>
                <span className="text-right">Acción</span>
              </div>

              {orderedPlans.length ? (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {orderedPlans.map((plan) => {
                    const selected = selectedPlan?.id === plan.id;
                    const price = getPlanPrice(plan, billingCycle, currentDiscount);
                    const topFeatures = plan.features.slice(0, 3);

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowAllFeatures(false);
                        }}
                        className={[
                          "grid w-full gap-4 border-l-4 px-4 py-4 text-left transition md:grid-cols-[1fr_132px_130px] md:items-center",
                          selected
                            ? "border-l-blue-500 bg-white/95 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-blue-500/25 dark:bg-white/10 dark:ring-blue-300/20"
                            : "border-l-transparent bg-white hover:bg-slate-50 dark:bg-[#101820] dark:hover:bg-white/5",
                        ].join(" ")}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                            {plan.popular && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
                                <Star className="h-3 w-3" />
                                Más popular
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {topFeatures.map((feature, index) => (
                              <span
                                key={`${plan.id}-${index}`}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                              >
                                <Check className="h-3 w-3 text-emerald-500" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">$</span>
                            <p className="text-3xl font-bold tracking-tight text-foreground">{formatPrice(price.final)}</p>
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            MXN / {getBillingPeriodLabel(billingCycle)}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">No incluye IVA</p>
                          {currentDiscount > 0 && price.base > 0 && (
                            <p className="text-xs text-slate-500 line-through dark:text-slate-400">${formatPrice(price.base)}</p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <span
                            className={[
                              "inline-flex min-w-28 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold",
                              selected
                                ? "bg-emerald-600 text-white"
                                : "bg-[#222] text-white dark:bg-white dark:text-[#101214]",
                            ].join(" ")}
                          >
                            {selected ? "Seleccionado" : "Elegir"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="font-semibold text-foreground">No hay planes para esta categoría.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Revisa la configuración de planes de servicio.</p>
                </div>
              )}
            </section>
          </main>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#101820]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso 3</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Resumen</h2>

              {selectedPlan ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">{selectedPlan.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{selectedCategoryInfo?.name}</p>
                      </div>
                      {selectedPlan.popular && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="pb-1 text-lg font-semibold text-slate-500 dark:text-slate-400">$</span>
                      <p className="text-5xl font-bold tracking-tight text-foreground">{formatPrice(selectedPlanPrice?.final ?? 0)}</p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                      MXN / {getBillingPeriodLabel(billingCycle)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No incluye IVA. Se calcula en el checkout.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
                    <p className="text-sm font-semibold text-foreground">Incluye</p>
                    <ul className="mt-3 space-y-2">
                      {visibleFeatures.map((feature, index) => (
                        <li key={`${selectedPlan.id}-feature-${index}`} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {hiddenFeatures > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAllFeatures(true)}
                        className="mt-3 text-sm font-semibold text-foreground hover:underline"
                      >
                        Ver {hiddenFeatures} beneficios más
                      </button>
                    )}
                  </div>

                  {selectedPlan.specs && Object.keys(selectedPlan.specs).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground">Especificaciones</p>
                      <div className="mt-3 space-y-2">
                        {Object.entries(selectedPlan.specs).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between gap-3 text-sm">
                            <span className="capitalize text-slate-600 dark:text-slate-300">{key.replace(/_/g, " ")}</span>
                            <span className="font-medium text-foreground">{value as any}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 dark:bg-white dark:text-[#101214]"
                  >
                    Continuar al checkout
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Selecciona un plan para ver el resumen, beneficios y continuar al checkout.
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContractServicePage;

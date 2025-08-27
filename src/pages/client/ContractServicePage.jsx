import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Gamepad2,
  Cloud,
  Database,
  Star,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BillingCycleSwitch from "../../components/pricing/billing-cycle-switch";
import PricingCard from "../../components/pricing/pricing-card";
import apiService from "../../services/api";

const ContractServicePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("hosting");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  
  // Dynamic data states
  const [categories, setCategories] = useState([]);
  const [billingCycles, setBillingCycles] = useState([]);
  const [servicePlans, setServicePlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for categories
  const iconMap = {
    Globe,
    Gamepad2,
    Cloud,
    Database,
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load categories, billing cycles, and service plans in parallel
        const [categoriesResponse, billingCyclesResponse, servicePlansResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getBillingCycles(),
          apiService.getServicePlans(),
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
          // Set first category as default if available
          if (categoriesResponse.data.length > 0) {
            setSelectedCategory(categoriesResponse.data[0].slug);
          }
        }

        if (billingCyclesResponse.success) {
          setBillingCycles(billingCyclesResponse.data);
          // Set first billing cycle as default if available
          if (billingCyclesResponse.data.length > 0) {
            setBillingCycle(billingCyclesResponse.data[0].slug);
          }
        }

        if (servicePlansResponse.success) {
          // Group service plans by category slug
          const plansByCategory = {};
          servicePlansResponse.data.forEach(plan => {
            const categorySlug = plan.category?.slug;
            if (categorySlug) {
              if (!plansByCategory[categorySlug]) {
                plansByCategory[categorySlug] = [];
              }
              plansByCategory[categorySlug].push(plan);
            }
          });
          setServicePlans(plansByCategory);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  const handleProceedToCheckout = () => {
    if (selectedPlan) {
      navigate("/client/checkout", {
        state: { plan: selectedPlan, billingCycle },
      });
    }
  };

  // Transform API data to match existing component structure
  const transformedCategories = categories.map(category => ({
    id: category.slug,
    name: category.name,
    icon: iconMap[category.icon] || Globe,
    description: category.description,
    color: category.color || "text-blue-500",
    bgColor: category.bg_color || "bg-blue-500/15",
  }));

  const transformedBillingCycles = billingCycles.map(cycle => ({
    id: cycle.slug,
    name: cycle.name,
    discount: cycle.discount_percentage || 0,
  }));

  const transformedServicePlans = {};
  Object.keys(servicePlans).forEach(categorySlug => {
    transformedServicePlans[categorySlug] = servicePlans[categorySlug].map(plan => {
      // Build pricing object from plan_pricing relationships
      const pricing = {};
      if (plan.pricing && Array.isArray(plan.pricing)) {
        plan.pricing.forEach(priceData => {
          if (priceData.billing_cycle) {
            pricing[priceData.billing_cycle.slug] = parseFloat(priceData.price);
          }
        });
      }

      // Build features array from plan_features relationships
      const features = [];
      if (plan.features && Array.isArray(plan.features)) {
        plan.features
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .forEach(featureData => {
            features.push(featureData.feature);
          });
      }

      return {
        id: plan.slug,
        name: plan.name,
        description: plan.description,
        price: pricing,
        popular: plan.is_popular || false,
        features: features,
        specs: plan.specifications || {},
      };
    });
  });

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
          <p className="text-red-500 mb-4">{error}</p>
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
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-15 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-4xl font-bold text-foreground">
          Contratar Servicio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige el servicio perfecto para tus necesidades. Todos nuestros planes
          incluyen soporte 24/7 y garantía de uptime del 99.9%.
        </p>
      </motion.div>

      {/* Service Categories */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {transformedCategories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group text-left p-5 rounded-2xl transition-all bg-white dark:bg-[#101214] border border-black/5 dark:border-white/10 hover:shadow-md ${
                selectedCategory === category.id
                  ? "ring-2 ring-[#222]/40 dark:ring-white/40"
                  : "hover:ring-1 hover:ring-[#222]/15 dark:hover:ring-white/15"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div
                className={`
                  grid place-items-center
                  w-12 h-12 rounded-full
                  ${category.bgColor}
                  shadow-sm mb-4
                  transition-transform
                  ${
                    selectedCategory === category.id
                      ? "scale-105"
                      : "group-hover:scale-105"
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Billing Cycle Switch */}
      {transformedBillingCycles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="flex justify-center">
            <BillingCycleSwitch
              cycles={transformedBillingCycles}
              value={billingCycle}
              onChange={setBillingCycle}
            />
          </div>
        </motion.div>
      )}

      {/* Service Plans */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {(() => {
          const source =
            (transformedServicePlans?.[selectedCategory] ??
              servicePlans?.[selectedCategory]) ||
            [];

          const list = [...source];
          const popIdx = list.findIndex((p) => p.popular);
          if (list.length === 3 && popIdx > -1 && popIdx !== 1) {
            const [popularPlan] = list.splice(popIdx, 1);
            list.splice(1, 0, popularPlan);
          }

          const currentDiscount =
            billingCycles?.find((c) => c.id === billingCycle)?.discount ?? 0;

          // Render
          return list.length ? (
            list.map((plan) => {
              const selected = selectedPlan?.id === plan.id;
              return (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  selected={selected}
                  discount={currentDiscount}
                  onSelect={() => setSelectedPlan(plan)}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center p-10 rounded-2xl bg-black/5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <p className="text-foreground font-semibold">
                No hay planes para esta categoría.
              </p>
              <p className="text-muted-foreground text-sm">
                Revisa la configuración de <code>servicePlans</code>.
              </p>
            </div>
          );
        })()}
      </motion.div>

      {/* Checkout Button */}
       {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-[60]"
        >
          <button
            onClick={handleProceedToCheckout}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold
                       bg-[#222222] text-white
                       dark:bg-white dark:text-[#101214]
                       shadow-lg hover:shadow-xl hover:brightness-110 active:translate-y-px
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-[#222222]/40 dark:focus-visible:ring-white/40 transition"
          >
            Proceder al Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ContractServicePage;


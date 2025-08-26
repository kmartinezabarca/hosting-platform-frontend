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

  const getPriceWithDiscount = (price, cycle) => {
    const billingCycleData = billingCycles.find((c) => c.slug === cycle);
    const discount = billingCycleData?.discount_percentage || 0;
    return price * (1 - discount / 100);
  };

  const handleSelectPlan = (plan) => setSelectedPlan(plan);
  
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contratar Servicio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el servicio perfecto para tus necesidades. Todos nuestros
            planes incluyen soporte 24/7 y garantía de uptime del 99.9%.
          </p>
        </motion.div>

        {/* Service Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Categorías de Servicios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transformedCategories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className={`${category.bgColor} p-3 rounded-lg w-fit mb-4`}>
                    <Icon className={`h-6 w-6 ${category.color}`} />
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
          </div>
        </motion.div>

        {/* Billing Cycle Switch */}
        {transformedBillingCycles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <BillingCycleSwitch
              cycles={transformedBillingCycles}
              selectedCycle={billingCycle}
              onCycleChange={setBillingCycle}
            />
          </motion.div>
        )}

        {/* Service Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Planes Disponibles
          </h2>
          
          {transformedServicePlans[selectedCategory] && transformedServicePlans[selectedCategory].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {transformedServicePlans[selectedCategory].map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  onSelect={handleSelectPlan}
                  isSelected={selectedPlan?.id === plan.id}
                  getPriceWithDiscount={getPriceWithDiscount}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No hay planes disponibles para esta categoría.
              </p>
            </div>
          )}
        </motion.div>

        {/* Checkout Button */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <button
              onClick={handleProceedToCheckout}
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold"
            >
              Proceder al Checkout
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContractServicePage;


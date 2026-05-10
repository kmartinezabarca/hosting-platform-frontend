import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Save, RotateCcw, Loader2 } from 'lucide-react';
import PhoneInput from '@presentation/components/features/forms/PhoneInput';
import FormField from '@presentation/components/features/profile/FormField';
import { cn } from '@shared/utils/utils';
import { mexicanStates } from '@shared/utils/sepomex';
import profileService from '@infrastructure/services/profileService';
import { toast } from '@presentation/components/features/ToastProvider';

const PersonalInfoSection = ({ profile, onUpdate, saving }: { profile: any; onUpdate: (data: any) => void; saving?: boolean }) => {
  const [formData, setFormData] = useState<any>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingPostalCode, setLoadingPostalCode] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(profile);
    setHasChanges(hasChanges);
  }, [formData, profile]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          newErrors.first_name = 'El nombre es requerido';
        } else if (value.length < 2) {
          newErrors.first_name = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete newErrors.first_name;
        }
        break;

      case 'last_name':
        if (!value.trim()) {
          newErrors.last_name = 'El apellido es requerido';
        } else if (value.length < 2) {
          newErrors.last_name = 'El apellido debe tener al menos 2 caracteres';
        } else {
          delete newErrors.last_name;
        }
        break;

      case 'phone':
        if (value && !/^[\d\s\-\(\)]+$/.test(value)) {
          newErrors.phone = 'Formato de teléfono inválido';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'postal_code':
        if (value && formData.country === 'MX' && !/^\d{5}$/.test(value)) {
          newErrors.postal_code = 'Código postal debe tener 5 dígitos';
        } else if (value && formData.country === 'US' && !/^\d{5}(-\d{4})?$/.test(value)) {
          newErrors.postal_code = 'Código postal inválido (formato: 12345 o 12345-6789)';
        } else {
          delete newErrors.postal_code;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleCountryChange = (countryCode: string) => {
    setFormData(prev => ({ ...prev, country: countryCode }));
    // Limpiar datos de dirección si cambia el país
    setFormData(prev => ({ 
      ...prev, 
      postal_code: '',
      state: '',
      city: '',
      address: ''
    }));
  };

  // Autocompletar dirección cuando se ingresa un CP en México
  const handlePostalCodeChange = async (postalCode: string) => {
    handleChange('postal_code', postalCode);

    if (formData.country === 'MX' && postalCode.length === 5) {
      setLoadingPostalCode(true);
      try {
        const response = await profileService.getPostalCode(postalCode, 'MX');
        
        if (response.success && response.data) {
          const { state, city } = response.data;
          setFormData(prev => ({
            ...prev,
            state: state,
            city: city,
          }));
          toast.success(`CP encontrado: ${state}, ${city}`);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast.warning('Código postal no encontrado');
        } else {
          toast.error('Error al buscar el código postal');
        }
      } finally {
        setLoadingPostalCode(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    if (Object.keys(errors).length === 0) {
      onUpdate(formData);
    }
  };

  const handleReset = () => {
    setFormData(profile);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
      <div className="rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Información Básica
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tu nombre y datos principales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Nombre"
            value={formData.first_name || ""}
            onChange={(e) => handleChange("first_name", e.target.value)}
            placeholder="Tu nombre"
            error={errors.first_name}
            required
          />

          <FormField
            label="Apellido"
            value={formData.last_name || ""}
            onChange={(e) => handleChange("last_name", e.target.value)}
            placeholder="Tu apellido"
            error={errors.last_name}
            required
          />

          <div className="md:col-span-2">
            <FormField
              label="Correo electrónico"
              type="email"
              value={formData.email || ""}
              icon={Mail}
              disabled
              description="Tu dirección de correo no se puede cambiar por seguridad"
            />
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Información de Contacto
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cómo podemos contactarte
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <PhoneInput
            value={formData.phone || ""}
            onChange={(phone) => handleChange("phone", phone)}
            onCountryChange={handleCountryChange}
            selectedCountry={formData.country || "MX"}
            placeholder="Número de teléfono"
            error={errors.phone}
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Dirección
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tu ubicación física (opcional)
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <FormField
            label="Dirección"
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Calle, número, colonia..."
            icon={MapPin}
          />

          {/* Código Postal con búsqueda automática */}
          <div className="relative">
            <FormField
              label="Código Postal"
              value={formData.postal_code || ""}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder={formData.country === "MX" ? "12345" : "12345-6789"}
              error={errors.postal_code}
              disabled={loadingPostalCode}
            />
            {loadingPostalCode && (
              <div className="absolute right-3 top-10 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estado/Provincia */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estado/Provincia
              </label>
              {formData.country === "MX" ? (
                <select
                  value={formData.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg border",
                    "bg-card border-border hover:border-border/80",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
                    "transition-colors"
                  )}
                >
                  <option value="">Selecciona un estado</option>
                  {mexicanStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.state || ""}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Estado o provincia"
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg border",
                    "bg-card border-border hover:border-border/80",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
                    "transition-colors placeholder:text-muted-foreground"
                  )}
                />
              )}
            </div>

            {/* Ciudad */}
            <FormField
              label="Ciudad"
              value={formData.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Tu ciudad"
            />

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                País
              </label>
              <select
                value={formData.country || "MX"}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={cn(
                  "w-full px-3 py-2.5 rounded-lg border",
                  "bg-card border-border hover:border-border/80",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
                  "transition-colors"
                )}
              >
                <option value="MX">México</option>
                <option value="US">Estados Unidos</option>
                <option value="ES">España</option>
                <option value="CO">Colombia</option>
                <option value="AR">Argentina</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      {hasChanges && (
        <div className="flex items-center justify-end gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "border border-slate-300 dark:border-slate-600",
              "text-slate-700 dark:text-slate-300",
              "hover:bg-slate-100 dark:hover:bg-slate-700",
              "focus:outline-none focus:ring-2 focus:ring-slate-500/20",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RotateCcw className="w-4 h-4" />
            Descartar cambios
          </button>

          <button
            type="submit"
            disabled={saving || Object.keys(errors).length > 0}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2 rounded-lg",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default PersonalInfoSection;

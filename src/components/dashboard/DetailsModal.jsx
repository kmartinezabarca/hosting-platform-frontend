import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Sector,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    return (
      <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-2 shadow-lg text-sm">
        {/* Si tiene 'name' y 'percentage', es del PieChart */}
        {data.name && data.percentage !== undefined ? (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{`${data.name}: ${value}`}</span>
            <span className="text-xs text-muted-foreground">{`(${data.percentage}%)`}</span>
          </div>
        ) : (
          // Si no, es del BarChart
          <>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground">{`Gasto: $${value.toFixed(
              2
            )}`}</p>
          </>
        )}
      </div>
    );
  }
  return null;
};

// --- Componente de Detalles de Servicios (Diseño Profesional) ---
const ServicesDetails = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);

  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
    } = props;
    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          dy={8}
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          className="text-lg font-bold"
        >
          {payload.value}
        </text>
        <text
          x={cx}
          y={cy + 10}
          dy={8}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          className="text-sm"
        >
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground">
        Resumen de Servicios
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        Desglose de los {totalValue} servicios en tu cuenta.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6 items-center">
        {/* Columna Izquierda: Gráfico de Dona (40% del espacio) */}
        <div className="lg:col-span-2 w-full h-52">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="90%"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-opacity"
                    style={{
                      opacity:
                        activeIndex === null || activeIndex === index ? 1 : 0.4,
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Columna Derecha: Tabla de Detalles (60% del espacio) */}
        <div className="lg:col-span-3 w-full">
          <div className="space-y-4">
            {data.map((entry, index) => (
              <motion.div
                key={entry.name}
                className="grid grid-cols-3 items-center gap-4 cursor-pointer p-2 rounded-lg"
                style={{
                  backgroundColor:
                    activeIndex === index ? `${entry.color}20` : "transparent",
                }}
                onMouseEnter={() => onPieEnter(null, index)}
                onMouseLeave={onPieLeave}
              >
                {/* Nombre del Estado */}
                <div className="col-span-1 flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {entry.name}
                  </span>
                </div>

                {/* Barra de Progreso */}
                <div className="col-span-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${entry.percentage}%`,
                        backgroundColor: entry.color,
                      }}
                    />
                  </div>
                </div>

                {/* Cantidad y Porcentaje */}
                <div className="col-span-1 text-right">
                  <span className="text-sm font-semibold text-foreground">
                    {entry.value}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {entry.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente de Detalles de Facturación (Diseño Profesional) ---
const BillingDetails = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = data.map((value, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - index));
    return {
      name: format(date, 'MMM', { locale: es }),
      Gasto: value,
    };
  });

  // Calcula el gasto promedio para la línea de tendencia
  const averageSpend = data.reduce((sum, value) => sum + value, 0) / data.length;

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Historial de Gasto</h3>
          <p className="text-sm text-muted-foreground mt-1">Últimos 12 meses</p>
        </div>
        <div className="text-right mt-6">
          <p className="text-xs text-muted-foreground">Promedio Mensual</p>
          <p className="text-sm font-semibold text-foreground">${averageSpend.toFixed(2)}</p>
        </div>
      </div>
      <div className="w-full h-64 mt-6">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive) {
                setActiveIndex(state.activeTooltipIndex);
              } else {
                setActiveIndex(null);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              {/* Gradiente sutil para las barras */}
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#222222" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#222222" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            
            {/* ¡SIN CURSOR! El resaltado se maneja en las celdas de la barra */}
            <Tooltip content={<CustomTooltip />} cursor={false} />

            <Bar dataKey="Gasto" fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="transition-opacity"
                  style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.3 }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Modal Principal (Contenedor) ---
const DetailsModal = ({ isOpen, onClose, contentType, stats }) => {
  const renderContent = () => {
    if (!stats || !stats.charts) {
      return (
        <div className="text-center text-muted-foreground py-10">
          Cargando detalles...
        </div>
      );
    }

    switch (contentType) {
      case "services":
        return <ServicesDetails data={stats.charts.service_distribution} />;
      case "billing":
        return <BillingDetails data={stats.charts.billing_history} />;
      case "domains":
        return (
          <div className="text-center text-muted-foreground py-10">
            Los detalles de dominios estarán disponibles próximamente.
          </div>
        );
      case "performance":
        return (
          <div className="text-center text-muted-foreground py-10">
            Las métricas de rendimiento detalladas estarán disponibles
            próximamente.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="relative w-full max-w-2xl bg-card rounded-2xl p-6 sm:p-8 shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailsModal;

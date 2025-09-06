import React from 'react';

const SkeletonServiceManagement = () => {
  return (
    <div className="container-premium section-padding space-y-8 animate-pulse">
      {/* Cabecera */}
      <div>
        <div className="h-5 w-48 bg-muted rounded-md mb-4"></div>
        <div className="flex justify-between items-start">
          <div>
            <div className="h-9 w-72 bg-muted rounded-lg"></div>
            <div className="h-5 w-48 bg-muted rounded-md mt-2"></div>
          </div>
          <div className="h-8 w-24 bg-muted rounded-full"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex gap-6">
          <div className="h-5 w-52 bg-muted rounded-md"></div>
          <div className="h-5 w-44 bg-muted rounded-md"></div>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navegación Lateral */}
        <aside className="lg:col-span-1">
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted rounded-lg"></div>
            ))}
          </div>
        </aside>

        {/* Contenido de la Pestaña */}
        <main className="lg:col-span-3">
          <div className="bg-card p-8 rounded-2xl border border-border min-h-[400px]">
            <div className="h-8 w-1/3 bg-muted rounded-lg mb-2"></div>
            <div className="h-5 w-2/3 bg-muted rounded-md mb-8"></div>
            <div className="space-y-4">
              <div className="h-20 w-full bg-muted rounded-lg"></div>
              <div className="h-20 w-full bg-muted rounded-lg"></div>
              <div className="h-20 w-full bg-muted rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SkeletonServiceManagement;

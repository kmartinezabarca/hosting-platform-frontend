import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 con efecto visual */}
        <div className="relative">
          <h1 className="text-[150px] sm:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/30 leading-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center -mt-16 sm:-mt-20">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-primary/50" />
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Página no encontrada
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Sugerencias */}
        <div className="bg-muted/30 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-sm font-medium mb-4">¿Qué puedes hacer?</p>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Verificar la URL escrita
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Regresar a la página anterior
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Ir al inicio de la aplicación
            </li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </Button>
          <Button
            asChild
            size="lg"
            className="gap-2"
          >
            <Link to="/client/dashboard">
              <Home className="w-4 h-4" />
              Ir al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
# Hosting Platform Frontend

Interfaz de usuario para la plataforma de gestión de servicios de hosting desarrollada con React.

## Características

- **Autenticación**: Login y registro de usuarios.
- **Panel de Cliente**: Gestión de servicios, facturas y tickets.
- **Panel de Administración**: Gestión de usuarios, servicios, facturas y tickets.
- **Diseño Responsivo**: Utilizando Tailwind CSS y Shadcn UI.

## Requisitos

- Node.js (versión 18 o superior)
- pnpm (recomendado)
- Backend de Laravel en ejecución (ver `hosting-platform-backend`)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd hosting-platform/frontend
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar el entorno

Crea un archivo `.env` en la raíz del proyecto y añade la URL de tu API de backend:

```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Iniciar el servidor de desarrollo

```bash
pnpm run dev
```

El frontend estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## Estructura del Proyecto

```
src/
├── assets/           # Activos estáticos (imágenes, etc.)
├── components/
│   ├── ui/           # Componentes de Shadcn UI
│   ├── AdminLayout.jsx # Layout para el panel de administración
│   └── ClientLayout.jsx # Layout para el panel de cliente
├── context/
│   └── AuthContext.jsx # Contexto de autenticación
├── pages/
│   ├── admin/        # Páginas del panel de administración
│   ├── client/       # Páginas del panel de cliente
│   ├── LoginPage.jsx # Página de inicio de sesión
│   └── RegisterPage.jsx # Página de registro
├── services/
│   └── auth.js       # Servicio para la autenticación con la API
├── App.css           # Estilos globales de la aplicación
├── App.jsx           # Componente principal de la aplicación y rutas
├── index.css         # Estilos base de Tailwind CSS
└── main.jsx          # Punto de entrada de la aplicación
```

## Integración con el Backend

El frontend se comunica con el backend de Laravel a través de la API RESTful. Asegúrate de que tu backend esté en ejecución y accesible desde la URL configurada en `VITE_API_URL`.

## Despliegue

Para construir la aplicación para producción:

```bash
pnpm run build
```

Los archivos estáticos se generarán en el directorio `dist/`.

## Contribución

1.  Fork el proyecto.
2.  Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`).
3.  Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`).
4.  Push a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Crea un Pull Request.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.

**Desarrollado para ROKE Industries.**


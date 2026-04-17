import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Mail,
  User,
  FileText,
  Calendar,
  Tag,
} from 'lucide-react';
import documentationRequestAdminService from '../../services/admin/documentationRequestAdminService';

const AdminDocumentationRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [kindFilter, resolvedFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      
      if (kindFilter) filters.kind = kindFilter;
      if (resolvedFilter !== '') filters.is_resolved = resolvedFilter === 'true';
      if (searchTerm) filters.search = searchTerm;

      const data = await documentationRequestAdminService.getDocumentationRequests(filters);
      setRequests(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Error loading documentation requests:", err);
      setError("No se pudieron cargar las solicitudes de documentación.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadRequests();
  };

  const handleMarkResolved = async (id) => {
    try {
      await documentationRequestAdminService.markAsResolved(id);
      setRequests(requests.map(r => r.id === id ? { ...r, is_resolved: true } : r));
      alert("Solicitud marcada como resuelta.");
    } catch (err) {
      console.error("Error marking request as resolved:", err);
      alert("Error al marcar la solicitud como resuelta.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) {
      try {
        await documentationRequestAdminService.deleteDocumentationRequest(id);
        setRequests(requests.filter(r => r.id !== id));
        alert("Solicitud eliminada exitosamente.");
      } catch (err) {
        console.error("Error deleting request:", err);
        alert("Error al eliminar la solicitud.");
      }
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getKindLabel = (kind) => {
    return kind === 'api_documentation' ? 'Documentación de API' : 'Documentación General';
  };

  const getKindColor = (kind) => {
    return kind === 'api_documentation' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Solicitudes de Documentación</h1>
          </div>
          <p className="text-muted-foreground">Gestiona las solicitudes de documentación de usuarios</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-lg p-6 border border-border mb-6"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre, email, tema..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={kindFilter}
                  onChange={(e) => setKindFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos los tipos</option>
                  <option value="documentation">Documentación General</option>
                  <option value="api_documentation">Documentación de API</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={resolvedFilter}
                  onChange={(e) => setResolvedFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos los estados</option>
                  <option value="false">Pendientes</option>
                  <option value="true">Resueltas</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Buscar
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Requests Table */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            {requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Nombre</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Tema</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{request.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{request.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-xs">{request.topic}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKindColor(request.kind)}`}>
                            {getKindLabel(request.kind)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.is_resolved
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {request.is_resolved ? 'Resuelta' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            {!request.is_resolved && (
                              <button
                                onClick={() => handleMarkResolved(request.id)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                title="Marcar como resuelta"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No hay solicitudes de documentación</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-8 max-w-2xl w-full border border-border shadow-lg"
          >
            <div className="flex items-center justify-between mb-6 border-b border-border dark:border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-foreground">Detalles de la Solicitud</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-muted-foreground hover:text-foreground dark:hover:text-foreground"
              >
                <X className="w-6 h-6 text-foreground dark:text-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getKindColor(selectedRequest.kind)}`}>
                    {getKindLabel(selectedRequest.kind)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.is_resolved
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {selectedRequest.is_resolved ? 'Resuelta' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Tema</p>
                <p className="font-medium">{selectedRequest.topic}</p>
              </div>

              {selectedRequest.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-foreground whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de Solicitud</p>
                <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleString('es-ES')}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors font-medium"
                >
                  Cerrar
                </button>
                {!selectedRequest.is_resolved && (
                  <button
                    onClick={() => {
                      handleMarkResolved(selectedRequest.id);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                  >
                    Marcar como Resuelta
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentationRequestsPage;

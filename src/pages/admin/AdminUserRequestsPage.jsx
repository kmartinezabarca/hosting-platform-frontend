import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Trash2, CheckCircle, Eye, Filter } from "lucide-react";
import userRequestAdminService from "@/services/admin/userRequestAdminService";

const AdminUserRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    kind: "",
    is_resolved: "",
    search: "",
    page: 1,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({});

  const kindOptions = [
    { value: "", label: "Todos los tipos" },
    { value: "blog_subscription", label: "Suscripción al Blog" },
    { value: "documentation_request", label: "Solicitud de Documentación" },
    { value: "api_documentation_request", label: "Solicitud de API" },
  ];

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "false", label: "Pendientes" },
    { value: "true", label: "Resueltas" },
  ];

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const filterParams = {
        kind: filters.kind || undefined,
        is_resolved: filters.is_resolved === "" ? undefined : filters.is_resolved === "true",
        search: filters.search || undefined,
        page: filters.page,
      };
      const response = await userRequestAdminService.getUserRequests(filterParams);
      setRequests(response.data || []);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      });
    } catch (err) {
      setError("Error al cargar las solicitudes. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      await userRequestAdminService.markAsResolved(id);
      fetchRequests();
    } catch (err) {
      console.error("Error al marcar como resuelta:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) {
      try {
        await userRequestAdminService.deleteUserRequest(id);
        fetchRequests();
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters({ ...filters, search: value, page: 1 });
  };

  const getKindLabel = (kind) => {
    const option = kindOptions.find((opt) => opt.value === kind);
    return option ? option.label : kind;
  };

  const getStatusBadge = (isResolved) => {
    return isResolved ? (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        Resuelta
      </span>
    ) : (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
        Pendiente
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Gestión de Solicitudes
          </h1>
          <p className="text-slate-600">
            Administra todas las solicitudes de usuarios (blog, documentación, API)
          </p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Solicitud
              </label>
              <select
                name="kind"
                value={filters.kind}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {kindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estado
              </label>
              <select
                name="is_resolved"
                value={filters.is_resolved}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre, email, tema..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No hay solicitudes que mostrar</p>
          </div>
        ) : (
          <>
            {/* Requests Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Tema
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {request.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {request.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {getKindLabel(request.kind)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {request.topic}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(request.is_resolved)}
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!request.is_resolved && (
                            <button
                              onClick={() => handleMarkResolved(request.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Marcar como resuelta"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setFilters({ ...filters, page })}
                      className={`px-4 py-2 rounded-lg transition ${
                        filters.page === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Detalles de la Solicitud
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <p className="text-slate-900">{selectedRequest.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <p className="text-slate-900">{selectedRequest.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo
                </label>
                <p className="text-slate-900">{getKindLabel(selectedRequest.kind)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tema
                </label>
                <p className="text-slate-900">{selectedRequest.topic}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <p className="text-slate-900 whitespace-pre-wrap">
                  {selectedRequest.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado
                </label>
                <div>{getStatusBadge(selectedRequest.is_resolved)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha de Creación
                </label>
                <p className="text-slate-900">
                  {new Date(selectedRequest.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              {!selectedRequest.is_resolved && (
                <button
                  onClick={() => {
                    handleMarkResolved(selectedRequest.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Marcar como Resuelta
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminUserRequestsPage;

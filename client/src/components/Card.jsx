/**
 * Componente Card reutilizable para las vistas CRUD.
 *
 * Props:
 *  - title       (string)  – Título que se muestra en el encabezado del card (ej. "Gestión de Roles").
 *  - onSubmit    (func)    – Callback para el evento onSubmit del formulario.
 *  - editingId   (any)     – ID del registro en edición. Controla el texto del botón (Crear/Actualizar) y la visibilidad del botón Cancelar.
 *  - onCancel    (func)    – Callback al presionar "Cancelar" edición.
 *  - children    (node)    – Campos del formulario (Inputs, Selects, etc.) que se renderizan dentro del grid.
 *  - columns     (array)   – Array de objetos { header: string, accessor: string } que define las columnas de la tabla.
 *  - data        (array)   – Datos a renderizar en la tabla.
 *  - rowKey      (string)  – Nombre de la propiedad que sirve como key única de cada fila.
 *  - onEdit      (func)    – Callback al presionar "Editar" en una fila.
 *  - onDelete    (func)    – Callback al presionar "Eliminar" en una fila.
 *  - submitSize  (string)  – Tamaño para los botones Crear/Cancelar ("sm" | "md" | "lg"). Por defecto "lg".
 */

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import Button from './Button';

const Card = ({
  title,
  onSubmit,
  editingId,
  onCancel,
  children,
  columns = [],
  data = [],
  rowKey,
  onEdit,
  onDelete,
  submitSize = 'md',
}) => {
  const [filterText, setFilterText] = useState('');

  // Accent-insensitive and case-insensitive string normalization
  const norm = (s) =>
    String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filteredData = data.filter((item) => {
    if (!filterText) return true;

    // Split search term into normalized tokens for multi-word search
    const tokens = norm(filterText).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;

    // Concatenate all visible column values into a single search string
    const searchString = columns
      .map((col) => {
        const val = item[col.accessor];
        return val !== null && val !== undefined ? norm(val) : '';
      })
      .join(' ');

    // Match if all search tokens are found anywhere in the combined string
    return tokens.every((token) => searchString.includes(token));
  });
  return (
    <div className="bg-white border border-zinc-200 rounded-lg">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      </div>

      {/* ── Form section ── */}
      <form onSubmit={onSubmit} className="px-6 py-5">
        {/* Grid de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {children}
        </div>

        {/* Botones del formulario */}
        <div className="flex items-center gap-2 mt-4">
          <Button type="submit" size={submitSize} variant="primary">
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>

          {editingId && (
            <Button
              type="button"
              size={submitSize}
              variant="secondary"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* ── Table section ── */}
      <div className="border-t border-zinc-200 overflow-hidden bg-white">
        {/* Real-time search filter */}
        <div className="px-6 py-3 bg-zinc-50/50 border-b border-zinc-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </span>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar en la tabla..."
              className="w-full pl-9 pr-8 h-9 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {filterText && (
            <span className="text-xs text-zinc-500 font-medium">
              Mostrando {filteredData.length} de {data.length} registros
            </span>
          )}
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-50">
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide border-b border-zinc-200"
                >
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide border-b border-zinc-200">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {filteredData.map((item) => (
              <tr
                key={item[rowKey]}
                className="bg-white hover:bg-zinc-50 transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor}
                    className="px-4 py-3 text-sm text-zinc-700"
                  >
                    {item[col.accessor]}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      onClick={() => onEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                      onClick={() => onDelete(item[rowKey])}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-zinc-400 text-sm"
                >
                  {data.length === 0 ? 'No hay registros disponibles.' : 'No se encontraron resultados para la búsqueda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Card;

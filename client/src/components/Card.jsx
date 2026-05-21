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

import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
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
  submitSize = 'lg',
}) => {
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
          <Button type="submit" size={submitSize} variant="primary" icon={editingId ? Pencil : Plus}>
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>

          {editingId && (
            <Button
              type="button"
              size={submitSize}
              variant="secondary"
              icon={X}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* ── Table section ── */}
      <div className="border-t border-zinc-200 overflow-hidden">
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
            {data.map((item) => (
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
                    <Button type="button" variant="secondary" size="sm" icon={Pencil} onClick={() => onEdit(item)}>
                      Editar
                    </Button>
                    <Button type="button" variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(item[rowKey])}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-zinc-400 text-sm"
                >
                  No hay registros disponibles.
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

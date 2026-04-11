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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">{title}</h2>
      </div>

      {/* ── Form section ── */}
      <form
        onSubmit={onSubmit}
        className="mx-8 my-6 p-6 bg-slate-50 rounded-lg border border-slate-200
                   transition-colors duration-200"
      >
        {/* Grid de campos */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {children}
        </div>

        {/* Botones del formulario */}
        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" size={submitSize}>
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
      <div className="px-8 pb-8 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-700">
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-3 py-3 font-semibold border-b-2 border-slate-300
                             first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
              <th
                className="px-3 py-3 font-semibold border-b-2 border-slate-300
                           rounded-tr-lg whitespace-nowrap"
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item[rowKey]}
                className="border-b border-slate-200 hover:bg-slate-50
                           transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor}
                    className="px-3 py-3 text-slate-500 whitespace-nowrap"
                  >
                    {item[col.accessor]}
                  </td>
                ))}
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(item[rowKey])}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <p className="text-center py-8 text-slate-400 text-sm">
            No hay registros disponibles.
          </p>
        )}
      </div>
    </div>
  );
};

export default Card;

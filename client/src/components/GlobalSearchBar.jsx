import React from 'react';
import { Search, X } from 'lucide-react';

const GlobalSearchBar = ({ filterText, setFilterText, filteredCount, totalCount }) => {
    return (
        <div className="px-4 py-3 bg-zinc-50/50 border-b border-zinc-200 flex items-center justify-between gap-4 flex-wrap mb-4 rounded-t-lg">
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
                    Mostrando {filteredCount} de {totalCount} registros
                </span>
            )}
        </div>
    );
};

export default GlobalSearchBar;

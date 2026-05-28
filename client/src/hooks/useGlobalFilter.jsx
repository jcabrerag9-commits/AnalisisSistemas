import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export const useGlobalFilter = (data, searchColumns) => {
    const [filterText, setFilterText] = useState('');

    // Accent-insensitive and case-insensitive string normalization
    const norm = (s) =>
        String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filteredData = data.filter((item) => {
        if (!filterText) return true;

        // Split search term into normalized tokens for multi-word search
        const tokens = norm(filterText).split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return true;

        // Concatenate only the allowed columns
        const searchString = searchColumns
            .map((col) => {
                const val = item[col];
                return val !== null && val !== undefined ? norm(val) : '';
            })
            .join(' ');

        // Match if all search tokens are found anywhere in the combined string
        return tokens.every((token) => searchString.includes(token));
    });

    return { filterText, setFilterText, filteredData };
};


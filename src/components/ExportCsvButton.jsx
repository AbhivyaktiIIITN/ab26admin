import React from 'react';

/**
 * Simple CSV export button. Accepts an array of objects (`rows`) and
 * an optional list of column keys to use for ordering/headers. If
 * `columns` is omitted the keys of the first row are used. The
 * resulting file is generated entirely on the client side and triggers
 * a download when clicked.
 */
const ExportCsvButton = ({ rows = [], columns, filename = 'data.csv', className }) => {
    const handleClick = () => {
        if (!rows || rows.length === 0) {
            // nothing to export
            return;
        }

        let headers = [];
        let accessors = [];

        if (Array.isArray(columns) && columns.length > 0 && columns[0].header) {
            // react-table style column definitions
            headers = columns.map(c => c.header || '');
            accessors = columns.map(c => {
                if (typeof c.accessorFn === 'function') return (row) => c.accessorFn(row);
                if (typeof c.accessorKey === 'string') return (row) => row[c.accessorKey];
                return (row) => {
                    try {
                        return c.cell ? c.cell({ row: { original: row }, getValue: () => '' }) : '';
                    } catch {
                        return '';
                    }
                };
            });
        } else {
            // fallback: simple object keys
            headers = Object.keys(rows[0] || {});
            accessors = headers.map(k => row => row[k]);
        }

        const escapeCell = (val) => {
            let str = '';

            if (val == null) {
                str = '';
            } else if (typeof val === 'object') {
                // Handle objects and arrays
                if (Array.isArray(val)) {
                    // For arrays, join with semicolon
                    str = val.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join('; ');
                } else {
                    // For objects, try to extract meaningful properties
                    if (val.name) str = val.name;
                    else if (val.email) str = val.email;
                    else if (val.id) str = val.id;
                    else if (val.title) str = val.title;
                    else str = JSON.stringify(val);
                }
            } else {
                str = String(val);
            }

            return `"${str.replace(/"/g, '""')}"`;
        };

        const headerLine = headers.join(',');
        const bodyLines = rows.map(r => accessors.map(fn => escapeCell(fn(r))).join(','));
        const csvContent = headerLine + '\n' + bodyLines.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <button
            onClick={handleClick}
            className={className || "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm text-sm"}
        >
            Download CSV
        </button>
    );
};

export default ExportCsvButton;

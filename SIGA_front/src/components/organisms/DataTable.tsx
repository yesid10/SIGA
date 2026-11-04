import type { ReactNode } from "react";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
  emptyMessage?: string;
};

export const DataTable = ({
  headers,
  children,
  emptyMessage = "No hay registros para mostrar.",
}: DataTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-155 text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3 font-bold" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children ?? (
            <tr>
              <td
                className="px-4 py-8 text-center text-slate-500"
                colSpan={headers.length}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

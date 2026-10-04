type PaginationProps = { page: number; totalPages: number; onChange: (page: number) => void }

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return <div className="flex items-center justify-end gap-3 text-sm"><button className="rounded-md border border-slate-200 px-3 py-2 disabled:opacity-40" type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</button><span className="text-slate-500">Página {page} de {totalPages}</span><button className="rounded-md border border-slate-200 px-3 py-2 disabled:opacity-40" type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Siguiente</button></div>
}

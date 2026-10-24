import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function PagePagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number
  pageCount: number
  searchParams: Record<string, string | undefined>
}) {
  if (pageCount <= 1) return null

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value)
    }
    params.set("page", String(targetPage))
    return `?${params.toString()}`
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={hrefFor(page - 1)} />
          ) : (
            <PaginationPrevious
              href="#"
              aria-disabled
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href={hrefFor(p)} isActive={p === page}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          {page < pageCount ? (
            <PaginationNext href={hrefFor(page + 1)} />
          ) : (
            <PaginationNext
              href="#"
              aria-disabled
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

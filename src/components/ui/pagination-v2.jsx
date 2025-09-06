import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

const Pagination = ({ currentPage, lastPage, onPageChange, className }) => {
  if (lastPage <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const ellipsis = <span key="ellipsis" className="px-4 py-2"><MoreHorizontal className="w-4 h-4" /></span>;

    if (lastPage <= maxPagesToShow + 2) {
      for (let i = 1; i <= lastPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              i === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            {i}
          </button>
        );
      }
    } else {
      // Lógica para mostrar "..."
      pageNumbers.push(
        <button key={1} onClick={() => onPageChange(1)} className={cn('px-4 py-2 text-sm font-medium rounded-md', 1 === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>1</button>
      );

      if (currentPage > 3) {
        pageNumbers.push(ellipsis);
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(lastPage - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      }
      if (currentPage >= lastPage - 2) {
        start = lastPage - 3;
        end = lastPage - 1;
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(
          <button key={i} onClick={() => onPageChange(i)} className={cn('px-4 py-2 text-sm font-medium rounded-md', i === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{i}</button>
        );
      }

      if (currentPage < lastPage - 2) {
        pageNumbers.push(ellipsis);
      }

      pageNumbers.push(
        <button key={lastPage} onClick={() => onPageChange(lastPage)} className={cn('px-4 py-2 text-sm font-medium rounded-md', lastPage === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lastPage}</button>
      );
    }

    return pageNumbers;
  };

  return (
    <nav className={cn("flex items-center justify-between gap-4", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>
      <div className="hidden sm:flex items-center gap-1">
        {renderPageNumbers()}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
      >
        Siguiente
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems = 0, 
  itemsPerPage = 10,
  showInfo = true 
}) => {
  // Handle inconsistent pagination props by deriving total pages when missing
  const derivedTotalPages = totalPages || Math.max(1, Math.ceil((totalItems || 0) / itemsPerPage));

  // Don't render if there's only one page or no pages
  if (derivedTotalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < derivedTotalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (derivedTotalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= derivedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(derivedTotalPages, currentPage + 2);
      
      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      // Show pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Always show last page
      if (end < derivedTotalPages) {
        if (end < derivedTotalPages - 1) {
          pages.push('...');
        }
        pages.push(derivedTotalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      {showInfo && totalItems > 0 && (
        <div className="pagination-info">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>
      )}
      
      <div className="pagination">
        <button 
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="pagination-btn prev-btn"
          title="Previous page"
        >
          <FaChevronLeft />
          Previous
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
              disabled={page === '...'}
              className={`pagination-page ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          onClick={handleNext}
          disabled={currentPage === derivedTotalPages}
          className="pagination-btn next-btn"
          title="Next page"
        >
          Next
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

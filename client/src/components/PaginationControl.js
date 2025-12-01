import React from 'react';
import { Pagination } from 'react-bootstrap';

const PaginationControl = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    let items = [];

    // Previous Button
    items.push(
        <Pagination.Prev
            key="prev"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
        />
    );

    // Page Numbers
    // Logic to show a window of pages if there are too many
    // For simplicity and per user request "1,2,3,4", we'll try to show relevant pages
    // If total pages <= 7, show all
    if (totalPages <= 7) {
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </Pagination.Item>,
            );
        }
    } else {
        // If many pages, show: 1, 2, ..., current-1, current, current+1, ..., last-1, last
        // Always show first page
        items.push(
            <Pagination.Item key={1} active={1 === currentPage} onClick={() => onPageChange(1)}>
                1
            </Pagination.Item>
        );

        // Ellipsis if current page is far from start
        if (currentPage > 4) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }

        // Pages around current
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        // Adjust if close to start or end
        if (currentPage <= 4) {
            startPage = 2;
            endPage = 5;
        }
        if (currentPage >= totalPages - 3) {
            startPage = totalPages - 4;
            endPage = totalPages - 1;
        }

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </Pagination.Item>,
            );
        }

        // Ellipsis if current page is far from end
        if (currentPage < totalPages - 3) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }

        // Always show last page
        items.push(
            <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => onPageChange(totalPages)}>
                {totalPages}
            </Pagination.Item>
        );
    }

    // Next Button
    items.push(
        <Pagination.Next
            key="next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
        />
    );

    return (
        <div className="d-flex justify-content-center mt-4">
            <Pagination>{items}</Pagination>
        </div>
    );
};

export default PaginationControl;

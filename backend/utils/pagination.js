/**
 * Parse and validate pagination parameters from query string.
 * @param {object} query - req.query object
 * @param {number} [defaultLimit=25] - default page size
 * @returns {{ page: number, limit: number, offset: number }}
 */
function parsePagination(query, defaultLimit = 25) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build a standardised paginated response envelope.
 * @param {Array} data - rows for the current page
 * @param {number} total - total row count
 * @param {number} page - current page number
 * @param {number} limit - page size
 */
function paginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = { parsePagination, paginatedResponse };

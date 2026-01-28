/**
 * Lenders Routes
 * PRD Reference: Phase 3 - Lender database with reviews
 */

const express = require('express');
const router = express.Router();

const { getDB } = require('../db/database');

/**
 * GET /api/lenders
 * Get list of lenders (public endpoint)
 */
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { country, minRating } = req.query;
    
    let query = 'SELECT * FROM lenders WHERE 1=1';
    const params = [];
    
    if (country) {
      query += ' AND country = ?';
      params.push(country.toUpperCase());
    }
    
    if (minRating) {
      query += ' AND rating >= ?';
      params.push(parseFloat(minRating));
    }
    
    query += ' ORDER BY rating DESC';
    
    const lenders = db.prepare(query).all(...params);
    
    res.json({
      success: true,
      data: lenders.map(formatLender),
    });
    
  } catch (error) {
    console.error('Get lenders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve lenders' }
    });
  }
});

/**
 * GET /api/lenders/:id
 * Get lender details with reviews (public endpoint)
 */
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const lender = db.prepare('SELECT * FROM lenders WHERE id = ?').get(req.params.id);
    
    if (!lender) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lender not found' }
      });
    }
    
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.lender_id = ? 
      ORDER BY r.created_at DESC
      LIMIT 20
    `).all(req.params.id);
    
    res.json({
      success: true,
      data: {
        ...formatLender(lender),
        reviews: reviews.map(formatReview),
      },
    });
    
  } catch (error) {
    console.error('Get lender error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve lender' }
    });
  }
});

/**
 * Format lender record for API response
 */
function formatLender(record) {
  return {
    id: record.id,
    name: record.name,
    country: record.country,
    averageAPR: record.average_apr,
    rating: record.rating,
    reviewCount: record.review_count,
    website: record.website,
    phone: record.phone,
    description: record.description,
  };
}

function formatReview(record) {
  return {
    id: record.id,
    rating: record.rating,
    comment: record.comment,
    userName: record.user_name || 'Anonymous',
    createdAt: record.created_at,
  };
}

module.exports = router;

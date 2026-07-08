import express from 'express';
import optionalAuth from '../middleware/optionalAuth.js';
import Coupon from '../models/Coupon.js';

const router = express.Router();

/**
 * @route POST /api/coupons/validate
 * @desc Validate a coupon code for usage
 */
router.post('/validate', optionalAuth, async (req, res) => {
  try {
    const { code, amount, category } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code or coupon is inactive.' });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ error: 'Coupon code is expired.' });
    }

    if (amount !== undefined && amount < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum purchase amount of ₹${coupon.minOrderValue} required for this coupon.`
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon code limit reached.' });
    }

    if (category && coupon.applicableTo.length > 0 && !coupon.applicableTo.includes('all')) {
      if (!coupon.applicableTo.includes(category)) {
        return res.status(400).json({
          error: `This coupon is not applicable to bookings of type ${category}.`
        });
      }
    }

    // If user is authenticated, check per-user limits
    if (req.user) {
      const userUsageCount = coupon.usedByUsers.filter(
        id => id.toString() === req.user._id.toString()
      ).length;

      if (userUsageCount >= coupon.perUserLimit) {
        return res.status(400).json({ error: 'You have reached the usage limit for this coupon.' });
      }
    }

    // Calculate discount amount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      description: coupon.description
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/coupons/available
 * @desc Get available coupons for the current user/guest
 */
router.get('/available', optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const query = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    };

    const coupons = await Coupon.find(query).limit(10);
    
    // Filter by usage limit and user limits
    const filteredCoupons = coupons.filter(coupon => {
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return false;
      }
      if (req.user) {
        const userUsageCount = coupon.usedByUsers.filter(
          id => id.toString() === req.user._id.toString()
        ).length;
        if (userUsageCount >= coupon.perUserLimit) {
          return false;
        }
      }
      return true;
    });

    res.json({ success: true, coupons: filteredCoupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { jest } from '@jest/globals';

const reviewFind = jest.fn();
const reviewFindOne = jest.fn();
const reviewCreate = jest.fn();
const productFindOne = jest.fn();
const orderExists = jest.fn();

jest.unstable_mockModule('../models/Review.js', () => ({
  Review: { find: reviewFind, findOne: reviewFindOne, create: reviewCreate },
}));
jest.unstable_mockModule('../models/Product.js', () => ({
  Product: { findOne: productFindOne },
}));
jest.unstable_mockModule('../models/Order.js', () => ({
  Order: { exists: orderExists },
}));

const { createReview, getProductReviews } = await import('./reviewController.js');

const invoke = (handler, req) => new Promise((resolve, reject) => {
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      resolve({ body, statusCode: this.statusCode });
      return this;
    },
  };
  handler(req, response, (error) => error && reject(error));
});

beforeEach(() => jest.clearAllMocks());

describe('product reviews', () => {
  test('rejects malformed input before database reads', async () => {
    await expect(invoke(createReview, {
      params: { id: '507f1f77bcf86cd799439011' },
      body: { rating: '5', title: 'Good', comment: 'Not long enough' },
      user: { _id: 'user-123' },
    })).rejects.toMatchObject({ statusCode: 400 });

    await expect(invoke(getProductReviews, { params: { id: 'not-an-object-id' } }))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(productFindOne).not.toHaveBeenCalled();
    expect(reviewFind).not.toHaveBeenCalled();
  });

  test('trims review text and marks purchase status from persisted orders', async () => {
    productFindOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    reviewFindOne.mockResolvedValue(null);
    orderExists.mockResolvedValue(false);
    reviewCreate.mockResolvedValue({ _id: 'review-123' });

    const result = await invoke(createReview, {
      params: { id: '507f1f77bcf86cd799439011' },
      body: { rating: 5, title: '  Nice fit  ', comment: '  Comfortable and well made.  ' },
      user: { _id: 'user-123' },
    });

    expect(reviewCreate).toHaveBeenCalledWith({
      product: '507f1f77bcf86cd799439011',
      user: 'user-123',
      rating: 5,
      title: 'Nice fit',
      comment: 'Comfortable and well made.',
      isVerifiedPurchase: false,
    });
    expect(result.statusCode).toBe(201);
  });
});

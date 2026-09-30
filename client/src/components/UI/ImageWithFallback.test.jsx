import { fireEvent, render, screen } from '@testing-library/react';
import ImageWithFallback from './ImageWithFallback.jsx';

describe('ImageWithFallback', () => {
  it('shows an accessible fallback when the image cannot load', () => {
    render(
      <ImageWithFallback
        src="/missing-product-image.jpg"
        alt="Product photo"
        className="h-full w-full object-cover"
      />
    );

    fireEvent.error(screen.getByAltText('Product photo'));

    expect(screen.getByRole('img', { name: 'Product photo' })).toBeInTheDocument();
    expect(screen.queryByAltText('Product photo')).not.toBeInTheDocument();
  });
});

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { resolveCatalogImageUrl } from '../../utils/catalogImage';
import { colors } from '../../theme/colors';

type ProductLike = {
  image_url?: string | null;
  product_type?: string | null;
  category?: string | null;
  name?: string | null;
  brand?: string | null;
  model?: string | null;
};

type Props = {
  product: ProductLike;
  alt?: string;
  sx?: object;
  objectFit?: 'cover' | 'contain';
};

const ProductImage: React.FC<Props> = ({ product, alt, sx, objectFit = 'cover' }) => {
  const label =
    alt ||
    product.name ||
    `${product.brand || ''} ${product.model || ''}`.trim() ||
    'Product';
  const primary = resolveCatalogImageUrl(product);
  const [src, setSrc] = useState(primary);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.offWhite,
          color: colors.gray400,
          p: 2,
          textAlign: 'center',
          ...sx,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={label}
      sx={{ display: 'block', objectFit, objectPosition: 'center', ...sx }}
      onError={() => {
        const fallback = resolveCatalogImageUrl({ ...product, image_url: null });
        if (src !== fallback) {
          setSrc(fallback);
          return;
        }
        setFailed(true);
      }}
    />
  );
};

export default ProductImage;

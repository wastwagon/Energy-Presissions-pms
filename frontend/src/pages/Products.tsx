import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
  Stack,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as UploadIcon, PhotoLibrary as LibraryIcon, Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../services/api';
import { Product, ProductType } from '../types';
import MediaPicker from '../components/MediaPicker';
import { useAuth } from '../contexts/AuthContext';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { parseGalleryImages } from '../utils/productGallery';

const emptyForm = {
  product_type: ProductType.PANEL,
  name: '',
  brand: '',
  model: '',
  short_description: '',
  description: '',
  wattage: 0,
  capacity_kw: 0,
  capacity_kwh: 0,
  price_type: 'fixed',
  base_price: 0,
  image_url: '',
  gallery_images: [] as string[],
  category: '',
  is_active: true,
  stock_quantity: 0,
  manage_stock: false,
};

const Products: React.FC = () => {
  const { user } = useAuth();
  const canManageProducts = user?.role === 'admin' || user?.role === 'website_admin';
  
  // Helper function to format product type with uppercase first letter of each word
  const formatProductType = (type: string): string => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  // Helper function to format price type with uppercase first letter of each word
  const formatPriceType = (priceType: string): string => {
    return priceType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/', { params: { limit: 5000 } });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditing(product);
      setFormData({
        product_type: product.product_type,
        name: product.name || '',
        brand: product.brand || '',
        model: product.model || '',
        short_description: product.short_description || '',
        description: product.description || '',
        wattage: product.wattage || 0,
        capacity_kw: product.capacity_kw || 0,
        capacity_kwh: product.capacity_kwh || 0,
        price_type: product.price_type,
        base_price: product.base_price || 0,
        image_url: product.image_url || '',
        gallery_images: parseGalleryImages(product.gallery_images),
        category: product.category || '',
        is_active: product.is_active ?? true,
        stock_quantity: product.stock_quantity ?? 0,
        manage_stock: product.manage_stock ?? false,
      });
    } else {
      setEditing(null);
      setFormData({ ...emptyForm, product_type: ProductType.PANEL });
    }
    setGalleryUrlInput('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
        short_description: formData.short_description.trim() || null,
        description: formData.description.trim() || null,
        name: formData.name.trim() || null,
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products/', payload);
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (jpg, png, gif, webp)');
      return;
    }
    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const response = await api.post('/products/upload-image', formDataUpload);
      const url = response.data?.url;
      if (url) setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const uploadGalleryImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (jpg, png, gif, webp)');
      return;
    }
    try {
      setGalleryUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const response = await api.post('/products/upload-image', formDataUpload);
      const url = response.data?.url;
      if (url) {
        setFormData((prev) => ({
          ...prev,
          gallery_images: prev.gallery_images.includes(url)
            ? prev.gallery_images
            : [...prev.gallery_images, url],
        }));
      }
    } catch (err: any) {
      console.error('Gallery upload failed:', err);
      alert(err.response?.data?.detail || 'Upload failed');
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadGalleryImage(file);
    e.target.value = '';
  };

  const addGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.includes(url) ? prev.gallery_images : [...prev.gallery_images, url],
    }));
    setGalleryUrlInput('');
  };

  const removeGalleryImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((item) => item !== url),
    }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const capacityLabel = product.wattage
      ? `${product.wattage}w`
      : product.capacity_kw
        ? `${product.capacity_kw}kw`
        : product.capacity_kwh
          ? `${product.capacity_kwh}kwh`
          : '';
    return (
      formatProductType(product.product_type).toLowerCase().includes(q) ||
      (product.brand && product.brand.toLowerCase().includes(q)) ||
      (product.model && product.model.toLowerCase().includes(q)) ||
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.short_description && product.short_description.toLowerCase().includes(q)) ||
      (product.description && product.description.toLowerCase().includes(q)) ||
      (product.category && product.category.toLowerCase().includes(q)) ||
      capacityLabel.includes(q) ||
      formatPriceType(product.price_type).toLowerCase().includes(q) ||
      String(product.stock_quantity ?? 0).includes(q) ||
      product.base_price.toFixed(2).includes(q) ||
      String(product.catalog_unit_price ?? product.base_price).includes(q) ||
      (product.is_active ? 'yes' : 'no').includes(q) ||
      String(product.id).includes(q)
    );
  });

  if (!canManageProducts) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <Typography>You don't have permission to view this page.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Product
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search type, brand, model, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 260, maxWidth: 480 }}
        />
        {search.trim() && (
          <Typography variant="body2" color="text.secondary">
            {filteredProducts.length} of {products.length} products
          </Typography>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Wattage / Capacity</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Price Type</TableCell>
              <TableCell>Base Price</TableCell>
              <TableCell>Website unit</TableCell>
              <TableCell>Visible</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {search.trim() ? 'No products match your search.' : 'No products yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
              <TableRow key={product.id} sx={{ opacity: product.is_active ? 1 : 0.6 }}>
                <TableCell>{formatProductType(product.product_type)}</TableCell>
                <TableCell>{product.brand || '-'}</TableCell>
                <TableCell>{product.model || '-'}</TableCell>
                <TableCell>{product.category || '-'}</TableCell>
                <TableCell>
                  {product.wattage ? `${product.wattage}W` : 
                   product.capacity_kw ? `${product.capacity_kw}kW` : 
                   product.capacity_kwh ? `${product.capacity_kwh}kWh` : 
                   '-'}
                </TableCell>
                <TableCell>
                  {product.manage_stock ? (
                    <Chip
                      label={product.stock_quantity ?? 0}
                      size="small"
                      color={
                        (product.stock_quantity ?? 0) === 0 ? 'error' :
                        (product.stock_quantity ?? 0) <= 5 ? 'warning' : 'default'
                      }
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2">{product.stock_quantity ?? 0}</Typography>
                  )}
                </TableCell>
                <TableCell>{formatPriceType(product.price_type)}</TableCell>
                <TableCell>{product.base_price.toFixed(2)}</TableCell>
                <TableCell>
                  {(product.catalog_unit_price ?? product.base_price).toFixed(2)}
                </TableCell>
                <TableCell>{product.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Product Type"
            value={formData.product_type}
            onChange={(e) =>
              setFormData({ ...formData, product_type: e.target.value as ProductType })
            }
            margin="normal"
          >
            {Object.values(ProductType).map((type) => (
              <MenuItem key={type} value={type}>
                {formatProductType(type)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Shop display name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            helperText="Shown on the shop and product page. Leave blank to use brand + model."
          />
          <TextField
            fullWidth
            label="Short description"
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            margin="normal"
            multiline
            minRows={2}
            helperText="Brief summary for shop cards and the product hero."
          />
          <TextField
            fullWidth
            label="Full description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            minRows={4}
            helperText="Extra product details shown on the product page."
          />
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Featured Image
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                label="Image URL"
                placeholder="Paste URL, upload, or choose from library"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button
                variant="outlined"
                startIcon={<LibraryIcon />}
                onClick={() => setMediaPickerOpen(true)}
              >
                Library
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Box>
            <MediaPicker
              open={mediaPickerOpen}
              onClose={() => setMediaPickerOpen(false)}
              onSelect={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
            />
            {formData.image_url && (
              <Box
                component="img"
                src={resolveMediaUrl(formData.image_url)}
                alt="Preview"
                sx={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 1 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Gallery images
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Additional photos shown on the product page. The featured image above is always shown first.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                label="Add image URL"
                placeholder="Paste URL and click Add"
                value={galleryUrlInput}
                onChange={(e) => setGalleryUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGalleryUrl();
                  }
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button variant="outlined" onClick={addGalleryUrl} disabled={!galleryUrlInput.trim()}>
                Add
              </Button>
              <Button variant="outlined" startIcon={<LibraryIcon />} onClick={() => setGalleryPickerOpen(true)}>
                Library
              </Button>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />} disabled={galleryUploading}>
                {galleryUploading ? 'Uploading...' : 'Upload'}
                <input type="file" hidden accept="image/*" onChange={handleGalleryUpload} />
              </Button>
            </Stack>
            <MediaPicker
              open={galleryPickerOpen}
              onClose={() => setGalleryPickerOpen(false)}
              onSelect={(url) => {
                setFormData((prev) => ({
                  ...prev,
                  gallery_images: prev.gallery_images.includes(url)
                    ? prev.gallery_images
                    : [...prev.gallery_images, url],
                }));
                setGalleryPickerOpen(false);
              }}
            />
            {formData.gallery_images.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.gallery_images.map((url) => (
                  <Box
                    key={url}
                    sx={{
                      position: 'relative',
                      width: 88,
                      height: 88,
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={resolveMediaUrl(url)}
                      alt="Gallery"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                      size="small"
                      aria-label="Remove gallery image"
                      onClick={() => removeGalleryImage(url)}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        bgcolor: 'rgba(0,0,0,0.55)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                        p: 0.25,
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No gallery images yet.
              </Typography>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <TextField
            fullWidth
            label="Brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            margin="normal"
          />
          {formData.product_type === ProductType.PANEL && (
            <TextField
              fullWidth
              label="Wattage"
              type="number"
              value={formData.wattage}
              onChange={(e) => setFormData({ ...formData, wattage: parseInt(e.target.value) })}
              margin="normal"
            />
          )}
          {formData.product_type === ProductType.INVERTER && (
            <TextField
              fullWidth
              label="Capacity (kW)"
              type="number"
              value={formData.capacity_kw || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setFormData({ ...formData, capacity_kw: isNaN(val) ? 0 : val });
              }}
              margin="normal"
            />
          )}
          {formData.product_type === ProductType.BATTERY && (
            <TextField
              fullWidth
              label="Capacity (kWh)"
              type="number"
              value={formData.capacity_kwh || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                setFormData({ ...formData, capacity_kwh: isNaN(val) ? 0 : val });
              }}
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            select
            label="Price Type"
            value={formData.price_type}
            onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
            margin="normal"
          >
            <MenuItem value="fixed">Fixed</MenuItem>
            <MenuItem value="per_panel">Per Panel</MenuItem>
            <MenuItem value="per_watt">Per Watt</MenuItem>
            <MenuItem value="per_kw">Per kW</MenuItem>
            <MenuItem value="per_kwh">Per kWh</MenuItem>
            <MenuItem value="percentage">Percentage</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Base Price"
            type="number"
            value={formData.base_price || ''}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
              setFormData({ ...formData, base_price: isNaN(val) ? 0 : val });
            }}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Shop Category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
            helperText="Used for filtering on the shop page"
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="panel">Solar Panels</MenuItem>
            <MenuItem value="inverter">Inverters</MenuItem>
            <MenuItem value="battery">Batteries</MenuItem>
            <MenuItem value="Accessories">Accessories</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Stock Quantity"
            type="number"
            inputProps={{ min: 0 }}
            value={formData.stock_quantity ?? 0}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFormData({ ...formData, stock_quantity: isNaN(val) ? 0 : Math.max(0, val) });
            }}
            margin="normal"
            helperText="Current quantity on hand. Shown for all products."
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.manage_stock}
                onChange={(e) => setFormData({ ...formData, manage_stock: e.target.checked })}
                color="primary"
              />
            }
            label="Track stock (deduct when project accepted or online order paid)"
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                color="primary"
              />
            }
            label="Visible in Shop"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;


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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as UploadIcon, PhotoLibrary as LibraryIcon } from '@mui/icons-material';
import api from '../services/api';
import { Product, ProductType } from '../types';
import MediaPicker from '../components/MediaPicker';

const API_BASE = (window as any).REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
import { useAuth } from '../contexts/AuthContext';

const Products: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Helper function to format product type with uppercase first letter of each word
  const formatProductType = (type: string): string => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  // Helper function to format price type with uppercase first letter of each word
  const formatPriceType = (priceType: string): string => {
    return priceType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_type: ProductType.PANEL,
    brand: '',
    model: '',
    wattage: 0,
    capacity_kw: 0,
    capacity_kwh: 0,
    price_type: 'fixed',
    base_price: 0,
    image_url: '',
    category: '',
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
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
        brand: product.brand || '',
        model: product.model || '',
        wattage: product.wattage || 0,
        capacity_kw: product.capacity_kw || 0,
        capacity_kwh: product.capacity_kwh || 0,
        price_type: product.price_type,
        base_price: product.base_price || 0,
        image_url: product.image_url || '',
        category: product.category || '',
        is_active: product.is_active ?? true,
      });
    } else {
      setEditing(null);
      setFormData({
        product_type: ProductType.PANEL,
        brand: '',
        model: '',
        wattage: 0,
        capacity_kw: 0,
        capacity_kwh: 0,
        price_type: 'fixed',
        base_price: 0,
        image_url: '',
        category: '',
        is_active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, formData);
      } else {
        await api.post('/products/', formData);
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

  if (!isAdmin) {
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Wattage / Capacity</TableCell>
              <TableCell>Price Type</TableCell>
              <TableCell>Base Price</TableCell>
              <TableCell>Visible</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
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
                <TableCell>{formatPriceType(product.price_type)}</TableCell>
                <TableCell>{product.base_price.toFixed(2)}</TableCell>
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
            ))}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
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
                src={formData.image_url.startsWith('http') ? formData.image_url : `${API_BASE}${formData.image_url}`}
                alt="Preview"
                sx={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 1 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </Box>
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


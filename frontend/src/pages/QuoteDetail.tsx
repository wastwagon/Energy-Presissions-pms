import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon, Email as EmailIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import api from '../services/api';
import { Quote, QuoteItem } from '../types';

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [editQuoteDialogOpen, setEditQuoteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [itemForm, setItemForm] = useState({ description: '', quantity: 1, unit_price: 0 });
  const [quoteForm, setQuoteForm] = useState({ notes: '', payment_terms: '', validity_days: 30 });
  const [editingPercentage, setEditingPercentage] = useState<{ itemId: number; type: 'bos' | 'installation'; value: number } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (id) {
      fetchQuote();
    }
  }, [id]);

  const fetchQuote = async () => {
    try {
      const response = await api.get(`/quotes/${id}`);
      
      // Set quote state - create a new object to ensure React detects the change
      const quoteData = {
        ...response.data,
        project: response.data.project ? {
          ...response.data.project,
          customer: response.data.project.customer ? {
            ...response.data.project.customer
          } : undefined
        } : undefined
      };
      
      setQuote(quoteData);
      setTaxPercent(response.data.tax_percent || 0);
      setDiscountPercent(response.data.discount_percent || 0);
      
      if (response.data.project?.customer?.email) {
        setEmailAddress(response.data.project.customer.email);
      }
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Failed to load quote', 
        severity: 'error' 
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/quotes/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation_${quote?.quote_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setSnackbar({ open: true, message: 'Error downloading PDF', severity: 'error' });
    }
  };

  const handleDownloadProformaPDF = async () => {
    try {
      const response = await api.get(`/quotes/${id}/pdf`, {
        params: { document_type: 'proforma_invoice' },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `proforma_invoice_${quote?.quote_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar({ open: true, message: 'Proforma Invoice downloaded', severity: 'success' });
    } catch (error) {
      console.error('Error downloading Proforma Invoice:', error);
      setSnackbar({ open: true, message: 'Error downloading Proforma Invoice', severity: 'error' });
    }
  };

  const handlePrint = () => {
    // Create a print-friendly window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setSnackbar({ open: true, message: 'Please allow popups to print', severity: 'error' });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quote ${quote?.quote_number}</title>
          <style>
            @media print {
              @page { 
                size: A4;
                margin: 1cm; 
              }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .quote-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .totals-row {
              display: flex;
              justify-content: flex-end;
              margin: 5px 0;
            }
            .totals-label {
              width: 200px;
              text-align: right;
              padding-right: 10px;
            }
            .totals-value {
              width: 150px;
              text-align: right;
              font-weight: bold;
            }
            .grand-total {
              font-size: 1.2em;
              border-top: 2px solid #333;
              padding-top: 10px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>QUOTATION</h1>
            <h2>Quote Number: ${quote?.quote_number}</h2>
          </div>
          
          <div class="quote-info">
            <div>
              <p><strong>Customer:</strong> ${quote?.project?.customer?.name || 'N/A'}</p>
              <p><strong>Project:</strong> ${quote?.project?.name || 'N/A'}</p>
              <p><strong>Date:</strong> ${quote?.created_at ? new Date(quote.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p><strong>Valid Until:</strong> ${quote?.validity_days ? new Date(new Date(quote.created_at).getTime() + quote.validity_days * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Status:</strong> ${quote?.status || 'N/A'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Unit Price (GHS)</th>
                <th style="text-align: right;">Total (GHS)</th>
              </tr>
            </thead>
            <tbody>
              ${quote?.items?.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: right;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.unit_price)}</td>
                  <td style="text-align: right;">${formatCurrency(item.total_price)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <div class="totals-label">Equipment Subtotal (GHS):</div>
              <div class="totals-value">${formatCurrency(quote?.equipment_subtotal || 0)}</div>
            </div>
            <div class="totals-row">
              <div class="totals-label">Services Subtotal (GHS):</div>
              <div class="totals-value">${formatCurrency(quote?.services_subtotal || 0)}</div>
            </div>
            ${quote?.tax_amount ? `
            <div class="totals-row">
              <div class="totals-label">Tax (${quote.tax_percent}%) (GHS):</div>
              <div class="totals-value">${formatCurrency(quote.tax_amount)}</div>
            </div>
            ` : ''}
            ${quote?.discount_amount ? `
            <div class="totals-row">
              <div class="totals-label">Discount (${quote.discount_percent}%) (GHS):</div>
              <div class="totals-value">-${formatCurrency(quote.discount_amount)}</div>
            </div>
            ` : ''}
            <div class="totals-row grand-total">
              <div class="totals-label">Grand Total (GHS):</div>
              <div class="totals-value">${formatCurrency(quote?.grand_total || 0)}</div>
            </div>
          </div>

          ${quote?.notes ? `
          <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #333;">
            <h3>Notes:</h3>
            <p>${quote.notes.replace(/\n/g, '<br>')}</p>
          </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSendEmail = async () => {
    try {
      const params: any = {};
      if (emailAddress && emailAddress !== quote?.project?.customer?.email) {
        params.recipient_email = emailAddress;
      }
      
      await api.post(`/quotes/${id}/send-email`, null, { params });
      setSnackbar({ open: true, message: 'Email sent successfully', severity: 'success' });
      setEmailDialogOpen(false);
      fetchQuote(); // Refresh to get updated status
    } catch (error: any) {
      console.error('Error sending email:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Error sending email. Check SMTP configuration.',
        severity: 'error',
      });
    }
  };

  const handleEditItem = (item: QuoteItem) => {
    setEditingItem(item);
    setItemForm({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price
    });
    setEditItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!editingItem || !id) return;
    
    try {
      const updatedItem = {
        ...editingItem,
        ...itemForm,
        total_price: itemForm.quantity * itemForm.unit_price
      };
      
      await api.put(`/quotes/${id}/items/${editingItem.id}`, updatedItem);
      setEditItemDialogOpen(false);
      setEditingItem(null);
      
      // Wait a moment for backend to recalculate dependent items (BOS, Installation)
      setTimeout(() => {
        fetchQuote();
      }, 300);
      
      setSnackbar({ open: true, message: 'Item updated successfully. BOS and Installation recalculated automatically.', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Error updating item', severity: 'error' });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!id || !window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/quotes/${id}/items/${itemId}`);
      
      // Wait a moment for backend to recalculate dependent items (BOS, Installation)
      setTimeout(() => {
        fetchQuote();
      }, 300);
      
      setSnackbar({ open: true, message: 'Item deleted successfully. BOS and Installation recalculated automatically.', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Error deleting item', severity: 'error' });
    }
  };

  const extractPercentage = (description: string): number | null => {
    const match = description.match(/(\d+\.?\d*)%/);
    return match ? parseFloat(match[1]) : null;
  };

  const handleUpdatePercentage = async (itemId: number, type: 'bos' | 'installation', percentage: number) => {
    if (!id) return;
    
    try {
      await api.put(`/quotes/${id}/update-percentage?item_type=${type}`, { percentage });
      
      // Wait a moment for backend to recalculate
      setTimeout(() => {
        fetchQuote();
      }, 300);
      
      setEditingPercentage(null);
      setSnackbar({ open: true, message: `${type === 'bos' ? 'BOS' : 'Installation'} percentage updated and recalculated.`, severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Error updating percentage', severity: 'error' });
    }
  };

  const handleEditQuote = () => {
    if (!quote) return;
    setQuoteForm({
      notes: quote.notes || '',
      payment_terms: quote.payment_terms || '',
      validity_days: quote.validity_days || 30
    });
    setEditQuoteDialogOpen(true);
  };

  const handleSaveQuote = async () => {
    if (!id) return;
    
    try {
      await api.put(`/quotes/${id}`, quoteForm);
      setSnackbar({ open: true, message: 'Quote updated successfully', severity: 'success' });
      setEditQuoteDialogOpen(false);
      fetchQuote();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Error updating quote', severity: 'error' });
    }
  };

  const handleUpdateTotals = async () => {
    if (!id) return;
    
    try {
      await api.put(`/quotes/${id}`, {
        tax_percent: taxPercent,
        discount_percent: discountPercent,
      });
      fetchQuote();
      setSnackbar({ open: true, message: 'Tax and discount updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating quote:', error);
      setSnackbar({ open: true, message: 'Error updating quote', severity: 'error' });
    }
  };

  const handleTaxPercentChange = (value: number) => {
    setTaxPercent(value);
    
    // Clear existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    // Set new timeout to update after user stops typing (500ms delay)
    const timeout = setTimeout(() => {
      handleUpdateTotals();
    }, 500);
    
    setUpdateTimeout(timeout);
  };

  const handleDiscountPercentChange = (value: number) => {
    setDiscountPercent(value);
    
    // Clear existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    // Set new timeout to update after user stops typing (500ms delay)
    const timeout = setTimeout(() => {
      handleUpdateTotals();
    }, 500);
    
    setUpdateTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  if (!quote) {
    return <Typography>Loading...</Typography>;
  }

  const subtotal = quote.equipment_subtotal + quote.services_subtotal;
  
  // Calculate tax and discount amounts locally for immediate display
  const localTaxAmount = subtotal * (taxPercent / 100);
  const localDiscountAmount = subtotal * (discountPercent / 100);
  const localGrandTotal = subtotal + localTaxAmount - localDiscountAmount;
  
  // Use local calculations if they differ from stored values (user is typing)
  const displayTaxAmount = (taxPercent !== quote.tax_percent) ? localTaxAmount : (quote.tax_amount || 0);
  const displayDiscountAmount = (discountPercent !== quote.discount_percent) ? localDiscountAmount : (quote.discount_amount || 0);
  const displayGrandTotal = (taxPercent !== quote.tax_percent || discountPercent !== quote.discount_percent) ? localGrandTotal : quote.grand_total;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quote {quote.quote_number}</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => setEmailDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Send Email
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            sx={{ mr: 1 }}
          >
            Quotation PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadProformaPDF}
            sx={{ mr: 1 }}
          >
            Proforma Invoice
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditQuote} sx={{ ml: 1 }}>
            Edit Quote
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }} key={`customer-info-${quote.id}-${quote.project?.customer?.id || 'no-customer'}`}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            {quote.project?.customer ? (
              <>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {quote.project.customer.name || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {quote.project.customer.email || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {quote.project.customer.phone || 'N/A'}
                </Typography>
                {quote.project.customer.address && quote.project.customer.address.trim() && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {quote.project.customer.address}
                  </Typography>
                )}
                {quote.project.customer.city && (
                  <Typography variant="body1">
                    <strong>City:</strong> {quote.project.customer.city}
                    {quote.project.customer.country && `, ${quote.project.customer.country}`}
                  </Typography>
                )}
              </>
            ) : (
              <Typography color="text.secondary">
                {quote.project ? 'Customer information not available' : 'Project information not available'}
                <br />
                <small>Debug: hasProject={String(!!quote.project)}, hasCustomer={String(!!quote.project?.customer)}</small>
              </Typography>
            )}
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price (GHS)</TableCell>
                  <TableCell align="right">Total (GHS)</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const displayOrder = (item: QuoteItem) => {
                    const d = (item.description || '').toUpperCase();
                    if (d.includes('PANEL')) return 0;
                    if (d.includes('INVERTER')) return 1;
                    if (d.includes('BATTERY')) return 2;
                    if (d.includes('MOUNTING')) return 3;
                    if (d.includes('BOS') || d.includes('BALANCE OF SYSTEM')) return 4;
                    if (d.includes('TRANSPORT') || d.includes('LOGISTICS')) return 5;
                    if (d.includes('INSTALLATION')) return 6;
                    return 7;
                  };
                  const sorted = [...(quote.items || [])].sort(
                    (a, b) => displayOrder(a) - displayOrder(b) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
                  );
                  return sorted.map((item) => {
                  const isBOS = item.description.toUpperCase().includes('BOS') || item.description.includes('Balance of System');
                  const isInstallation = item.description.includes('Installation') && !item.description.includes('Transport');
                  const currentPercentage = extractPercentage(item.description);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {editingPercentage?.itemId === item.id ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              type="number"
                              value={editingPercentage.value}
                              onChange={(e) => setEditingPercentage({ ...editingPercentage, value: parseFloat(e.target.value) || 0 })}
                              size="small"
                              inputProps={{ min: 0, max: 100, step: 0.1 }}
                              sx={{ width: 80 }}
                            />
                            <Typography>%</Typography>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleUpdatePercentage(item.id, editingPercentage.type, editingPercentage.value)}
                              sx={{ ml: 1 }}
                            >
                              Save
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setEditingPercentage(null)}
                            >
                              Cancel
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <Typography>{item.description}</Typography>
                            {(isBOS || isInstallation) && currentPercentage !== null && (
                              <Button
                                size="small"
                                onClick={() => setEditingPercentage({ itemId: item.id, type: isBOS ? 'bos' : 'installation', value: currentPercentage })}
                                sx={{ mt: 0.5, fontSize: '0.75rem' }}
                              >
                                Edit {currentPercentage}%
                              </Button>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total_price)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                }); })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing Summary
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Equipment:</Typography>
                <Typography>{formatCurrency(quote.equipment_subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Services:</Typography>
                <Typography>{formatCurrency(quote.services_subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" fontWeight="bold">
                  Subtotal:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(subtotal)}
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Tax %"
                type="number"
                value={taxPercent}
                onChange={(e) => handleTaxPercentChange(parseFloat(e.target.value) || 0)}
                margin="normal"
                size="small"
                helperText="Updates automatically"
              />
              {(displayTaxAmount > 0 || taxPercent > 0) && (
                <Box display="flex" justifyContent="space-between" mb={1} sx={{ ml: 2, mr: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tax ({taxPercent}%):
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(displayTaxAmount)}
                  </Typography>
                </Box>
              )}
              <TextField
                fullWidth
                label="Discount %"
                type="number"
                value={discountPercent}
                onChange={(e) => handleDiscountPercentChange(parseFloat(e.target.value) || 0)}
                margin="normal"
                size="small"
                helperText="Updates automatically"
              />
              {(displayDiscountAmount > 0 || discountPercent > 0) && (
                <Box display="flex" justifyContent="space-between" mb={1} sx={{ ml: 2, mr: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Discount ({discountPercent}%):
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    -{formatCurrency(displayDiscountAmount)}
                  </Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" mt={3} pt={2} borderTop={1}>
                <Typography variant="h6">Grand Total (GHS):</Typography>
                <Typography variant="h6">{formatCurrency(displayGrandTotal)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Quote via Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Recipient Email"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            margin="normal"
            helperText="Leave empty to use customer email"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            The quotation PDF will be attached to the email. Make sure SMTP is configured in settings.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained" disabled={!emailAddress}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editItemDialogOpen} onClose={() => setEditItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Quote Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={itemForm.description}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={itemForm.quantity}
            onChange={(e) => {
              const qty = parseFloat(e.target.value) || 0;
              setItemForm({ ...itemForm, quantity: qty });
            }}
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            fullWidth
            label="Unit Price (GHS)"
            type="number"
            value={itemForm.unit_price}
            onChange={(e) => {
              const price = parseFloat(e.target.value) || 0;
              setItemForm({ ...itemForm, unit_price: price });
            }}
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: 'primary.light', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'primary.main'
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Calculated Total:
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatCurrency(itemForm.quantity * itemForm.unit_price)} GHS
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {itemForm.quantity} × {formatCurrency(itemForm.unit_price)} = {formatCurrency(itemForm.quantity * itemForm.unit_price)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained" disabled={itemForm.quantity <= 0 || itemForm.unit_price < 0}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Quote Dialog */}
      <Dialog open={editQuoteDialogOpen} onClose={() => setEditQuoteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Quote Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Payment Terms"
            value={quoteForm.payment_terms}
            onChange={(e) => setQuoteForm({ ...quoteForm, payment_terms: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Notes"
            value={quoteForm.notes}
            onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Validity Days"
            type="number"
            value={quoteForm.validity_days}
            onChange={(e) => setQuoteForm({ ...quoteForm, validity_days: parseInt(e.target.value) || 30 })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditQuoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuote} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuoteDetail;

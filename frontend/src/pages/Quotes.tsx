import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../services/api';
import { Quote, QuoteStatus, Project } from '../types';

const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newQuoteDialogOpen, setNewQuoteDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    fetchQuotes();
    fetchProjects();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes/');
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleOpenNewQuoteDialog = () => {
    setSelectedProjectId('');
    setError('');
    setNewQuoteDialogOpen(true);
  };

  const handleCloseNewQuoteDialog = () => {
    setNewQuoteDialogOpen(false);
    setSelectedProjectId('');
    setError('');
  };

  const handleCreateQuote = async () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/quotes/', {
        project_id: selectedProjectId,
        validity_days: 30,
      });
      handleCloseNewQuoteDialog();
      navigate(`/pms/quotes/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating quote:', error);
      setError(error.response?.data?.detail || 'Failed to create quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: QuoteStatus) => {
    const colors: Record<QuoteStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      [QuoteStatus.DRAFT]: 'default',
      [QuoteStatus.SENT]: 'primary',
      [QuoteStatus.ACCEPTED]: 'success',
      [QuoteStatus.REJECTED]: 'error',
      [QuoteStatus.EXPIRED]: 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quotes</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenNewQuoteDialog}
        >
          New Quote
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Quote Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>System Size</TableCell>
              <TableCell>Total Amount (GHS)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow
                key={quote.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/pms/quotes/${quote.id}`)}
              >
                <TableCell>{quote.quote_number}</TableCell>
                <TableCell>{quote.project?.customer?.name || '-'}</TableCell>
                <TableCell>{quote.project?.name || '-'}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{formatCurrency(quote.grand_total)}</TableCell>
                <TableCell>
                  <Chip
                    label={quote.status.toUpperCase()}
                    color={getStatusColor(quote.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={newQuoteDialogOpen} onClose={handleCloseNewQuoteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Quote</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            select
            label="Select Project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            margin="normal"
            required
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name} - {project.customer?.name || 'No Customer'}
              </MenuItem>
            ))}
          </TextField>
          {projects.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No projects available. Please create a project first.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewQuoteDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateQuote} 
            variant="contained" 
            disabled={!selectedProjectId || loading || projects.length === 0}
          >
            {loading ? 'Creating...' : 'Create Quote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Quotes;


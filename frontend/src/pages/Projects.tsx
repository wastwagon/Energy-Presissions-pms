import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../services/api';
import { Project, SystemType, ProjectStatus, Customer } from '../types';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    reference_code: '',
    system_type: SystemType.GRID_TIED,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchCustomers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleOpen = () => {
    setFormData({
      customer_id: '',
      name: '',
      reference_code: '',
      system_type: SystemType.GRID_TIED,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/projects/', formData);
      fetchProjects();
      handleClose();
      navigate(`/pms/projects/${response.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
      [ProjectStatus.NEW]: 'default',
      [ProjectStatus.QUOTED]: 'primary',
      [ProjectStatus.ACCEPTED]: 'success',
      [ProjectStatus.REJECTED]: 'error',
      [ProjectStatus.INSTALLED]: 'success',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          New Project
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>System Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/pms/projects/${project.id}`)}
              >
                <TableCell>{project.reference_code || '-'}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.customer?.name || '-'}</TableCell>
                <TableCell>{project.system_type.replace('_', ' ').toUpperCase()}</TableCell>
                <TableCell>
                  <Chip
                    label={project.status.toUpperCase()}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Customer"
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            margin="normal"
            required
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Reference Code (optional)"
            value={formData.reference_code}
            onChange={(e) => setFormData({ ...formData, reference_code: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="System Type"
            value={formData.system_type}
            onChange={(e) => setFormData({ ...formData, system_type: e.target.value as SystemType })}
            margin="normal"
            required
          >
            <MenuItem value={SystemType.GRID_TIED}>Grid-Tied</MenuItem>
            <MenuItem value={SystemType.HYBRID}>Hybrid</MenuItem>
            <MenuItem value={SystemType.OFF_GRID}>Off-Grid</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.customer_id || !formData.name}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;

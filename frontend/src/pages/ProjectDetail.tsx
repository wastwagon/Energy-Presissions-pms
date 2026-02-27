import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  MenuItem,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  Chip,
  Autocomplete,
  CircularProgress,
  Select,
  InputLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  SolarPower as SolarPowerIcon,
  BatteryChargingFull as BatteryIcon,
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  WbSunny as SunIcon,
  Power as PowerIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import api from '../services/api';
import {
  Project,
  Appliance,
  ApplianceType,
  ApplianceCategory,
  ApplianceTemplate,
  PowerUnit,
  SizingResult,
  SystemType,
  ProjectStatus,
} from '../types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [sizingResult, setSizingResult] = useState<SizingResult | null>(null);
  const [totalDailyKwhWithDiversity, setTotalDailyKwhWithDiversity] = useState<number | null>(null);
  const [diversityFactor, setDiversityFactor] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const [applianceDialogOpen, setApplianceDialogOpen] = useState(false);
  const [editingApplianceId, setEditingApplianceId] = useState<number | null>(null);
  const [sizingDialogOpen, setSizingDialogOpen] = useState(false);
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const [loadInputMethod, setLoadInputMethod] = useState<'appliances' | 'monthly'>('appliances');
  const [applianceCatalog, setApplianceCatalog] = useState<Record<string, ApplianceTemplate[]>>({});
  const [applianceCategories, setApplianceCategories] = useState<Array<{value: string, label: string}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<ApplianceCategory | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState<ApplianceTemplate | null>(null);
  const [useCustom, setUseCustom] = useState(false);
  const [applianceForm, setApplianceForm] = useState({
    category: ApplianceCategory.LIGHTING,
    appliance_type: ApplianceType.LED_BULB,
    description: '',
    power_value: 0,
    power_unit: PowerUnit.W,
    quantity: 1,
    hours_per_day: 0,
    is_essential: false,
  });
  const [sizingForm, setSizingForm] = useState({
    location: '',
    panel_brand: 'Jinko',
    backup_hours: 0,
    essential_load_percent: 50,
  });
  const [peakSunHoursOptions, setPeakSunHoursOptions] = useState<Array<{label: string, value: string, hours: number}>>([]);
  const [sizingError, setSizingError] = useState<string>('');
  const [calculating, setCalculating] = useState(false);
  const [monthlyForm, setMonthlyForm] = useState({
    monthly_kwh: '',
    monthly_bill: '',
    tariff: '',
    location: '',
    panel_brand: 'Jinko',
    backup_hours: 0,
    essential_load_percent: 50,
  });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusMessages, setStatusMessages] = useState<Record<string, string[]>>({});
  const [statusUpdateForm, setStatusUpdateForm] = useState<{ status: ProjectStatus; message: string }>({ status: ProjectStatus.NEW, message: '' });

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchAppliances();
      fetchSizingResult();
      fetchDiversityFactor();
    }
    fetchApplianceCatalog();
    fetchApplianceCategories();
    fetchPeakSunHours();
    fetchStatusMessages();
  }, [id]);

  const fetchStatusMessages = async () => {
    try {
      const response = await api.get('/projects/status-messages');
      setStatusMessages(response.data);
    } catch (error) {
      console.error('Error fetching status messages:', error);
    }
  };

  const handleOpenStatusDialog = () => {
    setStatusUpdateForm({
      status: project?.status || ProjectStatus.NEW,
      message: (statusMessages[project?.status || 'new'] || [])[0] || '',
    });
    setStatusDialogOpen(true);
  };

  const handleUpdateProjectStatus = async () => {
    if (!id || !statusUpdateForm.message.trim()) {
      alert('Please select or enter a status message');
      return;
    }
    try {
      await api.patch(`/projects/${id}/status`, statusUpdateForm);
      fetchProject();
      setStatusDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const fetchDiversityFactor = async () => {
    try {
      const response = await api.get('/settings/');
      const setting = response.data.find((s: any) => s.key === 'load_diversity_factor');
      if (setting) {
        setDiversityFactor(parseFloat(setting.value));
      } else {
        setDiversityFactor(0.65); // Default value
      }
    } catch (error) {
      console.warn('Could not fetch diversity factor, using default 0.65');
      setDiversityFactor(0.65); // Default value
    }
  };

  const fetchPeakSunHours = async () => {
    try {
      const response = await api.get('/settings/peak-sun-hours/');
      const options = response.data.map((psh: any) => ({
        label: `${psh.city || ''}${psh.state ? `, ${psh.state}` : ''} (${psh.peak_sun_hours} hrs)`,
        value: psh.city || psh.state || '',
        hours: psh.peak_sun_hours,
      }));
      setPeakSunHoursOptions(options);
    } catch (error) {
      console.error('Error fetching peak sun hours:', error);
    }
  };

  const fetchApplianceCatalog = async () => {
    try {
      const response = await api.get('/appliances/catalog/list');
      setApplianceCatalog(response.data);
    } catch (error) {
      console.error('Error fetching appliance catalog:', error);
    }
  };

  const fetchApplianceCategories = async () => {
    try {
      const response = await api.get('/appliances/catalog/categories');
      setApplianceCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchAppliances = async () => {
    try {
      const response = await api.get(`/appliances/?project_id=${id}`);
      setAppliances(response.data);
      
      // Fetch total with diversity factor applied
      try {
        const totalResponse = await api.get(`/appliances/project/${id}/total-daily-kwh`);
        setTotalDailyKwhWithDiversity(totalResponse.data.total_daily_kwh);
      } catch (error) {
        // Fallback to calculating from appliances if API fails
        console.warn('Could not fetch total with diversity factor, using sum of appliances');
        setTotalDailyKwhWithDiversity(null);
      }
    } catch (error) {
      console.error('Error fetching appliances:', error);
    }
  };

  const fetchSizingResult = async () => {
    try {
      const response = await api.get(`/sizing/project/${id}`);
      setSizingResult(response.data);
    } catch (error) {
      // Sizing result might not exist yet
    }
  };

  const handleEditAppliance = (appliance: Appliance) => {
    setEditingApplianceId(appliance.id);
    setSelectedCategory(appliance.category as ApplianceCategory);
    setUseCustom(true); // When editing, show custom form
    setSelectedTemplate(null);
    setApplianceForm({
      category: appliance.category as ApplianceCategory,
      appliance_type: appliance.appliance_type as ApplianceType,
      description: appliance.description,
      power_value: appliance.power_value,
      power_unit: appliance.power_unit as PowerUnit,
      quantity: appliance.quantity,
      hours_per_day: appliance.hours_per_day,
      is_essential: appliance.is_essential,
    });
    setApplianceDialogOpen(true);
  };

  const handleAddAppliance = async () => {
    try {
      // Validate required fields
      if (!applianceForm.description?.trim()) {
        alert('Please enter a description');
        return;
      }
      if (!applianceForm.power_value || applianceForm.power_value <= 0) {
        alert('Please enter a valid power value');
        return;
      }
      if (!applianceForm.hours_per_day || applianceForm.hours_per_day <= 0) {
        alert('Please enter valid hours per day');
        return;
      }
      
      // Ensure enum values are converted to strings
      const categoryValue = typeof applianceForm.category === 'string' ? applianceForm.category : (applianceForm.category as any)?.valueOf?.() || applianceForm.category;
      const applianceTypeValue = typeof applianceForm.appliance_type === 'string' ? applianceForm.appliance_type : (applianceForm.appliance_type as any)?.valueOf?.() || applianceForm.appliance_type;
      const powerUnitValue = typeof applianceForm.power_unit === 'string' ? applianceForm.power_unit : (applianceForm.power_unit as any)?.valueOf?.() || applianceForm.power_unit;
      
      const basePayload = {
        category: categoryValue.toLowerCase(),
        appliance_type: applianceTypeValue.toLowerCase(),
        description: applianceForm.description,
        power_value: applianceForm.power_value,
        power_unit: powerUnitValue,
        quantity: applianceForm.quantity,
        hours_per_day: applianceForm.hours_per_day,
        is_essential: applianceForm.is_essential,
      };
      
      if (editingApplianceId) {
        // Update existing appliance
        await api.put(`/appliances/${editingApplianceId}`, basePayload);
      } else {
        // Create new appliance - include project_id
        const payload = {
          ...basePayload,
          project_id: parseInt(id!),
        };
        await api.post('/appliances/', payload);
      }
      
      fetchAppliances();
      setApplianceDialogOpen(false);
      resetApplianceForm();
      setEditingApplianceId(null);
    } catch (error: any) {
      console.error('Error saving appliance:', error);
      alert(error.response?.data?.detail || 'Failed to save appliance. Please check the console for details.');
    }
  };

  const resetApplianceForm = () => {
    setApplianceForm({
      category: ApplianceCategory.LIGHTING,
      appliance_type: ApplianceType.LED_BULB,
      description: '',
      power_value: 0,
      power_unit: PowerUnit.W,
      quantity: 1,
      hours_per_day: 0,
      is_essential: false,
    });
    setSelectedCategory('');
    setSelectedTemplate(null);
    setUseCustom(false);
    setEditingApplianceId(null);
  };

  const handleCategoryChange = (category: ApplianceCategory) => {
    setSelectedCategory(category);
    setSelectedTemplate(null);
    setUseCustom(false);
    // API returns catalog with string keys (category values)
    const categoryKey = typeof category === 'string' ? category : (category as any)?.valueOf?.() || String(category);
    const templates = applianceCatalog[categoryKey] || [];
    if (templates.length > 0) {
      // Auto-select first template
      const firstTemplate = templates[0];
      setSelectedTemplate(firstTemplate);
      setApplianceForm({
        category: category,
        appliance_type: firstTemplate.appliance_type as ApplianceType,
        description: firstTemplate.name,
        power_value: firstTemplate.power_value,
        power_unit: firstTemplate.power_unit as PowerUnit,
        quantity: firstTemplate.default_quantity || 1,
        hours_per_day: firstTemplate.default_hours || 0,
        is_essential: firstTemplate.is_essential || false,
      });
    }
  };

  const handleTemplateSelect = (template: ApplianceTemplate) => {
    setSelectedTemplate(template);
    setUseCustom(false);
    setApplianceForm({
      category: template.category as ApplianceCategory,
      appliance_type: template.appliance_type as ApplianceType,
      description: template.name,
      power_value: template.power_value,
      power_unit: template.power_unit as PowerUnit,
      quantity: template.default_quantity,
      hours_per_day: template.default_hours,
      is_essential: template.is_essential,
    });
  };

  const handleUseCustom = () => {
    setUseCustom(true);
    setSelectedTemplate(null);
    setApplianceForm({
      ...applianceForm,
      category: selectedCategory || ApplianceCategory.OTHER,
      appliance_type: ApplianceType.CUSTOM,
      description: '',
    });
  };

  const handleDeleteAppliance = async (applianceId: number) => {
    try {
      await api.delete(`/appliances/${applianceId}`);
      fetchAppliances();
    } catch (error) {
      console.error('Error deleting appliance:', error);
    }
  };

  const handleCalculateSizing = async () => {
    if (totalDailyKwh <= 0) {
      setSizingError('Please add appliances first. Total daily kWh must be greater than 0.');
      return;
    }
    
    setCalculating(true);
    setSizingError('');
    try {
      const params: any = {
        location: sizingForm.location?.trim() || null,
        panel_brand: sizingForm.panel_brand,
      };
      
      if (project?.system_type !== SystemType.GRID_TIED) {
        params.backup_hours = parseFloat(sizingForm.backup_hours.toString()) || 0;
        // Convert percentage to decimal (100% = 1.0, 50% = 0.5)
        params.essential_load_percent = (parseFloat(sizingForm.essential_load_percent.toString()) || 50) / 100;
      }
      
      await api.post(`/sizing/from-appliances/${id}`, params);
      await fetchSizingResult();
      setSizingDialogOpen(false);
      setSizingError('');
    } catch (error: any) {
      console.error('Error calculating sizing:', error);
      setSizingError(error.response?.data?.detail || 'Failed to calculate sizing. Please check your inputs.');
    } finally {
      setCalculating(false);
    }
  };

  const handleCalculateFromMonthly = async () => {
    try {
      const params: any = {
        project_id: parseInt(id!),
        location: monthlyForm.location,
        panel_brand: monthlyForm.panel_brand,
      };
      
      if (monthlyForm.monthly_kwh) {
        params.monthly_kwh = parseFloat(monthlyForm.monthly_kwh);
      } else if (monthlyForm.monthly_bill && monthlyForm.tariff) {
        params.monthly_bill = parseFloat(monthlyForm.monthly_bill);
        params.tariff = parseFloat(monthlyForm.tariff);
      }
      
      if (project?.system_type !== SystemType.GRID_TIED) {
        params.backup_hours = parseFloat(monthlyForm.backup_hours.toString()) || 0;
        // Convert percentage to decimal (100% = 1.0, 50% = 0.5)
        params.essential_load_percent = (parseFloat(monthlyForm.essential_load_percent.toString()) || 50) / 100;
      }
      
      await api.post('/sizing/from-monthly', params);
      fetchSizingResult();
      setMonthlyDialogOpen(false);
    } catch (error) {
      console.error('Error calculating sizing from monthly:', error);
    }
  };

  const handleCreateQuote = async () => {
    try {
      // Auto-generate items from sizing results (default is true)
      const response = await api.post('/quotes/?auto_generate_items=true', {
        project_id: parseInt(id!),
        validity_days: 30,
      });
      navigate(`/pms/quotes/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating quote:', error);
      alert(error.response?.data?.detail || 'Failed to create quote. Please try again.');
    }
  };

  // Use API total with diversity factor if available, otherwise sum appliances
  const totalDailyKwh = totalDailyKwhWithDiversity !== null 
    ? totalDailyKwhWithDiversity 
    : appliances.reduce((sum, app) => sum + (app.daily_kwh || 0), 0);

  const handlePrintAppliances = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Load Analysis - ${project?.name}</title>
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
              max-width: 1000px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .project-info {
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
            .total {
              margin-top: 20px;
              padding: 15px;
              background-color: #f9f9f9;
              border: 2px solid #333;
              text-align: center;
              font-size: 1.2em;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LOAD ANALYSIS REPORT</h1>
            <h2>${project?.name || 'Project'}</h2>
          </div>
          
          <div class="project-info">
            <p><strong>Customer:</strong> ${project?.customer?.name || 'N/A'}</p>
            <p><strong>Project Reference:</strong> ${project?.reference_code || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th>Description</th>
                <th>Power</th>
                <th>Quantity</th>
                <th>Hours/Day</th>
                <th>Daily kWh</th>
              </tr>
            </thead>
            <tbody>
              ${appliances.map(app => `
                <tr>
                  <td>${app.category?.replace(/_/g, ' ').toUpperCase() || '-'}</td>
                  <td>${app.appliance_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-'}</td>
                  <td>${app.description}</td>
                  <td>${app.power_value} ${app.power_unit}</td>
                  <td>${app.quantity}</td>
                  <td>${app.hours_per_day}</td>
                  <td>${app.daily_kwh?.toFixed(2) || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Total Daily Energy Consumption: ${totalDailyKwh.toFixed(2)} kWh
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadAppliances = () => {
    // Create CSV content
    const headers = ['Category', 'Type', 'Description', 'Power', 'Quantity', 'Hours/Day', 'Daily kWh'];
    const rows = appliances.map(app => [
      app.category?.replace(/_/g, ' ') || '',
      app.appliance_type?.replace(/_/g, ' ') || '',
      app.description || '',
      `${app.power_value} ${app.power_unit}`,
      app.quantity?.toString() || '',
      app.hours_per_day?.toString() || '',
      app.daily_kwh?.toFixed(2) || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Add total row
    const csvWithTotal = csvContent + `\n\nTotal Daily Energy Consumption,${totalDailyKwh.toFixed(2)} kWh`;

    const blob = new Blob([csvWithTotal], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `load_analysis_${project?.name?.replace(/\s+/g, '_') || 'project'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!id || appliances.length === 0) {
      alert('No appliances to download. Please add appliances first.');
      return;
    }

    try {
      const response = await api.get(`/appliances/project/${id}/pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const projectName = project?.name?.replace(/\s+/g, '_') || 'project';
      link.setAttribute('download', `load_analysis_${projectName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      alert(error.response?.data?.detail || 'Error downloading PDF. Please try again.');
    }
  };

  const handleDownloadSizingPDF = async () => {
    if (!id || !sizingResult) {
      alert('No sizing data to download. Please calculate sizing first.');
      return;
    }

    try {
      const response = await api.get(`/projects/${id}/sizing/pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const projectName = project?.name?.replace(/\s+/g, '_') || 'project';
      link.setAttribute('download', `system_sizing_${projectName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Error downloading sizing PDF:', error);
      alert(error.response?.data?.detail || 'Error downloading PDF. Please try again.');
    }
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Reference: {project.reference_code} | Customer: {project.customer?.name}
            {project.created_by_user && ` | Created by: ${project.created_by_user.full_name}`}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={project.status?.toUpperCase() || 'NEW'}
              color={
                project.status === 'installed' || project.status === 'accepted' ? 'success' :
                project.status === 'rejected' ? 'error' :
                project.status === 'quoted' ? 'primary' : 'default'
              }
              size="medium"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<UpdateIcon />}
              onClick={handleOpenStatusDialog}
            >
              Update Status
            </Button>
          </Box>
          {sizingResult && (
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
              onClick={handleCreateQuote}
            >
              Create Quote
            </Button>
          )}
        </Box>
      </Box>

      {project.status_updates && project.status_updates.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Recent Status Updates
          </Typography>
          {project.status_updates.slice(0, 5).map((su) => (
            <Typography key={su.id} variant="body2" sx={{ mb: 0.5 }}>
              • {su.message} <Typography component="span" variant="caption" color="text.secondary">
                ({new Date(su.created_at).toLocaleString()})
              </Typography>
            </Typography>
          ))}
        </Paper>
      )}

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Project Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusUpdateForm.status}
              label="Status"
              onChange={(e) => {
                const s = e.target.value as ProjectStatus;
                const msgs = statusMessages[s] || [];
                setStatusUpdateForm({ status: s, message: msgs[0] || '' });
              }}
            >
              <MenuItem value={ProjectStatus.NEW}>NEW</MenuItem>
              <MenuItem value={ProjectStatus.QUOTED}>QUOTED</MenuItem>
              <MenuItem value={ProjectStatus.ACCEPTED}>ACCEPTED</MenuItem>
              <MenuItem value={ProjectStatus.REJECTED}>REJECTED</MenuItem>
              <MenuItem value={ProjectStatus.INSTALLED}>INSTALLED</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Predefined messages (select to use)</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {(statusMessages[statusUpdateForm.status] || []).map((msg) => (
              <Chip
                key={msg}
                label={msg}
                onClick={() => setStatusUpdateForm({ ...statusUpdateForm, message: msg })}
                color={statusUpdateForm.message === msg ? 'primary' : 'default'}
                variant={statusUpdateForm.message === msg ? 'filled' : 'outlined'}
                sx={{ maxWidth: '100%' }}
              />
            ))}
          </Box>
          <TextField
            fullWidth
            label="Status message (required)"
            value={statusUpdateForm.message}
            onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, message: e.target.value })}
            placeholder="Select a predefined message above or type your own..."
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateProjectStatus} disabled={!statusUpdateForm.message?.trim()}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mt: 3 }}>
        <Tab label="Load Analysis" />
        <Tab label="System Sizing" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ mt: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Load Analysis</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintAppliances}
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                disabled={!appliances || appliances.length === 0}
                sx={{ mr: 1 }}
                title={!appliances || appliances.length === 0 ? "Add appliances first" : "Download PDF report"}
              >
                Download PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadAppliances}
                sx={{ mr: 1 }}
              >
                Download CSV
              </Button>
              <Button
                variant="outlined"
                onClick={() => setMonthlyDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Enter Monthly Consumption
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetApplianceForm();
                  setApplianceDialogOpen(true);
                }}
              >
                Add Appliance
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Power</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Hours/Day</TableCell>
                  <TableCell>Daily kWh</TableCell>
                  <TableCell>Essential</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appliances.map((appliance) => (
                  <TableRow key={appliance.id}>
                    <TableCell>{appliance.category?.replace(/_/g, ' ').toUpperCase() || '-'}</TableCell>
                    <TableCell>{appliance.appliance_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-'}</TableCell>
                    <TableCell>{appliance.description}</TableCell>
                    <TableCell>
                      {appliance.power_value} {appliance.power_unit}
                    </TableCell>
                    <TableCell>{appliance.quantity}</TableCell>
                    <TableCell>{appliance.hours_per_day}</TableCell>
                    <TableCell>{appliance.daily_kwh?.toFixed(2) || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditAppliance(appliance)}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAppliance(appliance.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6">
              Total Daily Energy Consumption: {totalDailyKwh.toFixed(2)} kWh
            </Typography>
          </Paper>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ mt: 3 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4,
              background: 'linear-gradient(135deg, #2c5aa0 0%, #1e3d72 100%)',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SolarPowerIcon sx={{ fontSize: 32, mr: 1.5 }} />
                  <Typography variant="h4" fontWeight="bold">
                    System Sizing
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<PowerIcon />}
                    label={`Total Daily Energy: ${totalDailyKwh.toFixed(2)} kWh`}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      height: 32
                    }}
                  />
                  {sizingResult && (
                    <Chip 
                      icon={<CheckCircleIcon />}
                      label="Sizing Complete"
                      sx={{ 
                        bgcolor: 'rgba(76, 175, 80, 0.9)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        height: 32
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                {sizingResult && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadSizingPDF}
                    sx={{
                      bgcolor: '#00E676',
                      color: '#000',
                      fontWeight: 'bold',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#00C85F',
                      }
                    }}
                  >
                    Download PDF
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CalculateIcon />}
                  onClick={() => {
                    setSizingError('');
                    setSizingDialogOpen(true);
                  }}
                  disabled={totalDailyKwh <= 0}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }}
                >
                  Calculate Sizing
                </Button>
              </Box>
            </Box>
          </Paper>

          {totalDailyKwh <= 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Please add appliances in the Load Analysis tab before calculating system sizing.
            </Alert>
          )}

          {sizingError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSizingError('')}>
              {sizingError}
            </Alert>
          )}

          {sizingResult ? (
            <Grid container spacing={3}>
              {/* Input Parameters */}
              <Grid item xs={12}>
                <Card 
                  elevation={2}
                  sx={{ 
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        bgcolor: 'primary.main', 
                        borderRadius: '50%', 
                        p: 1.5, 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        Input Parameters
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(44, 90, 160, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(44, 90, 160, 0.1)',
                            height: '100%'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <PowerIcon sx={{ color: 'primary.main', mr: 1, fontSize: 24 }} />
                            <Typography variant="body1" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={0.5} fontSize="0.85rem">
                              Daily Energy
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
                            {totalDailyKwhWithDiversity !== null ? totalDailyKwhWithDiversity.toFixed(2) : sizingResult.total_daily_kwh.toFixed(2)}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" fontWeight="500">
                            kWh/day
                          </Typography>
                          {totalDailyKwhWithDiversity !== null && Math.abs(totalDailyKwhWithDiversity - sizingResult.total_daily_kwh) > 0.01 && (
                            <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                              * Adjusted with load diversity factor (accounts for realistic simultaneous usage)
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(255, 165, 0, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(255, 165, 0, 0.1)',
                            height: '100%'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <LocationIcon sx={{ color: '#ffa500', mr: 1, fontSize: 24 }} />
                            <Typography variant="body1" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={0.5} fontSize="0.85rem">
                              Location
                            </Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {sizingResult.location && sizingResult.location.trim() && sizingResult.location !== '0' 
                              ? sizingResult.location 
                              : 'Not specified'}
                          </Typography>
                          {sizingResult.peak_sun_hours && (
                            <Chip 
                              label={`${sizingResult.peak_sun_hours.toFixed(1)} hrs/day`}
                              size="small"
                              icon={<SunIcon />}
                              sx={{ bgcolor: 'rgba(255, 165, 0, 0.1)', color: '#ffa500' }}
                            />
                          )}
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(76, 175, 80, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(76, 175, 80, 0.1)',
                            height: '100%'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <SunIcon sx={{ color: '#4caf50', mr: 1, fontSize: 24 }} />
                            <Typography variant="body1" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={0.5} fontSize="0.85rem">
                              Peak Sun Hours
                            </Typography>
                          </Box>
                          <Typography variant="h4" fontWeight="bold" color="#4caf50" sx={{ mb: 0.5 }}>
                            {sizingResult.peak_sun_hours?.toFixed(1) || '-'}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" fontWeight="500">
                            hrs/day
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(33, 150, 243, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(33, 150, 243, 0.1)',
                            height: '100%'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <SolarPowerIcon sx={{ color: '#2196f3', mr: 1, fontSize: 24 }} />
                            <Typography variant="body1" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={0.5} fontSize="0.85rem">
                              Panel Brand
                            </Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold" color="#2196f3" sx={{ mb: 0.5 }}>
                            {sizingResult.panel_brand}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" fontWeight="500">
                            {sizingResult.panel_wattage}W per panel
                          </Typography>
                        </Paper>
                      </Grid>
                      {sizingResult.backup_hours != null && sizingResult.backup_hours > 0 && (
                        <>
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper 
                              elevation={0}
                              sx={{ 
                                p: 2, 
                                bgcolor: 'rgba(156, 39, 176, 0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(156, 39, 176, 0.1)',
                                height: '100%'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <BatteryIcon sx={{ color: '#9c27b0', mr: 1, fontSize: 24 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={0.5} fontSize="0.85rem">
                                  Backup Hours
                                </Typography>
                              </Box>
                              <Typography variant="h4" fontWeight="bold" color="#9c27b0" sx={{ mb: 0.5 }}>
                                {sizingResult.backup_hours}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" fontWeight="500">
                                hours
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper 
                              elevation={0}
                              sx={{ 
                                p: 2, 
                                bgcolor: 'rgba(244, 67, 54, 0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(244, 67, 54, 0.1)',
                                height: '100%'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <TrendingUpIcon sx={{ color: '#f44336', mr: 1, fontSize: 24 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={0.5} fontSize="0.85rem">
                                  Essential Load
                                </Typography>
                              </Box>
                              <Typography variant="h4" fontWeight="bold" color="#f44336" sx={{ mb: 0.5 }}>
                                {sizingResult.essential_load_percent ? (sizingResult.essential_load_percent * 100).toFixed(0) : 0}%
                              </Typography>
                              <Typography variant="body1" color="text.secondary" fontWeight="500">
                                of total load
                              </Typography>
                            </Paper>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* System Specifications */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        bgcolor: 'primary.main', 
                        borderRadius: '50%', 
                        p: 1.5, 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SolarPowerIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        System Specifications
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(44, 90, 160, 0.08)',
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>PV System Capacity</Typography>
                            <Typography variant="h3" fontWeight="bold" color="primary">
                              {sizingResult.system_size_kw?.toFixed(2)} <Typography component="span" variant="h5" color="text.secondary" fontWeight="500">kW</Typography>
                            </Typography>
                          </Box>
                          <PowerIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                        </Box>
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(33, 150, 243, 0.08)',
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderColor: '#2196f3'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>Number of Panels</Typography>
                            <Typography variant="h3" fontWeight="bold" color="#2196f3">
                              {sizingResult.number_of_panels} <Typography component="span" variant="h6" color="text.secondary" fontWeight="500">panels</Typography>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ mt: 0.5, display: 'block' }}>
                              {sizingResult.number_of_panels} × {sizingResult.panel_brand} {sizingResult.panel_wattage}W
                            </Typography>
                          </Box>
                          <SolarPowerIcon sx={{ fontSize: 48, color: '#2196f3', opacity: 0.3 }} />
                        </Box>
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(255, 165, 0, 0.08)',
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderColor: '#ffa500'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>Inverter Size</Typography>
                            <Typography variant="h3" fontWeight="bold" color="#ffa500">
                              {sizingResult.min_inverter_kw?.toFixed(1) || sizingResult.inverter_size_kw?.toFixed(1)} <Typography component="span" variant="h5" color="text.secondary" fontWeight="500">kW</Typography>
                            </Typography>
                            {sizingResult.min_inverter_kw && sizingResult.inverter_size_kw && Math.abs(sizingResult.min_inverter_kw - sizingResult.inverter_size_kw) > 0.01 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                Selected: {sizingResult.inverter_size_kw.toFixed(1)}kW (for quote)
                              </Typography>
                            )}
                          </Box>
                          <SettingsIcon sx={{ fontSize: 48, color: '#ffa500', opacity: 0.3 }} />
                        </Box>
                      </Paper>
                      
                      {sizingResult.battery_capacity_kwh && (
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(76, 175, 80, 0.08)',
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderColor: '#4caf50'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>Battery Capacity</Typography>
                              <Typography variant="h3" fontWeight="bold" color="#4caf50">
                                {sizingResult.battery_capacity_kwh?.toFixed(1)} <Typography component="span" variant="h5" color="text.secondary" fontWeight="500">kWh</Typography>
                              </Typography>
                            </Box>
                            <BatteryIcon sx={{ fontSize: 48, color: '#4caf50', opacity: 0.3 }} />
                          </Box>
                        </Paper>
                      )}
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(156, 39, 176, 0.08)',
                          borderRadius: 2,
                          borderLeft: '4px solid',
                          borderColor: '#9c27b0'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>Required Roof Area</Typography>
                            <Typography variant="h3" fontWeight="bold" color="#9c27b0">
                              {sizingResult.roof_area_m2?.toFixed(1)} <Typography component="span" variant="h5" color="text.secondary" fontWeight="500">m²</Typography>
                            </Typography>
                          </Box>
                          <HomeIcon sx={{ fontSize: 48, color: '#9c27b0', opacity: 0.3 }} />
                        </Box>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Design Factors & Calculations */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        bgcolor: 'secondary.main', 
                        borderRadius: '50%', 
                        p: 1.5, 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SettingsIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="secondary.main">
                        Design Factors & Calculations
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          bgcolor: 'rgba(44, 90, 160, 0.06)',
                          borderRadius: 2,
                          border: '1px solid rgba(44, 90, 160, 0.15)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1.5 }}>
                              System Efficiency
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" color="primary">
                              {((sizingResult.system_efficiency || 0) * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                          <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 36, opacity: 0.6 }} />
                        </Box>
                        <Chip 
                          label="Accounts for inverter, wiring, temperature, and soiling losses"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(44, 90, 160, 0.1)',
                            color: 'primary.main',
                            fontSize: '0.75rem',
                            height: 28,
                            fontWeight: 500
                          }}
                        />
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          bgcolor: 'rgba(33, 150, 243, 0.06)',
                          borderRadius: 2,
                          border: '1px solid rgba(33, 150, 243, 0.15)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1.5 }}>
                              DC/AC Ratio
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" color="#2196f3">
                              {sizingResult.dc_ac_ratio?.toFixed(2)}
                            </Typography>
                          </Box>
                          <TrendingUpIcon sx={{ color: '#2196f3', fontSize: 36, opacity: 0.6 }} />
                        </Box>
                        <Chip 
                          label="Prevents inverter clipping"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(33, 150, 243, 0.1)',
                            color: '#2196f3',
                            fontSize: '0.75rem',
                            height: 28,
                            fontWeight: 500
                          }}
                        />
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          bgcolor: 'rgba(76, 175, 80, 0.06)',
                          borderRadius: 2,
                          border: '1px solid rgba(76, 175, 80, 0.15)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1.5 }}>
                              Design Factor (Safety Margin)
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" color="#4caf50">
                              {Math.round(((sizingResult.design_factor || 1) - 1) * 100)}%
                            </Typography>
                          </Box>
                          <InfoIcon sx={{ color: '#4caf50', fontSize: 36, opacity: 0.6 }} />
                        </Box>
                        <Chip 
                          label="Additional capacity for system reliability"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: '#4caf50',
                            fontSize: '0.75rem',
                            height: 28,
                            fontWeight: 500
                          }}
                        />
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          bgcolor: 'rgba(156, 39, 176, 0.06)',
                          borderRadius: 2,
                          border: '1px solid rgba(156, 39, 176, 0.15)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="600" sx={{ mb: 1.5 }}>
                              Load Diversity Factor
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" color="#9c27b0">
                              {diversityFactor !== null ? (diversityFactor * 100).toFixed(0) : '65'}%
                            </Typography>
                          </Box>
                          <Box sx={{ color: '#9c27b0', fontSize: 36, opacity: 0.6, display: 'flex', alignItems: 'center' }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </Box>
                        </Box>
                        <Chip 
                          label="Accounts for realistic simultaneous appliance usage"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(156, 39, 176, 0.1)',
                            color: '#9c27b0',
                            fontSize: '0.75rem',
                            height: 28,
                            fontWeight: 500
                          }}
                        />
                      </Paper>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalculateIcon sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Calculation Summary
                        </Typography>
                      </Box>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
                          p: 2.5, 
                          borderRadius: 2,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="500">Effective Daily Energy (after losses)</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {sizingResult.effective_daily_kwh 
                                ? sizingResult.effective_daily_kwh.toFixed(2)
                                : ((totalDailyKwhWithDiversity !== null ? totalDailyKwhWithDiversity : sizingResult.total_daily_kwh) / (sizingResult.system_efficiency || 0.72)).toFixed(2)} kWh
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="500">System Size</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {sizingResult.system_size_kw?.toFixed(2)} kW
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="500">Panel Array</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {sizingResult.number_of_panels} × {sizingResult.panel_wattage}W = {((sizingResult.number_of_panels || 0) * (sizingResult.panel_wattage || 0) / 1000).toFixed(2)} kW
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight="500">Inverter</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {sizingResult.min_inverter_kw?.toFixed(1) || sizingResult.inverter_size_kw?.toFixed(1)} kW <Typography component="span" variant="body2" color="text.secondary" fontWeight="400">(DC/AC: {sizingResult.dc_ac_ratio?.toFixed(2)})</Typography>
                              {sizingResult.min_inverter_kw && sizingResult.inverter_size_kw && Math.abs(sizingResult.min_inverter_kw - sizingResult.inverter_size_kw) > 0.01 && (
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  Selected: {sizingResult.inverter_size_kw.toFixed(1)}kW for quote
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notes & Recommendations */}
              <Grid item xs={12}>
                <Card 
                  elevation={2}
                  sx={{ 
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        bgcolor: 'info.main', 
                        borderRadius: '50%', 
                        p: 1.5, 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <InfoIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="info.main">
                        Notes & Recommendations
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Alert 
                      severity="info" 
                      icon={<InfoIcon />}
                      sx={{ 
                        mb: 0,
                        bgcolor: 'rgba(33, 150, 243, 0.08)',
                        border: '1px solid rgba(33, 150, 243, 0.2)',
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          color: 'info.main'
                        }
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
                        System Design Notes
                      </Typography>
                      <Box component="ul" sx={{ pl: 3, mb: 0, mt: 0 }}>
                        <Typography component="li" variant="body1" sx={{ mb: 1.5, fontSize: '1rem', lineHeight: 1.6 }}>
                          The system is sized to meet your daily energy requirement of <strong>{(totalDailyKwhWithDiversity !== null ? totalDailyKwhWithDiversity : sizingResult.total_daily_kwh).toFixed(2)} kWh</strong>.
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1.5, fontSize: '1rem', lineHeight: 1.6 }}>
                          Roof area requirement includes spacing for mounting structures and maintenance access.
                        </Typography>
                        <Typography component="li" variant="body1" sx={{ mb: 1.5, fontSize: '1rem', lineHeight: 1.6 }}>
                          Inverter size is rounded up to the nearest 0.5 kW increment, minimum 6.5 kW.
                        </Typography>
                        {sizingResult.battery_capacity_kwh && (
                          <Typography component="li" variant="body1" sx={{ mb: 1.5, fontSize: '1rem', lineHeight: 1.6 }}>
                            Battery capacity is calculated for <strong>{sizingResult.backup_hours} hours</strong> of backup at <strong>{sizingResult.essential_load_percent ? (sizingResult.essential_load_percent * 100).toFixed(0) : 0}%</strong> essential load.
                          </Typography>
                        )}
                        <Typography component="li" variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                          All calculations use industry-standard derating factors for system reliability.
                        </Typography>
                      </Box>
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CalculateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Sizing Result Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {totalDailyKwh > 0 
                  ? 'Click "Calculate Sizing" to generate system specifications based on your load analysis.'
                  : 'Please add appliances in the Load Analysis tab first, then calculate sizing.'}
              </Typography>
              {totalDailyKwh > 0 && (
                <Button
                  variant="contained"
                  startIcon={<CalculateIcon />}
                  onClick={() => {
                    setSizingError('');
                    setSizingDialogOpen(true);
                  }}
                >
                  Calculate Sizing Now
                </Button>
              )}
            </Paper>
          )}
        </Box>
      )}

      {/* Enhanced Appliance Dialog with Categories */}
      <Dialog 
        open={applianceDialogOpen} 
        onClose={() => {
          setApplianceDialogOpen(false);
          resetApplianceForm();
        }} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>{editingApplianceId ? 'Edit Appliance' : 'Add Appliance'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Category"
            value={selectedCategory || ''}
            onChange={(e) => handleCategoryChange(e.target.value as ApplianceCategory)}
            margin="normal"
            required
          >
            {applianceCategories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>

          {selectedCategory && !useCustom && !editingApplianceId && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select from Catalog or Use Custom Entry
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                {(() => {
                  const categoryKey = typeof selectedCategory === 'string' ? selectedCategory : (selectedCategory as any)?.valueOf?.() || String(selectedCategory || '');
                  return (applianceCatalog[categoryKey] || []).map((template: ApplianceTemplate) => (
                  <Paper
                    key={template.appliance_type}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      cursor: 'pointer',
                      bgcolor: selectedTemplate?.appliance_type === template.appliance_type ? 'primary.light' : 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {template.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Power: {template.power_value} {template.power_unit}
                      {template.typical_range && ` (${template.typical_range})`}
                    </Typography>
                  </Paper>
                  ));
                })()}
              </Box>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleUseCustom}
              >
                + Add Custom Appliance
              </Button>
            </Box>
          )}

          {(useCustom || editingApplianceId) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Custom Appliance Entry
              </Typography>
              <TextField
                fullWidth
                select
                label="Appliance Type"
                value={applianceForm.appliance_type}
                onChange={(e) =>
                  setApplianceForm({ ...applianceForm, appliance_type: e.target.value as ApplianceType })
                }
                margin="normal"
              >
                {Object.values(ApplianceType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
          <TextField
            fullWidth
            label="Description"
            value={applianceForm.description}
            onChange={(e) => setApplianceForm({ ...applianceForm, description: e.target.value })}
            margin="normal"
          />
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Power Value"
              type="number"
              value={applianceForm.power_value}
              onChange={(e) =>
                setApplianceForm({ ...applianceForm, power_value: parseFloat(e.target.value) })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Unit"
              value={applianceForm.power_unit}
              onChange={(e) =>
                setApplianceForm({ ...applianceForm, power_unit: e.target.value as PowerUnit })
              }
              margin="normal"
            >
              {Object.values(PowerUnit).map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={applianceForm.quantity}
            onChange={(e) =>
              setApplianceForm({ ...applianceForm, quantity: parseInt(e.target.value) })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Hours per Day"
            type="number"
            value={applianceForm.hours_per_day}
            onChange={(e) =>
              setApplianceForm({ ...applianceForm, hours_per_day: parseFloat(e.target.value) || 0 })
            }
            margin="normal"
            required
            inputProps={{ min: 0, max: 24, step: 0.5 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={applianceForm.is_essential}
                onChange={(e) => setApplianceForm({ ...applianceForm, is_essential: e.target.checked })}
              />
            }
            label="Essential Load (for backup sizing)"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setApplianceDialogOpen(false);
            resetApplianceForm();
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddAppliance} 
            variant="contained"
            disabled={!applianceForm.description?.trim() || !applianceForm.power_value || applianceForm.power_value <= 0 || !applianceForm.hours_per_day || applianceForm.hours_per_day <= 0}
          >
            {editingApplianceId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Monthly Consumption Dialog */}
      <Dialog open={monthlyDialogOpen} onClose={() => setMonthlyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Monthly Consumption</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Input Method</FormLabel>
            <RadioGroup
              value={loadInputMethod}
              onChange={(e) => setLoadInputMethod(e.target.value as 'appliances' | 'monthly')}
              row
            >
              <FormControlLabel value="monthly" control={<Radio />} label="Monthly kWh" />
              <FormControlLabel value="bill" control={<Radio />} label="Monthly Bill" />
            </RadioGroup>
          </FormControl>
          
          {loadInputMethod === 'monthly' ? (
            <TextField
              fullWidth
              label="Monthly kWh"
              type="number"
              value={monthlyForm.monthly_kwh}
              onChange={(e) => setMonthlyForm({ ...monthlyForm, monthly_kwh: e.target.value })}
              margin="normal"
            />
          ) : (
            <>
              <TextField
                fullWidth
                label="Monthly Bill Amount"
                type="number"
                value={monthlyForm.monthly_bill}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, monthly_bill: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Tariff (per kWh)"
                type="number"
                value={monthlyForm.tariff}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, tariff: e.target.value })}
                margin="normal"
              />
            </>
          )}
          
          <TextField
            fullWidth
            label="Location"
            value={monthlyForm.location}
            onChange={(e) => setMonthlyForm({ ...monthlyForm, location: e.target.value })}
            margin="normal"
            helperText="City, State, or Country"
          />
          <TextField
            fullWidth
            select
            label="Panel Brand"
            value={monthlyForm.panel_brand}
            onChange={(e) => setMonthlyForm({ ...monthlyForm, panel_brand: e.target.value })}
            margin="normal"
          >
            <MenuItem value="Jinko">Jinko 580W</MenuItem>
            <MenuItem value="Longi">Longi 570W</MenuItem>
            <MenuItem value="JA">JA 560W</MenuItem>
          </TextField>
          {project?.system_type !== SystemType.GRID_TIED && (
            <>
              <TextField
                fullWidth
                label="Backup Hours"
                type="number"
                value={monthlyForm.backup_hours}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, backup_hours: parseFloat(e.target.value) || 0 })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Essential Load %"
                type="number"
                value={monthlyForm.essential_load_percent}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, essential_load_percent: parseFloat(e.target.value) || 50 })}
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMonthlyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCalculateFromMonthly} variant="contained">
            Calculate Sizing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Sizing Dialog */}
      <Dialog open={sizingDialogOpen} onClose={() => {
        setSizingDialogOpen(false);
        setSizingError('');
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Calculate System Sizing</Typography>
            {totalDailyKwh > 0 && (
              <Chip 
                label={`Daily Energy: ${totalDailyKwh.toFixed(2)} kWh`} 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {totalDailyKwh <= 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No appliances found. Please add appliances in the Load Analysis tab first.
            </Alert>
          )}
          
          {sizingError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSizingError('')}>
              {sizingError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={peakSunHoursOptions}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                value={peakSunHoursOptions.find(opt => opt.value === sizingForm.location) || null}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    // Store the full city name for better matching
                    setSizingForm({ ...sizingForm, location: newValue.value || newValue.label?.split(',')[0]?.trim() || '' });
                  } else if (typeof newValue === 'string') {
                    setSizingForm({ ...sizingForm, location: newValue });
                  } else {
                    setSizingForm({ ...sizingForm, location: '' });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Location"
                    margin="normal"
                    helperText="Search for your city or region to get accurate peak sun hours"
                    fullWidth
                  />
                )}
                freeSolo
                onInputChange={(_, newInputValue) => {
                  if (newInputValue && !peakSunHoursOptions.find(opt => opt.value === newInputValue)) {
                    setSizingForm({ ...sizingForm, location: newInputValue });
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Panel Brand"
                value={sizingForm.panel_brand}
                onChange={(e) => setSizingForm({ ...sizingForm, panel_brand: e.target.value })}
                margin="normal"
                required
              >
                <MenuItem value="Jinko">Jinko 580W</MenuItem>
                <MenuItem value="Longi">Longi 570W</MenuItem>
                <MenuItem value="JA">JA 560W</MenuItem>
              </TextField>
            </Grid>

            {project?.system_type !== SystemType.GRID_TIED && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Backup Hours"
                    type="number"
                    value={sizingForm.backup_hours}
                    onChange={(e) =>
                      setSizingForm({ ...sizingForm, backup_hours: parseFloat(e.target.value) || 0 })
                    }
                    margin="normal"
                    helperText="Hours of backup power required (0 = no battery backup)"
                    inputProps={{ min: 0, step: 0.5 }}
                  />
                </Grid>
                {sizingForm.backup_hours > 0 && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Essential Load Percentage"
                      type="number"
                      value={sizingForm.essential_load_percent}
                      onChange={(e) =>
                        setSizingForm({ ...sizingForm, essential_load_percent: parseFloat(e.target.value) || 50 })
                      }
                      margin="normal"
                      helperText="Percentage of load for battery sizing only (does not affect panels/inverter)"
                      inputProps={{ min: 0, max: 100, step: 5 }}
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Calculation Preview</Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on {totalDailyKwh.toFixed(2)} kWh/day, the system will be sized to meet your energy requirements
                  {sizingForm.location && ` in ${sizingForm.location}`}.
                  {project?.system_type !== SystemType.GRID_TIED && sizingForm.backup_hours > 0 && (
                    <> Battery backup will be calculated for {sizingForm.backup_hours} hours at {sizingForm.essential_load_percent}% essential load.</>
                  )}
                  {project?.system_type !== SystemType.GRID_TIED && sizingForm.backup_hours === 0 && (
                    <> No battery backup required. Panel and inverter sizing based on total daily energy.</>
                  )}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSizingDialogOpen(false);
            setSizingError('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCalculateSizing} 
            variant="contained"
            disabled={totalDailyKwh <= 0 || calculating || !sizingForm.location}
            startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
          >
            {calculating ? 'Calculating...' : 'Calculate Sizing'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;

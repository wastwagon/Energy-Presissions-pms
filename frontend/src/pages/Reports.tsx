import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Analytics {
  period: {
    start: string;
    end: string;
  };
  total_quotes: number;
  quotes_by_status: Record<string, number>;
  accepted_quotes: number;
  pending_quotes?: number;
  rejected_quotes?: number;
  conversion_rate: number;
  total_quoted_value: number;
  accepted_value: number;
  average_quote_value?: number;
  average_accepted_value?: number;
  average_system_size_kw: number;
  revenue_change_percent?: number;
  quotes_by_month: Array<{ month: string; count: number }>;
}

const Reports: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/reports/analytics', { params });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleExport = async (type: 'quotes' | 'customers' | 'projects') => {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get(`/reports/export/${type}`, {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/reports/pdf', {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const startStr = startDate || 'all';
      const endStr = endDate || 'all';
      link.setAttribute('download', `analytics_report_${startStr}_to_${endStr}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const handlePrintReport = () => {
    if (!analytics) {
      alert('No data to print. Please load analytics first.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    const periodText = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reports & Analytics - ${periodText}</title>
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
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .stat-label {
              font-size: 0.9em;
              color: #666;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 1.8em;
              font-weight: bold;
              color: #333;
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
            .section {
              margin: 30px 0;
            }
            .section-title {
              font-size: 1.2em;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTS & ANALYTICS</h1>
            <h2>Period: ${periodText}</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Quotes</div>
              <div class="stat-value">${analytics.total_quotes}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Conversion Rate</div>
              <div class="stat-value">${analytics.conversion_rate}%</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Quoted Value</div>
              <div class="stat-value">$${analytics.total_quoted_value.toLocaleString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Accepted Value</div>
              <div class="stat-value">$${analytics.accepted_value.toLocaleString()}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Accepted Quotes</div>
              <div class="stat-value">${analytics.accepted_quotes}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Average System Size</div>
              <div class="stat-value">${analytics.average_system_size_kw.toFixed(2)} kW</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Quotes by Status</div>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th style="text-align: right;">Count</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(analytics.quotes_by_status).map(([status, count]) => `
                  <tr>
                    <td>${status.toUpperCase()}</td>
                    <td style="text-align: right;">${count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Quotes by Month</div>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style="text-align: right;">Count</th>
                </tr>
              </thead>
              <tbody>
                ${analytics.quotes_by_month.map(item => `
                  <tr>
                    <td>${item.month}</td>
                    <td style="text-align: right;">${item.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="outlined" onClick={fetchAnalytics}>
            Apply Filter
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={!analytics}
            sx={{ mr: 1 }}
            title={!analytics ? "Load analytics first" : "Download PDF report"}
          >
            Download PDF
          </Button>
          {analytics && (
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintReport}
            >
              Print Report
            </Button>
          )}
        </Box>
      </Box>

      {analytics && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Total Quotes</Typography>
                  </Box>
                  <Typography variant="h4">{analytics.total_quotes}</Typography>
                  {analytics.pending_quotes !== undefined && analytics.pending_quotes > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {analytics.pending_quotes} pending
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Conversion Rate</Typography>
                  </Box>
                  <Typography variant="h4">{analytics.conversion_rate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analytics.accepted_quotes} accepted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <DescriptionIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="h6">Total Quoted</Typography>
                  </Box>
                  <Typography variant="h4">
                    GH₵ {analytics.total_quoted_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  {analytics.average_quote_value !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      Avg: GH₵ {analytics.average_quote_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Accepted Value</Typography>
                  </Box>
                  <Typography variant="h4">
                    GH₵ {analytics.accepted_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  {analytics.average_accepted_value !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      Avg: GH₵ {analytics.average_accepted_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            {analytics.average_system_size_kw > 0 && (
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <DescriptionIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="h6">Avg System Size</Typography>
                    </Box>
                    <Typography variant="h4">{analytics.average_system_size_kw.toFixed(2)} kW</Typography>
                    <Typography variant="body2" color="text.secondary">
                      PV capacity
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {analytics.revenue_change_percent !== undefined && (
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <TrendingUpIcon sx={{ mr: 1, color: analytics.revenue_change_percent >= 0 ? 'success.main' : 'error.main' }} />
                      <Typography variant="h6">Revenue Trend</Typography>
                    </Box>
                    <Typography 
                      variant="h4" 
                      color={analytics.revenue_change_percent >= 0 ? 'success.main' : 'error.main'}
                    >
                      {analytics.revenue_change_percent >= 0 ? '+' : ''}{analytics.revenue_change_percent.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      vs previous period
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* Calculation Insights Section */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#f0f8ff', borderLeft: '4px solid #00E676' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00E676', fontWeight: 'bold' }}>
              📊 Calculation Insights
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" paragraph>
                • <strong>Conversion Rate:</strong> {analytics.conversion_rate}% of quotes were accepted
                {analytics.conversion_rate >= 30 ? ' (Excellent performance)' : analytics.conversion_rate >= 20 ? ' (Good performance)' : ' (Needs improvement)'}
              </Typography>
              {analytics.average_quote_value !== undefined && (
                <Typography variant="body2" paragraph>
                  • <strong>Average Quote Value:</strong> GH₵ {analytics.average_quote_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per quote
                  {analytics.total_quoted_value > 0 && (
                    <span> ({((analytics.accepted_value / analytics.total_quoted_value) * 100).toFixed(1)}% of total value accepted)</span>
                  )}
                </Typography>
              )}
              {analytics.revenue_change_percent !== undefined && (
                <Typography variant="body2" paragraph>
                  • <strong>Revenue Trend:</strong> 
                  {analytics.revenue_change_percent > 0 ? (
                    <span style={{ color: '#4caf50' }}> +{analytics.revenue_change_percent.toFixed(1)}%</span>
                  ) : analytics.revenue_change_percent < 0 ? (
                    <span style={{ color: '#f44336' }}> {analytics.revenue_change_percent.toFixed(1)}%</span>
                  ) : (
                    <span> No change</span>
                  )}
                  {' '}compared to previous period
                </Typography>
              )}
              {analytics.average_system_size_kw > 0 && (
                <Typography variant="body2" paragraph>
                  • <strong>System Sizing:</strong> Average system size of {analytics.average_system_size_kw.toFixed(2)} kW indicates{' '}
                  {analytics.average_system_size_kw >= 10 ? 'large-scale' : analytics.average_system_size_kw >= 5 ? 'medium-scale' : 'residential-scale'} installations
                </Typography>
              )}
              {analytics.pending_quotes !== undefined && analytics.pending_quotes > 0 && (
                <Typography variant="body2" paragraph>
                  • <strong>Pending Quotes:</strong> {analytics.pending_quotes} quotes awaiting response
                  ({((analytics.pending_quotes / analytics.total_quotes) * 100).toFixed(1)}% of total)
                </Typography>
              )}
              {analytics.rejected_quotes !== undefined && analytics.rejected_quotes > 0 && (
                <Typography variant="body2" paragraph>
                  • <strong>Rejected Quotes:</strong> {analytics.rejected_quotes} quotes were rejected
                  ({((analytics.rejected_quotes / analytics.total_quotes) * 100).toFixed(1)}% of total)
                </Typography>
              )}
            </Box>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quotes by Status
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(analytics.quotes_by_status).map(([status, count]) => (
                        <TableRow key={status}>
                          <TableCell>{status.toUpperCase()}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quotes by Month
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.quotes_by_month.map((item) => (
                        <TableRow key={item.month}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Export Data
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('quotes')}
          >
            Export Quotes
          </Button>
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            onClick={() => handleExport('customers')}
          >
            Export Customers
          </Button>
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={() => handleExport('projects')}
          >
            Export Projects
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Reports;




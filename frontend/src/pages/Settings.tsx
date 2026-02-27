import React, { useState, useEffect } from 'react';
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
  TextField,
  Button,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
} from '@mui/material';
import { Save as SaveIcon, CloudUpload as UploadIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import api from '../services/api';
import { Setting, User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [settings, setSettings] = useState<Setting[]>([]);
  const [tab, setTab] = useState(0);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState({ email: '', full_name: '', password: '', role: UserRole.SALES });

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
      fetchUsers();
      // Load logo preview
      const logoUrl = '/logo.jpg';
      const img = new Image();
      img.onload = () => setLogoPreview(logoUrl);
      img.onerror = () => setLogoPreview(null);
      img.src = logoUrl;
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/');
      setSettings(response.data);
      const initial: Record<string, string> = {};
      response.data.forEach((setting: Setting) => {
        initial[setting.key] = setting.value;
      });
      setEditedSettings(initial);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async (key: string) => {
    try {
      await api.put(`/settings/${key}`, null, {
        params: { value: editedSettings[key] },
      });
      fetchSettings();
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleSaveAll = async () => {
    try {
      // Save all edited settings
      const savePromises = Object.keys(editedSettings).map(key =>
        api.put(`/settings/${key}`, null, {
          params: { value: editedSettings[key] },
        })
      );
      await Promise.all(savePromises);
      
      // Upload logo if selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        await api.post('/settings/upload-logo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setLogoFile(null);
        setLogoPreview(null);
      }
      
      fetchSettings();
      alert('All settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please check the console for details.');
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.full_name || !userForm.password) {
      alert('Please fill in all required fields');
      return;
    }
    if (userForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await api.post('/auth/register', userForm);
      fetchUsers();
      setUserDialogOpen(false);
      setUserForm({ email: '', full_name: '', password: '', role: UserRole.SALES });
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAdmin) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography>You don't have permission to view this page.</Typography>
      </Box>
    );
  }

  const sizingSettings = settings.filter((s: Setting) => s.category === 'sizing');
  const pricingSettings = settings.filter((s: Setting) => s.category === 'pricing');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Sizing Factors" />
        <Tab label="Pricing" />
        <Tab label="Other" />
        <Tab label="Users" />
      </Tabs>

      {tab === 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Setting</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sizingSettings.map((setting: Setting) => {
                  // Format display name for better readability
                  const displayName = setting.key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  
                  // Special handling for load_diversity_factor
                  const isDiversityFactor = setting.key === 'load_diversity_factor';
                  const currentValue = parseFloat(editedSettings[setting.key] || setting.value);
                  const isDisabled = isDiversityFactor && currentValue >= 1.0;
                  
                  return (
                    <TableRow key={setting.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={isDiversityFactor ? 600 : 400}>
                          {displayName}
                          {isDiversityFactor && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              Set to 1.0 to disable (no reduction)
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          inputProps={{ 
                            min: 0, 
                            max: 1, 
                            step: 0.01,
                            style: { textAlign: 'right' }
                          }}
                          value={editedSettings[setting.key] || setting.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value;
                            // Allow empty string for editing, but validate on blur
                            setEditedSettings({ ...editedSettings, [setting.key]: val });
                          }}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val) || val < 0) {
                              setEditedSettings({ ...editedSettings, [setting.key]: '0' });
                            } else if (val > 1) {
                              setEditedSettings({ ...editedSettings, [setting.key]: '1.0' });
                            }
                          }}
                          helperText={
                            isDiversityFactor 
                              ? currentValue >= 1.0 
                                ? 'Disabled (100% = no diversity reduction)' 
                                : `${(currentValue * 100).toFixed(0)}% simultaneous usage`
                              : undefined
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {setting.description || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              size="large"
            >
              Save All Settings
            </Button>
          </Box>
        </>
      )}

      {tab === 1 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Setting</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pricingSettings.map((setting: Setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>{setting.key}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={editedSettings[setting.key] || setting.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditedSettings({ ...editedSettings, [setting.key]: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>{setting.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              size="large"
            >
              Save All Settings
            </Button>
          </Box>
        </>
      )}

      {tab === 2 && (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Setting</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings
                  .filter((s: Setting) => s.category !== 'sizing' && s.category !== 'pricing')
                  .map((setting: Setting) => (
                    <TableRow key={setting.id}>
                      <TableCell>{setting.key}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={editedSettings[setting.key] || setting.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditedSettings({ ...editedSettings, [setting.key]: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>{setting.description || '-'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Company Logo Upload Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Company Logo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2 }}>
              <Avatar
                src={logoPreview || '/logo.jpg'}
                alt="Company Logo"
                sx={{ width: 120, height: 120 }}
                variant="rounded"
              />
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    Upload Logo
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Recommended: JPG or PNG, max 2MB
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              size="large"
            >
              Save All Settings
            </Button>
          </Box>
        </>
      )}

      {tab === 3 && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Team Members</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => {
                setUserForm({ email: '', full_name: '', password: '', role: UserRole.SALES });
                setUserDialogOpen(true);
              }}
            >
              Add User
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip label={u.role} size="small" color={u.role === 'admin' ? 'primary' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small" color={u.is_active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Create New User</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Full Name"
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                margin="normal"
                required
                helperText="Minimum 6 characters"
              />
              <TextField
                fullWidth
                select
                label="Role"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                margin="normal"
              >
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                <MenuItem value={UserRole.SALES}>Sales</MenuItem>
                <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreateUser} disabled={!userForm.email || !userForm.full_name || !userForm.password}>
                Create User
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Settings;


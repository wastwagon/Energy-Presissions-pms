import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../services/api';
import CmsPageEditor from '../components/admin/CmsPageEditor';
import { formatApiErrorDetail } from '../utils/apiErrorMessage';
import { BLOG_CATEGORIES } from '../data/blogPosts';

const SITE_IMAGE_KEYS = [
  { key: 'home_hero_image', label: 'Home hero image URL' },
  { key: 'about_hero_image', label: 'About hero image URL' },
  { key: 'services_hero_image', label: 'Services hero image URL' },
];

interface BlogRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  display_date: string;
  read_time: string;
  category: string;
  featured_image: string;
  published: boolean;
  sort_order: number;
}

interface FaqRow {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}

const emptyBlog: Omit<BlogRow, 'id'> = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  display_date: '',
  read_time: '',
  category: 'Ghana',
  featured_image: '',
  published: false,
  sort_order: 0,
};

const WebContentAdmin: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [blogDialog, setBlogDialog] = useState<{ open: boolean; edit?: BlogRow | null }>({ open: false });
  const [blogForm, setBlogForm] = useState(emptyBlog);
  const [faqDialog, setFaqDialog] = useState<{ open: boolean; edit?: FaqRow | null }>({ open: false });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', sort_order: 0, published: true });
  const [actionError, setActionError] = useState<string | null>(null);

  const loadSettings = async () => {
    const res = await api.get<Record<string, string>>('/content/admin/settings');
    setSettings(res.data || {});
  };

  const loadBlogs = async () => {
    const res = await api.get<BlogRow[]>('/content/admin/blog');
    setBlogs(res.data || []);
  };

  const loadFaqs = async () => {
    const res = await api.get<FaqRow[]>('/content/admin/faqs');
    setFaqs(res.data || []);
  };

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadSettings(), loadBlogs(), loadFaqs()]);
      } catch (e) {
        console.error(e);
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const saveSetting = async (key: string, value: string) => {
    try {
      setActionError(null);
      await api.put(`/content/admin/settings/${encodeURIComponent(key)}`, { value });
      setSettings((s) => ({ ...s, [key]: value }));
    } catch (err) {
      setActionError(formatApiErrorDetail(err) || 'Failed to save setting');
    }
  };

  const saveBlog = async () => {
    try {
      setActionError(null);
    const payload = {
      slug: blogForm.slug,
      title: blogForm.title,
      excerpt: blogForm.excerpt,
      body: blogForm.body,
      display_date: blogForm.display_date,
      read_time: blogForm.read_time,
      category: blogForm.category,
      featured_image: blogForm.featured_image,
      published: blogForm.published,
      sort_order: blogForm.sort_order,
    };
    if (blogDialog.edit) {
      await api.put(`/content/admin/blog/${blogDialog.edit.id}`, payload);
    } else {
      await api.post('/content/admin/blog', payload);
    }
    setBlogDialog({ open: false });
    await loadBlogs();
    } catch (err) {
      setActionError(formatApiErrorDetail(err) || 'Failed to save blog post');
    }
  };

  const deleteBlog = async (id: number) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      setActionError(null);
      await api.delete(`/content/admin/blog/${id}`);
      await loadBlogs();
    } catch (err) {
      setActionError(formatApiErrorDetail(err) || 'Failed to delete blog post');
    }
  };

  const saveFaq = async () => {
    try {
      setActionError(null);
      if (faqDialog.edit) {
        await api.put(`/content/admin/faqs/${faqDialog.edit.id}`, faqForm);
      } else {
        await api.post('/content/admin/faqs', faqForm);
      }
      setFaqDialog({ open: false });
      await loadFaqs();
    } catch (err) {
      setActionError(formatApiErrorDetail(err) || 'Failed to save FAQ');
    }
  };

  const deleteFaq = async (id: number) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      setActionError(null);
      await api.delete(`/content/admin/faqs/${id}`);
      await loadFaqs();
    } catch (err) {
      setActionError(formatApiErrorDetail(err) || 'Failed to delete FAQ');
    }
  };

  if (loading && blogs.length === 0 && faqs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Website content
      </Typography>
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Page content" />
          <Tab label="Blog" />
          <Tab label="FAQs" />
          <Tab label="Hero images" />
        </Tabs>
      </Paper>

      {tab === 0 && <CmsPageEditor />}

      {tab === 1 && (
        <Box>
          <Button startIcon={<AddIcon />} variant="contained" sx={{ mb: 2 }} onClick={() => { setBlogForm(emptyBlog); setBlogDialog({ open: true }); }}>
            New post
          </Button>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blogs.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>{b.slug}</TableCell>
                    <TableCell>{b.category || 'Ghana'}</TableCell>
                    <TableCell>{b.published ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => { setBlogForm({ ...b }); setBlogDialog({ open: true, edit: b }); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteBlog(b.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Button startIcon={<AddIcon />} variant="contained" sx={{ mb: 2 }} onClick={() => { setFaqForm({ question: '', answer: '', sort_order: 0, published: true }); setFaqDialog({ open: true }); }}>
            New FAQ
          </Button>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faqs.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.question.slice(0, 80)}{f.question.length > 80 ? '…' : ''}</TableCell>
                    <TableCell>{f.published ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => { setFaqForm({ question: f.question, answer: f.answer, sort_order: f.sort_order, published: f.published }); setFaqDialog({ open: true, edit: f }); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteFaq(f.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === 3 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Legacy hero image overrides — used only when a page CMS hero image field is empty. Prefer Page content → Hero section (or upload via Media library and paste /api/media/public/ID).
          </Typography>
          {SITE_IMAGE_KEYS.map(({ key, label }) => (
            <Box key={key} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label={label}
                value={settings[key] ?? ''}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                onBlur={() => saveSetting(key, settings[key] ?? '')}
              />
            </Box>
          ))}
        </Paper>
      )}

      <Dialog open={blogDialog.open} onClose={() => setBlogDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle>{blogDialog.edit ? 'Edit post' : 'New post'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Slug" value={blogForm.slug} onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })} required />
          <TextField label="Title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} required />
          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={blogForm.category || 'Ghana'}
              onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
            >
              {BLOG_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} multiline minRows={2} />
          <TextField
            label="Featured image URL"
            value={blogForm.featured_image}
            onChange={(e) => setBlogForm({ ...blogForm, featured_image: e.target.value })}
            placeholder="e.g. /portfolio/ep-install-01.jpg or /api/media/public/12"
            helperText="Path under public folder or media library URL shown on blog cards and article page."
          />
          <TextField label="Body" value={blogForm.body} onChange={(e) => setBlogForm({ ...blogForm, body: e.target.value })} multiline minRows={8} />
          <TextField label="Display date" value={blogForm.display_date} onChange={(e) => setBlogForm({ ...blogForm, display_date: e.target.value })} placeholder="e.g. 2026-04-01" />
          <TextField label="Read time" value={blogForm.read_time} onChange={(e) => setBlogForm({ ...blogForm, read_time: e.target.value })} placeholder="e.g. 5 min read" />
          <TextField type="number" label="Sort order" value={blogForm.sort_order} onChange={(e) => setBlogForm({ ...blogForm, sort_order: Number(e.target.value) })} />
          <FormControlLabel control={<Switch checked={blogForm.published} onChange={(_, v) => setBlogForm({ ...blogForm, published: v })} />} label="Published" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlogDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveBlog} disabled={!blogForm.slug.trim() || !blogForm.title.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={faqDialog.open} onClose={() => setFaqDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{faqDialog.edit ? 'Edit FAQ' : 'New FAQ'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} multiline required />
          <TextField label="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} multiline minRows={4} required />
          <TextField type="number" label="Sort order" value={faqForm.sort_order} onChange={(e) => setFaqForm({ ...faqForm, sort_order: Number(e.target.value) })} />
          <FormControlLabel control={<Switch checked={faqForm.published} onChange={(_, v) => setFaqForm({ ...faqForm, published: v })} />} label="Published" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFaqDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveFaq} disabled={!faqForm.question.trim() || !faqForm.answer.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebContentAdmin;

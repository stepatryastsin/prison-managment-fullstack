import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Box,
} from '@mui/material';

const STAFF_API_URL = 'http://localhost:8080/api/staff';
const JOB_API_URL = 'http://localhost:8080/api/job';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    job: { jobId: null, jobDescription: '' },
    salary: '',
  });
  const [originalJob, setOriginalJob] = useState({ jobId: null, jobDescription: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchStaff();
    fetchJobs();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(STAFF_API_URL);
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      setStaffList(await res.json());
    } catch (err) {
      showError(err, 'Ошибка загрузки сотрудников');
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(JOB_API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки должностей');
      setJobs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'jobDescription') {
      setFormData(f => ({ ...f, job: { ...f.job, jobDescription: value } }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const clearForm = () => {
    setFormData({ firstName: '', lastName: '', job: { jobId: null, jobDescription: '' }, salary: '' });
    setOriginalJob({ jobId: null, jobDescription: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Имя и Фамилия обязательны');
      return;
    }
    if (!formData.job.jobDescription.trim()) {
      alert('Выберите должность');
      return;
    }
    if (Number(formData.salary) <= 0) {
      alert('Зарплата должна быть больше нуля');
      return;
    }

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      salary: Number(formData.salary),
    };
    // attach job object
    const existing = jobs.find(j => j.jobDescription === formData.job.jobDescription);
    payload.job = existing
      ? { jobId: existing.jobId, jobDescription: existing.jobDescription }
      : { jobDescription: formData.job.jobDescription };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${STAFF_API_URL}/${editingId}` : STAFF_API_URL;
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      await fetchStaff();
      clearForm();
    } catch (err) {
      showError(err, 'Ошибка при сохранении сотрудника');
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.staffId);
    setOriginalJob({ jobId: s.job?.jobId ?? null, jobDescription: s.job?.jobDescription ?? '' });
    setFormData({
      firstName: s.firstName,
      lastName: s.lastName,
      job: { jobId: s.job?.jobId ?? null, jobDescription: s.job?.jobDescription ?? '' },
      salary: s.salary?.toString() ?? '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить сотрудника?')) return;
    try {
      const res = await fetch(`${STAFF_API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      await fetchStaff();
      if (editingId === id) clearForm();
    } catch (err) {
      showError(err, 'Ошибка при удалении сотрудника');
    }
  };

  const filtered = useMemo(() => {
    return staffList.filter(s =>
      `${s.firstName} ${s.lastName} ${s.job?.jobDescription}`.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [staffList, searchQuery]);

  const handleShowJobDialog = () => {
    setJobDialogOpen(true);
  };
  const handleSelectJob = (job) => {
    setFormData(f => ({ ...f, job: { jobId: job.jobId, jobDescription: job.jobDescription } }));
    setJobDialogOpen(false);
  };

  const showError = (err, fallback) => {
    let msg = fallback;
    if (err && err.message) {
      msg = `${err.message}${err.status ? ` (${err.status})` : ''}${err.time ? ` at ${err.time}` : ''}`;
    }
    alert(msg);
    console.error(fallback, err);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, m: 'auto', mt: 4, bgcolor: '#fafafa' }}>
      <Typography variant="h5" align="center" gutterBottom>
        {editingId ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Имя" name="firstName"
              value={formData.firstName} onChange={handleChange}
              required variant="outlined" sx={{ bgcolor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Фамилия" name="lastName"
              value={formData.lastName} onChange={handleChange}
              required variant="outlined" sx={{ bgcolor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Должность" name="jobDescription"
              value={formData.job.jobDescription} onClick={handleShowJobDialog}
              InputProps={{ readOnly: true }} helperText="Нажмите для выбора"
              required variant="outlined" sx={{ bgcolor: '#fff', cursor: 'pointer' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth label="Зарплата" name="salary" type="number"
              value={formData.salary} onChange={handleChange}
              required variant="outlined" sx={{ bgcolor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="contained" color="primary" type="submit">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
          </Grid>
          {editingId && (
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" color="secondary" onClick={clearForm}>
                Отмена
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom>Поиск</Typography>
      <TextField
        fullWidth placeholder="Поиск..." variant="outlined"
        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
        sx={{ mb: 3, bgcolor: '#fff' }}
      />

      <Typography variant="h5" gutterBottom>Сотрудники</Typography>
      <Table sx={{ bgcolor: '#fff' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#1976d2' }}>
            {['ID','Имя','Фамилия','Должность','Зарплата','Действия'].map(h => (
              <TableCell key={h} sx={{ color:'#fff' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(s => (
            <TableRow key={s.staffId} hover>
              <TableCell>{s.staffId}</TableCell>
              <TableCell>{s.firstName}</TableCell>
              <TableCell>{s.lastName}</TableCell>
              <TableCell>{s.job?.jobDescription}</TableCell>
              <TableCell>{s.salary}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => handleEdit(s)} variant="contained">Ред.</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(s.staffId)} variant="outlined">Удал.</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor:'#1976d2', color:'#fff' }}>Выберите должность</DialogTitle>
        <DialogContent>
          <List>
            {jobs.map(j => (
              <ListItem button key={j.jobId} onClick={() => handleSelectJob(j)}>
                <ListItemText primary={j.jobDescription} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default Staff;

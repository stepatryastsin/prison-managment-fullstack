// src/pages/Infirmary.jsx

import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Slide,
  Box,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1200,
  margin: 'auto',
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(3),
}));

export default function Infirmary({ readOnly = false }) {
  const [records, setRecords] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [form, setForm] = useState({
    prisonerId: '',
    relatedDoctor: '',
    drugName: '',
    drugUsageDay: '',
    diseaseType: '',
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [openPrisoner, setOpenPrisoner] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'error' });
  const navigate = useNavigate();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [infRes, prRes] = await Promise.all([
        axios.get(`${API_BASE}/infirmary`),
        axios.get(`${API_BASE}/prisoners`),
      ]);
      const valid = infRes.data.filter(r => r.prisoner);
      setRecords(valid);
      setPrisoners(prRes.data);
    } catch {
      showSnack('Ошибка загрузки данных');
    }
  };

  const showSnack = (msg, sev = 'error') => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const clearForm = () => {
    setForm({ prisonerId: '', relatedDoctor: '', drugName: '', drugUsageDay: '', diseaseType: '' });
    setEditId(null);
  };

  const submit = async e => {
    e.preventDefault();
    try {
      const payload = {
        prisoner: { prisonerId: Number(form.prisonerId) },
        relatedDoctor: form.relatedDoctor,
        drugName: form.drugName,
        drugUsageDay: Number(form.drugUsageDay),
        diseaseType: form.diseaseType,
      };
      if (editId) {
        await axios.put(`${API_BASE}/infirmary/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE}/infirmary`, payload);
      }
      await loadAll();
      clearForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при сохранении';
      showSnack(msg, 'error');
    }
  };

  const editRecord = rec => {
    setEditId(rec.prescriptionNum);
    setForm({
      prisonerId: rec.prisoner.prisonerId,
      relatedDoctor: rec.relatedDoctor,
      drugName: rec.drugName,
      drugUsageDay: rec.drugUsageDay,
      diseaseType: rec.diseaseType,
    });
  };

  const deleteRecord = async id => {
    if (!window.confirm('Удалить рецепт?')) return;
    try {
      await axios.delete(`${API_BASE}/infirmary/${id}`);
      if (editId === id) clearForm();
      await loadAll();
    } catch {
      showSnack('Ошибка при удалении');
    }
  };

  const filtered = records.filter(r =>
    `${r.prisoner.prisonerId} ${r.relatedDoctor} ${r.drugName} ${r.diseaseType}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert onClose={closeSnack} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      <Title variant="h4" align="center">Рецепты лечения</Title>

      {!readOnly && (
        <Box component="form" onSubmit={submit} sx={{ mb: 4, p: 3, bgcolor: '#fafafa', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            {editId ? 'Редактирование рецепта' : 'Новый рецепт'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ID заключённого"
                name="prisonerId"
                value={form.prisonerId}
                onClick={() => setOpenPrisoner(true)}
                InputProps={{ readOnly: true }}
                helperText="Нажмите для выбора"
                sx={{ cursor: 'pointer' }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Лечащий врач"
                name="relatedDoctor" value={form.relatedDoctor}
                onChange={handleChange} required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Препарат"
                name="drugName" value={form.drugName}
                onChange={handleChange} required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Доза/день"
                name="drugUsageDay" type="number"
                value={form.drugUsageDay} onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Тип заболевания"
                name="diseaseType" value={form.diseaseType}
                onChange={handleChange} required
              />
            </Grid>
            <Grid item xs={12} sm={4} container spacing={1}>
              <Grid item xs>
                <Button fullWidth variant="contained" type="submit">
                  {editId ? 'Сохранить' : 'Добавить'}
                </Button>
              </Grid>
              {editId && (
                <Grid item xs>
                  <Button fullWidth variant="outlined" onClick={clearForm}>
                    Отмена
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {!readOnly && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Поиск рецептов..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <CloseIcon />
            }}
          />
        </Stack>
      )}

      <Table size="small">
        <TableHead sx={{ bgcolor: '#e0f7fa' }}>
          <TableRow>
            {['ID заключённого', 'Врач', 'Препарат', 'Доза/день', 'Заболевание', 'Действия'].map(h => (
              <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(rec => (
            <TableRow key={rec.prescriptionNum} hover>
              <TableCell>{rec.prisoner.prisonerId}</TableCell>
              <TableCell>{rec.relatedDoctor}</TableCell>
              <TableCell>{rec.drugName}</TableCell>
              <TableCell>{rec.drugUsageDay}</TableCell>
              <TableCell>{rec.diseaseType}</TableCell>
              <TableCell>
                {!readOnly ? (
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" onClick={() => editRecord(rec)}>Ред.</Button>
                    <Button size="small" variant="outlined" color="error"
                      onClick={() => deleteRecord(rec.prescriptionNum)}>Уд.</Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="textSecondary">только просмотр</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openPrisoner} onClose={() => setOpenPrisoner(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          Выбор заключённого
          <Button onClick={() => setOpenPrisoner(false)}><CloseIcon /></Button>
        </DialogTitle>
        <DialogContent dividers>
          {prisoners.length ? (
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  {['ID', 'Имя', 'Фамилия', 'Камера', 'Дата рожд.'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {prisoners.map(p => (
                  <TableRow key={p.prisonerId} hover sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setForm(f => ({ ...f, prisonerId: p.prisonerId }));
                      setOpenPrisoner(false);
                    }}
                  >
                    <TableCell>{p.prisonerId}</TableCell>
                    <TableCell>{p.firstName}</TableCell>
                    <TableCell>{p.lastName}</TableCell>
                    <TableCell>{p.cell?.cellNum ?? '—'}</TableCell>
                    <TableCell>{p.dateOfBirth}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box textAlign="center" py={3}>
              <Typography>Нет заключённых</Typography>
              <Button variant="outlined" onClick={() => navigate('/prisoners')}>
                Добавить заключённого
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrisoner(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// src/pages/PropertiesFrontend.jsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_PROPERTIES = 'http://localhost:8080/api/properties';
const API_PRISONERS   = 'http://localhost:8080/api/prisoners';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1280,
  margin: 'auto',
  marginTop: theme.spacing(4),
  background: theme.palette.background.default,
}));

export default function PropertiesFrontend({ readOnly = false }) {
  const [propsList, setPropsList] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const [viewRec, setViewRec]     = useState(null);
  const [viewOpen, setViewOpen]   = useState(false);

  // edit/create only if not readOnly
  const [editRec, setEditRec]     = useState(null);
  const [editOpen, setEditOpen]   = useState(false);
  const [form, setForm]           = useState({
    prisonerId: '',
    propertyName: '',
    description: ''
  });

  const [snack, setSnack]         = useState({ open: false, msg: '', sev: 'success' });
  const openSnack = (msg, sev = 'success') => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  useEffect(fetchAll, []);
  async function fetchAll() {
    setLoading(true);
    try {
      const [pRes, prRes] = await Promise.all([
        axios.get(API_PROPERTIES),
        axios.get(API_PRISONERS)
      ]);
      setPropsList(pRes.data);
      setPrisoners(prRes.data);
    } catch {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    return propsList.reduce((acc, r) => {
      const pid = r.prisoner?.prisonerId;
      if (!pid) return acc;
      acc[pid] = acc[pid] || { prisoner: r.prisoner, items: [] };
      acc[pid].items.push(r);
      return acc;
    }, {});
  }, [propsList]);

  const filteredKeys = useMemo(() => {
    if (!search.trim()) return Object.keys(grouped);
    return Object.keys(grouped).filter(pid => {
      const { prisoner, items } = grouped[pid];
      return (
        prisoner.firstName.toLowerCase().includes(search.toLowerCase()) ||
        prisoner.lastName.toLowerCase().includes(search.toLowerCase()) ||
        items.some(r =>
          r.id.propertyName.toLowerCase().includes(search.toLowerCase())
        )
      );
    });
  }, [search, grouped]);

  function openForm(rec = null) {
    if (rec) {
      setEditRec(rec);
      setForm({
        prisonerId: rec.id.prisonerId,
        propertyName: rec.id.propertyName,
        description: rec.description
      });
    } else {
      setEditRec(null);
      setForm({ prisonerId:'', propertyName:'', description:'' });
    }
    setEditOpen(true);
  }

  async function handleSave() {
    try {
      const payload = {
        id: {
          prisonerId: form.prisonerId,
          propertyName: form.propertyName
        },
        description: form.description,
        prisoner: { prisonerId: form.prisonerId }
      };
      if (editRec) {
        await axios.put(
          `${API_PROPERTIES}/${form.prisonerId}/${form.propertyName}`,
          payload
        );
        openSnack('Запись обновлена');
      } else {
        await axios.post(API_PROPERTIES, payload);
        openSnack('Запись добавлена');
      }
      setEditOpen(false);
      fetchAll();
    } catch {
      openSnack('Ошибка сохранения', 'error');
    }
  }

  async function handleDelete(rec) {
    if (!window.confirm('Удалить запись?')) return;
    try {
      await axios.delete(
        `${API_PROPERTIES}/${rec.id.prisonerId}/${rec.id.propertyName}`
      );
      openSnack('Запись удалена');
      fetchAll();
    } catch {
      openSnack('Ошибка удаления', 'error');
    }
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Вещи заключённых
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          placeholder="Поиск..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
        {/* Add button only if not readOnly */}
        {!readOnly && (
          <Button variant="contained" onClick={() => openForm(null)}>
            Добавить запись
          </Button>
        )}
      </Stack>

      {loading && <Typography>Загрузка...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3}>
        {filteredKeys.map(pid => {
          const { prisoner, items } = grouped[pid];
          return (
            <Grid item xs={12} sm={6} md={4} key={pid}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': { transform: 'scale(1.02)', transition: '0.2s' }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {prisoner.firstName[0]}
                    </Avatar>
                  }
                  title={`${prisoner.firstName} ${prisoner.lastName}`}
                  subheader={`ID: ${pid}`}
                  action={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Просмотр">
                        <IconButton
                          onClick={() => {
                            setViewRec(grouped[pid]);
                            setViewOpen(true);
                          }}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      {/* Edit/Delete only if not readOnly */}
                      {!readOnly && (
                        <>
                          <Tooltip title="Редактировать">
                            <IconButton onClick={() => openForm(items[0])}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton onClick={() => handleDelete(items[0])}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  }
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    {items.map(r => (
                      <Box
                        component="div"
                        key={r.id.propertyName}
                        sx={{ display: 'flex', justifyContent: 'space-between' }}
                      >
                        <Typography variant="body2">
                          • <strong>{r.id.propertyName}</strong>: {r.description || '—'}
                        </Typography>
                        {/* per-item delete if not readOnly */}
                        {!readOnly && (
                          <Tooltip title="Удалить">
                            <IconButton size="small" onClick={() => handleDelete(r)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {!loading && filteredKeys.length === 0 && (
          <Typography>Записей не найдено</Typography>
        )}
      </Grid>

      {/* View Dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Детали заключённого</DialogTitle>
        <DialogContent dividers>
          {viewRec && (
            <>
              <Typography variant="h6" gutterBottom>
                {viewRec.prisoner.firstName} {viewRec.prisoner.lastName} (ID:{' '}
                {viewRec.prisoner.prisonerId})
              </Typography>
              <Stack spacing={1}>
                {viewRec.items.map(r => (
                  <Typography key={r.id.propertyName}>
                    • <strong>{r.id.propertyName}</strong>: {r.description || '—'}
                  </Typography>
                ))}
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Dialog — only if not readOnly */}
      {!readOnly && (
        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editRec ? 'Редактировать' : 'Добавить'} запись
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} mt={1}>
              <TextField
                select
                label="Заключённый"
                value={form.prisonerId}
                onChange={e =>
                  setForm(f => ({ ...f, prisonerId: e.target.value }))
                }
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="">— Выберите —</option>
                {prisoners.map(p => (
                  <option key={p.prisonerId} value={p.prisonerId}>
                    {p.firstName} {p.lastName} (ID {p.prisonerId})
                  </option>
                ))}
              </TextField>
              <TextField
                label="Свойство"
                value={form.propertyName}
                onChange={e =>
                  setForm(f => ({ ...f, propertyName: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Описание"
                value={form.description}
                onChange={e =>
                  setForm(f => ({ ...f, description: e.target.value }))
                }
                fullWidth
                multiline
                rows={3}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Отмена</Button>
            <Button
              onClick={handleSave}
              disabled={!form.prisonerId || !form.propertyName}
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.sev} onClose={closeSnack}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

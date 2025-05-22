// src/components/PropertiesFrontend.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';

import {
  Paper, Typography, Stack, TextField, InputAdornment, Button,
  Grid, Card, CardHeader, Avatar, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const API_PROPERTIES = 'http://localhost:8080/api/properties-in-cells';
const API_PRISONERS   = 'http://localhost:8080/api/prisoners';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1280,
  margin: 'auto',
  marginTop: theme.spacing(4),
  background: theme.palette.background.default,
}));

function ModelViewer({ url }) {
  const { progress } = useProgress();
  const [obj, setObj] = useState();
  useEffect(() => {
    if (!url) return;
    new OBJLoader().load(
      url,
      loaded => setObj(loaded),
      () => {},
      err => console.error(err)
    );
  }, [url]);
  if (!url) return null;
  if (!obj) return <Html center>{Math.round(progress)}% загружено...</Html>;
  return <primitive object={obj} />;
}

export default function PropertiesFrontend({ readOnly = false }) {
  const [propsList, setPropsList] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const [viewRec, setViewRec]     = useState(null);
  const [viewOpen, setViewOpen]   = useState(false);

  const [editRec, setEditRec]     = useState(null);
  const [editOpen, setEditOpen]   = useState(false);
  const [form, setForm]           = useState({ prisonerId: '', name: '', modelFile: null });

  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });
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

  // Группируем по заключённому
  const grouped = useMemo(() => {
    const map = {};
    propsList.forEach(r => {
      const pid = r.prisoner.prisonerId;
      if (!map[pid]) map[pid] = { prisoner: r.prisoner, items: [] };
      map[pid].items.push(r);
    });
    return map;
  }, [propsList]);

  // Фильтруем группы по поиску
  const filteredKeys = useMemo(() => {
    if (!search.trim()) return Object.keys(grouped);
    const q = search.toLowerCase();
    return Object.keys(grouped).filter(pid => {
      const { prisoner, items } = grouped[pid];
      return (
        prisoner.firstName.toLowerCase().includes(q) ||
        prisoner.lastName.toLowerCase().includes(q) ||
        items.some(r => r.name.toLowerCase().includes(q))
      );
    });
  }, [search, grouped]);

  function openForm(rec = null) {
    if (rec) {
      setEditRec(rec);
      setForm({ prisonerId: rec.id.prisonerId, name: rec.name, modelFile: null });
    } else {
      setEditRec(null);
      setForm({ prisonerId: '', name: '', modelFile: null });
    }
    setEditOpen(true);
  }

  async function handleSave() {
    if (!form.prisonerId || !form.name.trim()) return;

    try {
      if (editRec) {
        if (form.modelFile) {
          const data = new FormData();
          data.append('model', form.modelFile);
          await axios.put(
            `${API_PROPERTIES}/upload/${form.prisonerId}/${encodeURIComponent(editRec.name)}`,
            data,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        } else {
          await axios.put(
            `${API_PROPERTIES}/${form.prisonerId}/${encodeURIComponent(editRec.name)}`,
            { ...editRec, name: form.name.trim() }
          );
        }
        openSnack('Запись обновлена');
        setEditOpen(false);
        fetchAll();
        return;
      }

      // Создание новой записи
      const data = new FormData();
      data.append('prisonerId', form.prisonerId);
      data.append('name', form.name.trim());
      if (form.modelFile) data.append('model', form.modelFile);

      await axios.post(
        `${API_PROPERTIES}/upload`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      openSnack('Запись добавлена');
      setEditOpen(false);
      fetchAll();

    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при сохранении';
      openSnack(msg, 'error');
    }
  }

  async function handleDelete(rec) {
    if (!window.confirm('Удалить запись?')) return;
    try {
      await axios.delete(
        `${API_PROPERTIES}/${rec.id.prisonerId}/${encodeURIComponent(rec.name)}`
      );
      openSnack('Запись удалена');
      fetchAll();
    } catch {
      openSnack('Ошибка удаления', 'error');
    }
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Вещи заключённых</Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          placeholder="Поиск..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment> }}
          sx={{ flexGrow: 1 }}
        />
        {!readOnly && (
          <Button variant="contained" onClick={() => openForm(null)}>
            Добавить
          </Button>
        )}
      </Stack>

      {loading && <Typography>Загрузка...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {filteredKeys.map(pid => {
        const { prisoner, items } = grouped[pid];
        return (
          <React.Fragment key={pid}>
            <Typography variant="h6" mt={3} mb={1}>
              {prisoner.firstName} {prisoner.lastName} (ID {pid})
            </Typography>
            <Grid container spacing={3}>
              {items.map(rec => (
                <Grid item xs={12} sm={6} md={4} key={rec.name}>
                  <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                    <CardHeader
                      avatar={<Avatar>{prisoner.firstName[0]}</Avatar>}
                      title={rec.name}
                      action={
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Просмотр">
                            <IconButton
                              onClick={() => { setViewRec(rec); setViewOpen(true); }}
                            >
                              <InfoIcon/>
                            </IconButton>
                          </Tooltip>
                          {!readOnly && (
                            <>
                              <Tooltip title="Редактировать">
                                <IconButton onClick={() => openForm(rec)}>
                                  <EditIcon/>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Удалить">
                                <IconButton onClick={() => handleDelete(rec)}>
                                  <DeleteIcon/>
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      }
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </React.Fragment>
        );
      })}

      {/* View 3D-model */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          3D-модель:
        </DialogTitle>
        <DialogContent dividers sx={{ height: 500 }}>
          {viewRec && (
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight />
              <directionalLight position={[5, 5, 5]} />
              <ModelViewer
                url={`${API_PROPERTIES}/model/${viewRec.prisoner.prisonerId}/${encodeURIComponent(viewRec.name)}`}
              />
              <OrbitControls />
            </Canvas>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create */}
      {!readOnly && (
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            {editRec ? 'Редактировать' : 'Добавить'} описание и модель
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} mt={1}>
              <TextField
                select
                label="Заключённый"
                value={form.prisonerId}
                onChange={e => setForm(f => ({ ...f, prisonerId: e.target.value }))}
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
                label="Имя вещи"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                required
              />
              <Button variant="outlined" component="label">
                {form.modelFile ? form.modelFile.name : 'Выберите OBJ-модель'}
                <input
                  type="file"
                  hidden
                  accept=".obj"
                  onChange={e => setForm(f => ({ ...f, modelFile: e.target.files[0] }))}
                />
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={!form.prisonerId || !form.name.trim()}>
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
        <Alert severity={snack.sev} onClose={closeSnack}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}

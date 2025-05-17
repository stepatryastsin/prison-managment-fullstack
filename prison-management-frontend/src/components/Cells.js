// Cells.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Paper,
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
  Stack,
  Box,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const API_URL = 'http://localhost:8080/api/cells';

export default function Cells() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [cells, setCells] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dlgOpen, setDlgOpen] = useState(false);
  const [newCellNum, setNewCellNum] = useState('');
  const [newDate, setNewDate] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editErrors, setEditErrors] = useState({});

  // Fetch list of cells with session cookie
  const fetchCells = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      const data = await res.json();
      setCells(data);
    } catch (e) {
      console.error('fetchCells error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCells();
  }, []);

  // Create new cell
  const handleCreate = async () => {
    if (!newCellNum) return alert('Введите номер камеры');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellNum: +newCellNum, lastShakedownDate: newDate })
      });
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      setDlgOpen(false);
      setNewCellNum('');
      setNewDate('');
      fetchCells();
    } catch (e) {
      console.error('handleCreate error:', e);
    }
  };

  // Init edit mode
  const handleEditInit = (cell) => {
    setEditId(cell.cellNum);
    setEditDate(cell.lastShakedownDate?.split('T')[0] || '');
    setEditErrors({});
  };

  // Save edits
  const handleSave = async (cellNum) => {
    try {
      const res = await fetch(`${API_URL}/${cellNum}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellNum, lastShakedownDate: editDate })
      });
      if (!res.ok) {
        const err = await res.json();
        setEditErrors(err.errors || {});
        return;
      }
      setEditId(null);
      fetchCells();
    } catch (e) {
      console.error('handleSave error:', e);
    }
  };

  // Delete cell
  const handleDelete = async (cellNum) => {
    if (!window.confirm('Удалить камеру?')) return;
    try {
      const res = await fetch(`${API_URL}/${cellNum}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
      fetchCells();
    } catch (e) {
      console.error('handleDelete error:', e);
    }
  };

  const openDetail = (item) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: isMobile ? 1 : 3, maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <AppBar position="static" color="primary" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Управление камерами
          </Typography>
          <Button color="inherit" startIcon={<AddIcon />} onClick={() => setDlgOpen(true)}>
            Новая камера
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container spacing={2}>
        <AnimatePresence>
          {cells.map(cell => (
            <Grid key={cell.cellNum} item xs={12} sm={6} md={4}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardHeader
                    avatar={<Avatar>{cell.cellNum}</Avatar>}
                    title={`Камера №${cell.cellNum}`}
                    subheader={`Проверка: ${cell.lastShakedownDate?.split('T')[0] || '—'}`}
                    action={
                      <Stack direction="row" spacing={1}>
                        <EditIcon sx={{ cursor: 'pointer' }} onClick={() => handleEditInit(cell)} />
                        <InfoIcon sx={{ cursor: 'pointer' }} onClick={() => openDetail(cell)} />
                        <DeleteIcon color="error" sx={{ cursor: 'pointer' }} onClick={() => handleDelete(cell.cellNum)} />
                      </Stack>
                    }
                  />
                  {editId === cell.cellNum && (
                    <CardContent>
                      <Stack spacing={2}>
                        <TextField
                          label="Дата проверки"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={editDate}
                          onChange={e => setEditDate(e.target.value)}
                          error={!!editErrors.lastShakedownDate}
                          helperText={editErrors.lastShakedownDate}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" onClick={() => handleSave(cell.cellNum)}>
                            Сохранить
                          </Button>
                          <Button variant="outlined" onClick={() => setEditId(null)}>
                            Отмена
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Create Dialog */}
      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)}>
        <DialogTitle>Новая камера</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Номер камеры"
              type="number"
              value={newCellNum}
              onChange={e => setNewCellNum(e.target.value)}
              fullWidth
            />
            <TextField
              label="Дата проверки"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreate}>Создать</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DialogTitle>Детали камеры</DialogTitle>
        <DialogContent>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(detailItem, null, 2)}</pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

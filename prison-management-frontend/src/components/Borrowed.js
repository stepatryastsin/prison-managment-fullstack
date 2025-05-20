// src/components/Borrowed.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Paper,
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
  Stack,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LibraryBooks as LibraryBooksIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Info as InfoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const API = {
  borrowed:   'http://localhost:8080/api/borrowed',
  prisoners:  'http://localhost:8080/api/prisoners',
  books:      'http://localhost:8080/api/libraries'
};

export default function Borrowed() {
  const [tab, setTab]             = useState(0);
  const [borrowed, setBorrowed]   = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [books, setBooks]         = useState([]);

  const [dlgOpen, setDlgOpen] = useState(false);
  const [selPr, setSelPr]     = useState('');
  const [selBk, setSelBk]     = useState('');
  const [errors, setErrors]   = useState({});

  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

async function fetchAll() {
  try {
    const [b, p, k] = await Promise.all([
      axios.get(API.borrowed),
      axios.get(API.prisoners),
      axios.get(API.books)
    ]);
    setBorrowed(b.data);
    setPrisoners(p.data);
    setBooks(k.data);
  } catch (err) {
    const message = err.response?.data?.message || 'Ошибка загрузки данных';
    console.error('Ошибка fetchAll:', message);
    alert(message);
  }
}

  // Group by prisoner
  const grouped = borrowed.reduce((acc, rec) => {
    const { prisoner, library } = rec;
    if (!prisoner) return acc;
    const pid = prisoner.prisonerId;
    if (!acc[pid]) acc[pid] = { prisoner, libraries: [] };
    acc[pid].libraries.push(library);
    return acc;
  }, {});

  const openView = (item, type) => {
    setViewItem(item);
    setViewType(type);
    setViewOpen(true);
  };

  async function create() {
  setErrors({});
  if (!selPr || !selBk) {
    setErrors({ form: 'Выберите заключённого и книгу' });
    return;
  }

  try {
    await axios.post(API.borrowed, { prisonerId: +selPr, isbn: selBk });
    setDlgOpen(false);
    setSelPr('');
    setSelBk('');
    await fetchAll();
  } catch (err) {
    const message = err.response?.data?.message;
    if (message) {
      setErrors({ form: message });
    } else {
      setErrors(err.response?.data?.errors || { form: 'Ошибка сервера' });
    }
  }
}

  async function remove(prisonerId, isbn) {
  if (!window.confirm('Удалить эту запись?')) return;

  try {
    await axios.delete(`${API.borrowed}/${prisonerId}/${encodeURIComponent(isbn)}`);
    await fetchAll();
  } catch (err) {
    const message = err.response?.data?.message || 'Ошибка удаления записи';
    console.error('Ошибка удаления:', message);
    alert(message);
  }
}

  return (
    <Paper sx={{ maxWidth: 1280, mx: 'auto' }}>
      <AppBar position="static">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab icon={<LibraryBooksIcon />} label="Заимствования" />
          <Tab icon={<PersonIcon />} label="Заключённые" />
          <Tab icon={<BookIcon />} label="Книги" />
        </Tabs>
      </AppBar>

      <Box p={3}>
        {/* Заимствования */}
        {tab === 0 && (
          <>
            <Box mb={2} textAlign="right">
              <Button variant="contained" onClick={() => setDlgOpen(true)}>
                Новое заимствование
              </Button>
            </Box>
            <Grid container spacing={2}>
              <AnimatePresence>
                {Object.values(grouped).map(({ prisoner, libraries }) => (
                  <Grid item xs={12} md={6} lg={4} key={prisoner.prisonerId}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <Card variant="outlined">
                        <CardHeader
                          avatar={
                            <Avatar>
                              {prisoner.name?.[0] ?? '?'}
                            </Avatar>
                          }
                          title={prisoner.name}
                          subheader={`ID: ${prisoner.prisonerId}`}
                          action={
                            <IconButton onClick={() => openView({ prisoner, libraries }, 'borrowed')}>
                              <InfoIcon />
                            </IconButton>
                          }
                        />
                        <CardContent>
                          <Stack spacing={1}>
                            {libraries.map(lib => (
                              <Box key={lib.isbn} display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="body2">• {lib.bookName}</Typography>
                                <IconButton size="small" color="error" onClick={() => remove(prisoner.prisonerId, lib.isbn)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </>
        )}

        {/* Заключённые */}
        {tab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Список заключённых</Typography>
            <Grid container spacing={2}>
              {prisoners.map(p => (
                <Grid item xs={12} sm={6} md={4} key={p.prisonerId}>
                  <Card>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">{p.name}</Typography>
                        <Typography color="text.secondary">ID: {p.prisonerId}</Typography>
                      </Box>
                      <IconButton onClick={() => openView(p, 'prisoner')}>
                        <InfoIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Книги */}
        {tab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>Каталог книг</Typography>
            <Grid container spacing={2}>
              {books.map(b => (
                <Grid item xs={12} sm={6} md={4} key={b.isbn}>
                  <Card>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">{b.bookName}</Typography>
                        <Typography color="text.secondary">ISBN: {b.isbn}</Typography>
                      </Box>
                      <IconButton onClick={() => openView(b, 'book')}>
                        <InfoIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Диалог создания */}
      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)}>
        <DialogTitle>Новое заимствование</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Заключённый"
              SelectProps={{ native: true }}
              value={selPr}
              onChange={e => setSelPr(e.target.value)}
            >
              <option value="">— Выберите —</option>
              {prisoners.map(p => (
                <option key={p.prisonerId} value={p.prisonerId}>
                  {p.name} (ID {p.prisonerId})
                </option>
              ))}
            </TextField>
            <TextField
              select
              label="Книга"
              SelectProps={{ native: true }}
              value={selBk}
              onChange={e => setSelBk(e.target.value)}
            >
              <option value="">— Выберите —</option>
              {books.map(b => (
                <option key={b.isbn} value={b.isbn}>
                  {b.bookName}
                </option>
              ))}
            </TextField>
            {errors.form && <Typography color="error">{errors.form}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={create}>Добавить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Подробности</DialogTitle>
        <DialogContent dividers>
          {viewType === 'borrowed' && viewItem && (
            <>
              <Typography><strong>Заключённый:</strong> {viewItem.prisoner.name}</Typography>
              <Typography mt={2}><strong>Книги:</strong></Typography>
              <Stack spacing={1} mt={1}>
                {viewItem.libraries.map(lib => (
                  <Typography key={lib.isbn}>• {lib.bookName} (ISBN {lib.isbn})</Typography>
                ))}
              </Stack>
            </>
          )}
          {viewType === 'prisoner' && viewItem && (
            <>
              <Typography><strong>Имя:</strong> {viewItem.name}</Typography>
              <Typography><strong>ID:</strong> {viewItem.prisonerId}</Typography>
            </>
          )}
          {viewType === 'book' && viewItem && (
            <>
              <Typography><strong>Название:</strong> {viewItem.bookName}</Typography>
              <Typography><strong>ISBN:</strong> {viewItem.isbn}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}


// src/App.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Box,               // <- убедитесь, что есть импорт
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
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const API = {
  borrowed:   'http://localhost:8080/api/borrowed',
  prisoners: 'http://localhost:8080/api/prisoners',
  books:      'http://localhost:8080/api/libraries'
};

export default function App() {
  const [tab, setTab]         = useState(0);
  const [borrowed, setBorrowed] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [books, setBooks]     = useState([]);

  const [dlgOpen, setDlgOpen] = useState(false);
  const [selPr, setSelPr]     = useState('');
  const [selBk, setSelBk]     = useState('');
  const [errors, setErrors]   = useState({});

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
      console.error(err);
    }
  }

  async function create() {
    setErrors({});
    if (!selPr || !selBk) {
      setErrors({ form: 'Выберите заключённого и книгу' });
      return;
    }
    try {
      await axios.post(API.borrowed, {
        prisonerId: parseInt(selPr),
        isbn: selBk
      });
      setDlgOpen(false);
      setSelPr(''); setSelBk('');
      fetchAll();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ form: 'Ошибка сервера' });
      }
    }
  }

  async function remove(pid, isbn) {
    if (!window.confirm(`Удалить заимствование ${pid} ↔ ${isbn}?`)) return;
    await axios.delete(`${API.borrowed}/${pid}/${isbn}`);
    fetchAll();
  }

  // Группируем
  const grouped = borrowed.reduce((acc, rec) => {
    const prisoner = rec.prisoner;
    const lib      = rec.library;
    if (!prisoner) return acc;               // если данных нет — пропускаем
    const pid = prisoner.prisonerId;
    if (!acc[pid]) acc[pid] = { prisoner, books: [] };
    acc[pid].books.push(lib);
    return acc;
  }, {});

  return (
    <Paper sx={{ maxWidth: 1280, mx: 'auto' }}>
      <AppBar position="static" color="primary">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab icon={<LibraryBooksIcon />} label="Заимствования" />
          <Tab icon={<PersonIcon />} label="Заключённые" />
          <Tab icon={<BookIcon />} label="Книги" />
        </Tabs>
      </AppBar>

      <Box p={3}>
        {/*** Вкладка "Заимствования" ***/}
        {tab === 0 && (
          <>
            <Box mb={2} display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={() => setDlgOpen(true)}>
                Новое заимствование
              </Button>
            </Box>
            <Grid container spacing={2}>
              <AnimatePresence>
                {Object.values(grouped).map(({ prisoner, books }) => (
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
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              {prisoner?.name?.[0] || '?'}
                            </Avatar>
                          }
                          title={prisoner?.name || '—'}
                          subheader={`ID: ${prisoner.prisonerId}`}
                          action={
                            <Chip
                              label={`${books.length} книг`}
                              color="primary"
                              size="small"
                            />
                          }
                        />
                        <CardContent>
                          <Stack spacing={1}>
                            {books.map((b) => (
                              <Box
                                key={b.isbn}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="body2">
                                  • {b.bookName || '—'}
                                </Typography>
                                <Button
                                  size="small"
                                  onClick={() => remove(prisoner.prisonerId, b.isbn)}
                                >
                                  ×
                                </Button>
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

        {/*** Вкладка "Заключённые" ***/}
        {tab === 1 && (
          <motion.div
            key="prisoners"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" gutterBottom>
              Список заключённых
            </Typography>
            <Grid container spacing={2}>
              {prisoners.map((p) => (
                <Grid item xs={12} sm={6} md={4} key={p.prisonerId}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{p.name || '—'}</Typography>
                      <Typography color="text.secondary">
                        ID: {p.prisonerId}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/*** Вкладка "Книги" ***/}
        {tab === 2 && (
          <motion.div
            key="books"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" gutterBottom>
              Каталог книг
            </Typography>
            <Grid container spacing={2}>
              {books.map((b) => (
                <Grid item xs={12} sm={6} md={4} key={b.isbn}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{b.bookName || '—'}</Typography>
                      <Typography color="text.secondary">
                        ISBN: {b.isbn}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Box>

      {/*** Диалог создания заимствования ***/}
      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)}>
        <DialogTitle>Новое заимствование</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
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
                  {b.bookName} ({b.isbn})
                </option>
              ))}
            </TextField>

            {errors.form && (
              <Typography color="error">{errors.form}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={create}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

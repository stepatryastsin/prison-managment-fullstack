import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  Grid
} from '@mui/material';

const API_BASE = 'http://localhost:8080/api/borrowed';
const PRISONERS_API = 'http://localhost:8080/api/prisoners';
const BOOKS_API = 'http://localhost:8080/api/libraries';

export default function Borrowed() {
  const [borrowedList, setBorrowedList] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [books, setBooks] = useState([]);

  const [openPrisonerDialog, setOpenPrisonerDialog] = useState(false);
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [searchPrisoner, setSearchPrisoner] = useState('');
  const [searchBook, setSearchBook] = useState('');
  const [selectedPrisoner, setSelectedPrisoner] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [bRes, pRes, lRes] = await Promise.all([
        fetch(API_BASE),
        fetch(PRISONERS_API),
        fetch(BOOKS_API)
      ]);
      if (!bRes.ok || !pRes.ok || !lRes.ok) throw new Error();
      setBorrowedList(await bRes.json());
      setPrisoners(await pRes.json());
      setBooks(await lRes.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreate() {
    if (!selectedPrisoner || !selectedBook) {
      alert('Выберите заключённого и книгу');
      return;
    }
    const payload = {
      prisonerId: selectedPrisoner.prisonerId,
      isbn: selectedBook.isbn
    };
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      setCreateErrors(err.errors || {});
      return;
    }
    setCreateErrors({});
    setSelectedPrisoner(null);
    setSelectedBook(null);
    fetchAll();
  }

  async function handleDelete(prisonerId, isbn) {
    if (!window.confirm(`Удалить запись: ${prisonerId} ↔ ${isbn}?`)) return;
    const res = await fetch(`${API_BASE}/${prisonerId}/${isbn}`, { method: 'DELETE' });
    if (res.ok) fetchAll();
  }

  // Группируем по заключённому
  const grouped = borrowedList.reduce((acc, rec) => {
    const pid = rec.prisoner.prisonerId;
    if (!acc[pid]) acc[pid] = { prisoner: rec.prisoner, books: [] };
    acc[pid].books.push(rec.library);
    return acc;
  }, {});

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Управление заимствованиями
      </Typography>

      {/* Новая запись */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Новая запись
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setOpenPrisonerDialog(true)}
          >
            {selectedPrisoner
              ? `Закл.: ${selectedPrisoner.name} (ID ${selectedPrisoner.prisonerId})`
              : 'Выбрать заключённого'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => setOpenBookDialog(true)}
          >
            {selectedBook
              ? `Книга: ${selectedBook.bookName} (${selectedBook.isbn})`
              : 'Выбрать книгу'}
          </Button>

          <Button variant="contained" onClick={handleCreate}>
            Создать
          </Button>
        </Stack>
        {createErrors.prisonerId && (
          <Typography color="error">{createErrors.prisonerId}</Typography>
        )}
        {createErrors.isbn && (
          <Typography color="error">{createErrors.isbn}</Typography>
        )}
      </Box>

      {/* Существующие заимствования */}
      <Typography variant="h5" gutterBottom>
        Текущие заимствования
      </Typography>
      <Grid container spacing={2}>
        {Object.values(grouped).map(({ prisoner, books }) => (
          <Grid key={prisoner.prisonerId} item xs={12} md={6} lg={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">
                  👤 {prisoner.name} (ID {prisoner.prisonerId})
                </Typography>
                <ul>
                  {books.map((b) => (
                    <li key={b.isbn}>
                      {b.bookName} (<em>{b.isbn}</em>){' '}
                      <Button
                        size="small"
                        onClick={() => handleDelete(prisoner.prisonerId, b.isbn)}
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Диалог выбора заключённого */}
      <Dialog
        open={openPrisonerDialog}
        onClose={() => setOpenPrisonerDialog(false)}
        fullWidth
      >
        <DialogTitle>Выберите заключённого</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Поиск по имени или ID"
            value={searchPrisoner}
            onChange={(e) => setSearchPrisoner(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prisoners
                .filter((p) => {
                  const name = p.name ?? '';
                  return (
                    name.toLowerCase().includes(searchPrisoner.toLowerCase()) ||
                    p.prisonerId.toString().includes(searchPrisoner)
                  );
                })
                .map((p) => (
                  <TableRow
                    key={p.prisonerId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedPrisoner(p);
                      setOpenPrisonerDialog(false);
                    }}
                  >
                    <TableCell>{p.prisonerId}</TableCell>
                    <TableCell>{p.name}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrisonerDialog(false)}>Отмена</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог выбора книги */}
      <Dialog
        open={openBookDialog}
        onClose={() => setOpenBookDialog(false)}
        fullWidth
      >
        <DialogTitle>Выберите книгу</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Поиск по названию или ISBN"
            value={searchBook}
            onChange={(e) => setSearchBook(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ISBN</TableCell>
                <TableCell>Название</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books
                .filter((b) => {
                  const name = b.bookName ?? '';
                  return (
                    name.toLowerCase().includes(searchBook.toLowerCase()) ||
                    b.isbn.includes(searchBook)
                  );
                })
                .map((b) => (
                  <TableRow
                    key={b.isbn}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedBook(b);
                      setOpenBookDialog(false);
                    }}
                  >
                    <TableCell>{b.isbn}</TableCell>
                    <TableCell>{b.bookName}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookDialog(false)}>Отмена</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

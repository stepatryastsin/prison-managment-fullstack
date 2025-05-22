// src/pages/LibraryManagement.jsx

import React, { useEffect, useState, useRef } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Snackbar,
  Alert,
  Slide,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

const API_URL = 'http://localhost:8080/api/libraries';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 900,
  margin: 'auto',
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(2),
}));

export default function LibraryManagement({ readOnly = false }) {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ isbn: '', bookName: '', genre: '' });
  const [search, setSearch] = useState('');
  const [editIsbn, setEditIsbn] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'error' });

  // PDF preview
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const fileInputRef = useRef();

  // Для области загрузки
  const [selectedIsbn, setSelectedIsbn] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setBooks(data);
    } catch {
      showSnack('Не удалось загрузить список книг');
    }
  };

  const showSnack = (msg, sev = 'error') => {
    setSnack({ open: true, msg, sev });
  };
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const clearForm = () => {
    setForm({ isbn: '', bookName: '', genre: '' });
    setEditIsbn(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (readOnly) return;
    try {
      if (editIsbn) {
        await axios.put(`${API_URL}/${editIsbn}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      clearForm();
      loadBooks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при сохранении';
      showSnack(msg, 'error');
    }
  };

  const handleEdit = book => {
    if (readOnly) return;
    setForm({ isbn: book.isbn, bookName: book.bookName, genre: book.genre });
    setEditIsbn(book.isbn);
  };

  const handleDelete = async isbn => {
    if (readOnly) return;
    try {
      await axios.delete(`${API_URL}/${isbn}`);
      loadBooks();
      // если удалили выбранную
      if (selectedIsbn === isbn) setSelectedIsbn(null);
    } catch (err) {
      if (err.response?.status === 409) {
        showSnack('Книга используется и не может быть удалена.', 'warning');
      } else {
        showSnack('Ошибка при удалении книги');
      }
    }
  };

  const filtered = books.filter(b =>
    `${b.isbn} ${b.bookName} ${b.genre}`.toLowerCase().includes(search.toLowerCase())
  );

  // === PDF upload & view ===

  const triggerFileInput = () => {
    if (!selectedIsbn) {
      showSnack('Сначала выберите книгу из списка (клик по строке)', 'warning');
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    const isbn = selectedIsbn;
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${API_URL}/${isbn}/pdf`, formData);
      showSnack('PDF успешно загружен', 'success');
    } catch {
      showSnack('Ошибка при загрузке PDF');
    } finally {
      e.target.value = null;
    }
  };

  const handleViewPdf = async isbn => {
    try {
      const resp = await axios.get(`${API_URL}/${isbn}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      setPdfDialogOpen(true);
    } catch {
      showSnack('PDF не найден или ошибка сервера');
    }
  };

  const closePdfDialog = () => {
    setPdfDialogOpen(false);
    window.URL.revokeObjectURL(pdfUrl);
    setPdfUrl('');
  };

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key="library-page"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <Container>
            {/* Форма добавления/редактирования */}
            {!readOnly && (
              <>
                <Title variant="h4" align="center">
                  {editIsbn ? 'Редактировать книгу' : 'Добавить книгу'}
                </Title>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3,
                    p: 2,
                    bgcolor: '#fafafa',
                    borderRadius: 2,
                  }}
                >
                  <TextField
                    label="ISBN"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    required
                    sx={{ flex: '1 1 30%' }}
                    disabled={!!editIsbn || readOnly}
                  />
                  <TextField
                    label="Название"
                    name="bookName"
                    value={form.bookName}
                    onChange={handleChange}
                    required
                    sx={{ flex: '1 1 40%' }}
                    InputProps={{ readOnly }}
                  />
                  <TextField
                    label="Жанр"
                    name="genre"
                    value={form.genre}
                    onChange={handleChange}
                    required
                    sx={{ flex: '1 1 25%' }}
                    InputProps={{ readOnly }}
                  />
                  <Button type="submit" variant="contained" sx={{ alignSelf: 'center' }}>
                    {editIsbn ? 'Сохранить' : 'Добавить'}
                  </Button>
                  {editIsbn && (
                    <Button variant="outlined" color="secondary" onClick={clearForm} sx={{ alignSelf: 'center' }}>
                      Отмена
                    </Button>
                  )}
                </Box>
                <TextField
                  label="Поиск книги"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  fullWidth
                  sx={{ mb: 3 }}
                />
              </>
            )}

            {/* Область загрузки PDF */}
            {!readOnly && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f4f4f4', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedIsbn
                    ? `Загрузка PDF для книги ${selectedIsbn}`
                    : 'Выберите книгу в таблице, чтобы загрузить PDF'}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={!selectedIsbn}
                  onClick={triggerFileInput}
                >
                  Загрузить PDF
                </Button>
              </Box>
            )}

            <Typography variant="h5" gutterBottom>
              Список книг (для загрузки кликните по строке)
            </Typography>

            <Table>
              <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                <TableRow>
                  {['ISBN', 'Название', 'Жанр', 'Просмотр PDF', 'Действия'].map(h => (
                    <TableCell
                      key={h}
                      sx={{ fontWeight: 600 }}
                      align={h === 'Действия' ? 'center' : 'left'}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(book => {
                  const isSelected = book.isbn === selectedIsbn;
                  return (
                    <TableRow
                      key={book.isbn}
                      hover
                      selected={isSelected}
                      onClick={() => setSelectedIsbn(book.isbn)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>{book.bookName}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={e => { e.stopPropagation(); handleViewPdf(book.isbn); }}
                        >
                          Просмотр
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {!readOnly ? (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={e => { e.stopPropagation(); handleEdit(book); }}
                              >
                                Ред.
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={e => { e.stopPropagation(); handleDelete(book.isbn); }}
                              >
                                Уд.
                              </Button>
                            </>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              только просмотр
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Snackbar
              open={snack.open}
              autoHideDuration={3000}
              onClose={closeSnack}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              TransitionComponent={Slide}
            >
              <Alert onClose={closeSnack} severity={snack.sev} sx={{ width: '100%' }}>
                {snack.msg}
              </Alert>
            </Snackbar>
          </Container>
        </motion.div>
      </AnimatePresence>

      {/* PDF Viewer Dialog */}
      <Dialog fullWidth maxWidth="lg" open={pdfDialogOpen} onClose={closePdfDialog}>
        <DialogTitle>
          Просмотр PDF
          <IconButton
            aria-label="close"
            onClick={closePdfDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ height: '80vh', p: 0 }}>
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

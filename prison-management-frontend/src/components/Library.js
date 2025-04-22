import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Snackbar,
  Alert
} from '@mui/material';

const API_URL = 'http://localhost:8080/api/libraries';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    isbn: '',
    bookName: '',
    genre: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Состояние для уведомления
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Сетевая ошибка');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Ошибка загрузки книг:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const preparedData = {
      ...formData,
      isbn: Number(formData.isbn)
    };
    try {
      if (editingId !== null) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preparedData)
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preparedData)
        });
      }
      fetchBooks();
      setEditingId(null);
      setFormData({
        isbn: '',
        bookName: '',
        genre: ''
      });
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleDelete = async (isbn) => {
    try {
      const response = await fetch(`${API_URL}/${isbn}`, { method: 'DELETE' });
      if (response.status === 409) {
        // Открываем окно уведомления, если книга используется заключённым
        setSnackbar({
          open: true,
          message: 'Эта книга используется заключённым и не может быть удалена.',
          severity: 'warning'
        });
      } else if (!response.ok) {
        throw new Error('Ошибка при удалении книги');
      } else {
        fetchBooks();
      }
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      setSnackbar({
        open: true,
        message: 'Произошла ошибка при удалении книги',
        severity: 'error'
      });
    }
  };

  const handleEdit = (book) => {
    setFormData({
      isbn: book.isbn,
      bookName: book.bookName,
      genre: book.genre
    });
    setEditingId(book.isbn);
  };

  const filteredBooks = books.filter((book) =>
    Object.values(book)
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 1000,
        margin: 'auto',
        mt: 3,
        borderRadius: 2,
        boxShadow: 3
      }}
    >
      <Typography variant="h5" gutterBottom align="center">
        {editingId !== null ? 'Редактировать книгу' : 'Добавить книгу'}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          p: 2,
          border: '1px solid #ccc',
          borderRadius: 2,
          backgroundColor: '#fafafa',
          mb: 3
        }}
      >
        <TextField
          label="ISBN"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          required
          disabled={editingId !== null}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Название книги"
          name="bookName"
          value={formData.bookName}
          onChange={handleChange}
          required
          sx={{ flex: 2 }}
        />
        <TextField
          label="Жанр"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          required
          sx={{ flex: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ height: 'fit-content', whiteSpace: 'nowrap' }}
        >
          {editingId !== null ? 'Сохранить' : 'Добавить'}
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Поиск книги
      </Typography>
      <TextField
        label="Введите текст для поиска"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

      <Typography variant="h5" gutterBottom>
        Список книг
      </Typography>
      <Table>
        <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
          <TableRow>
            <TableCell>
              <strong>ISBN</strong>
            </TableCell>
            <TableCell>
              <strong>Название книги</strong>
            </TableCell>
            <TableCell>
              <strong>Жанр</strong>
            </TableCell>
            <TableCell align="center">
              <strong>Действия</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBooks.map((book) => (
            <TableRow key={book.isbn} hover>
              <TableCell>{book.isbn}</TableCell>
              <TableCell>{book.bookName}</TableCell>
              <TableCell>{book.genre}</TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(book)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(book.isbn)}
                  >
                    Удалить
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Окно уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default LibraryManagement;

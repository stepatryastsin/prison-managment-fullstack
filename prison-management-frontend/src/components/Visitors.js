import React, { useEffect, useState, useMemo } from 'react';
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
  Box,
  InputAdornment,
  Snackbar,
  Alert,
  Slide,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const API_URL = 'http://localhost:8080/api/visitors';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    relationToPrisoner: '',
    visitDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки посетителей');
      const data = await response.json();
      setVisitors(data);
    } catch (error) {
      console.error('Ошибка загрузки посетителей:', error);
      openSnackbar('Ошибка загрузки посетителей', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId !== null ? 'PUT' : 'POST';
      const url = editingId !== null ? `${API_URL}/${editingId}` : API_URL;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Ошибка сохранения данных');
      await fetchVisitors();
      openSnackbar(editingId !== null ? 'Посетитель обновлён' : 'Посетитель добавлен');
      setEditingId(null);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        relationToPrisoner: '',
        visitDate: '',
      });
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      openSnackbar('Ошибка при сохранении', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка при удалении');
      await fetchVisitors();
      openSnackbar('Посетитель удалён');
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      openSnackbar('Ошибка при удалении', 'error');
    }
  };

  const handleEdit = (visitor) => {
    setFormData({
      firstName: visitor.firstName,
      lastName: visitor.lastName,
      phoneNumber: visitor.phoneNumber,
      relationToPrisoner: visitor.relationToPrisoner,
      visitDate: visitor.visitDate,
    });
    setEditingId(visitor.visitorId);
  };

  const filteredVisitors = useMemo(() => {
    if (!searchQuery.trim()) return visitors;
    return visitors.filter((visitor) =>
      Object.values(visitor)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [visitors, searchQuery]);

  const openSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <Paper
      sx={{
        padding: 3,
        maxWidth: 1000,
        margin: 'auto',
        mt: 3,
        boxShadow: 3,
        backgroundColor: '#ffffff',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
        {editingId !== null ? 'Редактировать посетителя' : 'Добавить посетителя'}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          justifyContent: 'space-between',
        }}
        noValidate
      >
        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          variant="outlined"
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          variant="outlined"
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          label="Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          variant="outlined"
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          label="Relation to Prisoner"
          name="relationToPrisoner"
          value={formData.relationToPrisoner}
          onChange={handleChange}
          variant="outlined"
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          label="Visit Date"
          type="date"
          name="visitDate"
          value={formData.visitDate}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          sx={{ flex: 1, minWidth: 200 }}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{
            height: 'fit-content',
            whiteSpace: 'nowrap',
            alignSelf: 'center',
            px: 3,
          }}
        >
          {editingId !== null ? 'Сохранить' : 'Добавить'}
        </Button>
      </Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          variant="outlined"
          placeholder="Поиск посетителя..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 300 }}
        />
      </Box>
      <Typography variant="h5" gutterBottom>
        Список посетителей
      </Typography>
      <Table sx={{ backgroundColor: '#f9f9f9' }}>
        <TableHead sx={{ backgroundColor: '#1976d2' }}>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>First Name</TableCell>
            <TableCell sx={{ color: '#fff' }}>Last Name</TableCell>
            <TableCell sx={{ color: '#fff' }}>Phone Number</TableCell>
            <TableCell sx={{ color: '#fff' }}>Relation to Prisoner</TableCell>
            <TableCell sx={{ color: '#fff' }}>Visit Date</TableCell>
            <TableCell align="center" sx={{ color: '#fff' }}>
              Действия
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredVisitors.map((visitor) => (
            <TableRow key={visitor.visitorId} hover>
              <TableCell>{visitor.firstName}</TableCell>
              <TableCell>{visitor.lastName}</TableCell>
              <TableCell>{visitor.phoneNumber}</TableCell>
              <TableCell>{visitor.relationToPrisoner}</TableCell>
              <TableCell>{visitor.visitDate}</TableCell>
              <TableCell align="center">
                <Tooltip title="Редактировать">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(visitor)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Ред.
                  </Button>
                </Tooltip>
                <Tooltip title="Удалить">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(visitor.visitorId)}
                    size="small"
                  >
                    Удал.
                  </Button>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Visitors;

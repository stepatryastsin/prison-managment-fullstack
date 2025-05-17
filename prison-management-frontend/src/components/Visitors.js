// src/pages/Visitors.jsx
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
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/visitors';

export default function Visitors({ readOnly = false }) {
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
      const { data } = await axios.get(API_URL);
      setVisitors(data);
    } catch (error) {
      openSnackbar('Ошибка загрузки посетителей', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId != null) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        openSnackbar('Посетитель обновлён');
      } else {
        await axios.post(API_URL, formData);
        openSnackbar('Посетитель добавлен');
      }
      setEditingId(null);
      setFormData({ firstName: '', lastName: '', phoneNumber: '', relationToPrisoner: '', visitDate: '' });
      fetchVisitors();
    } catch {
      openSnackbar('Ошибка при сохранении', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этого посетителя?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      openSnackbar('Посетитель удалён');
      fetchVisitors();
    } catch {
      openSnackbar('Ошибка при удалении', 'error');
    }
  };

  const handleEdit = (v) => {
    setFormData({
      firstName: v.firstName,
      lastName: v.lastName,
      phoneNumber: v.phoneNumber,
      relationToPrisoner: v.relationToPrisoner,
      visitDate: v.visitDate,
    });
    setEditingId(v.visitorId);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return visitors;
    return visitors.filter((v) =>
      Object.values(v).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [visitors, searchQuery]);

  const openSnackbar = (msg, sev = 'success') => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <AnimatePresence>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        sx={{ p: 4, maxWidth: 1000, mx: 'auto', mt: 4, boxShadow: 3 }}
      >
        {/* Форма добавления/редактирования — только если не readOnly */}
        {!readOnly && (
          <>
            <Typography variant="h4" align="center" gutterBottom>
              {editingId != null ? 'Редактировать посетителя' : 'Добавить посетителя'}
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 4,
                justifyContent: 'space-between',
              }}
            >
              {[
                { label: 'First Name', name: 'firstName', required: true },
                { label: 'Last Name', name: 'lastName', required: true },
                { label: 'Phone Number', name: 'phoneNumber', required: true },
                { label: 'Relation to Prisoner', name: 'relationToPrisoner' },
                { label: 'Visit Date', name: 'visitDate', type: 'date', required: true },
              ].map((field) => (
                <TextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type || 'text'}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required || false}
                  InputLabelProps={field.type === 'date' ? { shrink: true } : null}
                  sx={{ flex: 1, minWidth: 200 }}
                />
              ))}

              <Button
                type="submit"
                variant="contained"
                sx={{ alignSelf: 'center', px: 4 }}
              >
                {editingId != null ? 'Сохранить' : 'Добавить'}
              </Button>
            </Box>
          </>
        )}

        {/* Поиск — всегда */}
        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <TextField
            placeholder="Поиск..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Stack>

        <Typography variant="h5" gutterBottom>
          Список посетителей
        </Typography>

        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              {['First Name', 'Last Name', 'Phone', 'Relation', 'Visit Date', 'Actions'].map((h) => (
                <TableCell
                  key={h}
                  sx={{ color: '#fff', fontWeight: 'bold' }}
                  align={h === 'Actions' ? 'center' : 'left'}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            <AnimatePresence>
              {filtered.map((v) => (
                <TableRow
                  key={v.visitorId}
                  hover
                  component={motion.tr}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <TableCell>{v.firstName}</TableCell>
                  <TableCell>{v.lastName}</TableCell>
                  <TableCell>{v.phoneNumber}</TableCell>
                  <TableCell>{v.relationToPrisoner}</TableCell>
                  <TableCell>{v.visitDate}</TableCell>
                  <TableCell align="center">
                    {!readOnly && (
                      <>
                        <Tooltip title="Редактировать">
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                            onClick={() => handleEdit(v)}
                          >
                            Ред.
                          </Button>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(v.visitorId)}
                          >
                            Удл.
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>

        {/* Snackbar */}
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
    </AnimatePresence>
  );
}

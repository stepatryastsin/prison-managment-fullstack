import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Box,
  Snackbar,
  Alert,
  Slide,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

// Используем переменные окружения для гибкости
const STAFF_API = 'http://localhost:8080/api/staff';
const JOB_API   = 'http://localhost:8080/api/job';

// Стили контейнера
const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1200,
  margin: 'auto',
  marginTop: theme.spacing(6),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[6],
  backgroundColor: theme.palette.background.default,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '1px',
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.grey[200],
}));

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    jobId: null,
    jobDesc: '',
    salary: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sRes, jRes] = await Promise.all([
        axios.get(STAFF_API),
        axios.get(JOB_API),
      ]);
      setStaff(sRes.data);
      setJobs(jRes.data);
    } catch {
      showSnack('Ошибка загрузки данных', 'error');
    }
  };

  const showSnack = (msg, severity = 'success') => {
    setSnack({ open: true, msg, sev: severity });
  };
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const clearForm = () => {
    setForm({ firstName: '', lastName: '', jobId: null, jobDesc: '', salary: '' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectJob = (job) => {
    setForm((f) => ({ ...f, jobId: job.jobId, jobDesc: job.jobDescription }));
    setDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, jobDesc, salary, jobId } = form;
    if (!firstName.trim() || !lastName.trim() || !jobDesc || Number(salary) <= 0) {
      showSnack('Заполните все поля корректно', 'error');
      return;
    }
    const payload = { firstName, lastName, salary: Number(salary), job: { jobId, jobDescription: jobDesc } };
    try {
      if (editingId) {
        await axios.put(`${STAFF_API}/${editingId}`, payload);
        showSnack('Сотрудник обновлён', 'success');
      } else {
        await axios.post(STAFF_API, payload);
        showSnack('Сотрудник добавлен', 'success');
      }
      clearForm();
      loadData();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Ошибка при сохранении', 'error');
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.staffId);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      jobId: emp.job?.jobId,
      jobDesc: emp.job?.jobDescription || '',
      salary: emp.salary.toString(),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить сотрудника?')) return;
    try {
      await axios.delete(`${STAFF_API}/${id}`);
      showSnack('Сотрудник удалён', 'success');
      if (editingId === id) clearForm();
      loadData();
    } catch {
      showSnack('Ошибка при удалении', 'error');
    }
  };

  const filtered = useMemo(
    () =>
      staff.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.job?.jobDescription}`.toLowerCase().includes(search.toLowerCase())
      ),
    [staff, search]
  );

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title variant="h3" align="center">
        {editingId ? 'Редактирование сотрудника' : 'Добавление сотрудника'}
      </Title>

      {/* Форма добавления / редактирования */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Имя"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Фамилия"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Должность"
              name="jobDesc"
              value={form.jobDesc}
              onClick={() => setDialogOpen(true)}
              InputProps={{ readOnly: true }}
              helperText="Нажмите, чтобы выбрать"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Зарплата"
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="contained" size="large" type="submit">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
          </Grid>
          {editingId && (
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" size="large" onClick={clearForm}>
                Отмена
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Поиск */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="Поиск сотрудников..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Таблица сотрудников */}
      <Paper elevation={3} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {['ID', 'Имя', 'Фамилия', 'Должность', 'Зарплата', 'Действия'].map((h) => (
                <StyledTableCell key={h}>{h}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s, idx) => (
              <TableRow
                key={s.staffId}
                hover
                sx={{
                  backgroundColor: idx % 2 === 0 ? 'grey.50' : 'common.white',
                }}
              >
                <TableCell>{s.staffId}</TableCell>
                <TableCell>{s.firstName}</TableCell>
                <TableCell>{s.lastName}</TableCell>
                <TableCell>{s.job?.jobDescription}</TableCell>
                <TableCell>{s.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button variant="text" onClick={() => handleEdit(s)}>
                      Редактировать
                    </Button>
                    <Button variant="text" color="error" onClick={() => handleDelete(s.staffId)}>
                      Удалить
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Диалог выбора должности */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>
          Выберите должность
n          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {jobs.map((j) => (
              <ListItem button key={j.jobId} onClick={() => handleSelectJob(j)}>
                <ListItemText primary={j.jobDescription} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Снэкбар уведомлений */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.sev}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Staff;

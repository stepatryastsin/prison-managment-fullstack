import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Paper, Typography, TextField, Button, Grid,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
  Stack, Box, Snackbar, Alert, Slide, IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

const STAFF_API = 'http://localhost:8080/api/staff';
const JOB_API = 'http://localhost:8080/api/job';

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

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    jobId: null,
    jobDesc: '',
    salary: '',
    username: '',
    password: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sRes, jRes] = await Promise.all([
        axios.get(STAFF_API, { params: { t: Date.now() } }),
        axios.get(JOB_API, { params: { t: Date.now() } }),
      ]);
      setStaff(sRes.data);
      setJobs(jRes.data);
    } catch {
      showSnack('Ошибка загрузки данных', 'error');
    }
  }

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  const clearForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      jobId: null,
      jobDesc: '',
      salary: '',
      username: '',
      password: '',
    });
    setEditingId(null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSelectJob = job => {
    setForm(f => ({ ...f, jobId: job.jobId, jobDesc: job.jobDescription }));
    setDialogOpen(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const { firstName, lastName, jobId, jobDesc, salary, username, password } = form;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !jobId ||
      Number(salary) < 0 ||
      !username.trim() ||
      (!editingId && !password.trim())
    ) {
      return showSnack('Заполните все поля корректно', 'error');
    }

    const payload = {
      firstName,
      lastName,
      salary: Number(salary),
      username,
      password: password || '', // может быть пустым при обновлении
      job: {
        jobId,
        jobDescription: jobDesc,
      },
    };

    try {
      if (editingId) {
        await axios.put(`${STAFF_API}/${editingId}`, payload);

        if (password.trim()) {
          await axios.post(`${STAFF_API}/set-password`, null, {
            params: { username, password },
          });
        }

        showSnack('Сотрудник обновлён', 'success');
      } else {
        await axios.post(STAFF_API, payload);
        showSnack('Сотрудник добавлен', 'success');
      }

      clearForm();

      setStaff([]);
      await loadData();

    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при сохранении';
      showSnack(msg, 'error');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Удалить сотрудника?')) return;
    try {
      await axios.delete(`${STAFF_API}/${id}`);
      showSnack('Сотрудник удалён', 'success');
      if (editingId === id) clearForm();

      setStaff([]);
      await loadData();

    } catch {
      showSnack('Ошибка при удалении', 'error');
    }
  }

  const handleEdit = emp => {
    setEditingId(emp.staffId);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      jobId: emp.job?.jobId,
      jobDesc: emp.job?.jobDescription || '',
      salary: emp.salary.toString(),
      username: emp.username,
      password: '', // поле очищается при редактировании
    });
  };

  const filtered = useMemo(
    () =>
      staff.filter(s =>
        `${s.firstName} ${s.lastName} ${s.job?.jobDescription} ${s.username}`
          .toLowerCase()
          .includes(search.toLowerCase())
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
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required={!editingId}
              helperText={editingId ? 'Оставьте пустым, чтобы не менять' : ''}
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="Поиск сотрудников..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <AnimatePresence>
        <Paper
          key="staff-table"
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          elevation={3}
          sx={{ overflowX: 'auto' }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {['ID', 'Имя', 'Фамилия', 'Должность', 'Зарплата', 'Username', 'Действия'].map(h => (
                  <StyledTableCell key={h}>{h}</StyledTableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody
              component={motion.tbody}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {},
              }}
            >
              <AnimatePresence>
                {filtered.map((s, idx) => (
                  <motion.tr
                    key={s.staffId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      backgroundColor: idx % 2 ? 'white' : '#f9f9f9',
                    }}
                  >
                    <TableCell>{s.staffId}</TableCell>
                    <TableCell>{s.firstName}</TableCell>
                    <TableCell>{s.lastName}</TableCell>
                    <TableCell>{s.job?.jobDescription}</TableCell>
                    <TableCell>{s.salary.toLocaleString()}</TableCell>
                    <TableCell>{s.username}</TableCell>
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
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Paper>
      </AnimatePresence>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>
          Выберите должность
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {jobs.map(j => (
              <ListItem button key={j.jobId} onClick={() => handleSelectJob(j)}>
                <ListItemText primary={j.jobDescription} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

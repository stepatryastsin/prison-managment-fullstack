import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Box,
} from '@mui/material';

const STAFF_API_URL = 'http://localhost:8080/api/staff';
const JOB_API_URL = 'http://localhost:8080/api/job';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    supervisor: '',
    job: { jobId: null, jobDescription: '' },
    salary: '',
    hiredate: '',
  });
  const [originalJob, setOriginalJob] = useState({ jobId: null, jobDescription: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchStaff();
    fetchJobs();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(STAFF_API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(JOB_API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки должностей');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Ошибка загрузки данных о должностях:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'jobDescription') {
      setFormData((prev) => ({
        ...prev,
        job: { ...prev.job, jobDescription: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const clearForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      supervisor: '',
      job: { jobId: null, jobDescription: '' },
      salary: '',
      hiredate: '',
    });
    setOriginalJob({ jobId: null, jobDescription: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Имя и Фамилия обязательны для заполнения');
      return;
    }
    if (!formData.job.jobDescription.trim()) {
      alert('Выберите описание работы');
      return;
    }
    if (Number(formData.salary) <= 0) {
      alert('Зарплата должна быть больше нуля');
      return;
    }
    if (!formData.hiredate) {
      alert('Укажите дату приема');
      return;
    }
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      supervisor: formData.supervisor ? Number(formData.supervisor) : null,
      salary: Number(formData.salary),
      hiredate: formData.hiredate,
    };
    if (!editingId || formData.job.jobDescription !== originalJob.jobDescription) {
      const existingJob = jobs.find((j) => j.jobDescription === formData.job.jobDescription);
      payload.job = existingJob
        ? { jobId: existingJob.jobId, jobDescription: existingJob.jobDescription }
        : { jobDescription: formData.job.jobDescription };
    }
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${STAFF_API_URL}/${editingId}` : STAFF_API_URL;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Ошибка при сохранении сотрудника');
      fetchStaff();
      setEditingId(null);
      clearForm();
    } catch (error) {
      console.error('Ошибка при сохранении сотрудника:', error);
      alert('Не удалось сохранить сотрудника. Проверьте корректность введенных данных и зависимости.');
    }
  };

  const handleEdit = (staff) => {
    setEditingId(staff.staffId);
    const currentJob = staff.job || { jobId: null, jobDescription: '' };
    setOriginalJob({ jobId: currentJob.jobId, jobDescription: currentJob.jobDescription });
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      supervisor: staff.supervisor ? staff.supervisor.toString() : '',
      job: currentJob,
      salary: staff.salary ? staff.salary.toString() : '',
      hiredate: staff.hiredate || '',
    });
  };

  const checkDependencies = async (staffId) => {
    try {
      const response = await fetch('http://localhost:8080/api/courses');
      if (!response.ok) throw new Error('Ошибка проверки курсов');
      const courses = await response.json();
      const usedCourses = courses.filter(
        (course) => course.instructor && course.instructor.staffId === staffId
      );
      return usedCourses.length;
    } catch (error) {
      console.error('Ошибка проверки зависимостей сотрудника:', error);
      return -1;
    }
  };

  const handleDelete = async (id) => {
    const dependenciesCount = await checkDependencies(id);
    if (dependenciesCount === -1) {
      alert('Невозможно проверить зависимости сотрудника. Попробуйте позже.');
      return;
    }
    if (dependenciesCount > 0) {
      alert('Нельзя удалить сотрудника, так как он используется в курсах.');
      return;
    }
    if (window.confirm('Вы действительно хотите удалить сотрудника?')) {
      try {
        const response = await fetch(`${STAFF_API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Ошибка при удалении сотрудника');
        fetchStaff();
        if (editingId === id) {
          setEditingId(null);
          clearForm();
        }
      } catch (error) {
        console.error('Ошибка при удалении сотрудника:', error);
        alert('Не удалось удалить сотрудника. Проверьте зависимости.');
      }
    }
  };

  const filteredStaff = staffList.filter((staff) =>
    Object.values(staff)
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleShowJobDialog = async () => {
    if (jobs.length === 0) await fetchJobs();
    setJobDialogOpen(true);
  };

  const handleSelectJob = (selectedJob) => {
    setFormData((prev) => ({
      ...prev,
      job: { jobId: selectedJob.jobId, jobDescription: selectedJob.jobDescription },
    }));
    setJobDialogOpen(false);
  };

  return (
    <Paper
      sx={{
        padding: 4,
        maxWidth: 1200,
        margin: 'auto',
        mt: 4,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: '#fafafa',
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        {editingId ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Имя"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Фамилия"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Описание работы"
              name="jobDescription"
              value={formData.job.jobDescription}
              onClick={handleShowJobDialog}
              InputProps={{ readOnly: true }}
              helperText="Нажмите для выбора профессии"
              required
              variant="outlined"
              sx={{ backgroundColor: '#fff', cursor: 'pointer' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Зарплата"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Дата приема"
              name="hiredate"
              type="date"
              value={formData.hiredate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sm={4} display="flex" alignItems="center">
            <Button fullWidth variant="contained" color="primary" type="submit" size="large">
              {editingId ? 'Сохранить изменения' : 'Добавить сотрудника'}
            </Button>
          </Grid>
          {editingId && (
            <Grid item xs={12} sm={4} display="flex" alignItems="center">
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setEditingId(null);
                  clearForm();
                }}
                size="large"
              >
                Отмена
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Поиск сотрудника
      </Typography>
      <TextField
        fullWidth
        label="Введите текст для поиска"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3, backgroundColor: '#fff' }}
      />
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Список сотрудников
      </Typography>
      <Table sx={{ backgroundColor: '#fff' }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#1976d2' }}>
            <TableCell sx={{ color: '#fff' }}>ID</TableCell>
            <TableCell sx={{ color: '#fff' }}>Имя</TableCell>
            <TableCell sx={{ color: '#fff' }}>Фамилия</TableCell>
            <TableCell sx={{ color: '#fff' }}>Руководитель</TableCell>
            <TableCell sx={{ color: '#fff' }}>Описание работы</TableCell>
            <TableCell sx={{ color: '#fff' }}>Зарплата</TableCell>
            <TableCell sx={{ color: '#fff' }}>Дата приема</TableCell>
            <TableCell align="center" sx={{ color: '#fff' }}>
              Действия
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredStaff.map((staff) => (
            <TableRow key={staff.staffId} hover>
              <TableCell>{staff.staffId}</TableCell>
              <TableCell>{staff.firstName}</TableCell>
              <TableCell>{staff.lastName}</TableCell>
              <TableCell>{staff.supervisor || 'Не указан'}</TableCell>
              <TableCell>{staff.job?.jobDescription || 'Не указано'}</TableCell>
              <TableCell>{staff.salary}</TableCell>
              <TableCell>{staff.hiredate}</TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    onClick={() => handleEdit(staff)}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    Редактировать
                  </Button>
                  <Button
                    onClick={() => handleDelete(staff.staffId)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Удалить
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: '#fff' }}>
          Выберите описание работы
        </DialogTitle>
        <DialogContent>
          <List>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <ListItem button key={job.jobId} onClick={() => handleSelectJob(job)}>
                  <ListItemText primary={job.jobDescription} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2">Нет доступных должностей</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default Staff;

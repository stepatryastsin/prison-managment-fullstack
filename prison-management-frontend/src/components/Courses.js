import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

const COURSES_API = 'http://localhost:8080/api/courses';
const STAFF_API = 'http://localhost:8080/api/staff';

const CoursesFrontend = () => {
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояние для Snackbar ошибок
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Диалог создания/редактирования
  const [integratedDialogOpen, setIntegratedDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    courseId: null,
    courseName: '',
    instructor: { staffId: '', firstName: '', lastName: '' },
    deleted: false,
  });

  // Состояния преподавателей
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Фильтрация и навигация
  const [searchTerm, setSearchTerm] = useState('');
  const [openStaffSelector, setOpenStaffSelector] = useState(false);
  const navigate = useNavigate();

  // Показать ошибку
  const showError = async (res) => {
    try {
      const err = await res.json();
      setErrorMessage(err.message || 'Произошла ошибка');
    } catch {
      setErrorMessage('Произошла ошибка');
    }
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Загрузка курсов
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(COURSES_API);
      if (!res.ok) return showError(res);
      const data = await res.json();
      setCoursesList(data.map(c => ({ ...c, courseName: c.courseName || '' })));
    } catch {
      setErrorMessage('Ошибка при запросе курсов');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Soft delete
  const handleMarkInactive = async (course) => {
    try {
      const res = await fetch(`${COURSES_API}/${course.courseId}`, { method: 'DELETE' });
      if (!res.ok) return showError(res);
      fetchCourses();
    } catch {
      setErrorMessage('Ошибка при удалении курса');
      setSnackbarOpen(true);
    }
  };

  // Reactivate
  const handleMarkActive = async (course) => {
    try {
      const payload = { ...course, deleted: false };
      const res = await fetch(`${COURSES_API}/${course.courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return showError(res);
      fetchCourses();
    } catch {
      setErrorMessage('Ошибка при активации курса');
      setSnackbarOpen(true);
    }
  };

  // Hard delete
  const handleFullDelete = async (course) => {
    if (!window.confirm(`Полностью удалить курс "${course.courseName}"?`)) return;
    try {
      const res = await fetch(`${COURSES_API}/${course.courseId}/full`, { method: 'DELETE' });
      if (!res.ok) return showError(res);
      fetchCourses();
    } catch {
      setErrorMessage('Ошибка при полном удалении курса');
      setSnackbarOpen(true);
    }
  };

  // Открыть диалог создания
  const openDialogForCreate = () => {
    setIsEditing(false);
    setCurrentRecord({ courseId: null, courseName: '', instructor: { staffId: '', firstName: '', lastName: '' }, deleted: false });
    setIntegratedDialogOpen(true);
  };
  // Открыть диалог редактирования
  const openDialogForEdit = (course) => {
    setIsEditing(true);
    setCurrentRecord(course);
    setIntegratedDialogOpen(true);
  };
  const handleCourseNameChange = (e) => setCurrentRecord(prev => ({ ...prev, courseName: e.target.value }));

  // Загрузка преподавателей
  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch(STAFF_API);
      if (!res.ok) return showError(res);
      setStaffList(await res.json());
    } catch {
      setErrorMessage('Ошибка при запросе преподавателей');
      setSnackbarOpen(true);
    } finally {
      setLoadingStaff(false);
    }
  };
  const handleOpenStaffSelector = () => {
    fetchStaff();
    setOpenStaffSelector(true);
  };
  const handleSelectStaff = (staff) => {
    setCurrentRecord(prev => ({ ...prev, instructor: staff }));
    setOpenStaffSelector(false);
  };

  // Подтвердить создание/редактирование
  const handleConfirmSelection = async () => {
    try {
      const payload = { courseName: currentRecord.courseName, instructor: currentRecord.instructor, deleted: currentRecord.deleted };
      const url = isEditing ? `${COURSES_API}/${currentRecord.courseId}` : COURSES_API;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return showError(res);
      fetchCourses();
      setIntegratedDialogOpen(false);
    } catch {
      setErrorMessage('Ошибка при сохранении курса');
      setSnackbarOpen(true);
    }
  };

  // Группировка и фильтрация
  const grouped = coursesList.reduce((acc, c) => {
    const key = c.instructor?.staffId ?? 'Без инструктора';
    (acc[key] = acc[key] || []).push(c);
    return acc;
  }, {});
  const filtered = Object.entries(grouped).reduce((acc, [key, group]) => {
    const g = group.filter(c => c.courseName.toLowerCase().includes(searchTerm.toLowerCase()));
    if (g.length) acc[key] = g;
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleSnackbarClose} sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        Курсы и программы
      </Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openDialogForCreate}>
          Добавить курс
        </Button>
        <TextField
          size="small"
          label="Поиск"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Stack>

      {loading ? (
        <Typography align="center">Загрузка...</Typography>
      ) : (
        Object.entries(filtered).map(([key, group]) => (
          <Accordion key={key} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ flexGrow: 1 }}>
                {key === 'Без инструктора'
                  ? 'Без инструктора'
                  : `Преподаватель ${key}: ${group[0].instructor.firstName} ${group[0].instructor.lastName}`}
              </Typography>
              <Typography>({group.length} курс{group.length > 1 ? 'а' : ''})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.map(course => (
                    <TableRow key={course.courseId} sx={{ opacity: course.deleted ? 0.6 : 1 }}>
                      <TableCell>{course.courseId}</TableCell>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button onClick={() => openDialogForEdit(course)}>Ред.</Button>
                          {!course.deleted ? (
                            <Button color="secondary" onClick={() => handleMarkInactive(course)}>
                              Неактивный
                            </Button>
                          ) : (
                            <Button color="success" onClick={() => handleMarkActive(course)}>
                              Активировать
                            </Button>
                          )}
                          <Button color="error" onClick={() => handleFullDelete(course)}>
                            Удалить навсегда
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Создание/редактирование */}
      <Dialog open={integratedDialogOpen} onClose={() => setIntegratedDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Редактировать курс' : 'Добавить курс'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Название курса"
            value={currentRecord.courseName}
            onChange={handleCourseNameChange}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography sx={{ flexGrow: 1 }}>
              {currentRecord.instructor.staffId
                ? `Преподаватель: ${currentRecord.instructor.firstName} ${currentRecord.instructor.lastName}`
                : 'Преподаватель не выбран'}
            </Typography>
            <Button onClick={handleOpenStaffSelector}>Выбрать</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIntegratedDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmSelection}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Выбор преподавателя */}
      <Dialog open={openStaffSelector} onClose={() => setOpenStaffSelector(false)} fullWidth maxWidth="sm">
        <DialogTitle>Выберите преподавателя</DialogTitle>
        <DialogContent>
          {loadingStaff ? (
            <Typography>Загрузка...</Typography>
          ) : staffList.length > 0 ? (
            <List>
              {staffList.map(staff => (
                <ListItem key={staff.staffId} disablePadding>
                  <ListItemButton onClick={() => handleSelectStaff(staff)}>
                    {currentRecord.instructor.staffId === staff.staffId && <CheckIcon sx={{ mr: 1 }} />}
                    <ListItemText primary={`${staff.firstName} ${staff.lastName} (ID: ${staff.staffId})`} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Нет преподавателей</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStaffSelector(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursesFrontend;

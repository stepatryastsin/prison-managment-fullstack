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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

const COURSES_API = 'http://localhost:8080/api/courses';
const STAFF_API = 'http://localhost:8080/api/staff';

const CoursesFrontend = () => {
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [integratedDialogOpen, setIntegratedDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    courseId: null,
    courseName: '',
    instructor: { staffId: '', firstName: '', lastName: '' },
    deleted: false,
  });
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [errorStaff, setErrorStaff] = useState(null);
  const [openStaffSelector, setOpenStaffSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await fetch(COURSES_API);
      if (!res.ok) throw new Error('Ошибка при загрузке курсов');
      const data = await res.json();
      // Обеспечим, чтобы courseName всегда был строкой
      const normalizedData = data.map(course => ({
        ...course,
        courseName: course.courseName || '',
      }));
      setCoursesList(normalizedData);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Мягкое удаление курса (soft delete)
  const handleMarkInactive = (course) => {
    fetch(`${COURSES_API}/${course.courseId}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) fetchCourses();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Восстановление курса (активация)
  const handleMarkActive = (course) => {
    const payload = {
      courseName: course.courseName,
      instructor: course.instructor,
      deleted: false,
    };
    fetch(`${COURSES_API}/${course.courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((res) => {
      if (res.ok) fetchCourses();
    });
  };

  // Полное удаление курса (hard delete)
  const handleFullDelete = (course) => {
    if (
      window.confirm(
        `Вы действительно хотите полностью удалить курс "${course.courseName}"? Это действие нельзя отменить!`
      )
    ) {
      fetch(`${COURSES_API}/${course.courseId}/full`, { method: 'DELETE' })
        .then((res) => {
          if (res.ok) {
            fetchCourses();
          } else {
            alert('Ошибка полного удаления курса');
          }
        })
        .catch((err) => {
          console.error(err);
          alert('Ошибка при выполнении запроса полного удаления');
        });
    }
  };

  const openDialogForCreate = () => {
    setIsEditing(false);
    setCurrentRecord({
      courseId: null,
      courseName: '',
      instructor: { staffId: '', firstName: '', lastName: '' },
      deleted: false,
    });
    setIntegratedDialogOpen(true);
  };

  const openDialogForEdit = (course) => {
    setIsEditing(true);
    setCurrentRecord(course);
    setIntegratedDialogOpen(true);
  };

  const handleCourseNameChange = (e) => {
    setCurrentRecord((prev) => ({ ...prev, courseName: e.target.value }));
  };

  const handleSelectStaff = (staff) => {
    setCurrentRecord((prev) => ({ ...prev, instructor: staff }));
    setOpenStaffSelector(false);
  };

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch(STAFF_API);
      if (!res.ok) throw new Error('Ошибка при загрузке персонала');
      const data = await res.json();
      setStaffList(data);
      setLoadingStaff(false);
    } catch (err) {
      setErrorStaff(err);
      setLoadingStaff(false);
    }
  };

  const handleOpenStaffSelector = () => {
    fetchStaff();
    setOpenStaffSelector(true);
  };

  const handleConfirmSelection = () => {
    const payload = {
      courseName: currentRecord.courseName,
      instructor: currentRecord.instructor,
      deleted: currentRecord.deleted,
    };
    if (isEditing) {
      fetch(`${COURSES_API}/${currentRecord.courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (res.ok) {
          fetchCourses();
          setIntegratedDialogOpen(false);
        }
      });
    } else {
      fetch(COURSES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (res.ok) {
          fetchCourses();
          setIntegratedDialogOpen(false);
        }
      });
    }
  };

  const getCoursesCountForStaff = (staffId) => {
    return coursesList.filter(
      (course) =>
        course.instructor &&
        course.instructor.staffId.toString() === staffId.toString()
    ).length;
  };

  const groupedCourses = coursesList.reduce((acc, course) => {
    const key =
      course.instructor && course.instructor.staffId
        ? course.instructor.staffId
        : 'Без инструктора';
    if (!acc[key]) acc[key] = [];
    acc[key].push(course);
    return acc;
  }, {});

  const filteredGroupedCourses = Object.keys(groupedCourses).reduce(
    (filtered, key) => {
      const group = groupedCourses[key];
      const groupFiltered = group.filter((course) =>
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (groupFiltered.length) filtered[key] = groupFiltered;
      return filtered;
    },
    {}
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
        Курсы и программы
      </Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={openDialogForCreate}>
          Добавить курс
        </Button>
        <TextField
          label="Поиск курса"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
        />
      </Stack>
      {loading ? (
        <Typography align="center">Загрузка курсов...</Typography>
      ) : error ? (
        <Typography align="center" color="error">
          {error.message}
        </Typography>
      ) : (
        Object.keys(filteredGroupedCourses).map((key) => (
          <Accordion key={key} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {key === 'Без инструктора'
                  ? 'Без инструктора'
                  : `Преподаватель ID: ${key} - ${filteredGroupedCourses[key][0].instructor.firstName} ${filteredGroupedCourses[key][0].instructor.lastName}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                (Курсов: {filteredGroupedCourses[key].length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>ID курса</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Название курса</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Действия</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGroupedCourses[key].map((course) => (
                    <TableRow key={course.courseId} sx={{ opacity: course.deleted ? 0.6 : 1 }}>
                      <TableCell>{course.courseId}</TableCell>
                      <TableCell>{course.courseName}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button variant="outlined" color="primary" onClick={() => openDialogForEdit(course)}>
                            Редактировать
                          </Button>
                          {!course.deleted ? (
                            <Button variant="outlined" color="secondary" onClick={() => handleMarkInactive(course)}>
                              Неактивный
                            </Button>
                          ) : (
                            <Button variant="outlined" color="success" onClick={() => handleMarkActive(course)}>
                              Активировать
                            </Button>
                          )}
                          <Button variant="outlined" color="error" onClick={() => handleFullDelete(course)}>
                            Полное удаление
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

      {/* Диалог для создания / редактирования курса */}
      <Dialog open={integratedDialogOpen} onClose={() => setIntegratedDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Редактировать курс' : 'Добавить курс'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Название курса"
            fullWidth
            margin="normal"
            value={currentRecord.courseName}
            onChange={handleCourseNameChange}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {currentRecord.instructor && currentRecord.instructor.staffId
                ? `Преподаватель: ${currentRecord.instructor.staffId} - ${currentRecord.instructor.firstName} ${currentRecord.instructor.lastName}`
                : 'Преподаватель не выбран'}
            </Typography>
            <Button variant="outlined" onClick={handleOpenStaffSelector}>
              Выбрать преподавателя
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIntegratedDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmSelection} color="primary">
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог выбора преподавателя */}
      <Dialog open={openStaffSelector} onClose={() => setOpenStaffSelector(false)} fullWidth maxWidth="sm">
        <DialogTitle>Выберите преподавателя</DialogTitle>
        <DialogContent dividers>
          {loadingStaff ? (
            <Typography>Загрузка преподавателей...</Typography>
          ) : errorStaff ? (
            <Typography color="error">{errorStaff.message}</Typography>
          ) : staffList.length > 0 ? (
            <List>
              {staffList.map((staff) => {
                const coursesCount = getCoursesCountForStaff(staff.staffId);
                return (
                  <ListItem key={staff.staffId} disablePadding>
                    <ListItemButton onClick={() => handleSelectStaff(staff)}>
                      {currentRecord.instructor.staffId === staff.staffId && (
                        <CheckIcon color="primary" sx={{ mr: 1 }} />
                      )}
                      <ListItemText
                        primary={`ID: ${staff.staffId} - ${staff.firstName} ${staff.lastName} ${
                          coursesCount > 0 ? `(Используется в ${coursesCount} курсах)` : ''
                        }`}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography>Нет доступных преподавателей</Typography>
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

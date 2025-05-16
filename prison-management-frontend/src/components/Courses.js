// CoursesFrontend.jsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const COURSES_API = 'http://localhost:8080/api/courses';
const STAFF_API   = 'http://localhost:8080/api/staff';

export default function CoursesFrontend() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({ open: false, msg: '', severity: 'error' });

  const [dlgOpen, setDlgOpen]         = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [record, setRecord]           = useState({ courseId: null, courseName: '', instructor: {}, deleted: false });

  const [staffList, setStaffList]       = useState([]);
  const [staffDlgOpen, setStaffDlgOpen] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [search, setSearch]             = useState('');

  // New: Instructor detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailInstructor, setDetailInstructor] = useState(null);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(COURSES_API);
      if (!res.ok) throw res;
      setCourses(await res.json());
    } catch {
      showToast('Ошибка загрузки курсов');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff
  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch(STAFF_API);
      if (!res.ok) throw res;
      setStaffList(await res.json());
    } catch {
      showToast('Ошибка загрузки преподавателей');
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const showToast = (msg) => {
    setToast({ open: true, msg, severity: 'error' });
  };

  // Create / Edit dialog
  const openCreate = () => {
    setIsEditing(false);
    setRecord({ courseId: null, courseName: '', instructor: {}, deleted: false });
    setDlgOpen(true);
  };

  const openEdit = (c) => {
    setIsEditing(true);
    setRecord(c);
    setDlgOpen(true);
  };

  const handleSave = async () => {
    try {
      const url    = isEditing ? `${COURSES_API}/${record.courseId}` : COURSES_API;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw res;
      setDlgOpen(false);
      fetchCourses();
    } catch {
      showToast('Ошибка сохранения курса');
    }
  };

  // Deactivate
  const handleDeactivate = async (c) => {
    try {
      const res = await fetch(`${COURSES_API}/${c.courseId}`, { method: 'DELETE' });
      if (!res.ok) throw res;
      fetchCourses();
    } catch {
      showToast('Не удалось деактивировать курс');
    }
  };

  // Reactivate
  const handleActivate = async (c) => {
    try {
      const res = await fetch(`${COURSES_API}/${c.courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, deleted: false }),
      });
      if (!res.ok) throw res;
      fetchCourses();
    } catch {
      showToast('Не удалось активировать курс');
    }
  };

  // Hard delete
  const handleDeleteHard = async (c) => {
    if (!window.confirm(`Удалить навсегда "${c.courseName}"?`)) return;
    try {
      const res = await fetch(`${COURSES_API}/${c.courseId}/full`, { method: 'DELETE' });
      if (!res.ok) throw res;
      fetchCourses();
    } catch {
      showToast('Ошибка полного удаления');
    }
  };

  // Staff selector
  const openStaffSel = () => {
    fetchStaff();
    setStaffDlgOpen(true);
  };
  const selectStaff = (s) => {
    setRecord(r => ({ ...r, instructor: s }));
    setStaffDlgOpen(false);
  };

  // Instructor detail
  const openDetail = (instr) => {
    setDetailInstructor(instr);
    setDetailOpen(true);
  };

  // Group and filter
  const grouped = courses.reduce((acc, c) => {
    const key = c.instructor?.staffId || 'no-inst';
    (acc[key] = acc[key] || []).push(c);
    return acc;
  }, {});

  const filteredGroups = Object.entries(grouped)
    .map(([k, arr]) => [k, arr.filter(c => c.courseName.toLowerCase().includes(search.toLowerCase()))])
    .filter(([, arr]) => arr.length);

  return (
    <Paper sx={{ p: isMobile ? 1 : 3, maxWidth: 1200, mx: 'auto', mt: 4 }}>
      {/* Header */}
      <AppBar position="static" color="primary" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Курсы и программы
          </Typography>
          <Button color="inherit" startIcon={<AddIcon />} onClick={openCreate}>
            Добавить
          </Button>
        </Toolbar>
      </AppBar>

      {/* Search */}
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Поиск"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
        />
      </Stack>

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          <AnimatePresence>
            {filteredGroups.map(([key, list]) => (
              <Grid item xs={12} key={key}>
                <Card sx={{ borderRadius: 2, boxShadow: 2, p: 3 }}>
                  <Typography variant="h5">
                    {key === 'no-inst'
                      ? 'Без преподавателя'
                      : `Преподаватель ${list[0].instructor.firstName} ${list[0].instructor.lastName}`  
                    } ({list.length})
                  </Typography>
                  <Box mt={2}>
                    {list.map(c => (
                      <motion.div
                        key={c.courseId}
                        whileHover={{ scale: 1.02 }}
                        style={{ marginBottom: 12 }}
                      >
                        <Card variant="outlined" sx={{ borderRadius: 2, minHeight: 120 }}>
                          <CardHeader
                            avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>{c.courseName[0]}</Avatar>}
                            title={c.courseName}
                            subheader={`ID: ${c.courseId}`}
                            action={
                              <Stack direction="row" spacing={1}>
                                <EditIcon sx={{ cursor: 'pointer' }} onClick={() => openEdit(c)} fontSize="large" />
                                {!c.deleted ? (
                                  <ToggleOffIcon
                                    color="warning"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleDeactivate(c)}
                                    fontSize="large"
                                  />
                                ) : (
                                  <ToggleOnIcon
                                    color="success"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleActivate(c)}
                                    fontSize="large"
                                  />
                                )}
                                <VisibilityIcon
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => openDetail(c.instructor)}
                                  fontSize="large"
                                />
                                <DeleteForeverIcon
                                  color="error"
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => handleDeleteHard(c)}
                                  fontSize="large"
                                />
                              </Stack>
                            }
                          />
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Редактировать' : 'Добавить'} курс</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Название курса"
              fullWidth
              value={record.courseName}
              onChange={e => setRecord(r => ({ ...r, courseName: e.target.value }))}
            />
            <Box display="flex" alignItems="center">
              <Typography sx={{ flexGrow: 1 }}>
                {record.instructor.staffId
                  ? `${record.instructor.firstName} ${record.instructor.lastName}`
                  : 'Преподаватель не выбран'}
              </Typography>
              <Button variant="outlined" onClick={openStaffSel}>Выбрать</Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Staff Selector Dialog */}
      <Dialog open={staffDlgOpen} onClose={() => setStaffDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Выберите преподавателя</DialogTitle>
        <DialogContent>
          {loadingStaff ? (
            <Typography>Загрузка...</Typography>
          ) : (
            staffList.map(s => (
              <Box key={s.staffId} sx={{ mb: 1 }}>
                <Button
                  fullWidth
                  onClick={() => selectStaff(s)}
                  startIcon={record.instructor.staffId === s.staffId ? <CheckIcon /> : null}
                >
                  {s.firstName} {s.lastName} (ID: {s.staffId})
                </Button>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDlgOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Instructor Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Детали преподавателя</DialogTitle>
        <DialogContent>
          {detailInstructor ? (
            <List>
              <ListItem><ListItemText primary="ID" secondary={detailInstructor.staffId} /></ListItem>
              <ListItem><ListItemText primary="Имя" secondary={detailInstructor.firstName} /></ListItem>
              <ListItem><ListItemText primary="Фамилия" secondary={detailInstructor.lastName} /></ListItem>
              <ListItem><ListItemText primary="Email" secondary={detailInstructor.email || '—'} /></ListItem>
            </List>
          ) : (
            <Typography>Нет данных</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}

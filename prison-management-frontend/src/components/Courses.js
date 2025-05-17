// src/components/CoursesFrontend.jsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Grid,
  Card,
  CardHeader,
  Box,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check as CheckIcon,
  DeleteForever as DeleteForeverIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';

// API endpoints
const COURSES_API = 'http://localhost:8080/api/courses';
const STAFF_API   = 'http://localhost:8080/api/staff';

// include cookies + JSON headers
const defaultHeaders = { 'Content-Type': 'application/json' };
const fetchOptions = (overrides = {}) => ({
  credentials: 'include',
  headers: defaultHeaders,
  ...overrides
});

export default function CoursesFrontend() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ open: false, msg: '', severity: 'error' });

  const [dlgOpen, setDlgOpen]         = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [record, setRecord]           = useState({
    courseId: null,
    courseName: '',
    instructor: {},
    deleted: false
  });

  const [staffList, setStaffList]       = useState([]);
  const [staffDlgOpen, setStaffDlgOpen] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [search, setSearch]             = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailInstructor, setDetailInstructor] = useState(null);

  // load courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(COURSES_API, fetchOptions());
      if (!res.ok) throw new Error(res.statusText);
      setCourses(await res.json());
    } catch (err) {
      setToast({ open: true, msg: 'Ошибка загрузки курсов', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(fetchCourses, []);

  const showToast = (msg, severity='error') => setToast({ open: true, msg, severity });

  // create or edit
  const openCreate = () => {
    setIsEditing(false);
    setRecord({ courseId: null, courseName: '', instructor: {}, deleted: false });
    setDlgOpen(true);
  };
  const openEdit = c => {
    setIsEditing(true);
    setRecord(c);
    setDlgOpen(true);
  };
  const handleSave = async () => {
    try {
      const url    = isEditing ? `${COURSES_API}/${record.courseId}` : COURSES_API;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, fetchOptions({
        method,
        body: JSON.stringify(record)
      }));
      if (!res.ok) throw new Error();
      setDlgOpen(false);
      await fetchCourses();
      showToast(isEditing ? 'Курс обновлён' : 'Курс создан', 'success');
    } catch {
      showToast('Ошибка сохранения курса');
    }
  };

  // deactivate / soft-delete
  const handleDeactivate = async c => {
    try {
      const res = await fetch(`${COURSES_API}/${c.courseId}`, fetchOptions({ method: 'DELETE' }));
      if (!res.ok) throw new Error();
      await fetchCourses();
      showToast('Курс деактивирован', 'success');
    } catch {
      showToast('Не удалось деактивировать курс');
    }
  };

  // reactivate
  const handleActivate = async c => {
    try {
      const res = await fetch(`${COURSES_API}/${c.courseId}`, fetchOptions({
        method: 'PUT',
        body: JSON.stringify({ ...c, deleted: false })
      }));
      if (!res.ok) throw new Error();
      await fetchCourses();
      showToast('Курс активирован', 'success');
    } catch {
      showToast('Не удалось активировать курс');
    }
  };

  // hard delete
  const handleDeleteHard = async c => {
    if (!window.confirm(`Удалить навсегда "${c.courseName}"?`)) return;
    try {
      const res = await fetch(`${COURSES_API}/${c.courseId}/full`, fetchOptions({ method: 'DELETE' }));
      if (!res.ok) throw new Error();
      await fetchCourses();
      showToast('Курс окончательно удалён', 'success');
    } catch {
      showToast('Ошибка полного удаления');
    }
  };

  // staff selection
  const openStaffSel = async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch(STAFF_API, fetchOptions());
      if (!res.ok) throw new Error();
      setStaffList(await res.json());
    } catch {
      showToast('Ошибка загрузки преподавателей');
    } finally {
      setLoadingStaff(false);
      setStaffDlgOpen(true);
    }
  };
  const selectStaff = s => {
    setRecord(r => ({ ...r, instructor: s }));
    setStaffDlgOpen(false);
  };

  // detail
  const openDetail = instr => {
    setDetailInstructor(instr);
    setDetailOpen(true);
  };

  // grouping & filtering
  const grouped = courses.reduce((acc, c) => {
    const key = c.instructor?.staffId || 'no-inst';
    (acc[key] = acc[key] || []).push(c);
    return acc;
  }, {});

  const filteredGroups = Object.entries(grouped)
    .map(([k, arr]) => [k, arr.filter(c =>
      c.courseName.toLowerCase().includes(search.toLowerCase())
    )])
    .filter(([, arr]) => arr.length);

  return (
    <Paper sx={{ p: isMobile ? 1 : 3, maxWidth: 1200, mx: 'auto', mt: 4 }}>
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

      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Поиск"
          size="small"
          fullWidth={!isMobile}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Stack>

      {loading
        ? <Box display="flex" justifyContent="center"><CircularProgress/></Box>
        : <Grid container spacing={2}>
            <AnimatePresence>
              {filteredGroups.map(([key, list]) => (
                <Grid item xs={12} key={key}>
                  <Box component={Card} sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
                    <Typography variant="h5">
                      {key === 'no-inst'
                        ? 'Без преподавателя'
                        : `Преподаватель ${list[0].instructor.firstName} ${list[0].instructor.lastName}`
                      } ({list.length})
                    </Typography>
                    <Box mt={2}>
                      {list.map(c => (
                        <motion.div key={c.courseId} whileHover={{ scale: 1.02 }} style={{ marginBottom: 12 }}>
                          <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardHeader
                              avatar={<Avatar>{c.courseName.charAt(0)}</Avatar>}
                              title={c.courseName}
                              subheader={`ID: ${c.courseId}`}
                              action={
                                <Stack direction="row" spacing={1}>
                                  <EditIcon sx={{ cursor: 'pointer' }} onClick={() => openEdit(c)} />
                                  {!c.deleted
                                    ? <ToggleOffIcon color="warning" sx={{ cursor: 'pointer' }} onClick={() => handleDeactivate(c)} />
                                    : <ToggleOnIcon color="success" sx={{ cursor: 'pointer' }} onClick={() => handleActivate(c)} />
                                  }
                                  <VisibilityIcon sx={{ cursor: 'pointer' }} onClick={() => openDetail(c.instructor)} />
                                  <DeleteForeverIcon color="error" sx={{ cursor: 'pointer' }} onClick={() => handleDeleteHard(c)} />
                                </Stack>
                              }
                            />
                          </Card>
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
      }

      {/* Create/Edit Dialog */}
      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Редактировать курс' : 'Добавить курс'}</DialogTitle>
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

      {/* Staff Selector */}
      <Dialog open={staffDlgOpen} onClose={() => setStaffDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Выберите преподавателя</DialogTitle>
        <DialogContent>
          {loadingStaff
            ? <CircularProgress/>
            : <List>
                {staffList.map(s => (
                  <ListItem button key={s.staffId} onClick={() => selectStaff(s)}>
                    <ListItemText
                      primary={`${s.firstName} ${s.lastName}`}
                      secondary={`ID: ${s.staffId}`}
                    />
                    {record.instructor.staffId === s.staffId && <CheckIcon color="primary"/>}
                  </ListItem>
                ))}
              </List>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDlgOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Instructor Details */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Детали преподавателя</DialogTitle>
        <DialogContent>
          {detailInstructor
            ? <List>
                <ListItem><ListItemText primary="ID" secondary={detailInstructor.staffId} /></ListItem>
                <ListItem><ListItemText primary="Имя" secondary={detailInstructor.firstName} /></ListItem>
                <ListItem><ListItemText primary="Фамилия" secondary={detailInstructor.lastName} /></ListItem>
                <ListItem><ListItemText primary="Email" secondary={detailInstructor.email || '—'} /></ListItem>
              </List>
            : <Typography>Нет данных</Typography>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(t => ({ ...t, open:false }))}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}
      >
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}

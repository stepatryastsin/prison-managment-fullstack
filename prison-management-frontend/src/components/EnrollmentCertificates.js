import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  Slide,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box as MUIBox,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

// API endpoints
const ENROLLMENTS_API_URL = 'http://localhost:8080/api/enrollments';
const CERTIFICATES_API_URL = 'http://localhost:8080/api/certificates';
const PRISONERS_API_URL = 'http://localhost:8080/api/prisoners';
const COURSES_API_URL = 'http://localhost:8080/api/courses';

const EnrollmentCertificates = () => {
  // ----------------- ТАБЫ -----------------
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (e, newValue) => setActiveTab(newValue);

  // ================= Регистрации =================
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [enrollRequest, setEnrollRequest] = useState({
    prisonerId: '',
    prisonerInfo: null,
    courseId: '',
    courseInfo: null,
  });
  const [searchEnrollment, setSearchEnrollment] = useState('');

  // Диалоги выбора для регистраций
  const [prisonerDialogOpen, setPrisonerDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [prisonersList, setPrisonersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorPrisoners, setErrorPrisoners] = useState(null);
  const [errorCourses, setErrorCourses] = useState(null);

  // ================= Сертификаты =================
  const [certRequest, setCertRequest] = useState({
    prisonerId: '',
    prisonerInfo: null,
    courseId: '',
    courseInfo: null,
  });
  const [searchCertEnrollment, setSearchCertEnrollment] = useState('');
  const [certEnrollmentDialogOpen, setCertEnrollmentDialogOpen] = useState(false);
  const openCertEnrollmentDialog = () => setCertEnrollmentDialogOpen(true);

  // Список выданных сертификатов
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [certificateError, setCertificateError] = useState(null);

  // ----------------- Уведомления (Snackbar) -----------------
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const openSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  // ================= Загрузка данных =================
  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const res = await fetch(ENROLLMENTS_API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки регистраций');
      setEnrollments(await res.json());
    } catch (err) {
      setEnrollmentError(err);
      openSnackbar(err.message, 'error');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const res = await fetch(CERTIFICATES_API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки сертификатов');
      setCertificates(await res.json());
    } catch (err) {
      setCertificateError(err);
      openSnackbar(err.message, 'error');
    } finally {
      setLoadingCertificates(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchCertificates();
  }, []);

  // ---------------- Диалоги для регистраций ----------------
  const openPrisonerDialog = async () => {
    setLoadingPrisoners(true);
    try {
      const res = await fetch(PRISONERS_API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки заключённых');
      setPrisonersList(await res.json());
    } catch (err) {
      setErrorPrisoners(err);
      openSnackbar(err.message, 'error');
    } finally {
      setLoadingPrisoners(false);
      setPrisonerDialogOpen(true);
    }
  };

  const openCourseDialog = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(COURSES_API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки курсов');
      setCoursesList(await res.json());
    } catch (err) {
      setErrorCourses(err);
      openSnackbar(err.message, 'error');
    } finally {
      setLoadingCourses(false);
      setCourseDialogOpen(true);
    }
  };

  const handleSelectPrisoner = p => {
    setEnrollRequest(r => ({ ...r, prisonerId: String(p.prisonerId), prisonerInfo: p }));
    setPrisonerDialogOpen(false);
  };
  const handleSelectCourse = c => {
    if (c.deleted) {
      openSnackbar('Курс неактивен', 'warning');
      return;
    }
    setEnrollRequest(r => ({ ...r, courseId: String(c.courseId), courseInfo: c }));
    setCourseDialogOpen(false);
  };

  // ---------------- Добавление регистрации ----------------
  const handleEnrollSubmit = async e => {
    e.preventDefault();
    if (!enrollRequest.courseInfo || enrollRequest.courseInfo.deleted) {
      openSnackbar('Нельзя на неактивный курс', 'warning');
      return;
    }
    try {
      const res = await fetch(ENROLLMENTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: {
            prisonerId: Number(enrollRequest.prisonerId),
            courseId:   Number(enrollRequest.courseId),
          }
        }),
      });
      if (!res.ok) throw new Error('Ошибка регистрации');
      openSnackbar('Регистрация добавлена', 'success');
      setEnrollRequest({ prisonerId: '', prisonerInfo: null, courseId: '', courseInfo: null });
      fetchEnrollments();
    } catch (err) {
      openSnackbar(err.message, 'error');
    }
  };

  const filteredEnrollments = useMemo(() => {
    if (!searchEnrollment.trim()) return enrollments;
    return enrollments.filter(e =>
      String(e.id?.prisonerId).includes(searchEnrollment) ||
      String(e.id?.courseId).includes(searchEnrollment)
    );
  }, [enrollments, searchEnrollment]);

  // ---------------- Удаление регистрации ----------------
  const handleDeleteEnrollment = e => {
    if (!window.confirm(`Удалить регистрацию ${e.id.prisonerId}/${e.id.courseId}?`)) return;
    fetch(`${ENROLLMENTS_API_URL}/${e.id.prisonerId}/${e.id.courseId}`, { method: 'DELETE' })
      .then(r => {
        if (r.ok) {
          openSnackbar('Регистрация удалена', 'success');
          fetchEnrollments();
        } else openSnackbar('Ошибка удаления', 'error');
      })
      .catch(() => openSnackbar('Ошибка удаления', 'error'));
  };

  // ---------------- Выдача сертификата ----------------
  const handleSelectCertEnrollment = e => {
    const exists = certificates.some(
      c => Number(c.id.prisonerId) === e.id.prisonerId && Number(c.id.courseId) === e.id.courseId
    );
    if (exists) {
      openSnackbar('Сертификат уже выдан', 'warning');
      return;
    }
    if (e.course.deleted) {
      openSnackbar('Курс неактивен', 'warning');
      return;
    }
    setCertRequest({
      prisonerId: String(e.id.prisonerId),
      prisonerInfo: e.prisoner,
      courseId: String(e.id.courseId),
      courseInfo: e.course,
    });
    setCertEnrollmentDialogOpen(false);
  };

  const certificateExists = useMemo(() => {
    if (!certRequest.prisonerId || !certRequest.courseId) return false;
    return certificates.some(
      c => Number(c.id.prisonerId) === Number(certRequest.prisonerId) &&
           Number(c.id.courseId) === Number(certRequest.courseId)
    );
  }, [certRequest, certificates]);

  const allCertEnrollmentsFiltered = useMemo(() => {
    if (!searchCertEnrollment.trim()) return enrollments;
    return enrollments.filter(e =>
      String(e.id?.prisonerId).includes(searchCertEnrollment) ||
      String(e.id?.courseId).includes(searchCertEnrollment)
    );
  }, [enrollments, searchCertEnrollment]);

  const getCertificateStatus = e => {
    const given = certificates.some(
      c => Number(c.id.prisonerId) === e.id.prisonerId && Number(c.id.courseId) === e.id.courseId
    );
    const status = given ? 'Выдан' : 'Не выдан';
    return e.course.deleted ? `${status} (Не активен)` : status;
  };

  const handleCertSubmit = async e => {
    e.preventDefault();
    if (!certRequest.prisonerId || !certRequest.courseId) {
      openSnackbar('Выберите регистрацию', 'warning');
      return;
    }
    if (certificateExists) {
      openSnackbar('Сертификат уже выдан', 'warning');
      return;
    }
    try {
      const res = await fetch(CERTIFICATES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: {
            prisonerId: Number(certRequest.prisonerId),
            courseId:   Number(certRequest.courseId),
          }
        }),
      });
      if (!res.ok) throw new Error('Ошибка выдачи сертификата');
      openSnackbar('Сертификат выдан', 'success');
      setCertRequest({ prisonerId: '', prisonerInfo: null, courseId: '', courseInfo: null });
      fetchCertificates();
    } catch (err) {
      openSnackbar(err.message, 'error');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto', my: 3, boxShadow: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Регистрация и выдача сертификатов
      </Typography>
      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Регистрации" />
        <Tab label="Сертификаты" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          {/* Форма регистрации */}
          <Box component="form" onSubmit={handleEnrollSubmit} sx={{ mb: 3 }}>
            <Typography variant="h6">Добавить регистрацию</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="ID заключённого"
                value={enrollRequest.prisonerId}
                onClick={openPrisonerDialog}
                placeholder="Нажмите для выбора"
                InputProps={{ readOnly: true }}
                sx={{ cursor: 'pointer' }}
              />
              {enrollRequest.prisonerInfo && (
                <Typography variant="body2">
                  {enrollRequest.prisonerInfo.firstName}{' '}
                  {enrollRequest.prisonerInfo.lastName}
                </Typography>
              )}
              <TextField
                label="ID курса"
                value={enrollRequest.courseId}
                onClick={openCourseDialog}
                placeholder="Нажмите для выбора"
                InputProps={{ readOnly: true }}
                sx={{ cursor: 'pointer' }}
              />
              {enrollRequest.courseInfo && (
                <Typography
                  variant="body2"
                  sx={{ opacity: enrollRequest.courseInfo.deleted ? 0.5 : 1 }}
                >
                  {enrollRequest.courseInfo.courseName}{' '}
                  {enrollRequest.courseInfo.deleted && '(Не активен)'}
                </Typography>
              )}
              <Button type="submit" variant="contained">
                Добавить
              </Button>
            </Stack>
          </Box>

          {/* Поиск */}
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <TextField
              label="Поиск"
              size="small"
              value={searchEnrollment}
              onChange={e => setSearchEnrollment(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            {loadingEnrollments && <CircularProgress size={24} />}
          </Stack>

          {enrollmentError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {enrollmentError.message}
            </Typography>
          )}

          {loadingEnrollments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID заключённого</TableCell>
                  <TableCell>ID курса</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnrollments.map((enr, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{enr.id.prisonerId}</TableCell>
                    <TableCell>{enr.id.courseId}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteEnrollment(enr)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredEnrollments.length && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Нет данных
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Диалоги выбора */}
          <Dialog open={prisonerDialogOpen} onClose={() => setPrisonerDialogOpen(false)} fullWidth>
            <DialogTitle>Выберите заключённого</DialogTitle>
            <DialogContent dividers>
              {loadingPrisoners ? (
                <CircularProgress />
              ) : errorPrisoners ? (
                <Typography color="error">{errorPrisoners.message}</Typography>
              ) : prisonersList.length ? (
                prisonersList.map(p => (
                  <MUIBox key={p.prisonerId} sx={{ mb: 1 }}>
                    <Button fullWidth onClick={() => handleSelectPrisoner(p)}>
                      ID: {p.prisonerId} — {p.firstName} {p.lastName}
                    </Button>
                  </MUIBox>
                ))
              ) : (
                <Typography>Нет доступных</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPrisonerDialogOpen(false)}>Закрыть</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} fullWidth>
            <DialogTitle>Выберите курс</DialogTitle>
            <DialogContent dividers>
              {loadingCourses ? (
                <CircularProgress />
              ) : errorCourses ? (
                <Typography color="error">{errorCourses.message}</Typography>
              ) : coursesList.length ? (
                coursesList.map(c => (
                  <MUIBox key={c.courseId} sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      disabled={c.deleted}
                      onClick={() => handleSelectCourse(c)}
                    >
                      ID: {c.courseId} — {c.courseName}
                      {c.deleted && ' (Не активен)'}
                    </Button>
                  </MUIBox>
                ))
              ) : (
                <Typography>Нет доступных</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCourseDialogOpen(false)}>Закрыть</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Форма выдачи сертификата */}  
          <Box component="form" onSubmit={handleCertSubmit} sx={{ mb: 3 }}>
            <Typography variant="h6">Выдать сертификат</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Выбранная регистрация"
                value={
                  certRequest.prisonerId && certRequest.courseId
                    ? `ID: ${certRequest.prisonerId} — ${certRequest.prisonerInfo.firstName} ${certRequest.prisonerInfo.lastName} | Курс: ${certRequest.courseId} — ${certRequest.courseInfo.courseName}`
                    : ''
                }
                placeholder="Нажмите для выбора"
                InputProps={{ readOnly: true }}
                sx={{ cursor: 'pointer', width: '100%' }}
                onClick={openCertEnrollmentDialog}
              />
              <Button type="submit" variant="contained">
                Выдать
              </Button>
            </Stack>
          </Box>

          {/* Поиск сертификатов */}
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <TextField
              label="Поиск"
              size="small"
              value={searchCertEnrollment}
              onChange={e => setSearchCertEnrollment(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            {loadingEnrollments && <CircularProgress size={24} />}
          </Stack>

          {loadingEnrollments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID заключённого</TableCell>
                  <TableCell>ID курса</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allCertEnrollmentsFiltered.map((enr, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    onClick={() => handleSelectCertEnrollment(enr)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{enr.id.prisonerId}</TableCell>
                    <TableCell>{enr.id.courseId}</TableCell>
                    <TableCell>{getCertificateStatus(enr)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Удалить сертификат">
                        <IconButton
                          color="error"
                          onClick={e => {
                            e.stopPropagation();
                            const cert = certificates.find(
                              c =>
                                Number(c.id.prisonerId) === enr.id.prisonerId &&
                                Number(c.id.courseId) === enr.id.courseId
                            );
                            if (cert) handleDeleteCertificate(cert);
                            else openSnackbar('Не найден', 'warning');
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!allCertEnrollmentsFiltered.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Нет доступных
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Диалог выдачи сертификата */}
          <Dialog
            open={certEnrollmentDialogOpen}
            onClose={() => setCertEnrollmentDialogOpen(false)}
            fullWidth
          >
            <DialogTitle>Выберите регистрацию</DialogTitle>
            <DialogContent dividers>
              {loadingEnrollments ? (
                <CircularProgress />
              ) : allCertEnrollmentsFiltered.length ? (
                allCertEnrollmentsFiltered.map(enr => (
                  <MUIBox key={`${enr.id.prisonerId}-${enr.id.courseId}`} sx={{ mb: 1 }}>
                    <Button fullWidth onClick={() => handleSelectCertEnrollment(enr)}>
                      ID: {enr.id.prisonerId} — {enr.prisoner.firstName}{' '}
                      {enr.prisoner.lastName} | Курс: {enr.id.courseId} — {enr.course.courseName} (
                      {getCertificateStatus(enr)})
                    </Button>
                  </MUIBox>
                ))
              ) : (
                <Typography>Нет доступных</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCertEnrollmentDialogOpen(false)}>Закрыть</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default EnrollmentCertificates;

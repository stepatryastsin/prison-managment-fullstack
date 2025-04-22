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
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
  const openCertEnrollmentDialog = () => {
    setCertEnrollmentDialogOpen(true);
  };

  // Список выданных сертификатов
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [certificateError, setCertificateError] = useState(null);

  // ----------------- Уведомления (Snackbar) -----------------
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const openSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // ================= Загрузка данных =================
  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const response = await fetch(ENROLLMENTS_API_URL);
      if (!response.ok) throw new Error('Сетевая ошибка при загрузке регистраций');
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error('Ошибка загрузки регистраций:', error);
      setEnrollmentError(error);
      openSnackbar(error.message, 'error');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const response = await fetch(CERTIFICATES_API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки сертификатов');
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('Ошибка загрузки сертификатов:', error);
      setCertificateError(error);
      openSnackbar(error.message, 'error');
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
      const response = await fetch(PRISONERS_API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки заключённых');
      const data = await response.json();
      setPrisonersList(data);
    } catch (error) {
      console.error('Ошибка загрузки заключённых:', error);
      setErrorPrisoners(error);
      openSnackbar(error.message, 'error');
    } finally {
      setLoadingPrisoners(false);
      setPrisonerDialogOpen(true);
    }
  };

  const openCourseDialog = async () => {
    setLoadingCourses(true);
    try {
      const response = await fetch(COURSES_API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки курсов');
      const data = await response.json();
      setCoursesList(data);
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      setErrorCourses(error);
      openSnackbar(error.message, 'error');
    } finally {
      setLoadingCourses(false);
      setCourseDialogOpen(true);
    }
  };

  const closePrisonerDialog = () => setPrisonerDialogOpen(false);
  const closeCourseDialog = () => setCourseDialogOpen(false);

  // Выбор заключённого
  const handleSelectPrisoner = (prisoner) => {
    setEnrollRequest((prev) => ({
      ...prev,
      prisonerId: String(prisoner.prisonerId),
      prisonerInfo: prisoner,
    }));
    closePrisonerDialog();
  };

  // Выбор курса с проверкой активности
  const handleSelectCourse = (course) => {
    if (course.deleted) {
      openSnackbar('Выбранный курс неактивен', 'warning');
      return;
    }
    setEnrollRequest((prev) => ({
      ...prev,
      courseId: String(course.courseId),
      courseInfo: course,
    }));
    closeCourseDialog();
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollRequest.courseInfo || enrollRequest.courseInfo.deleted) {
      openSnackbar('Нельзя регистрироваться на неактивный курс', 'warning');
      return;
    }
    try {
      const response = await fetch(ENROLLMENTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prisonerId: Number(enrollRequest.prisonerId),
          courseId: Number(enrollRequest.courseId),
        }),
      });
      if (!response.ok) throw new Error('Ошибка регистрации на курс');
      openSnackbar('Регистрация успешно добавлена', 'success');
      setEnrollRequest({ prisonerId: '', prisonerInfo: null, courseId: '', courseInfo: null });
      fetchEnrollments();
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      openSnackbar('Ошибка регистрации на курс', 'error');
    }
  };

  const filteredEnrollments = useMemo(() => {
    if (!searchEnrollment.trim()) return enrollments;
    return enrollments.filter((enroll) =>
      String(enroll.id?.prisonerId).includes(searchEnrollment) ||
      String(enroll.id?.courseId).includes(searchEnrollment)
    );
  }, [enrollments, searchEnrollment]);

  // ---------------- Функции удаления ----------------

  // Удаление регистрации (enrollment) по составному ключу
  const handleDeleteEnrollment = (enroll) => {
    if (
      window.confirm(
        `Удалить регистрацию для заключённого ID: ${enroll.id.prisonerId} и курса ID: ${enroll.id.courseId}?`
      )
    ) {
      fetch(`${ENROLLMENTS_API_URL}/${enroll.id.prisonerId}/${enroll.id.courseId}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (res.ok) {
            openSnackbar('Регистрация удалена', 'success');
            fetchEnrollments();
          } else {
            openSnackbar('Ошибка удаления регистрации', 'error');
          }
        })
        .catch((error) => {
          console.error('Ошибка удаления регистрации:', error);
          openSnackbar('Ошибка удаления регистрации', 'error');
        });
    }
  };

  // Удаление сертификата по составному ключу
  const handleDeleteCertificate = (cert) => {
    if (
      window.confirm(
        `Удалить сертификат для заключённого ID: ${cert.id.prisonerId} и курса ID: ${cert.id.courseId}?`
      )
    ) {
      fetch(`${CERTIFICATES_API_URL}/${cert.id.prisonerId}/${cert.id.courseId}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (res.ok) {
            openSnackbar('Сертификат удалён', 'success');
            fetchCertificates();
          } else {
            openSnackbar('Ошибка удаления сертификата', 'error');
          }
        })
        .catch((error) => {
          console.error('Ошибка удаления сертификата:', error);
          openSnackbar('Ошибка удаления сертификата', 'error');
        });
    }
  };

  // ---------------- Обработка выдачи сертификата ----------------
  // При выборе записи для сертификата проверяем: не выдан ли уже сертификат и активность курса
  const handleSelectCertEnrollment = (enrollment) => {
    const exists = certificates.some(
      (cert) =>
        Number(cert.id.prisonerId) === Number(enrollment.id.prisonerId) &&
        Number(cert.id.courseId) === Number(enrollment.id.courseId)
    );
    if (exists) {
      openSnackbar('Сертификат для данной регистрации уже выдан', 'warning');
      return;
    }
    if (enrollment.course.deleted) {
      openSnackbar('Нельзя выдавать сертификат для неактивного курса', 'warning');
      return;
    }
    setCertRequest({
      prisonerId: String(enrollment.id.prisonerId),
      prisonerInfo: enrollment.prisoner,
      courseId: String(enrollment.id.courseId),
      courseInfo: enrollment.course,
    });
    setCertEnrollmentDialogOpen(false);
  };

  // Проверка существования сертификата
  const certificateExists = useMemo(() => {
    if (!certRequest.prisonerId || !certRequest.courseId) return false;
    return certificates.some(
      (cert) =>
        Number(cert.id.prisonerId) === Number(certRequest.prisonerId) &&
        Number(cert.id.courseId) === Number(certRequest.courseId)
    );
  }, [certRequest, certificates]);

  // Фильтрация регистраций для таблицы выдачи сертификатов
  const allCertEnrollmentsFiltered = useMemo(() => {
    if (!searchCertEnrollment.trim()) return enrollments;
    return enrollments.filter((enroll) =>
      String(enroll.id?.prisonerId).includes(searchCertEnrollment) ||
      String(enroll.id?.courseId).includes(searchCertEnrollment)
    );
  }, [enrollments, searchCertEnrollment]);

  // Получение статуса сертификата с учётом активности курса
  const getCertificateStatus = (enroll) => {
    const exists = certificates.some(
      (cert) =>
        Number(cert.id.prisonerId) === Number(enroll.id?.prisonerId) &&
        Number(cert.id.courseId) === Number(enroll.id?.courseId)
    );
    const status = exists ? 'Выдан' : 'Не выдан';
    return enroll.course.deleted ? `${status} (Не активен)` : status;
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!certRequest.prisonerId || !certRequest.courseId) {
      openSnackbar('Выберите регистрацию для выдачи сертификата', 'warning');
      return;
    }
    if (certificateExists) {
      openSnackbar('Сертификат для данной регистрации уже выдан', 'warning');
      return;
    }
    try {
      const response = await fetch(CERTIFICATES_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Отправляем EnrollmentRequest с prisonerId и courseId
        body: JSON.stringify({
          prisonerId: Number(certRequest.prisonerId),
          courseId: Number(certRequest.courseId),
        }),
      });
      if (!response.ok) throw new Error('Ошибка выдачи сертификата');
      openSnackbar('Сертификат успешно выдан', 'success');
      setCertRequest({ prisonerId: '', prisonerInfo: null, courseId: '', courseInfo: null });
      fetchCertificates();
    } catch (error) {
      console.error('Ошибка выдачи сертификата:', error);
      openSnackbar('Ошибка выдачи сертификата', 'error');
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
            <Typography variant="h6" gutterBottom>
              Добавить регистрацию
            </Typography>
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
                  {enrollRequest.prisonerInfo.firstName} {enrollRequest.prisonerInfo.lastName}
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
                  {enrollRequest.courseInfo.courseName} {enrollRequest.courseInfo.deleted && '(Не активен)'}
                </Typography>
              )}
              <Button type="submit" variant="contained" color="primary">
                Добавить
              </Button>
            </Stack>
          </Box>

          {/* Поиск регистраций */}
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <TextField
              label="Поиск по ID заключённого или курса"
              variant="outlined"
              size="small"
              value={searchEnrollment}
              onChange={(e) => setSearchEnrollment(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
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
              <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                <TableRow>
                  <TableCell><strong>ID заключённого</strong></TableCell>
                  <TableCell><strong>ID курса</strong></TableCell>
                  <TableCell align="center"><strong>Действия</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnrollments.map((enroll, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{enroll.id?.prisonerId}</TableCell>
                    <TableCell>{enroll.id?.courseId}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteEnrollment(enroll)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEnrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Нет данных
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Диалог выбора заключённого */}
          <Dialog
            open={prisonerDialogOpen}
            onClose={() => setPrisonerDialogOpen(false)}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
          >
            <DialogTitle>Выберите заключённого</DialogTitle>
            <DialogContent dividers>
              {loadingPrisoners ? (
                <CircularProgress />
              ) : errorPrisoners ? (
                <Typography color="error">{errorPrisoners.message}</Typography>
              ) : prisonersList.length > 0 ? (
                prisonersList.map((prisoner) => (
                  <MUIBox key={prisoner.prisonerId} sx={{ mb: 1 }}>
                    <Button variant="outlined" fullWidth onClick={() => handleSelectPrisoner(prisoner)}>
                      ID: {prisoner.prisonerId} — {prisoner.firstName} {prisoner.lastName}
                    </Button>
                  </MUIBox>
                ))
              ) : (
                <Typography>Нет доступных заключённых</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPrisonerDialogOpen(false)}>Закрыть</Button>
            </DialogActions>
          </Dialog>

          {/* Диалог выбора курса */}
          <Dialog
            open={courseDialogOpen}
            onClose={() => setCourseDialogOpen(false)}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
          >
            <DialogTitle>Выберите курс</DialogTitle>
            <DialogContent dividers>
              {loadingCourses ? (
                <CircularProgress />
              ) : errorCourses ? (
                <Typography color="error">{errorCourses.message}</Typography>
              ) : coursesList.length > 0 ? (
                coursesList.map((course) => (
                  <MUIBox key={course.courseId} sx={{ mb: 1 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleSelectCourse(course)}
                      disabled={course.deleted}
                      sx={{ opacity: course.deleted ? 0.5 : 1 }}
                    >
                      ID: {course.courseId} — {course.courseName}
                      {course.teacher && (
                        <span>
                          {' '}— Преподаватель: {course.teacher.firstName} {course.teacher.lastName}
                        </span>
                      )}
                      {course.deleted && ' (Не активен)'}
                    </Button>
                  </MUIBox>
                ))
              ) : (
                <Typography>Нет доступных курсов</Typography>
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
            <Typography variant="h6" gutterBottom>
              Выдать сертификат
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Выбранная регистрация"
                value={
                  certRequest.prisonerId && certRequest.courseId
                    ? `ID: ${certRequest.prisonerId} — ${certRequest.prisonerInfo.firstName} ${certRequest.prisonerInfo.lastName} | Курс: ${certRequest.courseId} — ${certRequest.courseInfo.courseName}`
                    : ''
                }
                placeholder="Выберите регистрацию"
                InputProps={{ readOnly: true }}
                sx={{ cursor: 'pointer', width: '100%' }}
                onClick={openCertEnrollmentDialog}
              />
              <Button type="submit" variant="contained" color="primary">
                Выдать
              </Button>
            </Stack>
          </Box>

          {/* Поиск регистраций для выдачи сертификата */}
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <TextField
              label="Поиск по регистрации"
              variant="outlined"
              size="small"
              value={searchCertEnrollment}
              onChange={(e) => setSearchCertEnrollment(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
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
              <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                <TableRow>
                  <TableCell><strong>ID заключённого</strong></TableCell>
                  <TableCell><strong>ID курса</strong></TableCell>
                  <TableCell><strong>Статус</strong></TableCell>
                  <TableCell align="center"><strong>Действия</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allCertEnrollmentsFiltered.map((enroll, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSelectCertEnrollment(enroll)}
                  >
                    <TableCell>{enroll.id?.prisonerId}</TableCell>
                    <TableCell>{enroll.id?.courseId}</TableCell>
                    <TableCell>{getCertificateStatus(enroll)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {/* Кнопка для полного удаления сертификата */}
                        <Tooltip title="Удалить сертификат">
                          <IconButton
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Найдем сертификат, соответствующий регистрации, и вызовем удаление
                              const cert = certificates.find(
                                (c) =>
                                  Number(c.id.prisonerId) === Number(enroll.id.prisonerId) &&
                                  Number(c.id.courseId) === Number(enroll.id.courseId)
                              );
                              if (cert) {
                                handleDeleteCertificate(cert);
                              } else {
                                openSnackbar('Сертификат не найден', 'warning');
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {allCertEnrollmentsFiltered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Нет доступных регистраций
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Диалог выбора регистрации для выдачи сертификата */}
          <Dialog
            open={certEnrollmentDialogOpen}
            onClose={() => setCertEnrollmentDialogOpen(false)}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
          >
            <DialogTitle>Выберите регистрацию для выдачи сертификата</DialogTitle>
            <DialogContent dividers>
              {loadingEnrollments ? (
                <CircularProgress />
              ) : allCertEnrollmentsFiltered.length > 0 ? (
                allCertEnrollmentsFiltered.map((enroll) => (
                  <MUIBox key={enroll.id.prisonerId + '-' + enroll.id.courseId} sx={{ mb: 1 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleSelectCertEnrollment(enroll)}
                    >
                      ID: {enroll.id.prisonerId} — {enroll.prisoner?.firstName} {enroll.prisoner?.lastName} | Курс: {enroll.id.courseId} — {enroll.course?.courseName} (<strong>{getCertificateStatus(enroll)}</strong>)
                    </Button>
                  </MUIBox>
                ))
              ) : (
                <Typography>Нет доступных регистраций</Typography>
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
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default EnrollmentCertificates;

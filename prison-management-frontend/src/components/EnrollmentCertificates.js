// src/components/EnrollmentCertificates.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Stack,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// API endpoints
const ENROLLMENTS_API_URL       = 'http://localhost:8080/api/enrollments';
const CERTIFICATES_API_URL      = 'http://localhost:8080/api/certificates';           // CRUD сертификатов
const PRISONERS_API_URL         = 'http://localhost:8080/api/prisoners';
const COURSES_API_URL           = 'http://localhost:8080/api/courses';
// Эндпоинт для генерации/скачивания PDF
const CERTIFICATE_PDF_API_URL   = 'http://localhost:8080/api/ownCertificateFrom';

const defaultHeaders = { 'Content-Type': 'application/json' };
const fetchOptions = (overrides = {}) => ({
  headers: defaultHeaders,
  credentials: 'include',
  ...overrides,
});

export default function EnrollmentCertificates() {
  const [activeTab, setActiveTab] = useState(0);

  // — Регистрации
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [searchEnrollment, setSearchEnrollment] = useState('');
  const [enrollRequest, setEnrollRequest] = useState({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });

  // Диалоги выбора
  const [prisonerDialogOpen, setPrisonerDialogOpen] = useState(false);
  const [prisonersList, setPrisonersList] = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // — Сертификаты
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [searchCertEnrollment, setSearchCertEnrollment] = useState('');
  const [certEnrollmentDialogOpen, setCertEnrollmentDialogOpen] = useState(false);
  const [certRequest, setCertRequest] = useState({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });

  // Просмотр PDF
  const [certPdfUrl, setCertPdfUrl] = useState('');
  const [certPdfDialogOpen, setCertPdfDialogOpen] = useState(false);

  // Диалоги подробностей
  const [prisonerInfoDialogOpen, setPrisonerInfoDialogOpen] = useState(false);
  const [viewPrisoner, setViewPrisoner] = useState(null);
  const [courseInfoDialogOpen, setCourseInfoDialogOpen] = useState(false);
  const [viewCourse, setViewCourse] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open:false, message:'', severity:'success' });
  const openSnackbar = (msg, sev='success') => setSnackbar({ open:true, message:msg, severity:sev });
  const closeSnackbar  = () => setSnackbar(s => ({ ...s, open:false }));

  // Загрузка на старте
  useEffect(() => {
    fetchEnrollments();
    fetchCertificates();
  }, []);

  // ==== Fetch functions ====
  async function fetchEnrollments() {
    setLoadingEnrollments(true);
    try {
      const res = await fetch(ENROLLMENTS_API_URL, fetchOptions());
      if (!res.ok) throw new Error('Ошибка загрузки регистраций');
      setEnrollments(await res.json());
    } catch (e) { openSnackbar(e.message, 'error'); }
    finally { setLoadingEnrollments(false); }
  }

  async function fetchCertificates() {
    setLoadingCertificates(true);
    try {
      const res = await fetch(CERTIFICATES_API_URL, fetchOptions());
      if (!res.ok) throw new Error('Ошибка загрузки сертификатов');
      setCertificates(await res.json());
    } catch (e) { openSnackbar(e.message, 'error'); }
    finally { setLoadingCertificates(false); }
  }

  // ==== Handlers: выбор заключённого/курса ====
  const openPrisonerDialog = async () => {
    setLoadingPrisoners(true);
    try {
      const res = await fetch(PRISONERS_API_URL, fetchOptions());
      if (!res.ok) throw new Error('Ошибка загрузки заключённых');
      setPrisonersList(await res.json());
    } catch (e) { openSnackbar(e.message, 'error'); }
    finally {
      setLoadingPrisoners(false);
      setPrisonerDialogOpen(true);
    }
  };
  const handleSelectPrisoner = p => {
    setEnrollRequest(r => ({ ...r, prisonerId:String(p.prisonerId), prisonerInfo:p }));
    setPrisonerDialogOpen(false);
  };

  const openCourseDialog = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(COURSES_API_URL, fetchOptions());
      if (!res.ok) throw new Error('Ошибка загрузки курсов');
      setCoursesList(await res.json());
    } catch (e) { openSnackbar(e.message, 'error'); }
    finally {
      setLoadingCourses(false);
      setCourseDialogOpen(true);
    }
  };
  const handleSelectCourse = c => {
    if (c.deleted) return openSnackbar('Курс неактивен','warning');
    setEnrollRequest(r => ({ ...r, courseId:String(c.courseId), courseInfo:c }));
    setCourseDialogOpen(false);
  };

  // ==== Обработка форм ====
  const handleEnrollSubmit = async e => {
    e.preventDefault();
    if (!enrollRequest.prisonerId || !enrollRequest.courseId) {
      return openSnackbar('Выберите заключённого и курс','warning');
    }
    try {
      const res = await fetch(ENROLLMENTS_API_URL, fetchOptions({
        method:'POST',
        body: JSON.stringify({ id:{
          prisonerId: Number(enrollRequest.prisonerId),
          courseId:   Number(enrollRequest.courseId)
        }})
      }));
      if (!res.ok) throw new Error('Ошибка регистрации');
      openSnackbar('Регистрация добавлена');
      setEnrollRequest({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });
      fetchEnrollments(); fetchCertificates();
    } catch (e) { openSnackbar(e.message,'error'); }
  };

  const handleDeleteEnrollment = e => {
    if (!window.confirm('Удалить регистрацию?')) return;
    fetch(`${ENROLLMENTS_API_URL}/${e.id.prisonerId}/${e.id.courseId}`, fetchOptions({ method:'DELETE' }))
      .then(r => {
        if (!r.ok) throw new Error();
        openSnackbar('Регистрация удалена');
        fetchEnrollments(); fetchCertificates();
      })
      .catch(() => openSnackbar('Ошибка удаления','error'));
  };

  // Сертификаты
  const openCertDialog = () => setCertEnrollmentDialogOpen(true);
  const handleSelectCertEnrollment = e => {
    const exists = certificates.some(c =>
      c.id.prisonerId===e.id.prisonerId && c.id.courseId===e.id.courseId
    );
    if (exists) return openSnackbar('Сертификат уже выдан','warning');
    if (e.course.deleted) return openSnackbar('Курс неактивен','warning');
    setCertRequest({
      prisonerId:String(e.id.prisonerId), prisonerInfo:e.prisoner,
      courseId:  String(e.id.courseId),   courseInfo:e.course
    });
    setCertEnrollmentDialogOpen(false);
  };

  const handleCertSubmit = async e => {
    e.preventDefault();
    if (!certRequest.prisonerId || !certRequest.courseId) {
      return openSnackbar('Выберите регистрацию','warning');
    }
    try {
      const res = await fetch(CERTIFICATES_API_URL, fetchOptions({
        method:'POST',
        body: JSON.stringify({ id:{
          prisonerId: Number(certRequest.prisonerId),
          courseId:   Number(certRequest.courseId)
        }})
      }));
      if (!res.ok) throw new Error('Ошибка выдачи сертификата');
      openSnackbar('Сертификат выдан');
      setCertRequest({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });
      fetchEnrollments(); fetchCertificates();
    } catch (e) { openSnackbar(e.message,'error'); }
  };

  const handleDeleteCertificate = cert => {
    if (!window.confirm('Удалить сертификат?')) return;
    fetch(`${CERTIFICATES_API_URL}/${cert.id.prisonerId}/${cert.id.courseId}`, fetchOptions({ method:'DELETE' }))
      .then(r => {
        if (!r.ok) throw new Error();
        openSnackbar('Сертификат удалён');
        fetchEnrollments(); fetchCertificates();
      })
      .catch(() => openSnackbar('Ошибка удаления','error'));
  };

  const getCertificateStatus = e => {
    const given = certificates.some(c =>
      c.id.prisonerId===e.id.prisonerId && c.id.courseId===e.id.courseId
    );
    let status = given ? 'Выдан' : 'Не выдан';
    if (e.course.deleted) status += ' (Не активен)';
    return status;
  };

  // Просмотр PDF
  const handleViewCertificate = async (prisonerId, courseId) => {
    try {
      const res = await fetch(
        `${CERTIFICATE_PDF_API_URL}/${prisonerId}/${courseId}/download`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      setCertPdfUrl(url);
      setCertPdfDialogOpen(true);
    } catch {
      openSnackbar('Не удалось загрузить PDF', 'error');
    }
  };

  // Клик для просмотра деталей
  const handleViewPrisoner = p => {
    setViewPrisoner(p);
    setPrisonerInfoDialogOpen(true);
  };
  const handleViewCourse = c => {
    setViewCourse(c);
    setCourseInfoDialogOpen(true);
  };

  // Фильтрация
  const filteredEnrollments = useMemo(() => {
    if (!searchEnrollment.trim()) return enrollments;
    return enrollments.filter(e =>
      String(e.id.prisonerId).includes(searchEnrollment) ||
      String(e.id.courseId).includes(searchEnrollment)
    );
  }, [enrollments, searchEnrollment]);

  const filteredCertEnrollments = useMemo(() => {
    if (!searchCertEnrollment.trim()) return enrollments;
    return enrollments.filter(e =>
      String(e.id.prisonerId).includes(searchCertEnrollment) ||
      String(e.id.courseId).includes(searchCertEnrollment)
    );
  }, [enrollments, searchCertEnrollment]);

  return (
    <Paper sx={{ p:3, maxWidth:1200, mx:'auto', my:3, boxShadow:4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Регистрация и выдача сертификатов
      </Typography>

      <Tabs value={activeTab} onChange={(_,v)=>setActiveTab(v)} centered sx={{ mb:3 }}>
        <Tab label="Регистрации" />
        <Tab label="Сертификаты" />
      </Tabs>

      {activeTab===0 && (
        <>
          <Box component="form" onSubmit={handleEnrollSubmit} sx={{ mb:3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Закл. ID"
                value={enrollRequest.prisonerId}
                onClick={openPrisonerDialog}
                InputProps={{ readOnly:true }}
                placeholder="Выбрать"
                sx={{ cursor:'pointer' }}
              />
              <TextField
                label="Курс ID"
                value={enrollRequest.courseId}
                onClick={openCourseDialog}
                InputProps={{ readOnly:true }}
                placeholder="Выбрать"
                sx={{ cursor:'pointer' }}
              />
              <Button type="submit" variant="contained">Добавить</Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb:2 }}>
            <TextField
              placeholder="Поиск"
              size="small"
              value={searchEnrollment}
              onChange={e=>setSearchEnrollment(e.target.value)}
              InputProps={{
                startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>
              }}
              sx={{ width:300 }}
            />
            {loadingEnrollments && <CircularProgress size={24}/>}
          </Stack>

          {loadingEnrollments ? (
            <Box sx={{ display:'flex', justifyContent:'center', mt:3 }}>
              <CircularProgress/>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Закл. ID</TableCell>
                  <TableCell>Курс ID</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnrollments.map((e,i)=>(

                  <TableRow key={i} hover>
                    <TableCell
                      sx={{ cursor:'pointer', color:'#1976d2', textDecoration:'underline' }}
                      onClick={() => handleViewPrisoner(e.prisoner)}
                    >
                      {e.id.prisonerId}
                    </TableCell>
                    <TableCell
                      sx={{ cursor:'pointer', color:'#1976d2', textDecoration:'underline' }}
                      onClick={() => handleViewCourse(e.course)}
                    >
                      {e.id.courseId}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={()=>handleDeleteEnrollment(e)}>
                        <DeleteIcon/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredEnrollments.length && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">Нет данных</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Диалоги выбора */}
          <Dialog open={prisonerDialogOpen} onClose={()=>setPrisonerDialogOpen(false)} fullWidth>
            <DialogTitle>Выберите заключённого</DialogTitle>
            <DialogContent dividers>
              {loadingPrisoners
                ? <CircularProgress/>
                : prisonersList.map(p=>(
                    <Box key={p.prisonerId} sx={{ mb:1 }}>
                      <Button fullWidth onClick={()=>handleSelectPrisoner(p)}>
                        ID:{p.prisonerId} — {p.firstName} {p.lastName}
                      </Button>
                    </Box>
                  ))
              }
            </DialogContent>
            <Button onClick={()=>setPrisonerDialogOpen(false)}>Закрыть</Button>
          </Dialog>

          <Dialog open={courseDialogOpen} onClose={()=>setCourseDialogOpen(false)} fullWidth>
            <DialogTitle>Выберите курс</DialogTitle>
            <DialogContent dividers>
              {loadingCourses
                ? <CircularProgress/>
                : coursesList.map(c=>(
                    <Box key={c.courseId} sx={{ mb:1 }}>
                      <Button
                        fullWidth
                        disabled={c.deleted}
                        onClick={()=>handleSelectCourse(c)}
                      >
                        ID:{c.courseId} — {c.courseName} {c.deleted && '(Неактивен)'}
                      </Button>
                    </Box>
                  ))
              }
            </DialogContent>
            <Button onClick={()=>setCourseDialogOpen(false)}>Закрыть</Button>
          </Dialog>
        </>
      )}

      {activeTab===1 && (
        <>
          <Box component="form" onSubmit={handleCertSubmit} sx={{ mb:3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="Выбрать регистрацию"
                value={certRequest.prisonerId && certRequest.courseId
                  ? `ID:${certRequest.prisonerId}|Курс:${certRequest.courseId}` : ''}
                InputProps={{ readOnly:true }}
                sx={{ cursor:'pointer', flexGrow:1 }}
                onClick={openCertDialog}
              />
              <Button type="submit" variant="contained">Выдать</Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb:2 }}>
            <TextField
              placeholder="Поиск"
              size="small"
              value={searchCertEnrollment}
              onChange={e=>setSearchCertEnrollment(e.target.value)}
              InputProps={{
                startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>
              }}
              sx={{ width:300 }}
            />
            {loadingCertificates && <CircularProgress size={24}/>}
          </Stack>

          {loadingCertificates ? (
            <Box sx={{ display:'flex', justifyContent:'center', mt:3 }}>
              <CircularProgress/>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Закл. ID</TableCell>
                  <TableCell>Курс ID</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertEnrollments.map((e,i)=>(

                  <TableRow key={i} hover>
                    <TableCell
                      sx={{ cursor:'pointer', color:'#1976d2', textDecoration:'underline' }}
                      onClick={() => handleViewPrisoner(e.prisoner)}
                    >
                      {e.id.prisonerId}
                    </TableCell>
                    <TableCell
                      sx={{ cursor:'pointer', color:'#1976d2', textDecoration:'underline' }}
                      onClick={() => handleViewCourse(e.course)}
                    >
                      {e.id.courseId}
                    </TableCell>
                    <TableCell>{getCertificateStatus(e)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewCertificate(e.id.prisonerId, e.id.courseId)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={()=>{ 
                          const cert = certificates.find(c=>
                            c.id.prisonerId===e.id.prisonerId && c.id.courseId===e.id.courseId
                          );
                          handleDeleteCertificate(cert);
                        }}
                      >
                        <DeleteIcon/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Dialog open={certEnrollmentDialogOpen} onClose={()=>setCertEnrollmentDialogOpen(false)} fullWidth>
            <DialogTitle>Выберите регистрацию</DialogTitle>
            <DialogContent dividers>
              {filteredCertEnrollments.map(e=>(
                <Box key={`${e.id.prisonerId}-${e.id.courseId}`} sx={{ mb:1 }}>
                  <Button fullWidth onClick={()=>handleSelectCertEnrollment(e)}>
                    ID:{e.id.prisonerId} — {e.prisoner.firstName} {e.prisoner.lastName} | 
                    {e.id.courseId} — {e.course.courseName}
                  </Button>
                </Box>
              ))}
            </DialogContent>
            <Button onClick={()=>setCertEnrollmentDialogOpen(false)}>Закрыть</Button>
          </Dialog>
        </>
      )}

      {/* Диалог просмотра PDF */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={certPdfDialogOpen}
        onClose={() => {
          setCertPdfDialogOpen(false);
          window.URL.revokeObjectURL(certPdfUrl);
        }}  
      >
        <DialogTitle>Просмотр сертификата</DialogTitle>
        <DialogContent sx={{ height:'80vh', p:0 }}>
          <iframe
            src={certPdfUrl}
            title="Certificate PDF"
            width="100%"
            height="100%"
            style={{ border:'none' }}
          />
        </DialogContent>
      </Dialog>

     <Dialog open={prisonerInfoDialogOpen} onClose={() => setPrisonerInfoDialogOpen(false)}>
<DialogTitle>Информация о заключённом</DialogTitle>
<DialogContent dividers>
  {viewPrisoner && (
    <>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          ID: {viewPrisoner.prisonerId}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Имя: {viewPrisoner.firstName}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Фамилия: {viewPrisoner.lastName}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Место рождения: {viewPrisoner.birthPlace}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Дата рождения: {viewPrisoner.dateOfBirth}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Профессия: {viewPrisoner.occupation}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Обвинение: {viewPrisoner.indictment}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Дата начала наказания: {viewPrisoner.intakeDate}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Дата окончания наказания: {viewPrisoner.sentenceEndDate}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Номер камеры: {viewPrisoner.cell?.cellNum}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Дата последнего обыска: {viewPrisoner.cell?.lastShakedownDate || "Нет данных"}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Уровень безопасности: {viewPrisoner.securityLevel?.securityLevelNo}
        </Button>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Button fullWidth disabled>
          Описание уровня безопасности: {viewPrisoner.securityLevel?.description || "Нет описания"}
        </Button>
      </Box>
    </>
  )}
</DialogContent>
<Button onClick={() => setPrisonerInfoDialogOpen(false)}>Закрыть</Button>



</Dialog>

      {/* Диалог подробностей курса */}
      <Dialog open={courseInfoDialogOpen} onClose={()=>setCourseInfoDialogOpen(false)}>
        <DialogTitle>Информация о курсе</DialogTitle>
        <DialogContent dividers>
          {viewCourse && (
            <>
              <Typography>ID: {viewCourse.courseId}</Typography>
              <Typography>Название: {viewCourse.courseName}</Typography>
              {viewCourse.description && (
                <Typography>Описание: {viewCourse.description}</Typography>
              )}
              {/* Другие поля из viewCourse */}
            </>
          )}
        </DialogContent>
        <Button onClick={()=>setCourseInfoDialogOpen(false)}>Закрыть</Button>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
        TransitionComponent={Slide}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}


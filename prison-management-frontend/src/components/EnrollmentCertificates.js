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
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

// API endpoints
const ENROLLMENTS_API_URL   = 'http://localhost:8080/api/enrollments';
const CERTIFICATES_API_URL  = 'http://localhost:8080/api/certificates';
const PRISONERS_API_URL     = 'http://localhost:8080/api/prisoners';
const COURSES_API_URL       = 'http://localhost:8080/api/courses';

export default function EnrollmentCertificates() {
  const [activeTab, setActiveTab] = useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [enrollRequest, setEnrollRequest] = useState({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });
  const [searchEnrollment, setSearchEnrollment] = useState('');

  const [prisonerDialogOpen, setPrisonerDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen]     = useState(false);
  const [prisonersList, setPrisonersList] = useState([]);
  const [coursesList, setCoursesList]     = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);
  const [loadingCourses, setLoadingCourses]     = useState(false);

  const [certRequest, setCertRequest]           = useState({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });
  const [searchCertEnrollment, setSearchCertEnrollment] = useState('');
  const [certEnrollmentDialogOpen, setCertEnrollmentDialogOpen] = useState(false);

  const [certificates, setCertificates]   = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const [snackbar, setSnackbar] = useState({ open:false, message:'', severity:'success' });
  const openSnackbar  = (msg, sev='success') => setSnackbar({ open:true, message:msg, severity:sev });
  const closeSnackbar = () => setSnackbar(s => ({ ...s, open:false }));

  // Load enrollments & certificates
  useEffect(() => { fetchEnrollments(); fetchCertificates(); }, []);
  async function fetchEnrollments() {
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
  }
  async function fetchCertificates() {
    setLoadingCertificates(true);
    try {
      const res = await fetch(CERTIFICATES_API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки сертификатов');
      setCertificates(await res.json());
    } catch (err) {
      openSnackbar(err.message, 'error');
    } finally {
      setLoadingCertificates(false);
    }
  }

  // --- Enrollment Dialogs ---
  const openPrisonerDialog = async () => {
    setLoadingPrisoners(true);
    try {
      const res = await fetch(PRISONERS_API_URL);
      if (!res.ok) throw new Error('Ошибка загрузки заключённых');
      setPrisonersList(await res.json());
    } catch (err) {
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
      openSnackbar(err.message, 'error');
    } finally {
      setLoadingCourses(false);
      setCourseDialogOpen(true);
    }
  };
  const handleSelectPrisoner = p => {
    setEnrollRequest(r => ({ ...r, prisonerId:String(p.prisonerId), prisonerInfo:p }));
    setPrisonerDialogOpen(false);
  };
  const handleSelectCourse = c => {
    if (c.deleted) return openSnackbar('Курс неактивен','warning');
    setEnrollRequest(r => ({ ...r, courseId:String(c.courseId), courseInfo:c }));
    setCourseDialogOpen(false);
  };

  // Create enrollment
  const handleEnrollSubmit = async e => {
    e.preventDefault();
    if (!enrollRequest.prisonerId||!enrollRequest.courseId) {
      return openSnackbar('Выберите заключённого и курс','warning');
    }
    try {
      const res = await fetch(ENROLLMENTS_API_URL, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ id:{ prisonerId:Number(enrollRequest.prisonerId), courseId:Number(enrollRequest.courseId) } })
      });
      if (!res.ok) throw new Error('Ошибка регистрации');
      openSnackbar('Регистрация добавлена');
      setEnrollRequest({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });
      fetchEnrollments();
    } catch(err) {
      openSnackbar(err.message,'error');
    }
  };

  // Filter enrollments
  const filteredEnrollments = useMemo(() => {
    if (!searchEnrollment.trim()) return enrollments;
    return enrollments.filter(e=>
      String(e.id.prisonerId).includes(searchEnrollment)||
      String(e.id.courseId).includes(searchEnrollment)
    );
  },[enrollments,searchEnrollment]);

  // Delete enrollment
  const handleDeleteEnrollment = e => {
    if (!window.confirm('Удалить регистрацию?')) return;
    fetch(`${ENROLLMENTS_API_URL}/${e.id.prisonerId}/${e.id.courseId}`,{ method:'DELETE' })
      .then(r=>{
        if(!r.ok) throw new Error();
        openSnackbar('Регистрация удалена');
        fetchEnrollments();
      })
      .catch(()=>openSnackbar('Ошибка удаления','error'));
  };

  // --- Certificate issuance ---
  const openCertDialog = () => setCertEnrollmentDialogOpen(true);
  const handleSelectCertEnrollment = e => {
    const exists = certificates.some(c=>c.id.prisonerId===e.id.prisonerId&&c.id.courseId===e.id.courseId);
    if (exists) return openSnackbar('Сертификат уже выдан','warning');
    if (e.course.deleted) return openSnackbar('Курс неактивен','warning');
    setCertRequest({ prisonerId:String(e.id.prisonerId), prisonerInfo:e.prisoner, courseId:String(e.id.courseId), courseInfo:e.course });
    setCertEnrollmentDialogOpen(false);
  };
  const filteredCertEnrollments = useMemo(()=>{
    if(!searchCertEnrollment.trim()) return enrollments;
    return enrollments.filter(e=>
      String(e.id.prisonerId).includes(searchCertEnrollment)||
      String(e.id.courseId).includes(searchCertEnrollment)
    );
  },[enrollments,searchCertEnrollment]);
  function getCertificateStatus(e) {
    const given = certificates.some(c=>c.id.prisonerId===e.id.prisonerId&&c.id.courseId===e.id.courseId);
    let status = given?'Выдан':'Не выдан';
    if(e.course.deleted) status+= ' (Не активен)';
    return status;
  }
  const handleCertSubmit = async e => {
    e.preventDefault();
    if(!certRequest.prisonerId||!certRequest.courseId) return openSnackbar('Выберите регистрацию','warning');
    const exists = certificates.some(c=>c.id.prisonerId===Number(certRequest.prisonerId)&&c.id.courseId===Number(certRequest.courseId));
    if(exists) return openSnackbar('Сертификат уже выдан','warning');
    try{
      const res = await fetch(CERTIFICATES_API_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id:{ prisonerId:Number(certRequest.prisonerId), courseId:Number(certRequest.courseId) } })
      });
      if(!res.ok) throw new Error('Ошибка выдачи сертификата');
      openSnackbar('Сертификат выдан');
      setCertRequest({ prisonerId:'', prisonerInfo:null, courseId:'', courseInfo:null });
      fetchCertificates();
    }catch(err){
      openSnackbar(err.message,'error');
    }
  };
  const handleDeleteCertificate = cert => {
    if(!window.confirm('Удалить сертификат?')) return;
    fetch(`${CERTIFICATES_API_URL}/${cert.id.prisonerId}/${cert.id.courseId}`,{ method:'DELETE' })
      .then(r=>{
        if(!r.ok) throw new Error();
        openSnackbar('Сертификат удалён');
        fetchCertificates();
      })
      .catch(()=>openSnackbar('Ошибка удаления','error'));
  };

  return (
    <Paper sx={{p:3,maxWidth:1200,mx:'auto',my:3,boxShadow:4}}>
      <Typography variant="h4" align="center" gutterBottom>
        Регистрация и выдача сертификатов
      </Typography>
      <Tabs value={activeTab} onChange={(e,v)=>setActiveTab(v)} centered sx={{mb:3}}>
        <Tab label="Регистрации"/>
        <Tab label="Сертификаты"/>
      </Tabs>

      {activeTab===0 && <>
        {/* Registration Form */}
        <Box component="form" onSubmit={handleEnrollSubmit} sx={{mb:3}}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Закл. ID"
              value={enrollRequest.prisonerId}
              onClick={openPrisonerDialog}
              InputProps={{readOnly:true}}
              placeholder="Выбрать"
              sx={{cursor:'pointer'}}
            />
            <TextField
              label="Курс ID"
              value={enrollRequest.courseId}
              onClick={openCourseDialog}
              InputProps={{readOnly:true}}
              placeholder="Выбрать"
              sx={{cursor:'pointer'}}
            />
            <Button type="submit" variant="contained">Добавить</Button>
          </Stack>
        </Box>

        {/* Search + Table */}
        <Stack direction="row" spacing={2} sx={{mb:2}}>
          <TextField
            placeholder="Поиск"
            size="small"
            value={searchEnrollment}
            onChange={e=>setSearchEnrollment(e.target.value)}
            InputProps={{
              startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>
            }}
            sx={{width:300}}
          />
          {loadingEnrollments && <CircularProgress size={24}/>}
        </Stack>
        {loadingEnrollments
          ? <Box sx={{display:'flex',justifyContent:'center',mt:3}}><CircularProgress/></Box>
          : <Table>
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
                    <TableCell>{e.id.prisonerId}</TableCell>
                    <TableCell>{e.id.courseId}</TableCell>
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
        }

        {/* Prisoner Select Dialog */}
        <Dialog open={prisonerDialogOpen} onClose={()=>setPrisonerDialogOpen(false)} fullWidth>
          <DialogTitle>Выберите заключённого</DialogTitle>
          <DialogContent dividers>
            {loadingPrisoners
              ? <CircularProgress/>
              : (prisonersList.map(p=>(
                  <Box key={p.prisonerId} sx={{mb:1}}>
                    <Button fullWidth onClick={()=>handleSelectPrisoner(p)}>
                      ID:{p.prisonerId} — {p.firstName} {p.lastName}
                    </Button>
                  </Box>
                )))
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setPrisonerDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        {/* Course Select Dialog */}
        <Dialog open={courseDialogOpen} onClose={()=>setCourseDialogOpen(false)} fullWidth>
          <DialogTitle>Выберите курс</DialogTitle>
          <DialogContent dividers>
            {loadingCourses
              ? <CircularProgress/>
              : (coursesList.map(c=>(
                  <Box key={c.courseId} sx={{mb:1}}>
                    <Button
                      fullWidth
                      disabled={c.deleted}
                      onClick={()=>handleSelectCourse(c)}
                    >
                      ID:{c.courseId} — {c.courseName}{c.deleted && ' (Не активен)'}
                    </Button>
                  </Box>
                )))
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setCourseDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </>}


      {activeTab===1 && <>
        {/* Certificate issuance */}
        <Box component="form" onSubmit={handleCertSubmit} sx={{mb:3}}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Выбрать регистрацию"
              value={certRequest.prisonerId && certRequest.courseId
                ? `ID:${certRequest.prisonerId}|Курс:${certRequest.courseId}` : ''}
              InputProps={{readOnly:true}}
              sx={{cursor:'pointer',flexGrow:1}}
              onClick={openCertDialog}
            />
            <Button type="submit" variant="contained">Выдать</Button>
          </Stack>
        </Box>

        {/* Search + Table */}
        <Stack direction="row" spacing={2} sx={{mb:2}}>
          <TextField
            placeholder="Поиск"
            size="small"
            value={searchCertEnrollment}
            onChange={e=>setSearchCertEnrollment(e.target.value)}
            InputProps={{
              startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>
            }}
            sx={{width:300}}
          />
          {loadingCertificates && <CircularProgress size={24}/>}
        </Stack>
        {loadingCertificates
          ? <Box sx={{display:'flex',justifyContent:'center',mt:3}}><CircularProgress/></Box>
          : <Table>
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
                    <TableCell>{e.id.prisonerId}</TableCell>
                    <TableCell>{e.id.courseId}</TableCell>
                    <TableCell>{getCertificateStatus(e)}</TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={()=>handleDeleteCertificate(
                        certificates.find(c=>c.id.prisonerId===e.id.prisonerId&&c.id.courseId===e.id.courseId)
                      )}>
                        <DeleteIcon/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        }

        {/* Cert enrollment dialog */}
        <Dialog open={certEnrollmentDialogOpen} onClose={()=>setCertEnrollmentDialogOpen(false)} fullWidth>
          <DialogTitle>Выберите регистрацию</DialogTitle>
          <DialogContent dividers>
            {filteredCertEnrollments.map(e=>(
              <Box key={`${e.id.prisonerId}-${e.id.courseId}`} sx={{mb:1}}>
                <Button fullWidth onClick={()=>handleSelectCertEnrollment(e)}>
                  ID:{e.id.prisonerId} — {e.prisoner.firstName} | {e.id.courseId} — {e.course.courseName}
                </Button>
              </Box>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setCertEnrollmentDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </>}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

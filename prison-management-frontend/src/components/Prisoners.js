import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, TextField, Button, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Box, Snackbar, Alert, Stack,
  Slide
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon,
  Book as BookIcon, CardMembership as CertificateIcon
} from '@mui/icons-material';

const API_URL = 'http://localhost:8080/api/prisoners';
const CELLS_API_URL = 'http://localhost:8080/api/cells';
const SECURITY_LEVELS_API_URL = 'http://localhost:8080/api/sl';
const BORROWED_API_URL = 'http://localhost:8080/api/borrowed';
const CERTIFICATES_API_URL = 'http://localhost:8080/api/ownCertificateFrom';

const defaultHeaders = { 'Content-Type': 'application/json' };
const fetchOptions = overrides => ({ headers: defaultHeaders, credentials: 'include', ...overrides });

export default function Prisoners({ readOnly = false }) {
  // Основное состояние
  const [prisoners, setPrisoners] = useState([]);
  const [formData, setFormData] = useState({
    prisonerId: '',
    firstName: '',
    lastName: '',
    birthPlace: '',
    dateOfBirth: '',
    occupation: '',
    indictment: '',
    intakeDate: '',
    sentenceEndDate: '',
    cellNum: '',
    securityLevelId: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Диалоги камер
  const [cells, setCells] = useState([]);
  const [cellDialogOpen, setCellDialogOpen] = useState(false);
  const [newCellNum, setNewCellNum] = useState('');

  // Диалоги уровней защиты
  const [securityLevels, setSecurityLevels] = useState([]);
  const [securityLevelDialogOpen, setSecurityLevelDialogOpen] = useState(false);
  const [newSecurityLevel, setNewSecurityLevel] = useState('');

  // Книги и сертификаты
  const [borrowedData, setBorrowedData] = useState([]);
  const [certificateData, setCertificateData] = useState([]);
  const [booksDialogOpen, setBooksDialogOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [certificatesDialogOpen, setCertificatesDialogOpen] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState([]);

  // Ошибки / снэкбар
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const showError = msg => { setErrorMessage(msg); setSnackbarOpen(true); };
  const closeSnackbar = () => setSnackbarOpen(false);

  // Загрузка данных при старте
  useEffect(() => {
    fetch(API_URL, fetchOptions())
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setPrisoners)
      .catch(() => showError('Ошибка загрузки заключённых'));

    fetch(BORROWED_API_URL, fetchOptions())
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setBorrowedData)
      .catch(() => showError('Ошибка загрузки книг'));

    fetch(CERTIFICATES_API_URL, fetchOptions())
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setCertificateData)
      .catch(() => showError('Ошибка загрузки сертификатов'));
  }, []);

  // Обработчики формы
  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  const clearForm = () => setFormData({
    prisonerId: '', firstName: '', lastName: '',
    birthPlace: '', dateOfBirth: '', occupation: '',
    indictment: '', intakeDate: '', sentenceEndDate: '',
    cellNum: '', securityLevelId: '',
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (readOnly) return;
    const payload = {
      prisonerId: Number(formData.prisonerId),
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthPlace: formData.birthPlace,
      dateOfBirth: formData.dateOfBirth,
      occupation: formData.occupation,
      indictment: formData.indictment,
      intakeDate: formData.intakeDate,
      sentenceEndDate: formData.sentenceEndDate,
      cell: { cellNum: Number(formData.cellNum) },
      securityLevel: { securityLevelNo: Number(formData.securityLevelId) },
    };
    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, fetchOptions({ method, body: JSON.stringify(payload) }));
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setPrisoners(prev =>
        editingId
          ? prev.map(p => p.prisonerId === editingId ? saved : p)
          : [...prev, saved]
      );
      setEditingId(null);
      clearForm();
    } catch {
      showError('Ошибка при сохранении');
    }
  };

  const handleEdit = p => {
    if (readOnly) return;
    setEditingId(p.prisonerId);
    setFormData({
      prisonerId: p.prisonerId,
      firstName: p.firstName,
      lastName: p.lastName,
      birthPlace: p.birthPlace,
      dateOfBirth: p.dateOfBirth,
      occupation: p.occupation,
      indictment: p.indictment,
      intakeDate: p.intakeDate,
      sentenceEndDate: p.sentenceEndDate,
      cellNum: p.cell?.cellNum || '',
      securityLevelId: p.securityLevel?.securityLevelNo || '',
    });
  };

  const handleDelete = async id => {
    if (readOnly) return;
    if (borrowedData.some(b => b.prisoner?.prisonerId === id)) {
      return showError(`Нельзя удалить: у ${id} есть книги`);
    }
    try {
      const res = await fetch(`${API_URL}/${id}`, fetchOptions({ method: 'DELETE' }));
      if (!res.ok) throw new Error();
      setPrisoners(prev => prev.filter(p => p.prisonerId !== id));
      if (editingId === id) { setEditingId(null); clearForm(); }
    } catch {
      showError('Ошибка при удалении');
    }
  };

  // Диалог выбора камер
  const openCellDialog = async () => {
    try {
      const res = await fetch(CELLS_API_URL, fetchOptions());
      if (!res.ok) throw new Error();
      setCells(await res.json());
      setCellDialogOpen(true);
    } catch {
      showError('Ошибка загрузки камер');
    }
  };
  const handleSelectCell = num => {
    setFormData(f => ({ ...f, cellNum: num }));
    setCellDialogOpen(false);
  };
  const handleCreateCell = async () => {
    if (readOnly) return;
    const num = Number(newCellNum);
    if (cells.some(c => c.cellNum === num)) {
      return showError('Камера уже существует');
    }
    try {
      const res = await fetch(CELLS_API_URL, fetchOptions({ method: 'POST', body: JSON.stringify({ cellNum: num }) }));
      if (!res.ok) throw new Error();
      const created = await res.json();
      setCells(prev => [...prev, created]);
      setNewCellNum('');
    } catch {
      showError('Ошибка создания камеры');
    }
  };

  // Диалог выбора уровней защиты
  const openSecurityLevelDialog = async () => {
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL, fetchOptions());
      if (!res.ok) throw new Error();
      setSecurityLevels(await res.json());
      setSecurityLevelDialogOpen(true);
    } catch {
      showError('Ошибка загрузки уровней защиты');
    }
  };
  const handleSelectSecurityLevel = num => {
    setFormData(f => ({ ...f, securityLevelId: num }));
    setSecurityLevelDialogOpen(false);
  };
  const handleCreateSecurityLevel = async () => {
    if (readOnly) return;
    const lvl = Number(newSecurityLevel);
    if (securityLevels.some(l => l.securityLevelNo === lvl)) {
      return showError('Уровень уже существует');
    }
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL, fetchOptions({ method: 'POST', body: JSON.stringify({ securityLevelNo: lvl }) }));
      if (!res.ok) throw new Error();
      const created = await res.json();
      setSecurityLevels(prev => [...prev, created]);
      setNewSecurityLevel('');
    } catch {
      showError('Ошибка создания уровня');
    }
  };

  // Диалоги книг и сертификатов
  const openBooksDialog = p => {
    setSelectedBooks(borrowedData.filter(b => b.prisoner?.prisonerId === p.prisonerId));
    setBooksDialogOpen(true);
  };
  const openCertificatesDialog = p => {
    setSelectedCertificates(certificateData.filter(c => c.prisoner?.prisonerId === p.prisonerId));
    setCertificatesDialogOpen(true);
  };
  const handleIssueCertificate = async cert => {
    if (readOnly) return;
    try {
      const { prisoner, id } = cert;
      const res = await fetch(`${CERTIFICATES_API_URL}/${prisoner.prisonerId}/${id.courseId}`, fetchOptions({ method: 'DELETE' }));
      if (!res.ok) throw new Error();
      setCertificateData(prev =>
        prev.filter(c => !(c.prisoner.prisonerId === prisoner.prisonerId && c.id.courseId === id.courseId))
      );
      setSelectedCertificates(prev =>
        prev.filter(c => !(c.prisoner.prisonerId === prisoner.prisonerId && c.id.courseId === id.courseId))
      );
    } catch {
      showError('Ошибка выдачи сертификата');
    }
  };

  // Фильтрация списка
  const filteredPrisoners = prisoners.filter(p =>
    Object.values(p)
      .flatMap(v => (v && typeof v === 'object' ? Object.values(v) : [v]))
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Рендер-диалоги
  const renderCellDialog = () => (
    <Dialog open={cellDialogOpen} onClose={() => setCellDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Список камер</DialogTitle>
      <DialogContent sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Номер камеры</TableCell></TableRow></TableHead>
          <TableBody>
            {cells.map(c => (
              <TableRow
                key={c.cellNum}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleSelectCell(c.cellNum)}
              >
                <TableCell>{c.cellNum}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!readOnly && (
          <TextField
            fullWidth
            label="Новая камера (номер)"
            type="number"
            value={newCellNum}
            onChange={e => setNewCellNum(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCellDialogOpen(false)}>Закрыть</Button>
        {!readOnly && <Button onClick={handleCreateCell} variant="contained">Создать</Button>}
      </DialogActions>
    </Dialog>
  );

  const renderSecurityLevelDialog = () => (
    <Dialog open={securityLevelDialogOpen} onClose={() => setSecurityLevelDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Список уровней защиты</DialogTitle>
      <DialogContent sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Номер</TableCell></TableRow></TableHead>
          <TableBody>
            {securityLevels.map(l => (
              <TableRow
                key={l.securityLevelNo}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleSelectSecurityLevel(l.securityLevelNo)}
              >
                <TableCell>{l.securityLevelNo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!readOnly && (
          <TextField
            fullWidth
            label="Новый уровень защиты (номер)"
            type="number"
            value={newSecurityLevel}
            onChange={e => setNewSecurityLevel(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSecurityLevelDialogOpen(false)}>Закрыть</Button>
        {!readOnly && <Button onClick={handleCreateSecurityLevel} variant="contained">Создать</Button>}
      </DialogActions>
    </Dialog>
  );

  const renderBooksDialog = () => (
    <Dialog open={booksDialogOpen} onClose={() => setBooksDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Книги заключённого</DialogTitle>
      <DialogContent>
        {selectedBooks.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {selectedBooks.map((b, i) => (
              <li key={i}>
                ISBN: {b.id?.isbn}{b.library?.title && ` – ${b.library.title}`}
              </li>
            ))}
          </Box>
        ) : (
          <Typography>Нет книг</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBooksDialogOpen(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );

  const renderCertificatesDialog = () => (
    <Dialog open={certificatesDialogOpen} onClose={() => setCertificatesDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Сертификаты заключённого</DialogTitle>
      <DialogContent>
        {selectedCertificates.length > 0 ? (
          <Stack spacing={2}>
            {selectedCertificates.map((c, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>
                  {c.course?.courseName || `ID курса ${c.id.courseId}`}
                </Typography>
                {!readOnly && (
                  <Button size="small" startIcon={<CertificateIcon />} onClick={() => handleIssueCertificate(c)}>
                    Забрать
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography>Нет сертификатов</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCertificatesDialogOpen(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Paper sx={{ p: 4, maxWidth: 1400, m: 'auto', borderRadius: 2, boxShadow: 3, bgcolor: '#fafafa' }}>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} TransitionComponent={Slide}>
        <Alert onClose={closeSnackbar} severity="error">{errorMessage}</Alert>
      </Snackbar>

      <Typography variant="h4" align="center" gutterBottom>Управление заключёнными</Typography>

      {!readOnly && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">{editingId ? 'Редактировать заключённого' : 'Добавить заключённого'}</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="ID" name="prisonerId" type="number" value={formData.prisonerId} onChange={handleChange} required disabled={!!editingId} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Имя" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Фамилия" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Место рождения" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Дата рождения" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Профессия" name="occupation" value={formData.occupation} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Обвинение" name="indictment" value={formData.indictment} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Начало наказания" name="intakeDate" type="date" value={formData.intakeDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Конец наказания" name="sentenceEndDate" type="date" value={formData.sentenceEndDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Номер камеры" name="cellNum" value={formData.cellNum} onClick={openCellDialog} helperText="Нажмите, чтобы выбрать камеру" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Уровень защиты" name="securityLevelId" value={formData.securityLevelId} onClick={openSecurityLevelDialog} helperText="Нажмите, чтобы выбрать уровень защиты" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="contained" type="submit" fullWidth>{editingId ? 'Сохранить' : 'Добавить'}</Button>
              </Grid>
              {editingId && (
                <Grid item xs={12} sm={4}>
                  <Button variant="outlined" fullWidth onClick={() => { setEditingId(null); clearForm(); }}>Отмена</Button>
                </Grid>
              )}
            </Grid>
          </form>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Поиск заключённого</Typography>
        <TextField fullWidth placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </Box>

      <Paper sx={{ mb: 4, overflowX: 'auto' }}>
        <Typography variant="h5" align="center" sx={{ py: 2, bgcolor: '#1976d2', color: '#fff' }}>Список заключённых</Typography>
        <Table>
          <TableHead sx={{ bgcolor: '#e3f2fd' }}>
            <TableRow>
              {['ID','Имя','Фамилия','Родился','Дата рожд.','Профессия','Обвинение','Начало','Конец','Камера','Ур. защиты','Книги','Сертификаты','Действия']
                .map(h => <TableCell key={h} align={h==='Действия'?'center':'left'}>{h}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrisoners.map(p => (
              <TableRow key={p.prisonerId} hover>
                <TableCell>{p.prisonerId}</TableCell>
                <TableCell>{p.firstName}</TableCell>
                <TableCell>{p.lastName}</TableCell>
                <TableCell>{p.birthPlace}</TableCell>
                <TableCell>{p.dateOfBirth}</TableCell>
                <TableCell>{p.occupation}</TableCell>
                <TableCell>{p.indictment}</TableCell>
                <TableCell>{p.intakeDate}</TableCell>
                <TableCell>{p.sentenceEndDate}</TableCell>
                <TableCell onClick={openCellDialog} sx={{cursor:'pointer',color:'#1976d2',textDecoration:'underline'}}>{p.cell?.cellNum}</TableCell>
                <TableCell onClick={openSecurityLevelDialog} sx={{cursor:'pointer',color:'#1976d2',textDecoration:'underline'}}>{p.securityLevel?.securityLevelNo}</TableCell>
                <TableCell><Button size="small" startIcon={<BookIcon />} onClick={() => openBooksDialog(p)}>Книги</Button></TableCell>
                <TableCell><Button size="small" startIcon={<CertificateIcon />} onClick={() => openCertificatesDialog(p)}>Сертификаты</Button></TableCell>
                <TableCell align="center">
                  {!readOnly && (
                    <>
                      <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={() => handleEdit(p)} sx={{mr:1}}>Ред.</Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(p.prisonerId)}>Удл.</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {renderCellDialog()}
      {renderSecurityLevelDialog()}
      {renderBooksDialog()}
      {renderCertificatesDialog()}
    </Paper>
  );
}

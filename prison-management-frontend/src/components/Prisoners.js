import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  CardMembership as CertificateIcon,
} from '@mui/icons-material';

const API_URL = 'http://localhost:8080/api/prisoners';
const CELLS_API_URL = 'http://localhost:8080/api/cells';
const SECURITY_LEVELS_API_URL = 'http://localhost:8080/api/sl';
const BORROWED_API_URL = 'http://localhost:8080/api/borrowed';
const CERTIFICATES_API_URL = 'http://localhost:8080/api/ownCertificateFrom';

const Prisoners = () => {
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
  const [cellDialogOpen, setCellDialogOpen] = useState(false);
  const [cells, setCells] = useState([]);
  const [newCellNum, setNewCellNum] = useState('');
  const [securityLevelDialogOpen, setSecurityLevelDialogOpen] = useState(false);
  const [securityLevels, setSecurityLevels] = useState([]);
  const [newSecurityLevel, setNewSecurityLevel] = useState('');
  const [borrowedData, setBorrowedData] = useState([]);
  const [certificateData, setCertificateData] = useState([]);
  const [booksDialogOpen, setBooksDialogOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [certificatesDialogOpen, setCertificatesDialogOpen] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState([]);

  // Состояния для отображения ошибок
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Функции для работы с уведомлением об ошибке
  const showError = (msg) => {
    setErrorMessage(msg);
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Загрузка данных заключённых
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setPrisoners)
      .catch(() => showError('Ошибка получения данных заключённых'));
  }, []);

  // Загрузка данных книг
  useEffect(() => {
    fetch(BORROWED_API_URL)
      .then((res) => res.json())
      .then(setBorrowedData)
      .catch(() => showError('Ошибка получения данных о книгах'));
  }, []);

  // Загрузка данных сертификатов
  useEffect(() => {
    fetch(CERTIFICATES_API_URL)
      .then((res) => res.json())
      .then(setCertificateData)
      .catch(() => showError('Ошибка получения данных сертификатов'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () =>
    setFormData({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      let response;
      if (editingId !== null) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const saved = await response.json();
        if (editingId !== null) {
          setPrisoners((prev) =>
            prev.map((p) => (p.prisonerId === editingId ? saved : p))
          );
          setEditingId(null);
        } else {
          setPrisoners((prev) => [...prev, saved]);
        }
        clearForm();
      } else {
        const err = await response.json();
        showError(err.message || 'Неизвестная ошибка сервера');
      }
    } catch {
      showError('Ошибка при отправке данных');
    }
  };

  const handleEdit = (prisoner) => {
    setEditingId(prisoner.prisonerId);
    setFormData({
      prisonerId: prisoner.prisonerId,
      firstName: prisoner.firstName,
      lastName: prisoner.lastName,
      birthPlace: prisoner.birthPlace,
      dateOfBirth: prisoner.dateOfBirth,
      occupation: prisoner.occupation,
      indictment: prisoner.indictment,
      intakeDate: prisoner.intakeDate,
      sentenceEndDate: prisoner.sentenceEndDate,
      cellNum: prisoner.cell?.cellNum || '',
      securityLevelId: prisoner.securityLevel?.securityLevelNo || '',
    });
  };

  const handleDelete = async (id) => {
    const prisoner = prisoners.find((p) => p.prisonerId === id);
    const hasBooks = borrowedData.some(
      (item) => item.prisoner?.prisonerId === id
    );
    if (hasBooks) {
      showError(`Невозможно удалить заключённого с id ${id}: есть выданные книги.`);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setPrisoners((prev) => prev.filter((p) => p.prisonerId !== id));
        if (editingId === id) {
          setEditingId(null);
          clearForm();
        }
      } else {
        const err = await response.json();
        showError(err.message || 'Ошибка удаления заключённого');
      }
    } catch {
      showError('Ошибка при удалении');
    }
  };

  const openCellDialog = async () => {
    try {
      const res = await fetch(CELLS_API_URL);
      if (res.ok) {
        setCells(await res.json());
      } else {
        showError('Ошибка получения списка камер');
      }
    } catch {
      showError('Ошибка при запросе списка камер');
    }
    setCellDialogOpen(true);
  };

  const handleCreateCell = async () => {
    const num = Number(newCellNum);
    if (cells.some((c) => c.cellNum === num)) {
      showError('Камера с таким номером уже существует.');
      return;
    }
    try {
      const res = await fetch(CELLS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellNum: num }),
      });
      if (res.ok) {
        const created = await res.json();
        setCells((prev) => [...prev, created]);
        setNewCellNum('');
      } else {
        showError('Ошибка при создании новой камеры');
      }
    } catch {
      showError('Ошибка при запросе создания камеры');
    }
  };

  const openSecurityLevelDialog = async () => {
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL);
      if (res.ok) {
        setSecurityLevels(await res.json());
      } else {
        showError('Ошибка получения уровней защиты');
      }
    } catch {
      showError('Ошибка при запросе уровней защиты');
    }
    setSecurityLevelDialogOpen(true);
  };

  const handleCreateSecurityLevel = async () => {
    const lvl = Number(newSecurityLevel);
    if (securityLevels.some((l) => l.securityLevelNo === lvl)) {
      showError('Уровень защиты с таким номером уже существует.');
      return;
    }
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ securityLevelNo: lvl }),
      });
      if (res.ok) {
        const created = await res.json();
        setSecurityLevels((prev) => [...prev, created]);
        setNewSecurityLevel('');
      } else {
        showError('Ошибка при создании уровня защиты');
      }
    } catch {
      showError('Ошибка при запросе создания уровня защиты');
    }
  };

  const handleSelectCell = (cellNum) => {
    setFormData((prev) => ({ ...prev, cellNum }));
    setCellDialogOpen(false);
  };

  const handleSelectSecurityLevel = (securityLevelNo) => {
    setFormData((prev) => ({ ...prev, securityLevelId: securityLevelNo }));
    setSecurityLevelDialogOpen(false);
  };

  const openBooksDialogHandler = (prisoner) => {
    setSelectedBooks(
      borrowedData.filter((b) => b.prisoner?.prisonerId === prisoner.prisonerId)
    );
    setBooksDialogOpen(true);
  };

  const openCertificatesDialogHandler = (prisoner) => {
    setSelectedCertificates(
      certificateData.filter(
        (c) => c.prisoner?.prisonerId === prisoner.prisonerId
      )
    );
    setCertificatesDialogOpen(true);
  };

  const handleIssueCertificate = async (cert) => {
    try {
      const { prisoner, id } = cert;
      const res = await fetch(
        `${CERTIFICATES_API_URL}/${prisoner.prisonerId}/${id.courseId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        alert('Сертификат выдан (удалён из списка ожидания)');
        // Обновляем списки
        setCertificateData((prev) =>
          prev.filter(
            (c) =>
              !(
                c.prisoner.prisonerId === prisoner.prisonerId &&
                c.id.courseId === id.courseId
              )
          )
        );
        setSelectedCertificates((prev) =>
          prev.filter(
            (c) =>
              !(
                c.prisoner.prisonerId === prisoner.prisonerId &&
                c.id.courseId === id.courseId
              )
          )
        );
      } else {
        const err = await res.json();
        showError(err.message || 'Ошибка при выдаче сертификата');
      }
    } catch {
      showError('Ошибка при запросе выдачи сертификата');
    }
  };

  const filteredPrisoners = prisoners.filter((p) =>
    Object.values(p)
      .flatMap((v) =>
        v && typeof v === 'object' ? Object.values(v) : [v]
      )
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Диалог выбора камер
  const renderCellDialog = () => (
    <Dialog open={cellDialogOpen} onClose={() => setCellDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Список камер</DialogTitle>
      <DialogContent sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Номер камеры</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cells.map((cell) => (
              <TableRow
                key={cell.cellNum}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleSelectCell(cell.cellNum)}
              >
                <TableCell>{cell.cellNum}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TextField
          fullWidth
          label="Новая камера (номер)"
          value={newCellNum}
          onChange={(e) => setNewCellNum(e.target.value)}
          type="number"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCellDialogOpen(false)}>Закрыть</Button>
        <Button onClick={handleCreateCell} variant="contained">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Диалог выбора уровня защиты
  const renderSecurityLevelDialog = () => (
    <Dialog open={securityLevelDialogOpen} onClose={() => setSecurityLevelDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Список уровней защиты</DialogTitle>
      <DialogContent sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {securityLevels.map((lvl) => (
              <TableRow
                key={lvl.securityLevelNo}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleSelectSecurityLevel(lvl.securityLevelNo)}
              >
                <TableCell>{lvl.securityLevelNo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TextField
          fullWidth
          label="Новый уровень защиты (номер)"
          value={newSecurityLevel}
          onChange={(e) => setNewSecurityLevel(e.target.value)}
          type="number"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSecurityLevelDialogOpen(false)}>Закрыть</Button>
        <Button onClick={handleCreateSecurityLevel} variant="contained">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Диалог книг
  const renderBooksDialog = () => (
    <Dialog open={booksDialogOpen} onClose={() => setBooksDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Книги заключённого</DialogTitle>
      <DialogContent>
        {selectedBooks.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {selectedBooks.map((b, i) => (
              <li key={i}>
                ISBN: {b.id?.isbn} {b.library?.title ? `– ${b.library.title}` : ''}
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

  // Диалог сертификатов
  const renderCertificatesDialog = () => (
    <Dialog open={certificatesDialogOpen} onClose={() => setCertificatesDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Сертификаты заключённого</DialogTitle>
      <DialogContent>
        {selectedCertificates.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {selectedCertificates.map((c, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography>
                  Курс: {c.course?.courseName || `ID курса ${c.id.courseId}`}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CertificateIcon />}
                  onClick={() => handleIssueCertificate(c)}
                >
                  Забрать
                </Button>
              </Box>
            ))}
          </Box>
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
    <Paper sx={{ p: 4, maxWidth: 1400, m: 'auto', borderRadius: 2, boxShadow: 3, bgcolor: '#f9f9f9' }}>
      {/* Уведомление об ошибке */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
        Управление заключёнными
      </Typography>

      {/* Форма добавления/редактирования */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Редактировать заключённого' : 'Добавить заключённого'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ID"
                type="number"
                name="prisonerId"
                value={formData.prisonerId}
                onChange={handleChange}
                required
                disabled={editingId !== null}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
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
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Место рождения"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Дата рождения"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Профессия"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Обвинение"
                name="indictment"
                value={formData.indictment}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Начало наказания"
                type="date"
                name="intakeDate"
                value={formData.intakeDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Конец наказания"
                type="date"
                name="sentenceEndDate"
                value={formData.sentenceEndDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Номер камеры"
                name="cellNum"
                value={formData.cellNum}
                onClick={openCellDialog}
                helperText="Нажмите, чтобы выбрать камеру"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Уровень защиты"
                name="securityLevelId"
                value={formData.securityLevelId}
                onClick={openSecurityLevelDialog}
                helperText="Нажмите, чтобы выбрать уровень защиты"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="contained" type="submit" fullWidth>
                {editingId ? 'Сохранить' : 'Добавить'}
              </Button>
            </Grid>
            {editingId && (
              <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    setEditingId(null);
                    clearForm();
                  }}
                >
                  Отмена
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>

      {/* Поиск */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Поиск заключённого
        </Typography>
        <TextField
          fullWidth
          placeholder="Введите текст для поиска"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Таблица */}
      <Paper sx={{ mb: 4, overflowX: 'auto', boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h5" align="center" sx={{ py: 2, bgcolor: '#1976d2', color: '#fff' }}>
          Список заключённых
        </Typography>
        <Table>
          <TableHead sx={{ bgcolor: '#e3f2fd' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Фамилия</TableCell>
              <TableCell>Место рождения</TableCell>
              <TableCell>Дата рождения</TableCell>
              <TableCell>Профессия</TableCell>
              <TableCell>Обвинение</TableCell>
              <TableCell>Начало наказания</TableCell>
              <TableCell>Конец наказания</TableCell>
              <TableCell>Камера</TableCell>
              <TableCell>Уровень защиты</TableCell>
              <TableCell>Книги</TableCell>
              <TableCell>Сертификаты</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrisoners.map((p) => (
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
                <TableCell
                  onClick={openCellDialog}
                  sx={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                >
                  {p.cell?.cellNum}
                </TableCell>
                <TableCell
                  onClick={openSecurityLevelDialog}
                  sx={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                >
                  {p.securityLevel?.securityLevelNo}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BookIcon />}
                    onClick={() => openBooksDialogHandler(p)}
                  >
                    Книги
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CertificateIcon />}
                    onClick={() => openCertificatesDialogHandler(p)}
                  >
                    Сертификаты
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => handleEdit(p)}
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                  >
                    Ред.
                  </Button>
                  <Button
                    onClick={() => handleDelete(p.prisonerId)}
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                  >
                    Удалить
                  </Button>
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
};

export default Prisoners;

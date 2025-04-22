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
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Book as BookIcon, 
  CardMembership as CertificateIcon 
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

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setPrisoners)
      .catch((err) => console.error('Ошибка получения данных заключённых:', err));
  }, []);

  useEffect(() => {
    fetch(BORROWED_API_URL)
      .then((res) => res.json())
      .then(setBorrowedData)
      .catch((err) => console.error('Ошибка получения данных книг:', err));
  }, []);

  useEffect(() => {
    fetch(CERTIFICATES_API_URL)
      .then((res) => res.json())
      .then(setCertificateData)
      .catch((err) => console.error('Ошибка получения сертификатов:', err));
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
    const newData = {
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
      if (editingId !== null) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData),
        });
        if (response.ok) {
          setPrisoners((prev) =>
            prev.map((p) => (p.prisonerId === editingId ? newData : p))
          );
          setEditingId(null);
        } else {
          console.error('Ошибка обновления заключённого');
        }
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData),
        });
        if (response.ok) {
          const savedPrisoner = await response.json();
          setPrisoners((prev) => [...prev, savedPrisoner]);
        } else {
          console.error('Ошибка добавления заключённого');
        }
      }
      clearForm();
    } catch (error) {
      console.error('Ошибка при отправке данных:', error);
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
    // Проверяем, есть ли у заключённого связанные книги
    const prisoner = prisoners.find((p) => p.prisonerId === id);
    const prisonerBooks = borrowedData.filter(
      (item) => item.prisoner?.prisonerId === prisoner.prisonerId
    );
    if (prisonerBooks.length > 0) {
      alert(`Невозможно удалить заключённого с id ${id}, так как у него имеются книги.`);
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
        console.error('Ошибка удаления заключённого');
      }
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  const filteredPrisoners = prisoners.filter((p) =>
    Object.values(p)
      .flatMap((v) =>
        typeof v === 'object' && v !== null ? Object.values(v) : v
      )
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const openCellDialog = async () => {
    try {
      const res = await fetch(CELLS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setCells(data);
      } else {
        console.error('Ошибка получения камер');
      }
    } catch (err) {
      console.error('Ошибка получения камер:', err);
    }
    setCellDialogOpen(true);
  };

  // Теперь функция handleIssueCertificate удаляет сертификат
  const handleIssueCertificate = async (cert) => {
    try {
      const { prisoner, id } = cert;
      const response = await fetch(
        `${CERTIFICATES_API_URL}/${prisoner.prisonerId}/${id.courseId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        alert('Сертификат удалён успешно');
        // Обновляем состояние, удаляя удалённый сертификат из списка
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
        alert('Ошибка при удалении сертификата');
      }
    } catch (error) {
      console.error('Ошибка при удалении сертификата:', error);
    }
  };

  const handleCreateCell = async () => {
    const cellNumber = Number(newCellNum);
    if (cells.find((cell) => cell.cellNum === cellNumber)) {
      alert('Камера с таким номером уже существует.');
      return;
    }
    try {
      const res = await fetch(CELLS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellNum: cellNumber }),
      });
      if (res.ok) {
        const createdCell = await res.json();
        setCells((prev) => [...prev, createdCell]);
        setNewCellNum('');
      } else {
        console.error('Ошибка создания камеры');
      }
    } catch (err) {
      console.error('Ошибка создания камеры:', err);
    }
  };

  const openSecurityLevelDialog = async () => {
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setSecurityLevels(data);
      } else {
        console.error('Ошибка получения уровней защиты');
      }
    } catch (err) {
      console.error('Ошибка получения уровней защиты:', err);
    }
    setSecurityLevelDialogOpen(true);
  };

  const handleCreateSecurityLevel = async () => {
    const levelNumber = Number(newSecurityLevel);
    if (
      securityLevels.find(
        (level) => level.securityLevelNo === levelNumber
      )
    ) {
      alert('Уровень защиты с таким номером уже существует.');
      return;
    }
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ securityLevelNo: levelNumber }),
      });
      if (res.ok) {
        const createdLevel = await res.json();
        setSecurityLevels((prev) => [...prev, createdLevel]);
        setNewSecurityLevel('');
      } else {
        console.error('Ошибка создания уровня защиты');
      }
    } catch (err) {
      console.error('Ошибка создания уровня защиты:', err);
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
    const booksForPrisoner = borrowedData.filter(
      (item) => item.prisoner?.prisonerId === prisoner.prisonerId
    );
    setSelectedBooks(booksForPrisoner);
    setBooksDialogOpen(true);
  };

  const openCertificatesDialogHandler = (prisoner) => {
    const certsForPrisoner = certificateData.filter(
      (item) => item.prisoner?.prisonerId === prisoner.prisonerId
    );
    setSelectedCertificates(certsForPrisoner);
    setCertificatesDialogOpen(true);
  };

  // Рендер диалога для выбора камеры
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
              <TableRow key={cell.cellNum} hover sx={{ cursor: 'pointer' }} onClick={() => handleSelectCell(cell.cellNum)}>
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
        <Button onClick={handleCreateCell} variant="contained" color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Рендер диалога для выбора уровня защиты
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
            {securityLevels.map((level) => (
              <TableRow key={level.securityLevelNo} hover sx={{ cursor: 'pointer' }} onClick={() => handleSelectSecurityLevel(level.securityLevelNo)}>
                <TableCell>{level.securityLevelNo}</TableCell>
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
        <Button onClick={handleCreateSecurityLevel} variant="contained" color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Рендер диалога с книгами заключённого
  const renderBooksDialog = () => (
    <Dialog open={booksDialogOpen} onClose={() => setBooksDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Книги заключённого</DialogTitle>
      <DialogContent>
        {selectedBooks.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {selectedBooks.map((book, index) => (
              <li key={index}>
                <Typography variant="body1">
                  ISBN: {book.id?.isbn} {book.library && book.library.title ? `- ${book.library.title}` : ''}
                </Typography>
              </li>
            ))}
          </Box>
        ) : (
          <Typography variant="body1">Нет книг</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBooksDialogOpen(false)} variant="outlined">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Рендер диалога с сертификатами – возможность редактирования убрана, осталась только кнопка "Выдать"
  const renderCertificatesDialog = () => (
    <Dialog open={certificatesDialogOpen} onClose={() => setCertificatesDialogOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Сертификаты заключённого</DialogTitle>
      <DialogContent>
        {selectedCertificates.length > 0 ? (
          <Box component="ul" sx={{ pl: 2 }}>
            {selectedCertificates.map((cert, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  Курс: {cert.course?.courseName || `ID курса ${cert.id?.courseId}`}
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<CertificateIcon />}
                    onClick={() => handleIssueCertificate(cert)}
                    sx={{ mr: 1 }}
                  >
                    Выдать
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body1">Нет сертификатов</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCertificatesDialogOpen(false)} variant="outlined">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Paper sx={{ padding: 4, maxWidth: 1400, margin: 'auto', borderRadius: 2, boxShadow: 3, backgroundColor: '#f9f9f9' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
        Управление заключёнными
      </Typography>
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
              <TextField fullWidth label="Имя" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Фамилия" type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Место Рождения" type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Дата Рождения"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Профессия" type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Обвинение" type="text" name="indictment" value={formData.indictment} onChange={handleChange} />
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
                type="number"
                name="cellNum"
                value={formData.cellNum}
                onChange={handleChange}
                helperText="Кликните, чтобы выбрать камеру"
                onClick={openCellDialog}
                sx={{ cursor: 'pointer' }}
                InputProps={{ inputProps: { style: { MozAppearance: 'textfield', WebkitAppearance: 'none' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Уровень защиты"
                type="number"
                name="securityLevelId"
                value={formData.securityLevelId}
                onChange={handleChange}
                helperText="Кликните, чтобы выбрать уровень защиты"
                onClick={openSecurityLevelDialog}
                sx={{ cursor: 'pointer' }}
                InputProps={{ inputProps: { style: { MozAppearance: 'textfield', WebkitAppearance: 'none' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="contained" color="primary" type="submit" fullWidth>
                {editingId ? 'Сохранить изменения' : 'Добавить'}
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Поиск заключённого
        </Typography>
        <TextField
          fullWidth
          label="Введите текст для поиска"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>
      <Paper sx={{ mb: 4, overflowX: 'auto', boxShadow: 2, borderRadius: 2 }}>
        <Typography variant="h5" align="center" sx={{ py: 2, backgroundColor: '#1976d2', color: '#fff' }}>
          Список заключённых
        </Typography>
        <Table>
          <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Фамилия</TableCell>
              <TableCell>Место Рождения</TableCell>
              <TableCell>Дата Рождения</TableCell>
              <TableCell>Профессия</TableCell>
              <TableCell>Обвинение</TableCell>
              <TableCell>Начало наказания</TableCell>
              <TableCell>Конец наказания</TableCell>
              <TableCell>Номер камеры</TableCell>
              <TableCell>Уровень защиты</TableCell>
              <TableCell>Книги</TableCell>
              <TableCell>Сертификаты</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrisoners.map((prisoner) => (
              <TableRow key={prisoner.prisonerId} hover>
                <TableCell>{prisoner.prisonerId}</TableCell>
                <TableCell>{prisoner.firstName}</TableCell>
                <TableCell>{prisoner.lastName}</TableCell>
                <TableCell>{prisoner.birthPlace}</TableCell>
                <TableCell>{prisoner.dateOfBirth}</TableCell>
                <TableCell>{prisoner.occupation}</TableCell>
                <TableCell>{prisoner.indictment}</TableCell>
                <TableCell>{prisoner.intakeDate}</TableCell>
                <TableCell>{prisoner.sentenceEndDate}</TableCell>
                <TableCell 
                  onClick={openCellDialog} 
                  sx={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                >
                  {prisoner.cell?.cellNum}
                </TableCell>
                <TableCell 
                  onClick={openSecurityLevelDialog} 
                  sx={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                >
                  {prisoner.securityLevel?.securityLevelNo}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<BookIcon />} 
                    onClick={() => openBooksDialogHandler(prisoner)}
                  >
                    Книги
                  </Button>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<CertificateIcon />} 
                    onClick={() => openCertificatesDialogHandler(prisoner)}
                  >
                    Сертификаты
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button 
                    onClick={() => handleEdit(prisoner)} 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    startIcon={<EditIcon />} 
                    sx={{ mr: 1 }}
                  >
                    Ред.
                  </Button>
                  <Button 
                    onClick={() => handleDelete(prisoner.prisonerId)} 
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

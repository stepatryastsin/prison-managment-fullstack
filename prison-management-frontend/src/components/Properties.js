import React, { useEffect, useState, useMemo } from 'react';
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const API_PROPERTIES = 'http://localhost:8080/api/properties';
const API_PRISONERS = 'http://localhost:8080/api/prisoners';

const PropertiesFrontend = () => {
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordsSearch, setRecordsSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    id: { prisonerId: '', propertyName: '' },
    description: ''
  });
  const [prisonersList, setPrisonersList] = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);
  const [errorPrisoners, setErrorPrisoners] = useState(null);
  const [openPrisonerDetailDialog, setOpenPrisonerDetailDialog] = useState(false);
  const [prisonerDetail, setPrisonerDetail] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_PROPERTIES);
      if (!res.ok) throw new Error('Ошибка при загрузке записей');
      const data = await res.json();
      setPropertiesList(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const openSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleDelete = async record => {
    try {
      const res = await fetch(
        `${API_PROPERTIES}/${record.id.prisonerId}/${record.id.propertyName}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        await fetchProperties();
        openSnackbar('Запись удалена');
      }
    } catch {
      openSnackbar('Ошибка удаления записи', 'error');
    }
  };

  const handleOpenDialogForCreate = () => {
    setIsEditing(false);
    setCurrentRecord({ id: { prisonerId: '', propertyName: '' }, description: '' });
    openDialog();
  };

  const handleOpenDialogForEdit = record => {
    setIsEditing(true);
    setCurrentRecord(record);
    openDialog();
  };

  const openDialog = async () => {
    setLoadingPrisoners(true);
    try {
      const res = await fetch(API_PRISONERS);
      if (!res.ok) throw new Error('Ошибка при загрузке данных заключённых');
      const data = await res.json();
      setPrisonersList(data);
    } catch (err) {
      setErrorPrisoners(err);
    } finally {
      setLoadingPrisoners(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleSelectPrisoner = prisoner =>
    setCurrentRecord(prev => ({
      ...prev,
      id: { ...prev.id, prisonerId: prisoner.prisonerId }
    }));

  const handlePropertyNameChange = e =>
    setCurrentRecord(prev => ({
      ...prev,
      id: { ...prev.id, propertyName: e.target.value }
    }));

  const handleDescriptionChange = e =>
    setCurrentRecord(prev => ({ ...prev, description: e.target.value }));

  const handleCreatePrisoner = () => {
    setDialogOpen(false);
    navigate('/prisoners');
  };

  const handleConfirm = async () => {
    const payload = {
      id: {
        prisonerId: currentRecord.id.prisonerId,
        propertyName: currentRecord.id.propertyName
      },
      description: currentRecord.description,
      prisoner: { prisonerId: currentRecord.id.prisonerId }
    };

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `${API_PROPERTIES}/${currentRecord.id.prisonerId}/${currentRecord.id.propertyName}`
      : API_PROPERTIES;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchProperties();
        handleCloseDialog();
        openSnackbar(isEditing ? 'Запись обновлена' : 'Запись создана');
      }
    } catch {
      openSnackbar('Ошибка сохранения записи', 'error');
    }
  };

  const handleShowPrisonerDetails = async prisonerId => {
    try {
      const res = await fetch(`${API_PRISONERS}/${prisonerId}`);
      const data = await res.json();
      setPrisonerDetail(data);
      setOpenPrisonerDetailDialog(true);
    } catch {}
  };

  const handleClosePrisonerDetailDialog = () => {
    setOpenPrisonerDetailDialog(false);
    setPrisonerDetail(null);
  };

  const groupedProperties = useMemo(() => {
    return propertiesList.reduce((acc, record) => {
      const prisonerId = record.prisoner?.prisonerId || record.id?.prisonerId;
      if (prisonerId) {
        acc[prisonerId] = acc[prisonerId] || [];
        acc[prisonerId].push(record);
      }
      return acc;
    }, {});
  }, [propertiesList]);

  const filteredGroupKeys = useMemo(() => {
    if (!recordsSearch.trim()) return Object.keys(groupedProperties);
    return Object.keys(groupedProperties).filter(prisonerId =>
      groupedProperties[prisonerId].some(
        record =>
          (record.prisoner &&
            `${record.prisoner.firstName} ${record.prisoner.lastName}`
              .toLowerCase()
              .includes(recordsSearch.toLowerCase())) ||
          (record.id.propertyName &&
            record.id.propertyName.toLowerCase().includes(recordsSearch.toLowerCase()))
      )
    );
  }, [groupedProperties, recordsSearch]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Вещи заключённых в камерах
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenDialogForCreate}>
          Добавить запись
        </Button>
        <TextField
          variant="outlined"
          placeholder="Поиск записей..."
          value={recordsSearch}
          onChange={e => setRecordsSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          sx={{ width: '300px' }}
        />
      </Box>
      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">Ошибка: {error.message}</Typography>
      ) : Object.keys(groupedProperties).length > 0 ? (
        filteredGroupKeys.map(prisonerId => {
          const prisonerInfo = groupedProperties[prisonerId][0].prisoner;
          return (
            <Accordion key={prisonerId} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6">Заключённый ID: {prisonerId}</Typography>
                  {prisonerInfo && prisonerInfo.firstName && prisonerInfo.lastName && (
                    <Typography variant="body2">
                      {prisonerInfo.firstName} {prisonerInfo.lastName}
                    </Typography>
                  )}
                  <Button
                    variant="text"
                    onClick={e => {
                      e.stopPropagation();
                      handleShowPrisonerDetails(prisonerId);
                    }}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    Подробнее о заключённом
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Свойство</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell align="center">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedProperties[prisonerId].map((record, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{record.id?.propertyName || 'не найдено'}</TableCell>
                        <TableCell>{record.description || '-'}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Редактировать запись">
                            <Button
                              variant="outlined"
                              onClick={() => handleOpenDialogForEdit(record)}
                              sx={{ mr: 1 }}
                            >
                              Редактировать
                            </Button>
                          </Tooltip>
                          <Tooltip title="Удалить запись">
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleDelete(record)}
                            >
                              Удалить
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Typography>Записей не найдено</Typography>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Редактировать запись' : 'Добавить запись'}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
            Заключённые:
          </Typography>
          {loadingPrisoners ? (
            <Typography>Загрузка заключённых...</Typography>
          ) : errorPrisoners ? (
            <Typography color="error">{errorPrisoners.message}</Typography>
          ) : prisonersList.length > 0 ? (
            <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc', mb: 2 }}>
              {prisonersList.map(prisoner => (
                <ListItem key={prisoner.prisonerId} disablePadding>
                  <ListItemButton onClick={() => handleSelectPrisoner(prisoner)}>
                    {currentRecord.id.prisonerId === prisoner.prisonerId && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    <ListItemText
                      primary={`ID: ${prisoner.prisonerId} - ${prisoner.firstName} ${prisoner.lastName}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography>Нет заключённых</Typography>
              <Button onClick={handleCreatePrisoner} color="primary">
                Создать нового
              </Button>
            </Box>
          )}
          <TextField
            label="Свойство"
            fullWidth
            margin="normal"
            value={currentRecord.id.propertyName}
            onChange={handlePropertyNameChange}
          />
          <TextField
            label="Описание"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={currentRecord.description}
            onChange={handleDescriptionChange}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Выбранный ID заключённого: <strong>{currentRecord.id.prisonerId || 'не выбран'}</strong>
            </Typography>
            <Typography variant="body1">
              Введённое свойство: <strong>{currentRecord.id.propertyName || 'не указано'}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleConfirm}
            color="primary"
            disabled={!currentRecord.id.prisonerId || !currentRecord.id.propertyName}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openPrisonerDetailDialog} onClose={handleClosePrisonerDetailDialog}>
        <DialogTitle>Детали заключённого</DialogTitle>
        <DialogContent>
          {prisonerDetail ? (
            <Box>
              <Typography>ID: {prisonerDetail.prisonerId}</Typography>
              <Typography>Имя: {prisonerDetail.firstName}</Typography>
              <Typography>Фамилия: {prisonerDetail.lastName}</Typography>
            </Box>
          ) : (
            <Typography>Загрузка...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrisonerDetailDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PropertiesFrontend;

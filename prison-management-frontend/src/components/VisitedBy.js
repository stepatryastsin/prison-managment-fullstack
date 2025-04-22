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
  TextField,
  InputAdornment,
  Paper,
  Snackbar,
  Alert,
  Slide,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api/visited-by';

const VisitedByFrontend = () => {
  const [visitedByList, setVisitedByList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({ id: { prisonerId: '', visitorId: '' } });

  const [integratedDialogOpen, setIntegratedDialogOpen] = useState(false);
  const [prisonersList, setPrisonersList] = useState([]);
  const [visitorsList, setVisitorsList] = useState([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(false);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [errorPrisoners, setErrorPrisoners] = useState(null);
  const [errorVisitors, setErrorVisitors] = useState(null);

  const [prisonerDetail, setPrisonerDetail] = useState(null);
  const [visitorDetail, setVisitorDetail] = useState(null);
  const [openPrisonerDetailDialog, setOpenPrisonerDetailDialog] = useState(false);
  const [openVisitorDetailDialog, setOpenVisitorDetailDialog] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('visitDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();

  const fetchVisitedBy = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Ошибка при загрузке данных');
      const data = await res.json();
      setVisitedByList(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitedBy();
  }, []);

  const handleOpenEditDialog = (record) => {
    setCurrentRecord(record);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord((prev) => ({
      ...prev,
      id: { ...prev.id, [name]: value },
    }));
  };

  const handleSubmitEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/${currentRecord.id.prisonerId}/${currentRecord.id.visitorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRecord),
      });
      if (res.ok) {
        await fetchVisitedBy();
        handleCloseEditDialog();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (record) => {
    try {
      const res = await fetch(`${API_URL}/${record.id.prisonerId}/${record.id.visitorId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchVisitedBy();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenIntegratedDialog = async () => {
    setCurrentRecord({ id: { prisonerId: '', visitorId: '' } });
    setLoadingPrisoners(true);
    try {
      const res1 = await fetch('http://localhost:8080/api/prisoners');
      if (!res1.ok) throw new Error('Ошибка загрузки данных заключённых');
      const prisonersData = await res1.json();
      setPrisonersList(prisonersData);
    } catch (err) {
      setErrorPrisoners(err);
    } finally {
      setLoadingPrisoners(false);
    }
    setLoadingVisitors(true);
    try {
      const res2 = await fetch('http://localhost:8080/api/visitors');
      if (!res2.ok) throw new Error('Ошибка загрузки данных посетителей');
      const visitorsData = await res2.json();
      setVisitorsList(visitorsData);
    } catch (err) {
      setErrorVisitors(err);
    } finally {
      setLoadingVisitors(false);
    }
    setIntegratedDialogOpen(true);
  };

  const handleCloseIntegratedDialog = () => {
    setIntegratedDialogOpen(false);
  };

  const handleSelectPrisoner = (prisoner) => {
    setCurrentRecord((prev) => ({ ...prev, id: { ...prev.id, prisonerId: prisoner.prisonerId } }));
  };

  const handleSelectVisitor = (visitor) => {
    setCurrentRecord((prev) => ({ ...prev, id: { ...prev.id, visitorId: visitor.visitorId } }));
  };

  const handleCreatePrisoner = () => {
    setIntegratedDialogOpen(false);
    navigate('/prisoners');
  };

  const handleCreateVisitor = () => {
    setIntegratedDialogOpen(false);
    navigate('/visitors');
  };

  const handleConfirmSelection = async () => {
    const payload = {
      id: {
        prisonerId: currentRecord.id.prisonerId,
        visitorId: currentRecord.id.visitorId,
      },
      prisoner: { prisonerId: currentRecord.id.prisonerId },
      visitor: { visitorId: currentRecord.id.visitorId },
    };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchVisitedBy();
        setIntegratedDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowPrisonerDetails = async (prisonerId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/prisoners/${prisonerId}`);
      const data = await res.json();
      setPrisonerDetail(data);
      setOpenPrisonerDetailDialog(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClosePrisonerDetailDialog = () => {
    setOpenPrisonerDetailDialog(false);
    setPrisonerDetail(null);
  };

  const handleShowVisitorDetails = async (visitorId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/visitors/${visitorId}`);
      const data = await res.json();
      setVisitorDetail(data);
      setOpenVisitorDetailDialog(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseVisitorDetailDialog = () => {
    setOpenVisitorDetailDialog(false);
    setVisitorDetail(null);
  };

  const groupedVisitedBy = useMemo(() => {
    return visitedByList.reduce((acc, record) => {
      const prisonerId = record.prisoner?.prisonerId || record.id?.prisonerId;
      if (prisonerId) {
        acc[prisonerId] = acc[prisonerId] || [];
        acc[prisonerId].push(record);
      }
      return acc;
    }, {});
  }, [visitedByList]);

  const filteredGroupKeys = useMemo(() => {
    let keys = Object.keys(groupedVisitedBy);
    if (searchQuery.trim()) {
      keys = keys.filter((prisonerId) =>
        groupedVisitedBy[prisonerId].some((record) => {
          const visitor = record.visitor || {};
          return (
            String(visitor.visitorId)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (visitor.firstName &&
              visitor.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (visitor.lastName &&
              visitor.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        })
      );
    }
    if (dateRange.from || dateRange.to) {
      keys = keys.filter((prisonerId) =>
        groupedVisitedBy[prisonerId].some((record) => {
          const visitDate = new Date(record.visitor?.visitDate || '');
          const fromCheck = dateRange.from ? visitDate >= new Date(dateRange.from) : true;
          const toCheck = dateRange.to ? visitDate <= new Date(dateRange.to) : true;
          return fromCheck && toCheck;
        })
      );
    }
    return keys.sort((a, b) => a.localeCompare(b));
  }, [groupedVisitedBy, searchQuery, dateRange]);

  const openSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleExportCSV = () => {
    const header = [
      'Prisoner ID',
      'Visitor ID',
      'Visitor First Name',
      'Visitor Last Name',
      'Phone',
      'Visit Date',
    ];
    const rows = [];
    Object.keys(groupedVisitedBy).forEach((prisonerId) => {
      groupedVisitedBy[prisonerId].forEach((record) => {
        const visitor = record.visitor || {};
        rows.push([
          prisonerId,
          visitor.visitorId || record.id.visitorId,
          visitor.firstName || '',
          visitor.lastName || '',
          visitor.phoneNumber || '',
          visitor.visitDate || '',
        ]);
      });
    });
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'visited_by_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Посещаемость
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenIntegratedDialog}>
          Добавить запись
        </Button>
        <Button variant="outlined" color="secondary" startIcon={<GetAppIcon />} onClick={handleExportCSV}>
          Экспорт CSV
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Поиск посетителя..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 300 }}
        />
        <TextField
          label="От:"
          type="date"
          size="small"
          value={dateRange.from}
          onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="До:"
          type="date"
          size="small"
          value={dateRange.to}
          onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">Ошибка: {error.message}</Typography>
      ) : Object.keys(groupedVisitedBy).length > 0 ? (
        filteredGroupKeys.map((prisonerId) => (
          <Paper key={prisonerId} sx={{ mb: 2, p: 2 }} elevation={3}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Заключённый ID: {prisonerId}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Visitor ID</TableCell>
                      <TableCell>Имя посетителя</TableCell>
                      <TableCell>Фамилия</TableCell>
                      <TableCell>Телефон</TableCell>
                      <TableCell>Дата визита</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedVisitedBy[prisonerId].map((record, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Button
                            variant="text"
                            onClick={() =>
                              handleShowVisitorDetails(record.visitor?.visitorId || record.id?.visitorId)
                            }
                          >
                            {record.visitor?.visitorId || record.id?.visitorId || 'не найдено'}
                          </Button>
                        </TableCell>
                        <TableCell>{record.visitor?.firstName || '---'}</TableCell>
                        <TableCell>{record.visitor?.lastName || '---'}</TableCell>
                        <TableCell>{record.visitor?.phoneNumber || '---'}</TableCell>
                        <TableCell>{record.visitor?.visitDate || '---'}</TableCell>
                        <TableCell>
                          <Tooltip title="Редактировать запись">
                            <Button
                              variant="outlined"
                              onClick={() => handleOpenEditDialog(record)}
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
          </Paper>
        ))
      ) : (
        <Typography>Записей не найдено</Typography>
      )}

      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle>Редактировать запись</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="prisonerId"
            label="ID заключённого"
            type="number"
            fullWidth
            variant="standard"
            value={currentRecord.id.prisonerId}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="visitorId"
            label="ID посетителя"
            type="number"
            fullWidth
            variant="standard"
            value={currentRecord.id.visitorId}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Отмена</Button>
          <Button onClick={handleSubmitEdit}>Обновить</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={integratedDialogOpen}
        onClose={handleCloseIntegratedDialog}
        fullWidth
        maxWidth="md"
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle>Выберите заключённого и посетителя</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
            Заключённые:
          </Typography>
          {loadingPrisoners ? (
            <Typography>Загрузка заключённых...</Typography>
          ) : errorPrisoners ? (
            <Typography color="error">{errorPrisoners.message}</Typography>
          ) : prisonersList.length > 0 ? (
            <Box>
              {prisonersList.map((prisoner) => (
                <Box key={prisoner.prisonerId} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Button
                    variant="text"
                    onClick={() => handleSelectPrisoner(prisoner)}
                    sx={{ textTransform: 'none' }}
                  >
                    {currentRecord.id.prisonerId === prisoner.prisonerId && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    {`ID: ${prisoner.prisonerId} - ${prisoner.firstName} ${prisoner.lastName}`}
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Нет заключённых</Typography>
              <Button onClick={handleCreatePrisoner} color="primary">
                Создать нового
              </Button>
            </Box>
          )}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Посетители:
          </Typography>
          {loadingVisitors ? (
            <Typography>Загрузка посетителей...</Typography>
          ) : errorVisitors ? (
            <Typography color="error">{errorVisitors.message}</Typography>
          ) : visitorsList.length > 0 ? (
            <Box>
              {visitorsList.map((visitor) => (
                <Box key={visitor.visitorId} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Button
                    variant="text"
                    onClick={() => handleSelectVisitor(visitor)}
                    sx={{ textTransform: 'none' }}
                  >
                    {currentRecord.id.visitorId === visitor.visitorId && (
                      <CheckIcon color="primary" sx={{ mr: 1 }} />
                    )}
                    {`ID: ${visitor.visitorId} - ${visitor.firstName} ${visitor.lastName}`}
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>Нет посетителей</Typography>
              <Button onClick={handleCreateVisitor} color="primary">
                Создать нового
              </Button>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Выбранный ID заключённого:{' '}
              <strong>{currentRecord.id.prisonerId || 'не выбран'}</strong>
            </Typography>
            <Typography variant="body1">
              Выбранный ID посетителя:{' '}
              <strong>{currentRecord.id.visitorId || 'не выбран'}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIntegratedDialog}>Отмена</Button>
          <Button
            onClick={handleConfirmSelection}
            color="primary"
            disabled={!currentRecord.id.prisonerId || !currentRecord.id.visitorId}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPrisonerDetailDialog} onClose={handleClosePrisonerDetailDialog}>
        <DialogTitle>Детальная информация о заключённом</DialogTitle>
        <DialogContent>
          {prisonerDetail ? (
            <Box>
              <Typography>ID: {prisonerDetail.prisonerId}</Typography>
              <Typography>Имя: {prisonerDetail.firstName}</Typography>
              <Typography>Фамилия: {prisonerDetail.lastName}</Typography>
              <Typography>Место рождения: {prisonerDetail.birthPlace}</Typography>
              <Typography>Дата рождения: {prisonerDetail.dateOfBirth}</Typography>
              <Typography>Профессия: {prisonerDetail.occupation}</Typography>
              <Typography>Обвинения: {prisonerDetail.indictment}</Typography>
              <Typography>Дата поступления: {prisonerDetail.intakeDate}</Typography>
              <Typography>Дата освобождения: {prisonerDetail.sentenceEndDate}</Typography>
              <Typography>Камера: {prisonerDetail.cell?.cellNum}</Typography>
              <Typography>Уровень: {prisonerDetail.securityLevel?.description}</Typography>
            </Box>
          ) : (
            <Typography>Загрузка...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrisonerDetailDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVisitorDetailDialog} onClose={handleCloseVisitorDetailDialog}>
        <DialogTitle>Детальная информация о посетителе</DialogTitle>
        <DialogContent>
          {visitorDetail ? (
            <Box>
              <Typography>ID: {visitorDetail.visitorId}</Typography>
              <Typography>Имя: {visitorDetail.firstName}</Typography>
              <Typography>Фамилия: {visitorDetail.lastName}</Typography>
              <Typography>Телефон: {visitorDetail.phoneNumber}</Typography>
              <Typography>Отношение к заключённому: {visitorDetail.relation_to_prisoner}</Typography>
              <Typography>Дата визита: {visitorDetail.visitDate}</Typography>
            </Box>
          ) : (
            <Typography>Загрузка...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVisitorDetailDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VisitedByFrontend;

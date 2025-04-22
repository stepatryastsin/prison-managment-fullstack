import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Snackbar,
  Alert,
  Slide,
  Tooltip,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

// URL для получения сертификатов заключённых по курсам
const API_CERTIFICATES = 'http://localhost:8080/api/ownCertificateFrom';

const OwnCertificateFromFrontend = () => {
  const [recordList, setRecordList] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [errorRecords, setErrorRecords] = useState(null);
  // Строка поиска для фильтрации записей
  const [recordsSearch, setRecordsSearch] = useState('');
  // Snackbar для уведомлений (например, об ошибках загрузки)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Получение записей из API
  const fetchRecords = () => {
    setLoadingRecords(true);
    fetch(API_CERTIFICATES)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка при загрузке данных сертификатов');
        return res.json();
      })
      .then((data) => {
        setRecordList(data);
        setLoadingRecords(false);
      })
      .catch((err) => {
        setErrorRecords(err);
        setLoadingRecords(false);
        openSnackbar(err.message, 'error');
      });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Функция удаления сертификата по prisonerId и courseId
  const handleDeleteCertificate = (record) => {
    const prisonerId = record.prisoner?.prisonerId || record.id?.prisonerId;
    const courseId = record.course?.courseId || record.id?.courseId;
    if (!prisonerId || !courseId) {
      openSnackbar('Невозможно удалить: отсутствуют идентификаторы', 'error');
      return;
    }
    if (window.confirm('Вы действительно хотите удалить сертификат?')) {
      fetch(`${API_CERTIFICATES}/${prisonerId}/${courseId}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (!res.ok) throw new Error('Ошибка удаления сертификата');
          openSnackbar('Сертификат успешно удалён', 'success');
          fetchRecords();
        })
        .catch((err) => {
          console.error(err);
          openSnackbar(err.message, 'error');
        });
    }
  };

  // Группировка записей по prisonerId для удобного просмотра
  const groupedRecords = useMemo(() => {
    return recordList.reduce((acc, record) => {
      const prisonerId = record.prisoner?.prisonerId || record.id?.prisonerId;
      if (prisonerId) {
        if (!acc[prisonerId]) acc[prisonerId] = [];
        acc[prisonerId].push(record);
      }
      return acc;
    }, {});
  }, [recordList]);

  // Фильтрация записей по строке поиска (по имени заключённого или названию курса)
  const filteredGroupKeys = useMemo(() => {
    if (!recordsSearch.trim()) return Object.keys(groupedRecords);
    return Object.keys(groupedRecords).filter((prisonerId) =>
      groupedRecords[prisonerId].some((record) =>
        (record.prisoner &&
          `${record.prisoner.firstName} ${record.prisoner.lastName}`
            .toLowerCase()
            .includes(recordsSearch.toLowerCase())) ||
        (record.course &&
          record.course.courseName.toLowerCase().includes(recordsSearch.toLowerCase()))
      )
    );
  }, [groupedRecords, recordsSearch]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Просмотр сертификатов заключённых по курсам
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Поиск записей..."
          value={recordsSearch}
          onChange={(e) => setRecordsSearch(e.target.value)}
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
      {loadingRecords ? (
        <Typography>Загрузка записей...</Typography>
      ) : errorRecords ? (
        <Typography color="error">Ошибка: {errorRecords.message}</Typography>
      ) : Object.keys(groupedRecords).length > 0 ? (
        filteredGroupKeys.map((prisonerId) => (
          <Accordion key={prisonerId} defaultExpanded sx={{ mb: 2, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Заключённый ID: {prisonerId}
                {groupedRecords[prisonerId][0]?.prisoner &&
                  ` - ${groupedRecords[prisonerId][0].prisoner.firstName} ${groupedRecords[prisonerId][0].prisoner.lastName}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Course ID</strong></TableCell>
                    <TableCell><strong>Название курса</strong></TableCell>
                    <TableCell align="center"><strong>Действия</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedRecords[prisonerId].map((record, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        {record.course?.courseId || record.id?.courseId || '-'}
                      </TableCell>
                      <TableCell>
                        {record.course?.courseName || '---'}
                        {record.course?.deleted && (
                          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                            (Не активен)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Удалить сертификат">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCertificate(record)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>Записей не найдено</Typography>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OwnCertificateFromFrontend;

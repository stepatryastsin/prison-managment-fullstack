// src/pages/OwnCertificateFromFrontend.jsx

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

const API_CERTIFICATES = 'http://localhost:8080/api/ownCertificateFrom';

export default function OwnCertificateFromFrontend() {
  const [recordList, setRecordList] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [errorRecords, setErrorRecords] = useState(null);
  const [recordsSearch, setRecordsSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const openSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const closeSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch(API_CERTIFICATES, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();
      setRecordList(data);
    } catch (err) {
      setErrorRecords(err);
      openSnackbar(err.message, 'error');
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDeleteCertificate = async (record) => {
    const prisonerId = record.prisoner?.prisonerId || record.id?.prisonerId;
    const courseId = record.course?.courseId || record.id?.courseId;
    if (!prisonerId || !courseId) {
      return openSnackbar('Отсутствуют идентификаторы', 'error');
    }
    if (!window.confirm('Удалить сертификат?')) return;
    try {
      const res = await fetch(`${API_CERTIFICATES}/${prisonerId}/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      openSnackbar('Сертификат удалён', 'success');
      await fetchRecords();
    } catch (err) {
      openSnackbar(err.message, 'error');
    }
  };

  const groupedRecords = useMemo(() => {
    return recordList.reduce((acc, record) => {
      const pid = record.prisoner?.prisonerId || record.id?.prisonerId;
      if (!pid) return acc;
      acc[pid] = acc[pid] || [];
      acc[pid].push(record);
      return acc;
    }, {});
  }, [recordList]);

  const filteredKeys = useMemo(() => {
    if (!recordsSearch) return Object.keys(groupedRecords);
    return Object.keys(groupedRecords).filter(pid =>
      groupedRecords[pid].some(rec => {
        const name = rec.prisoner
          ? `${rec.prisoner.firstName} ${rec.prisoner.lastName}`.toLowerCase()
          : '';
        const course = rec.course?.courseName.toLowerCase() || '';
        return name.includes(recordsSearch.toLowerCase()) || course.includes(recordsSearch.toLowerCase());
      })
    );
  }, [recordsSearch, groupedRecords]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Сертификаты заключённых по курсам
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Поиск..."
          value={recordsSearch}
          onChange={e => setRecordsSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {loadingRecords ? (
        <Typography>Загрузка...</Typography>
      ) : errorRecords ? (
        <Typography color="error">Ошибка: {errorRecords.message}</Typography>
      ) : filteredKeys.length > 0 ? (
        filteredKeys.map(pid => (
          <Accordion key={pid} defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Заключённый ID: {pid}
                {groupedRecords[pid][0]?.prisoner &&
                  ` — ${groupedRecords[pid][0].prisoner.firstName} ${groupedRecords[pid][0].prisoner.lastName}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course ID</TableCell>
                    <TableCell>Название курса</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedRecords[pid].map((rec, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{rec.course?.courseId || rec.id?.courseId || '-'}</TableCell>
                      <TableCell>
                        {rec.course?.courseName || '—'}
                        {rec.course?.deleted && (
                          <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                            (Не активен)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Удалить">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCertificate(rec)}
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
}

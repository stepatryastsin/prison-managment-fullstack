// src/pages/Job.jsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Box,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Slide,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import GetAppIcon from '@mui/icons-material/GetApp';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/job';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1000,
  margin: 'auto',
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(2),
}));

export default function Job() {
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingDesc, setEditingDesc] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data } = await axios.get(API_URL);
      // fetch usage in parallel
      const withUsage = await Promise.all(data.map(async j => {
        try {
          const res = await axios.get(`${API_URL}/${j.jobId}/usage`);
          return { ...j, usageCount: res.data.usageCount };
        } catch {
          return { ...j, usageCount: null };
        }
      }));
      setJobs(withUsage);
    } catch {
      showSnack('Ошибка загрузки данных', 'error');
    }
  };

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  const handleEditInit = job => {
    setEditingId(job.jobId);
    setEditingDesc(job.jobDescription);
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditingDesc('');
  };
  const handleSave = async id => {
    try {
      await axios.put(`${API_URL}/${id}`, { jobId: id, jobDescription: editingDesc });
      showSnack('Должность обновлена');
      loadJobs();
      handleCancel();
    } catch {
      showSnack('Ошибка обновления', 'error');
    }
  };
  const handleCreate = async () => {
    if (!newDesc.trim()) return;
    try {
      await axios.post(API_URL, { jobDescription: newDesc });
      setNewDesc('');
      showSnack('Должность добавлена');
      loadJobs();
    } catch {
      showSnack('Ошибка создания', 'error');
    }
  };
  const handleDelete = async id => {
    try {
      const usage = (await axios.get(`${API_URL}/${id}/usage`)).data.usageCount;
      if (usage > 0) {
        showSnack(`Нельзя удалить, используется: ${usage}`, 'warning');
        return;
      }
      await axios.delete(`${API_URL}/${id}`);
      showSnack('Должность удалена');
      loadJobs();
    } catch {
      showSnack('Ошибка удаления', 'error');
    }
  };

  const filteredSorted = useMemo(() => {
    let arr = jobs.filter(j =>
      j.jobDescription.toLowerCase().includes(search.toLowerCase())
    );
    arr.sort((a, b) =>
      (a.jobDescription < b.jobDescription ? -1 : 1) * (sortAsc ? 1 : -1)
    );
    return arr;
  }, [jobs, search, sortAsc]);

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Title variant="h4" align="center">Управление должностями</Title>

      {/* New job */}
      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          label="Описание новой должности"
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleCreate} startIcon={<SaveIcon />}>
          Добавить
        </Button>
      </Stack>

      {/* Search & controls */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
          sx={{ maxWidth: 300 }}
        />
        <Stack direction="row" spacing={1}>
          <Tooltip title="Сортировать">
            <IconButton onClick={() => setSortAsc(!sortAsc)}>
              <SortIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспорт CSV">
            <IconButton onClick={() => {
              const header = ['ID','Описание','Используется'];
              const rows = filteredSorted.map(j => [
                j.jobId,
                `"${j.jobDescription.replace(/"/g,'""')}"`,
                j.usageCount ?? '-'
              ]);
              const csv = 'data:text/csv;charset=utf-8,' +
                [header, ...rows].map(r=>r.join(',')).join('\n');
              const link = document.createElement('a');
              link.href = encodeURI(csv);
              link.download = 'jobs.csv';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <GetAppIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Table */}
      <Table>
        <TableHead sx={{ bgcolor: '#f0f0f0' }}>
          <TableRow>
            {['ID','Описание','Используется','Действия'].map(h => (
              <TableCell key={h} sx={{ fontWeight:600 }} align={h==='Действия'?'center':'left'}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredSorted.map(job => (
            <TableRow key={job.jobId} hover>
              <TableCell>{job.jobId}</TableCell>
              <TableCell>
                {editingId===job.jobId ? (
                  <TextField
                    value={editingDesc}
                    onChange={e=>setEditingDesc(e.target.value)}
                    size="small"
                    fullWidth
                  />
                ) : job.jobDescription}
              </TableCell>
              <TableCell>{job.usageCount ?? '-'}</TableCell>
              <TableCell align="center">
                {editingId===job.jobId ? (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      variant="contained"
                      onClick={()=>handleSave(job.jobId)}
                      startIcon={<SaveIcon />}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      startIcon={<CancelIcon />}
                    >
                      Отмена
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      variant="outlined"
                      onClick={()=>handleEditInit(job)}
                      startIcon={<EditIcon />}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={()=>handleDelete(job.jobId)}
                    >
                      Удалить
                    </Button>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filteredSorted.length===0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">Нет данных</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
      >
        <Alert onClose={closeSnack} severity={snack.sev} sx={{ width:'100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

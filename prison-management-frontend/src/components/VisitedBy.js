// src/pages/VisitedByFrontend.jsx

import React, { useEffect, useState, useMemo } from 'react';
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
  Box,
  InputAdornment,
  Snackbar,
  Alert,
  Slide,
  Tooltip,
  Stack,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1000,
  margin: 'auto',
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius * 2,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(2),
}));

const ActionBtn = styled(IconButton)(({ theme }) => ({
  transition: 'transform 0.2s',
  '&:hover': { transform: 'scale(1.1)' },
}));

export default function VisitedByFrontend() {
  const [visits, setVisits] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState({ prisoner: null, visitor: null });
  const [detail, setDetail] = useState({ open: false, title: '', data: null });
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vRes, pRes, tRes] = await Promise.all([
        axios.get(`${API_BASE}/visited-by`),
        axios.get(`${API_BASE}/prisoners`),
        axios.get(`${API_BASE}/visitors`),
      ]);
      setVisits(vRes.data);
      setPrisoners(pRes.data);
      setVisitors(tRes.data);
    } catch {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  const grouped = useMemo(() => {
    return visits.reduce((acc, rec) => {
      const pid = rec.prisoner.prisonerId;
      acc[pid] = acc[pid] || [];
      acc[pid].push(rec);
      return acc;
    }, {});
  }, [visits]);

  const filteredIds = useMemo(() => {
    return Object.keys(grouped).filter(pid =>
      grouped[pid].some(r => {
        const v = r.visitor;
        const txt = `${v.visitorId} ${v.firstName} ${v.lastName}`.toLowerCase();
        const dt = new Date(v.visitDate);
        return (
          (!search || txt.includes(search.toLowerCase())) &&
          (!dateFilter.from || dt >= new Date(dateFilter.from)) &&
          (!dateFilter.to   || dt <= new Date(dateFilter.to))
        );
      })
    ).sort();
  }, [grouped, search, dateFilter]);

  const deleteRecord = async rec => {
    try {
      await axios.delete(`${API_BASE}/visited-by/${rec.prisoner.prisonerId}/${rec.visitor.visitorId}`);
      showSnack('Запись удалена');
      fetchAll();
    } catch {
      showSnack('Ошибка при удалении', 'error');
    }
  };

  const addRecord = async () => {
    try {
      await axios.post(`${API_BASE}/visited-by`, {
        id: { prisonerId: selected.prisoner, visitorId: selected.visitor },
        prisoner: { prisonerId: selected.prisoner },
        visitor:  { visitorId:  selected.visitor  },
      });
      showSnack('Запись добавлена');
      setOpenAdd(false);
      setSelected({ prisoner: null, visitor: null });
      fetchAll();
    } catch {
      showSnack('Ошибка при добавлении', 'error');
    }
  };

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Title variant="h4" align="center">Посещаемость</Title>

      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button variant="contained" onClick={() => setOpenAdd(true)}>Добавить запись</Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          size="small"
          placeholder="Поиск по посетителям…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          size="small" type="date" label="От"
          value={dateFilter.from}
          onChange={e => setDateFilter(d => ({ ...d, from: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small" type="date" label="До"
          value={dateFilter.to}
          onChange={e => setDateFilter(d => ({ ...d, to: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      {loading ? (
        <Typography>Загрузка…</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredIds.length === 0 ? (
        <Typography>Ничего не найдено</Typography>
      ) : filteredIds.map(pid => (
        <Accordion key={pid} defaultExpanded sx={{ mb:2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
            <Typography variant="h6">Заключённый ID: {pid}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['ID','Имя','Фамилия','Телефон','Дата','Удалить'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:600 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {grouped[pid].map((rec,i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Button size="small" onClick={() => setDetail({ open:true, title:'Детали посетителя', data: rec.visitor })}>
                        {rec.visitor.visitorId}
                      </Button>
                    </TableCell>
                    <TableCell>{rec.visitor.firstName}</TableCell>
                    <TableCell>{rec.visitor.lastName}</TableCell>
                    <TableCell>{rec.visitor.phoneNumber}</TableCell>
                    <TableCell>{rec.visitor.visitDate}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Удалить">
                        <ActionBtn onClick={() => deleteRecord(rec)}>
                          <DeleteIcon color="error"/>
                        </ActionBtn>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm" TransitionComponent={Slide}>
        <DialogTitle>Новая запись посещения</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1">Заключённые:</Typography>
          {prisoners.map(p => (
            <Button
              key={p.prisonerId}
              fullWidth
              sx={{ mb:1 }}
              variant={selected.prisoner===p.prisonerId?'contained':'outlined'}
              startIcon={selected.prisoner===p.prisonerId?<CheckIcon/>:null}
              onClick={() => setSelected(s=>({ ...s, prisoner:p.prisonerId }))}
            >
              ID {p.prisonerId}: {p.firstName} {p.lastName}
            </Button>
          ))}
          <Typography variant="subtitle1" sx={{ mt:2 }}>Посетители:</Typography>
          {visitors.map(v => (
            <Button
              key={v.visitorId}
              fullWidth
              sx={{ mb:1 }}
              variant={selected.visitor===v.visitorId?'contained':'outlined'}
              startIcon={selected.visitor===v.visitorId?<CheckIcon/>:null}
              onClick={() => setSelected(s=>({ ...s, visitor:v.visitorId }))}
            >
              ID {v.visitorId}: {v.firstName} {v.lastName}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={addRecord}
            disabled={!selected.prisoner || !selected.visitor}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detail.open} onClose={() => setDetail({ ...detail, open:false })} fullWidth>
        <DialogTitle>{detail.title}</DialogTitle>
        <DialogContent dividers>
          {detail.data
            ? Object.entries(detail.data).map(([k,v]) => (
                <Typography key={k} sx={{ mb:1 }}>
                  <strong>{k.replace(/([A-Z])/g,' $1')}:</strong> {v || '—'}
                </Typography>
              ))
            : <Typography>Нет данных</Typography>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail({ ...detail, open:false })}>Закрыть</Button>
        </DialogActions>
      </Dialog>

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

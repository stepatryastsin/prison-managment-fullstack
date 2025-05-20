// src/pages/VisitedByFrontend.jsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
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
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function VisitedByFrontend({ readOnly = false }) {
  const [visits, setVisits] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState({ prisoner: null, visitor: null });
  const [detail, setDetail] = useState({ open: false, data: null });
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' });

  useEffect(() => { fetchAll(); }, []);

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

  const showSnack = (msg, sev='success') => setSnack({ open:true, msg, sev });
  const closeSnack = () => setSnack(s=>({ ...s, open:false }));

  const grouped = useMemo(() =>
    visits.reduce((acc, rec) => {
      const pid = rec.prisoner.prisonerId;
      if (!acc[pid]) acc[pid]=[];
      acc[pid].push(rec);
      return acc;
    }, {}), [visits]
  );

  const filteredIds = useMemo(() =>
    Object.keys(grouped).filter(pid =>
      grouped[pid].some(r => {
        const v = r.visitor;
        const txt = `${v.visitorId} ${v.firstName} ${v.lastName}`.toLowerCase();
        const dt = new Date(v.visitDate);
        return (!search || txt.includes(search.toLowerCase()))
            && (!dateFilter.from || dt >= new Date(dateFilter.from))
            && (!dateFilter.to   || dt <= new Date(dateFilter.to));
      })
    ), [grouped, search, dateFilter]
  );

  const deleteRecord = async rec => {
    if (!window.confirm('Удалить запись?')) return;
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
        id:{ prisonerId:selected.prisoner,visitorId:selected.visitor },
        prisoner:{ prisonerId:selected.prisoner },
        visitor:{ visitorId:selected.visitor },
      });
      showSnack('Запись добавлена');
      setOpenAdd(false);
      setSelected({ prisoner:null, visitor:null });
      fetchAll();
    } catch(err) {
      showSnack(err.response?.data?.message || 'Ошибка при сохранении','error');
    }
  };

  return (
    <AnimatePresence exitBeforeEnter>
      <Container
        component={motion.div}
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:-20 }}
        transition={{ duration:0.4 }}
      >
        <Title variant="h4" align="center">Посещаемость</Title>

        <Stack direction="row" spacing={2} mb={3}>
          <TextField
            size="small"
            placeholder="Поиск…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment> }}
            sx={{ flex:1 }}
          />
          <TextField
            size="small" type="date" label="От"
            value={dateFilter.from}
            onChange={e=>setDateFilter(d=>({...d,from:e.target.value}))}
            InputLabelProps={{ shrink:true }}
          />
          <TextField
            size="small" type="date" label="До"
            value={dateFilter.to}
            onChange={e=>setDateFilter(d=>({...d,to:e.target.value}))}
            InputLabelProps={{ shrink:true }}
          />
          {!readOnly && (
            <Button variant="contained" onClick={()=>setOpenAdd(true)}>
              Добавить
            </Button>
          )}
        </Stack>

        {loading && <Typography>Загрузка…</Typography>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && filteredIds.length===0 && <Typography>Ничего не найдено</Typography>}

        {!loading && filteredIds.map(pid=>(
          <Accordion key={pid} defaultExpanded sx={{ mb:2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
              <Typography variant="h6">Заключённый ID: {pid}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {grouped[pid].map((rec,i)=>(
                  <Card key={i} variant="outlined">
                    <CardContent>
                      <Typography><strong>ID:</strong> {rec.visitor.visitorId}</Typography>
                      <Typography><strong>Имя:</strong> {rec.visitor.firstName}</Typography>
                      <Typography><strong>Фамилия:</strong> {rec.visitor.lastName}</Typography>
                      <Typography><strong>Телефон:</strong> {rec.visitor.phoneNumber}</Typography>
                      <Typography><strong>Дата:</strong> {rec.visitor.visitDate}</Typography>
                    </CardContent>
                    <CardActions>
                      <Tooltip title="Подробнее">
                        <ActionBtn onClick={()=>setDetail({ open:true, data:rec.visitor })}>
                          <InfoIcon/>
                        </ActionBtn>
                      </Tooltip>
                      {!readOnly && (
                        <Tooltip title="Удалить">
                          <ActionBtn onClick={()=>deleteRecord(rec)}>
                            <DeleteIcon color="error"/>
                          </ActionBtn>
                        </Tooltip>
                      )}
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Add Dialog */}
        {!readOnly && (
          <Dialog open={openAdd} onClose={()=>setOpenAdd(false)} fullWidth maxWidth="sm" TransitionComponent={Slide}>
            <DialogTitle>Новая запись посещения</DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle1">Заключённые:</Typography>
              <Stack spacing={1} mb={2}>
                {prisoners.map(p=>(
                  <Button
                    key={p.prisonerId}
                    variant={selected.prisoner===p.prisonerId?'contained':'outlined'}
                    startIcon={selected.prisoner===p.prisonerId?<CheckIcon/>:null}
                    onClick={()=>setSelected(s=>({...s,prisoner:p.prisonerId}))}
                  >
                    ID {p.prisonerId}: {p.firstName} {p.lastName}
                  </Button>
                ))}
              </Stack>
              <Typography variant="subtitle1">Посетители:</Typography>
              <Stack spacing={1}>
                {visitors.map(v=>(
                  <Button
                    key={v.visitorId}
                    variant={selected.visitor===v.visitorId?'contained':'outlined'}
                    startIcon={selected.visitor===v.visitorId?<CheckIcon/>:null}
                    onClick={()=>setSelected(s=>({...s,visitor:v.visitorId}))}
                  >
                    ID {v.visitorId}: {v.firstName} {v.lastName}
                  </Button>
                ))}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>setOpenAdd(false)}>Отмена</Button>
              <Button variant="contained" onClick={addRecord} disabled={!selected.prisoner||!selected.visitor}>
                Добавить
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Detail Dialog */}
        <Dialog open={detail.open} onClose={()=>setDetail({ open:false, data:null })} fullWidth maxWidth="xs">
          <DialogTitle>Детали посетителя</DialogTitle>
          <DialogContent dividers>
            {detail.data
              ? Object.entries(detail.data).map(([k,v])=>(
                  <Typography key={k} gutterBottom>
                    <strong>{k.replace(/([A-Z])/g,' $1')}:</strong> {v||'—'}
                  </Typography>
                ))
              : <Typography>Нет данных</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDetail({ open:false, data:null })}>Закрыть</Button>
          </DialogActions>
        </Dialog>

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
    </AnimatePresence>
  );
}

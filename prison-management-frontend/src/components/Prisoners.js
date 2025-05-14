import React, { useState, useEffect, useMemo } from 'react';
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
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  CardMembership as CertificateIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8080/api/prisoners';
const CELLS_API_URL = 'http://localhost:8080/api/cells';
const SECURITY_LEVELS_API_URL = 'http://localhost:8080/api/sl';
const BORROWED_API_URL = 'http://localhost:8080/api/borrowed';
const CERTIFICATES_API_URL = 'http://localhost:8080/api/ownCertificateFrom';

export default function Prisoners() {
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
  const [cells, setCells] = useState([]);
  const [securityLevels, setSecurityLevels] = useState([]);
  const [borrowedData, setBorrowedData] = useState([]);
  const [certificateData, setCertificateData] = useState([]);

  // dialogs
  const [cellDialogOpen, setCellDialogOpen] = useState(false);
  const [newCellNum, setNewCellNum] = useState('');
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [newSecurityLevel, setNewSecurityLevel] = useState('');
  const [booksDialogOpen, setBooksDialogOpen] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [selectedCerts, setSelectedCerts] = useState([]);

  // snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const showError = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' });
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  useEffect(() => {
    fetch(API_URL).then((r) => r.json()).then(setPrisoners).catch(() => showError('Ошибка загрузки заключённых'));
    fetch(BORROWED_API_URL).then((r) => r.json()).then(setBorrowedData);
    fetch(CERTIFICATES_API_URL).then((r) => r.json()).then(setCertificateData);
  }, []);

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const clearForm = () => setFormData({
    prisonerId:'', firstName:'', lastName:'', birthPlace:'', dateOfBirth:'',
    occupation:'', indictment:'', intakeDate:'', sentenceEndDate:'',
    cellNum:'', securityLevelId:''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      prisonerId: Number(formData.prisonerId),
      cell: { cellNum: Number(formData.cellNum) },
      securityLevel: { securityLevelNo: Number(formData.securityLevelId) },
    };
    try {
      const url = editingId != null ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId != null ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setPrisoners((prev) => editingId != null
        ? prev.map((p) => p.prisonerId === editingId ? saved : p)
        : [...prev, saved]
      );
      clearForm(); setEditingId(null);
    } catch {
      showError('Ошибка сохранения');
    }
  };

  const handleEdit = (p) => {
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

  const handleDelete = async (id) => {
    if (borrowedData.some((b) => b.prisoner?.prisonerId === id)) {
      return showError('Нельзя удалить: есть выданные книги');
    }
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPrisoners((prev) => prev.filter((p) => p.prisonerId !== id));
      if (editingId === id) { setEditingId(null); clearForm(); }
    } catch {
      showError('Ошибка удаления');
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return prisoners;
    return prisoners.filter((p) =>
      Object.values({ ...p, ...p.cell, ...p.securityLevel })
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [prisoners, searchQuery]);

  // cell dialog
  const openCellDialog = async () => {
    try {
      const res = await fetch(CELLS_API_URL); setCells(await res.json());
    } catch { showError('Ошибка загрузки камер'); }
    setCellDialogOpen(true);
  };
  const createCell = async () => {
    const num = Number(newCellNum);
    if (cells.some((c) => c.cellNum === num)) return showError('Камера уже есть');
    try {
      const res = await fetch(CELLS_API_URL, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ cellNum: num })
      });
      setCells((prev) => [...prev, await res.json()]);
      setNewCellNum('');
    } catch { showError('Ошибка создания камеры'); }
  };
  const selectCell = (num) => {
    setFormData((p) => ({ ...p, cellNum: num })); setCellDialogOpen(false);
  };

  // security dialog
  const openSecurityDialog = async () => {
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL);
      setSecurityLevels(await res.json());
    } catch {
      showError('Ошибка загрузки уровней');
    }
    setSecurityDialogOpen(true);
  };
  const createSecurity = async () => {
    const lvl = Number(newSecurityLevel);
    if (securityLevels.some((l) => l.securityLevelNo === lvl)) return showError('Уровень уже есть');
    try {
      const res = await fetch(SECURITY_LEVELS_API_URL, {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ securityLevelNo: lvl })
      });
      setSecurityLevels((prev) => [...prev, await res.json()]);
      setNewSecurityLevel('');
    } catch { showError('Ошибка создания уровня'); }
  };
  const selectSecurity = (lvl) => {
    setFormData((p) => ({ ...p, securityLevelId: lvl }));
    setSecurityDialogOpen(false);
  };

  // books dialog
  const openBooksDialog = (p) => {
    setSelectedBooks(borrowedData.filter((b) => b.prisoner?.prisonerId === p.prisonerId));
    setBooksDialogOpen(true);
  };

  // certificates dialog
  const openCertDialog = (p) => {
    setSelectedCerts(
      certificateData.filter((c) => c.prisoner?.prisonerId === p.prisonerId)
    );
    setCertDialogOpen(true);
  };

  return (
    <Paper sx={{ p:4, maxWidth: 1400, mx:'auto', bgcolor:'#fafafa', borderRadius:2 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" align="center" gutterBottom>
        Управление заключёнными
      </Typography>

      {/* Form */}
      <Box component={motion.div}
           initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
           transition={{ duration:0.4 }}
           sx={{ mb:4 }}
      >
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Редактировать' : 'Добавить'} заключённого
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {[
              { xs:4, name:'prisonerId', label:'ID', type:'number', required: true, disabled: !!editingId },
              { xs:4, name:'firstName', label:'Имя', required: true },
              { xs:4, name:'lastName', label:'Фамилия', required: true },
              { xs:4, name:'birthPlace', label:'Место рождения' },
              { xs:4, name:'dateOfBirth', label:'Дата рождения', type:'date', required: true },
              { xs:4, name:'occupation', label:'Профессия' },
              { xs:4, name:'indictment', label:'Обвинение' },
              { xs:4, name:'intakeDate', label:'Начало наказания', type:'date' },
              { xs:4, name:'sentenceEndDate', label:'Конец наказания', type:'date' },
            ].map((f) => (
              <Grid item xs={12} sm={f.xs} key={f.name}>
                <TextField
                  fullWidth
                  label={f.label}
                  name={f.name}
                  type={f.type || 'text'}
                  value={formData[f.name]}
                  onChange={handleChange}
                  required={f.required || false}
                  disabled={f.disabled || false}
                  InputLabelProps={f.type === 'date' ? { shrink:true } : null}
                />
              </Grid>
            ))}

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Камера"
                value={formData.cellNum}
                onClick={openCellDialog}
                helperText="кликните для выбора"
                InputProps={{ readOnly:true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Уровень защиты"
                value={formData.securityLevelId}
                onClick={openSecurityDialog}
                helperText="кликните для выбора"
                InputProps={{ readOnly:true }}
              />
            </Grid>
            <Grid item xs={12} sm={4} display="flex" alignItems="center">
              <Button variant="contained" type="submit" fullWidth>
                {editingId ? 'Сохранить' : 'Добавить'}
              </Button>
            </Grid>
            {editingId && (
              <Grid item xs={12} sm={4} display="flex" alignItems="center">
                <Button variant="outlined" fullWidth onClick={() => { setEditingId(null); clearForm(); }}>
                  Отмена
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb:3 }}>
        <TextField
          fullWidth
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Table */}
      <Paper variant="outlined" sx={{ mb:4, overflowX:'auto' }}>
        <Table>
          <TableHead sx={{ bgcolor:'#1976d2' }}>
            <TableRow>
              {[
                'ID','Имя','Фамилия','Родился','Профессия','Обвинение',
                'Начало','Конец','Камера','Ур. защиты','Книги','Серты','Действия'
              ].map((h) => (
                <TableCell key={h} sx={{ color:'#fff', fontWeight:'bold' }} align={h==='Действия' ? 'center':'left'}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.prisonerId}
                component={motion.tr}
                whileHover={{ scale:1.02 }}
                sx={{ '&:nth-of-type(odd)':{ bgcolor:'#f5f5f5' }}}
              >
                <TableCell>{p.prisonerId}</TableCell>
                <TableCell>{p.firstName}</TableCell>
                <TableCell>{p.lastName}</TableCell>
                <TableCell>{p.dateOfBirth}</TableCell>
                <TableCell>{p.occupation}</TableCell>
                <TableCell>{p.indictment}</TableCell>
                <TableCell>{p.intakeDate}</TableCell>
                <TableCell>{p.sentenceEndDate}</TableCell>
                <TableCell>
                  <Button size="small" onClick={openCellDialog}>{p.cell?.cellNum}</Button>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={openSecurityDialog}>{p.securityLevel?.securityLevelNo}</Button>
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" startIcon={<BookIcon />} onClick={() => openBooksDialog(p)}>
                    {borrowedData.filter(b => b.prisoner?.prisonerId === p.prisonerId).length}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" startIcon={<CertificateIcon />} onClick={() => openCertDialog(p)}>
                    {certificateData.filter(c => c.prisoner?.prisonerId === p.prisonerId).length}
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button size="small" color="primary" startIcon={<EditIcon />} onClick={() => handleEdit(p)}>
                      Ред.
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(p.prisonerId)}>
                      Удл.
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialogs */}
      <CellDialog
        open={cellDialogOpen}
        cells={cells}
        newCell={newCellNum}
        onNewCellChange={setNewCellNum}
        onCreate={createCell}
        onSelect={selectCell}
        onClose={() => setCellDialogOpen(false)}
      />
      <SecurityDialog
        open={securityDialogOpen}
        levels={securityLevels}
        newLevel={newSecurityLevel}
        onNewLevelChange={setNewSecurityLevel}
        onCreate={createSecurity}
        onSelect={selectSecurity}
        onClose={() => setSecurityDialogOpen(false)}
      />
      <GenericListDialog
        open={booksDialogOpen}
        title="Книги заключённого"
        items={selectedBooks.map((b) => `ISBN ${b.id.isbn}`)}
        onClose={() => setBooksDialogOpen(false)}
      />
      <CertDialog
        open={certDialogOpen}
        certs={selectedCerts}
        onIssue={(c) => {}}
        onClose={() => setCertDialogOpen(false)}
      />
    </Paper>
  );
}
import React, { useEffect, useState } from 'react';
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
  Grid,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const INFIRMARY_API_URL  = 'http://localhost:8080/api/infirmary';
const PRISONER_API_URL  = 'http://localhost:8080/api/prisoners';

const Infirmary = () => {
  const [infirmary, setInfirmary]           = useState([]);
  const [formData, setFormData]             = useState({
    prisoner_id: '',
    related_doctor: '',
    drug_name: '',
    drug_usage_day: '',
    disease_type: '',
  });
  const [editingId, setEditingId]           = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [prisonersList, setPrisonersList]   = useState([]);
  const [prisonerDialogOpen, setPrisonerDialogOpen] = useState(false);

  // Snackbar для ошибок
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInfirmary();
  }, []);

  const showError = async (resOrErr, fallback) => {
    let msg = fallback;
    if (resOrErr instanceof Response) {
      try {
        const err = await resOrErr.json();
        msg = err.message || fallback;
      } catch {}
    } else if (resOrErr && resOrErr.message) {
      msg = resOrErr.message;
    }
    setErrorMessage(msg);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchInfirmary = async () => {
    try {
      const response = await fetch(INFIRMARY_API_URL);
      if (!response.ok) {
        return showError(response, 'Ошибка загрузки данных');
      }
      const data = await response.json();
      const records = Array.isArray(data) ? data : [data];
      const validRecords = [];
      for (const record of records) {
        if (record.prisoner) {
          validRecords.push({
            prescription_num: record.prescriptionNum,
            prisoner_id:      record.prisoner.prisonerId,
            related_doctor:   record.relatedDoctor,
            drug_name:        record.drugName,
            drug_usage_day:   record.drugUsageDay,
            disease_type:     record.diseaseType,
          });
        } else {
          // если нет привязки к заключённому — удаляем «битую» запись
          await fetch(`${INFIRMARY_API_URL}/${record.prescriptionNum}`, { method: 'DELETE' });
        }
      }
      setInfirmary(validRecords);
    } catch (error) {
      showError(error, 'Ошибка загрузки рецептов');
    }
  };

  const fetchPrisoners = async () => {
    try {
      const response = await fetch(PRISONER_API_URL);
      if (!response.ok) return showError(response, 'Ошибка загрузки заключённых');
      setPrisonersList(await response.json());
    } catch (error) {
      showError(error, 'Ошибка загрузки заключённых');
    }
    setPrisonerDialogOpen(true);
  };

  const handleShowPrisonersList = () => {
    fetchPrisoners();
  };

  const handleSelectPrisoner = (pr) => {
    setFormData(f => ({ ...f, prisoner_id: pr.prisonerId }));
    setPrisonerDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      prisoner_id:   '',
      related_doctor:'',
      drug_name:     '',
      drug_usage_day:'',
      disease_type:  '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      prisoner:      { prisonerId:    Number(formData.prisoner_id) },
      relatedDoctor: formData.related_doctor,
      drugName:      formData.drug_name,
      drugUsageDay:  Number(formData.drug_usage_day),
      diseaseType:   formData.disease_type,
    };
    try {
      const url    = editingId ? `${INFIRMARY_API_URL}/${editingId}` : INFIRMARY_API_URL;
      const method = editingId ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return showError(res, 'Ошибка при сохранении рецепта');
      }
      await fetchInfirmary();
      clearForm();
    } catch (error) {
      showError(error, 'Ошибка при сохранении');
    }
  };

  const handleEdit = (rec) => {
    setEditingId(rec.prescription_num);
    setFormData({
      prisoner_id:   rec.prisoner_id,
      related_doctor:rec.related_doctor,
      drug_name:     rec.drug_name,
      drug_usage_day:rec.drug_usage_day,
      disease_type:  rec.disease_type,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить рецепт?')) return;
    try {
      const res = await fetch(`${INFIRMARY_API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        return showError(res, 'Ошибка при удалении рецепта');
      }
      await fetchInfirmary();
      if (editingId === id) clearForm();
    } catch (error) {
      showError(error, 'Ошибка при удалении');
    }
  };

  const filtered = infirmary.filter(rec =>
    Object.values(rec).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, m: 'auto', mt: 4, borderRadius: 3, boxShadow: 4 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleSnackbarClose} sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h4" align="center" gutterBottom>
        Рецепты лечения
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 3, bgcolor: '#f7f7f7', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Редактировать рецепт' : 'Добавить новый рецепт'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ID заключённого"
              name="prisoner_id"
              value={formData.prisoner_id}
              onClick={handleShowPrisonersList}
              InputProps={{ readOnly: true }}
              helperText="Нажмите для выбора"
              required
              sx={{ cursor: 'pointer' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Лечащий врач"
              name="related_doctor"
              value={formData.related_doctor}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Препарат"
              name="drug_name"
              value={formData.drug_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Дозировка в день"
              name="drug_usage_day"
              type="number"
              value={formData.drug_usage_day}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Тип заболевания"
              name="disease_type"
              value={formData.disease_type}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button fullWidth variant="contained" color="primary" type="submit">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
          </Grid>
          {editingId && (
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button fullWidth variant="outlined" color="secondary" onClick={clearForm}>
                Отмена
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      <TextField
        fullWidth
        label="Поиск рецепта"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Table size="small" sx={{ mb: 3 }}>
        <TableHead sx={{ bgcolor: '#e3f2fd' }}>
          <TableRow>
            <TableCell><strong>ID заключённого</strong></TableCell>
            <TableCell><strong>Врач</strong></TableCell>
            <TableCell><strong>Препарат</strong></TableCell>
            <TableCell><strong>Доза/день</strong></TableCell>
            <TableCell><strong>Заболевание</strong></TableCell>
            <TableCell align="center"><strong>Действия</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(rec => (
            <TableRow key={rec.prescription_num} hover>
              <TableCell>{rec.prisoner_id}</TableCell>
              <TableCell>{rec.related_doctor}</TableCell>
              <TableCell>{rec.drug_name}</TableCell>
              <TableCell>{rec.drug_usage_day}</TableCell>
              <TableCell>{rec.disease_type}</TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button size="small" variant="contained" onClick={() => handleEdit(rec)}>
                    Ред.
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(rec.prescription_num)}>
                    Удалить
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={prisonerDialogOpen} onClose={() => setPrisonerDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Выберите заключённого
          <Button onClick={() => setPrisonerDialogOpen(false)}><CloseIcon /></Button>
        </DialogTitle>
        <DialogContent dividers>
          {prisonersList.length > 0 ? (
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Имя</strong></TableCell>
                  <TableCell><strong>Фамилия</strong></TableCell>
                  <TableCell><strong>Камера</strong></TableCell>
                  <TableCell><strong>Дата Рождения</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prisonersList.map(pr => (
                  <TableRow
                    key={pr.prisonerId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSelectPrisoner(pr)}
                  >
                    <TableCell>{pr.prisonerId}</TableCell>
                    <TableCell>{pr.firstName}</TableCell>
                    <TableCell>{pr.lastName}</TableCell>
                    <TableCell>{pr.cell?.cellNum ?? '-'}</TableCell>
                    <TableCell>{pr.dateOfBirth}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box textAlign="center" py={3}>
              <Typography>Нет заключённых</Typography>
              <Button variant="outlined" onClick={() => navigate('/prisoners')}>
                Добавить заключённого
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrisonerDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Infirmary;

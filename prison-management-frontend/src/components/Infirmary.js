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
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const INFIRMARY_API_URL = 'http://localhost:8080/api/infirmary';
const PRISONER_API_URL = 'http://localhost:8080/api/prisoners';

const Infirmary = () => {
  const [infirmary, setInfirmary] = useState([]);
  const [formData, setFormData] = useState({
    prisoner_id: '',
    related_doctor: '',
    drug_name: '',
    drug_usage_day: '',
    disease_type: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [prisonersList, setPrisonersList] = useState([]);
  const [prisonerDialogOpen, setPrisonerDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInfirmary();
  }, []);

  const fetchInfirmary = async () => {
    try {
      const response = await fetch(INFIRMARY_API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
      const records = Array.isArray(data) ? data : [data];
      const validRecords = [];
      for (const record of records) {
        if (record.prisoner) {
          validRecords.push({
            prescription_num: record.prescriptionNum,
            prisoner_id: record.prisoner.prisonerId,
            related_doctor: record.relatedDoctor,
            drug_name: record.drugName,
            drug_usage_day: record.drugUsageDay,
            disease_type: record.diseaseType,
          });
        } else {
          await fetch(`${INFIRMARY_API_URL}/${record.prescriptionNum}`, { method: 'DELETE' });
        }
      }
      setInfirmary(validRecords);
    } catch (error) {
      console.error('Ошибка загрузки рецептов:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearForm = () => {
    setFormData({
      prisoner_id: '',
      related_doctor: '',
      drug_name: '',
      drug_usage_day: '',
      disease_type: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const record = {
      prisoner: { prisonerId: Number(formData.prisoner_id) },
      relatedDoctor: formData.related_doctor,
      drugName: formData.drug_name,
      drugUsageDay: Number(formData.drug_usage_day),
      diseaseType: formData.disease_type,
    };

    try {
      const response = await fetch(
        editingId ? `${INFIRMARY_API_URL}/${editingId}` : INFIRMARY_API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }
      );
      if (!response.ok) throw new Error('Ошибка при сохранении рецепта');
      await fetchInfirmary();
      setEditingId(null);
      clearForm();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.prescription_num);
    setFormData({
      prisoner_id: record.prisoner_id,
      related_doctor: record.related_doctor,
      drug_name: record.drug_name,
      drug_usage_day: record.drug_usage_day,
      disease_type: record.disease_type,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${INFIRMARY_API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка при удалении рецепта');
      await fetchInfirmary();
      if (editingId === id) {
        setEditingId(null);
        clearForm();
      }
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  const handleShowPrisonersList = async () => {
    try {
      const response = await fetch(PRISONER_API_URL);
      if (!response.ok) throw new Error('Ошибка загрузки списка заключённых');
      const data = await response.json();
      setPrisonersList(data);
    } catch (error) {
      console.error('Ошибка при загрузке списка заключённых:', error);
      setPrisonersList([]);
    }
    setPrisonerDialogOpen(true);
  };

  const handleSelectPrisoner = (prisoner) => {
    setFormData(prev => ({ ...prev, prisoner_id: prisoner.prisonerId }));
    setPrisonerDialogOpen(false);
  };

  const filteredInfirmary = infirmary.filter(record =>
    Object.values(record)
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: 'auto', mt: 4, borderRadius: 3, boxShadow: 4, backgroundColor: '#fff' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
        Рецепты лечения
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f7f7f7' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {editingId ? 'Редактировать рецепт' : 'Добавить новый рецепт'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Prisoner ID"
              type="number"
              name="prisoner_id"
              value={formData.prisoner_id}
              onChange={handleChange}
              required
              helperText="Нажмите для выбора заключённого"
              onClick={handleShowPrisonersList}
              sx={{ cursor: 'pointer' }}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Related Doctor"
              type="text"
              name="related_doctor"
              value={formData.related_doctor}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Drug Name"
              type="text"
              name="drug_name"
              value={formData.drug_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Usage per Day"
              type="number"
              name="drug_usage_day"
              value={formData.drug_usage_day}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Disease Type"
              type="text"
              name="disease_type"
              value={formData.disease_type}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              {editingId ? 'Сохранить изменения' : 'Добавить рецепт'}
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
      </Box>

      <TextField
        fullWidth
        label="Поиск рецепта"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Table sx={{ mb: 3 }} size="small">
        <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
          <TableRow>
            <TableCell><strong>Prisoner ID</strong></TableCell>
            <TableCell><strong>Related Doctor</strong></TableCell>
            <TableCell><strong>Drug Name</strong></TableCell>
            <TableCell><strong>Usage per Day</strong></TableCell>
            <TableCell><strong>Disease Type</strong></TableCell>
            <TableCell align="center"><strong>Действия</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredInfirmary.map(record => (
            <TableRow key={record.prescription_num} hover>
              <TableCell>{record.prisoner_id}</TableCell>
              <TableCell>{record.related_doctor}</TableCell>
              <TableCell>{record.drug_name}</TableCell>
              <TableCell>{record.drug_usage_day}</TableCell>
              <TableCell>{record.disease_type}</TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(record)}
                  >
                    Ред.
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(record.prescription_num)}
                  >
                    Удалить
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={prisonerDialogOpen}
        onClose={() => setPrisonerDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Список заключённых
          <Button onClick={() => setPrisonerDialogOpen(false)} sx={{ color: 'grey.600' }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {prisonersList.length > 0 ? (
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Имя</strong></TableCell>
                  <TableCell><strong>Фамилия</strong></TableCell>
                  <TableCell><strong>Место Рождения</strong></TableCell>
                  <TableCell><strong>Дата Рождения</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prisonersList.map(prisoner => (
                  <TableRow
                    key={prisoner.prisonerId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSelectPrisoner(prisoner)}
                  >
                    <TableCell>{prisoner.prisonerId}</TableCell>
                    <TableCell>{prisoner.firstName}</TableCell>
                    <TableCell>{prisoner.lastName}</TableCell>
                    <TableCell>{prisoner.birthPlace}</TableCell>
                    <TableCell>{prisoner.dateOfBirth}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Grid container direction="column" alignItems="center" spacing={2}>
              <Grid item>
                <Typography>Нет заключённых</Typography>
              </Grid>
              <Grid item>
                <Button variant="outlined" color="primary" onClick={() => navigate('/prisoners')}>
                  Создать нового
                </Button>
              </Grid>
            </Grid>
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

import React, { useEffect, useState } from 'react';
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
  Stack,
  Box
} from '@mui/material';

const API_URL = 'http://localhost:8080/api/cells';

function Cells() {
  const [cells, setCells] = useState([]);
  const [editingCellId, setEditingCellId] = useState(null);
  const [editingDate, setEditingDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCellNum, setNewCellNum] = useState('');
  const [newLastShakedownDate, setNewLastShakedownDate] = useState('');

  useEffect(() => {
    fetchCells();
  }, []);

  const fetchCells = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Сетевая ошибка');
      }
      const data = await response.json();
      setCells(data);
    } catch (error) {
      console.error('Ошибка загрузки данных камер:', error);
    }
  };

  const handleEdit = (cell) => {
    setEditingCellId(cell.cellNum);
    const dateStr = cell.lastShakedownDate ? cell.lastShakedownDate.split('T')[0] : '';
    setEditingDate(dateStr);
  };

  const handleCancel = () => {
    setEditingCellId(null);
    setEditingDate('');
  };

  const handleSave = async (cellNum) => {
    const updatedCell = {
      cellNum, 
      lastShakedownDate: editingDate
    };

    try {
      const response = await fetch(`${API_URL}/${cellNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCell),
      });
      if (!response.ok) {
        throw new Error('Ошибка обновления данных');
      }
      await fetchCells();
      setEditingCellId(null);
      setEditingDate('');
    } catch (error) {
      console.error('Ошибка при обновлении даты:', error);
    }
  };

  const handleCreate = async () => {
    if (!newCellNum) {
      alert("Введите номер камеры");
      return;
    }
    const newCell = {
      cellNum: parseInt(newCellNum, 10),
      lastShakedownDate: newLastShakedownDate
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCell),
      });
      if (!response.ok) {
        throw new Error('Ошибка создания камеры');
      }
      await fetchCells();
      setNewCellNum('');
      setNewLastShakedownDate('');
    } catch (error) {
      console.error('Ошибка при создании камеры:', error);
    }
  };

  const handleDelete = async (cellNum) => {
    if (window.confirm('Вы действительно хотите удалить камеру?')) {
      try {
        const response = await fetch(`${API_URL}/${cellNum}`, {
          method: 'DELETE'
        });
        if (response.status === 409) {
          // Если камера занята заключённым, выводим уведомление
          alert('Невозможно удалить камеру, так как в ней находится заключённый.');
          return;
        }
        if (!response.ok) {
          throw new Error('Ошибка удаления камеры');
        }
        await fetchCells();
      } catch (error) {
        console.error('Ошибка при удалении камеры:', error);
      }
    }
  };

  const filteredCells = cells.filter(cell =>
    cell.cellNum.toString().includes(searchTerm)
  );

  return (
    <Paper sx={{ padding: 4, maxWidth: 900, margin: 'auto', mt: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Управление камерами
      </Typography>

      <Box sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fafafa' }}>
        <Typography variant="h6" gutterBottom>
          Создать новую камеру
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Номер камеры"
            value={newCellNum}
            onChange={(e) => setNewCellNum(e.target.value)}
            type="number"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Дата проверки"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newLastShakedownDate}
            onChange={(e) => setNewLastShakedownDate(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={handleCreate} sx={{ whiteSpace: 'nowrap' }}>
            Создать
          </Button>
        </Stack>
      </Box>

      {/* Поиск */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Поиск по номеру камеры"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Box>

      <Table>
        <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
          <TableRow>
            <TableCell><strong>Номер камеры</strong></TableCell>
            <TableCell><strong>Дата последней проверки</strong></TableCell>
            <TableCell><strong>ID заключённого</strong></TableCell>
            <TableCell align="center"><strong>Действия</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCells.map(cell => (
            <TableRow key={cell.cellNum} hover>
              <TableCell>{cell.cellNum}</TableCell>
              <TableCell>
                {editingCellId === cell.cellNum ? (
                  <TextField
                    value={editingDate}
                    onChange={(e) => setEditingDate(e.target.value)}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                ) : (
                  cell.lastShakedownDate ? cell.lastShakedownDate.split('T')[0] : ''
                )}
              </TableCell>
              <TableCell>
                { cell.prisoners && cell.prisoners.length > 0 
                  ? cell.prisoners.map(p => p.id).join(', ') 
                  : '-' 
                }
              </TableCell>
              <TableCell align="center">
                {editingCellId === cell.cellNum ? (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleSave(cell.cellNum)}
                    >
                      Сохранить
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={handleCancel}
                    >
                      Отмена
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button 
                      variant="outlined" 
                      onClick={() => handleEdit(cell)}
                    >
                      Редактировать
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleDelete(cell.cellNum)}
                    >
                      Удалить
                    </Button>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default Cells;

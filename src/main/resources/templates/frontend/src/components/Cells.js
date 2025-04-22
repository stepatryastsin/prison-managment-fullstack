import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

function Cells() {
  const [cells, setCells] = useState([]);

  useEffect(() => {
    // Запрос к API для получения данных камер
    fetch('http://localhost:8080/api/cells')
      .then(response => response.json())
      .then(data => setCells(data))
      .catch(error => console.error('Ошибка при загрузке данных камер:', error));
  }, []);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Список камер
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Номер камеры</TableCell>
            <TableCell>Дата последней проверки</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cells.map(cell => (
            <TableRow key={cell.cellNum}>
              <TableCell>{cell.cellNum}</TableCell>
              <TableCell>{cell.lastShakedownDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default Cells;
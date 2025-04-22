import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

function Prisoners() {
  const [prisoners, setPrisoners] = useState([]);

  useEffect(() => {
    // Запрос к бекенду (предполагается, что API доступен по адресу http://localhost:8080/api/prisoners)
    fetch('http://localhost:8080/api/prisoners')
      .then(response => response.json())
      .then(data => setPrisoners(data))
      .catch(error => console.error('Ошибка при загрузке данных заключённых:', error));
  }, []);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Список заключённых
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Имя</TableCell>
            <TableCell>Фамилия</TableCell>
            <TableCell>Дата рождения</TableCell>
            <TableCell>Профессия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prisoners.map(prisoner => (
            <TableRow key={prisoner.prisonerId}>
              <TableCell>{prisoner.prisonerId}</TableCell>
              <TableCell>{prisoner.firstName}</TableCell>
              <TableCell>{prisoner.lastName}</TableCell>
              <TableCell>{prisoner.dateOfBirth}</TableCell>
              <TableCell>{prisoner.occupation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default Prisoners;
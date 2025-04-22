import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

function Staff() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    // Запрос к API для получения данных персонала
    fetch('http://localhost:8080/api/staff')
      .then(response => response.json())
      .then(data => setStaff(data))
      .catch(error => console.error('Ошибка при загрузке данных персонала:', error));
  }, []);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Список персонала
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Имя</TableCell>
            <TableCell>Фамилия</TableCell>
            <TableCell>Должность</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staff.map(member => (
            <TableRow key={member.staffId}>
              <TableCell>{member.staffId}</TableCell>
              <TableCell>{member.firstName}</TableCell>
              <TableCell>{member.lastName}</TableCell>
              <TableCell>{member.jobDescription}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default Staff;
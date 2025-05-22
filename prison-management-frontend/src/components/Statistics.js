// src/components/Statistics.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Button,
  Divider
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);
  const apiBase = 'http://localhost:8080';

  useEffect(() => {
    axios.get(`${apiBase}/api/statistics/report`)
      .then(res => setData(res.data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <Alert severity="error" sx={{ mt:4 }}>Ошибка: {error}</Alert>;
  if (!data) return (
    <Box textAlign="center" sx={{ mt:8 }}>
      <CircularProgress size={60}/>
    </Box>
  );

  // helpers
  const toChart = (arr = [], label='category', val='value') => ({
    labels: arr.map(x => x[label]),
    datasets: [{ data: arr.map(x => x[val]), backgroundColor: arr.map((_,i)=>
      `hsl(${i*360/arr.length},70%,60%)` ) }]
  });
  const toLine = (arr = [], label='period', val='value') => ({
    labels: arr.map(x => x[label]),
    datasets: [{ data: arr.map(x => x[val]), fill:false, tension:0.3,
      borderColor:'#1976d2', pointBackgroundColor:'#1976d2', borderWidth:2 }]
  });
  const opts = { responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false} } };
  const CH=260;

  const ChartBlock = ({ title, Comp, chartData, options }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper sx={{p:2,height:CH+60}} elevation={2}>
        <Typography variant="subtitle1" gutterBottom>{title}</Typography>
        <Box sx={{height:CH}}><Comp data={chartData} options={options||opts}/></Box>
      </Paper>
    </Grid>
  );
  const StatCard = ({label,value}) => (
    <Grid item xs={12} sm={6} md={4}>
      <Paper sx={{p:3,textAlign:'center'}} elevation={2}>
        <Typography variant="subtitle1">{label}</Typography>
        <Typography variant="h3" color="primary">{value}%</Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{px:{xs:2,md:4},py:3}}>
      <Typography variant="h4" align="center" gutterBottom>Полная статистика</Typography>
      <Box textAlign="center" sx={{mb:3}}>
        <Button variant="contained" onClick={async()=>{
          try{
            const res = await axios.get(`${apiBase}/api/statistics/report/docx`,{responseType:'blob'});
            const url=URL.createObjectURL(new Blob([res.data]));
            const a=document.createElement('a'); a.href=url; a.download='Statistics_Report.docx';
            document.body.append(a); a.click(); a.remove();
          }catch{ setError('Не удалось скачать отчёт'); }
        }}>Скачать отчёт в Word</Button>
      </Box>
      <Divider sx={{mb:4}}/>

      {/* Общие распределения */}
      <Typography variant="h5" gutterBottom>Общие распределения</Typography>
      <Grid container spacing={2} sx={{mb:4}}>
        <ChartBlock title="Уровни безопасности" Comp={Pie}
          chartData={toChart(data.securityLevelDistribution)} />
        <ChartBlock title="Возрастные группы по безопасности" Comp={Pie}
          chartData={toChart(data.prisonersBySecurityAndAgeGroup,'subgroup_label','value')} />
        <ChartBlock title="Типы болезней" Comp={Pie}
          chartData={toChart(data.diseaseDistribution)} />
      </Grid>

      {/* Топ-листы */}
      <Typography variant="h5" gutterBottom>Топ-листы</Typography>
      <Grid container spacing={2} sx={{mb:4}}>
        <ChartBlock title="Топ-5 читаемых книг" Comp={Bar}
          chartData={toChart(data.topBorrowedBooks)} options={{...opts,indexAxis:'y'}} />
        <ChartBlock title="Топ-5 посещаемых" Comp={Bar}
          chartData={toChart(data.topVisitedPrisoners)} options={{...opts,indexAxis:'y'}} />
      </Grid>

      {/* Сроки и занятость */}
      <Typography variant="h5" gutterBottom>Сроки и занятость</Typography>
      <Grid container spacing={2} sx={{mb:4}}>
        <ChartBlock title="Средний срок по профессиям" Comp={Bar}
          chartData={toChart(data.avgSentenceByOccupation)} />
        <ChartBlock title="Средний % отбыто по безопасности" Comp={Bar}
          chartData={toChart(data.avgTimeServedPercentBySecurity,'group_label','value')} />
        <ChartBlock title="Загруженность камер" Comp={Bar}
          chartData={toChart(data.cellOccupancy)} options={{...opts,indexAxis:'y'}} />
      </Grid>

      {/* Расширенная аналитика */}
      <Typography variant="h5" gutterBottom>Расширенная аналитика</Typography>
      <Grid container spacing={2} sx={{mb:4}}>
        <StatCard label={data.enrollmentRate[0].label} value={data.enrollmentRate[0].value} />
        <ChartBlock title="Освобождения (3 мес.)" Comp={Line}
          chartData={toLine(data.upcomingReleases)} />
      </Grid>

      {/* Временные ряды */}
      <Typography variant="h5" gutterBottom>Временные ряды</Typography>
      <Grid container spacing={2}>
        <ChartBlock title="Новые за 12 мес." Comp={Line}
          chartData={toLine(data.monthlyNewPrisoners)} />
        <ChartBlock title="Посещения за 12 мес." Comp={Line}
          chartData={toLine(data.monthlyVisits)} />
      </Grid>
    </Box>
  );
}

import React, { useEffect, useState, useMemo } from 'react'
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
  Box,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Slide,
  Tooltip
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import SortIcon from '@mui/icons-material/Sort'
import GetAppIcon from '@mui/icons-material/GetApp'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

const API_URL = 'http://localhost:8080/api/job'

const Job = () => {
  const [jobs, setJobs] = useState([])
  const [editingJobId, setEditingJobId] = useState(null)
  const [editingDescription, setEditingDescription] = useState('')
  const [newJobDescription, setNewJobDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchJobs()
  }, [])

  const checkJobUsage = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/usage`)
      if (!response.ok) throw new Error('Usage check error')
      const { usageCount } = await response.json()
      return usageCount
    } catch (error) {
      console.error('Ошибка проверки использования работы:', error)
      return null
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Network error')
      const data = await response.json()
      const jobsWithUsage = await Promise.all(
        data.map(async (job) => {
          const usageCount = await checkJobUsage(job.jobId)
          return { ...job, usageCount }
        })
      )
      setJobs(jobsWithUsage)
    } catch (error) {
      console.error('Ошибка загрузки данных о должностях:', error)
      openSnackbar('Ошибка загрузки данных', 'error')
    }
  }

  const handleEdit = (job) => {
    setEditingJobId(job.jobId)
    setEditingDescription(job.jobDescription)
  }

  const handleCancel = () => {
    setEditingJobId(null)
    setEditingDescription('')
  }

  const handleSave = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id, jobDescription: editingDescription }),
      })
      if (!response.ok) throw new Error('Update error')
      fetchJobs()
      setEditingJobId(null)
      setEditingDescription('')
      openSnackbar('Должность обновлена')
    } catch (error) {
      console.error('Ошибка при обновлении должности:', error)
      openSnackbar('Ошибка обновления', 'error')
    }
  }

  const handleCreate = async () => {
    if (!newJobDescription.trim()) return
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: newJobDescription }),
      })
      if (!response.ok) throw new Error('Creation error')
      setNewJobDescription('')
      fetchJobs()
      openSnackbar('Должность добавлена')
    } catch (error) {
      console.error('Ошибка при создании новой работы:', error)
      openSnackbar('Ошибка создания', 'error')
    }
  }

  const handleDelete = async (id) => {
    const usageCount = await checkJobUsage(id)
    if (usageCount === null) return alert('Ошибка проверки использования работы')
    if (usageCount > 0)
      return alert(`Нельзя удалить работу, так как она используется сотрудниками: ${usageCount}`)
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete error')
      fetchJobs()
      openSnackbar('Должность удалена')
    } catch (error) {
      console.error('Ошибка при удалении работы:', error)
      alert('Ошибка при удалении работы')
    }
  }

  // Filtering and sorting jobs
  const filteredSortedJobs = useMemo(() => {
    let result = jobs.filter(job =>
      job.jobDescription.toLowerCase().includes(searchQuery.toLowerCase())
    )
    result.sort((a, b) => {
      if (a.jobDescription < b.jobDescription) return sortOrder === 'asc' ? -1 : 1
      if (a.jobDescription > b.jobDescription) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [jobs, searchQuery, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const openSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }
  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false })

  // Export jobs to CSV
  const handleExportCSV = () => {
    const header = ['Job ID', 'Job Description', 'Usage Count']
    const rows = filteredSortedJobs.map(job => [
      job.jobId,
      `"${job.jobDescription.replace(/"/g, '""')}"`,
      job.usageCount !== null && job.usageCount !== undefined ? job.usageCount : '-'
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows].map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'jobs_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 1000, margin: 'auto', mt: 3, boxShadow: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Список должностей
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          label="Описание новой работы"
          value={newJobDescription}
          onChange={(e) => setNewJobDescription(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleCreate} startIcon={<SaveIcon />}>
          Добавить
        </Button>
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Поиск по описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 300 }}
        />
        <Stack direction="row" spacing={1}>
          <Tooltip title="Сортировать">
            <IconButton onClick={toggleSortOrder}>
              <SortIcon color="action" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспортировать CSV">
            <IconButton onClick={handleExportCSV}>
              <GetAppIcon color="action" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Table>
        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
          <TableRow>
            <TableCell><strong>ID</strong></TableCell>
            <TableCell><strong>Описание</strong></TableCell>
            <TableCell><strong>Используется</strong></TableCell>
            <TableCell align="center"><strong>Действия</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredSortedJobs.map((job) => (
            <TableRow key={job.jobId} hover>
              <TableCell>{job.jobId}</TableCell>
              <TableCell>
                {editingJobId === job.jobId ? (
                  <TextField
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  job.jobDescription
                )}
              </TableCell>
              <TableCell>
                {job.usageCount !== null && job.usageCount !== undefined ? job.usageCount : '-'}
              </TableCell>
              <TableCell align="center">
                {editingJobId === job.jobId ? (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Сохранить изменения">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSave(job.jobId)}
                        startIcon={<SaveIcon />}
                      >
                        Сохранить
                      </Button>
                    </Tooltip>
                    <Tooltip title="Отмена">
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        startIcon={<CancelIcon />}
                      >
                        Отмена
                      </Button>
                    </Tooltip>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Редактировать">
                      <Button
                        variant="outlined"
                        onClick={() => handleEdit(job)}
                        startIcon={<EditIcon />}
                      >
                        Редактировать
                      </Button>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(job.jobId)}
                      >
                        Удалить
                      </Button>
                    </Tooltip>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
          {filteredSortedJobs.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Нет данных
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}

export default Job

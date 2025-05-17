// src/pages/SecurityLevels.jsx

import React, { useEffect, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Slide,
} from '@mui/material'
import { useTheme, styled } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import InfoIcon from '@mui/icons-material/Info'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

const API_URL = 'http://localhost:8080/api/sl'

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
  margin: 'auto',
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[4],
}))

export default function SecurityLevels({ readOnly = false }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)

  // только если не readOnly:
  const [createOpen, setCreateOpen] = useState(false)
  const [newLevelNo, setNewLevelNo] = useState('')
  const [newDesc, setNewDesc] = useState('')

  // детали доступны всем:
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  // edit / delete только если не readOnly:
  const [editId, setEditId] = useState(null)
  const [editDesc, setEditDesc] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, levelNo: null })

  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' })
  const openSnack = (msg, sev = 'success') => setSnack({ open: true, msg, sev })
  const closeSnack = () => setSnack(s => ({ ...s, open: false }))

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })
      if (!res.ok) throw new Error(`Ошибка: ${res.status}`)
      const data = await res.json()
      setLevels(data)
    } catch (e) {
      openSnack(`Ошибка загрузки: ${e.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          securityLevelNo: Number(newLevelNo),
          description: newDesc
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || res.statusText)
      }
      openSnack('Уровень создан')
      setCreateOpen(false)
      setNewLevelNo('')
      setNewDesc('')
      fetchLevels()
    } catch (e) {
      openSnack(`Ошибка создания: ${e.message}`, 'error')
    }
  }

  const handleEditInit = lvl => {
    setEditId(lvl.securityLevelNo)
    setEditDesc(lvl.description || '')
  }

  const handleSave = async levelNo => {
    try {
      const res = await fetch(`${API_URL}/${levelNo}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ securityLevelNo: levelNo, description: editDesc })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || res.statusText)
      }
      openSnack('Уровень обновлён')
      setEditId(null)
      fetchLevels()
    } catch (e) {
      openSnack(`Ошибка обновления: ${e.message}`, 'error')
    }
  }

  const handleDelete = async levelNo => {
    try {
      const res = await fetch(`${API_URL}/${levelNo}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || res.statusText)
      }
      openSnack('Уровень удалён')
      fetchLevels()
    } catch (e) {
      openSnack(`Ошибка удаления: ${e.message}`, 'error')
    } finally {
      setDeleteConfirm({ open:false, levelNo:null })
    }
  }

  const openDetail = lvl => {
    setDetailItem(lvl)
    setDetailOpen(true)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container component={motion.div} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
      <AppBar position="static" color="primary" sx={{ mb:2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow:1 }}>Уровни безопасности</Typography>
          {/* Кнопка создания — только если не readOnly */}
          {!readOnly && (
            <Button color="inherit" startIcon={<AddIcon />} onClick={()=>setCreateOpen(true)}>
              Новый уровень
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Grid container spacing={3}>
        <AnimatePresence>
          {levels.map(lvl => (
            <Grid key={lvl.securityLevelNo} item xs={12} sm={6} md={4}>
              <motion.div whileHover={{scale:1.03}}>
                <Card sx={{ display:'flex', flexDirection:'column', height:'100%', boxShadow:3 }}>
                  <CardHeader
                    avatar={<Avatar sx={{ bgcolor:'secondary.main' }}>{lvl.securityLevelNo}</Avatar>}
                    title={`Уровень №${lvl.securityLevelNo}`}
                    subheader={lvl.description || '—'}
                    action={
                      <Stack direction="row" spacing={1}>
                        {/* Кнопки редактирования и удаления — только если не readOnly */}
                        {!readOnly && (
                          <>
                            <IconButton size="small" onClick={()=>handleEditInit(lvl)}>
                              <EditIcon fontSize="small"/>
                            </IconButton>
                            <IconButton size="small" color="error" onClick={()=>setDeleteConfirm({open:true,levelNo:lvl.securityLevelNo})}>
                              <DeleteIcon fontSize="small"/>
                            </IconButton>
                          </>
                        )}
                        {/* Инфо — всегда */}
                        <IconButton size="small" onClick={()=>openDetail(lvl)}>
                          <InfoIcon fontSize="small"/>
                        </IconButton>
                      </Stack>
                    }
                  />
                  {/* Inline-редактирование — только если не readOnly */}
                  {!readOnly && editId === lvl.securityLevelNo && (
                    <CardContent sx={{ mt:'auto' }}>
                      <Stack spacing={2}>
                        <TextField
                          label="Описание"
                          value={editDesc}
                          onChange={e=>setEditDesc(e.target.value)}
                          fullWidth size="small"
                        />
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button variant="contained" startIcon={<SaveIcon />} onClick={()=>handleSave(lvl.securityLevelNo)}>
                            Сохранить
                          </Button>
                          <Button variant="outlined" startIcon={<CancelIcon />} onClick={()=>setEditId(null)}>
                            Отмена
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* Create Dialog — только если не readOnly */}
      {!readOnly && (
        <Dialog open={createOpen} onClose={()=>setCreateOpen(false)}>
          <DialogTitle>Новый уровень</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt:1 }}>
              <TextField
                label="Номер уровня"
                type="number"
                value={newLevelNo}
                onChange={e=>setNewLevelNo(e.target.value)}
                fullWidth
              />
              <TextField
                label="Описание"
                value={newDesc}
                onChange={e=>setNewDesc(e.target.value)}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setCreateOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={handleCreate}>Создать</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Detail Dialog — всегда */}
      <Dialog open={detailOpen} onClose={()=>setDetailOpen(false)}>
        <DialogTitle>Детали уровня</DialogTitle>
        <DialogContent dividers>
          {detailItem && (
            <>
              <Typography><strong>№{detailItem.securityLevelNo}</strong></Typography>
              <Typography sx={{ mt:1 }}>{detailItem.description || '—'}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDetailOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm — только если не readOnly */}
      {!readOnly && (
        <Dialog
          open={deleteConfirm.open}
          onClose={()=>setDeleteConfirm({open:false,levelNo:null})}
        >
          <DialogTitle>Удалить уровень</DialogTitle>
          <DialogContent>
            Уверены, что хотите удалить уровень №{deleteConfirm.levelNo}?
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDeleteConfirm({open:false,levelNo:null})}>Отмена</Button>
            <Button color="error" onClick={()=>handleDelete(deleteConfirm.levelNo)}>Удалить</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
        TransitionComponent={Slide}
      >
        <Alert onClose={closeSnack} severity={snack.sev} sx={{ width:'100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  )
}

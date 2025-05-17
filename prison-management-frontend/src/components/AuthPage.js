import React, { useState, useCallback } from 'react';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  Container,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/system';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

axios.defaults.withCredentials = true;

// Стили
const Background = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  width: '100%',
  maxWidth: 400,
}));

// Схема валидации
const loginSchema = object({
  username: string().required('Введите логин'),
  password: string().required('Введите пароль'),
});

function AuthPage({ onLogin }) {
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = useCallback(async (credentials) => {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8080/auth/login', credentials);
      onLogin(); // success
    } catch (err) {
      setSubmitError('Неверный логин или пароль');
    } finally {
      setIsSubmitting(false);
    }
  }, [onLogin]);

  return (
    <Background>
      <Container component="main">
        <StyledPaper elevation={8}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              Вход в систему
            </Typography>
          </Box>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            autoComplete="on"
          >
            <TextField
              label="Логин"
              fullWidth
              margin="normal"
              autoFocus
              autoComplete="username"
              {...register('username')}
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              aria-invalid={!!errors.username}
            />

            <TextField
              label="Пароль"
              fullWidth
              margin="normal"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              aria-invalid={!!errors.password}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </Background>
  );
}

export default AuthPage;
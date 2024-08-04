// pages/login.js
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { auth } from '../firebase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/'); // Redirect to home page after successful login
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"100vh"}
            padding={3}
        >
            <Typography variant="h4" marginBottom={2}>Login</Typography>
            <form onSubmit={handleLogin}>
                <Stack spacing={2} width={400}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button variant="contained" type="submit" fullWidth>
                        Log In
                    </Button>
                </Stack>
            </form>
            <Button
                variant="text"
                color="primary"
                onClick={() => router.push('/signup')}
                sx={{ marginTop: 2 }}
            >
                Don&apos;t have an account? Sign Up
            </Button>
        </Box>
    );
}

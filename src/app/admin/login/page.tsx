'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Title,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Stack,
    Alert,
} from '@mantine/core';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/admin');
            } else {
                setError(data.error || 'Invalid password');
            }
        } catch (err: any) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={100}>
            <Paper withBorder shadow="md" p={30} radius="md">
                <Stack gap="md">
                    <div style={{ textAlign: 'center' }}>
                        <IconLock size={48} style={{ margin: '0 auto 16px' }} />
                        <Title order={2}>Admin Dashboard</Title>
                        <Text c="dimmed" size="sm" mt={5}>
                            Enter password to access analytics
                        </Text>
                    </div>

                    {error && (
                        <Alert icon={<IconAlertCircle size={16} />} color="red">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleLogin}>
                        <Stack gap="md">
                            <PasswordInput
                                label="Password"
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                size="md"
                            />

                            <Button type="submit" fullWidth size="md" loading={loading}>
                                Login
                            </Button>
                        </Stack>
                    </form>

                    <Text size="xs" c="dimmed" ta="center">
                        Protected by password authentication
                    </Text>
                </Stack>
            </Paper>
        </Container>
    );
}

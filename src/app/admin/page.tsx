'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Title,
    Grid,
    Paper,
    Text,
    Button,
    Stack,
    Group,
    Table,
    Badge,
    LoadingOverlay,
    Alert,
    Card,
    SimpleGrid,
} from '@mantine/core';
import { LineChart, PieChart } from '@mantine/charts';
import {
    IconUsers,
    IconPhoto,
    IconGitBranch,
    IconActivity,
    IconDownload,
    IconLogout,
    IconAlertCircle,
    IconCheck,
} from '@tabler/icons-react';
import type { AnalyticsSummary } from '@/lib/admin/analytics';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState<AnalyticsSummary | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/analytics');
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                if (response.status === 401) {
                    router.push('/admin/login');
                } else {
                    setError(result.error || 'Failed to load analytics');
                }
            }
        } catch (err: any) {
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const handleExport = () => {
        window.open('/api/admin/export', '_blank');
    };

    if (loading) {
        return (
            <Container size="xl" py="xl">
                <LoadingOverlay visible={true} />
            </Container>
        );
    }

    if (error || !data) {
        return (
            <Container size="xl" py="xl">
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                    {error || 'No data available'}
                </Alert>
            </Container>
        );
    }

    // Prepare chart data
    const dailyChartData = data.dailyStats.map((stat) => ({
        date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Memes: stat.memes,
        Evolutions: stat.evolutions,
    }));

    const templateChartData = data.popularTemplates.map((template) => ({
        name: template.name,
        value: template.count,
        color: getRandomColor(),
    }));

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between">
                    <div>
                        <Title order={1}>Admin Dashboard</Title>
                        <Text c="dimmed" size="sm">
                            EvoMeme AI Analytics & Monitoring
                        </Text>
                    </div>
                    <Group>
                        <Button
                            leftSection={<IconDownload size={16} />}
                            variant="light"
                            onClick={handleExport}
                        >
                            Export CSV
                        </Button>
                        <Button
                            leftSection={<IconLogout size={16} />}
                            variant="subtle"
                            color="red"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Group>
                </Group>

                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                    <StatsCard
                        title="Total Memes"
                        value={data.totalMemes}
                        icon={<IconPhoto size={24} />}
                        color="blue"
                    />
                    <StatsCard
                        title="Total Sessions"
                        value={data.totalSessions}
                        icon={<IconUsers size={24} />}
                        color="green"
                    />
                    <StatsCard
                        title="Evolutions"
                        value={data.totalEvolutions}
                        icon={<IconGitBranch size={24} />}
                        color="violet"
                    />
                    <StatsCard
                        title="Success Rate"
                        value={`${data.successRate.toFixed(1)}%`}
                        icon={<IconCheck size={24} />}
                        color="teal"
                    />
                </SimpleGrid>

                {/* Charts */}
                <Grid>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Paper withBorder p="md" radius="md">
                            <Title order={3} mb="md">
                                Activity (Last 7 Days)
                            </Title>
                            <LineChart
                                h={300}
                                data={dailyChartData}
                                dataKey="date"
                                series={[
                                    { name: 'Memes', color: 'blue' },
                                    { name: 'Evolutions', color: 'violet' },
                                ]}
                                curveType="monotone"
                            />
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Paper withBorder p="md" radius="md">
                            <Title order={3} mb="md">
                                Popular Templates
                            </Title>
                            <PieChart
                                h={300}
                                data={templateChartData}
                                withLabelsLine
                                labelsPosition="outside"
                                labelsType="percent"
                                withTooltip
                            />
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Recent Memes */}
                <Paper withBorder p="md" radius="md">
                    <Title order={3} mb="md">
                        Recent Memes
                    </Title>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Caption</Table.Th>
                                <Table.Th>Template</Table.Th>
                                <Table.Th>Created</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.recentMemes.map((meme) => (
                                <Table.Tr key={meme.id}>
                                    <Table.Td>
                                        <Text size="xs" c="dimmed">
                                            {meme.id.substring(0, 8)}...
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" lineClamp={1}>
                                            {meme.caption || '(no caption)'}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light">{meme.template}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="xs" c="dimmed">
                                            {new Date(meme.created_at).toLocaleString()}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Paper>

                {/* Error Logs */}
                {data.errorLogs.length > 0 && (
                    <Paper withBorder p="md" radius="md">
                        <Title order={3} mb="md">
                            Recent Errors
                        </Title>
                        <Table striped>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Timestamp</Table.Th>
                                    <Table.Th>Error</Table.Th>
                                    <Table.Th>Context</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.errorLogs.map((log, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>
                                            <Text size="xs" c="dimmed">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="red">
                                                {log.error}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="xs" c="dimmed">
                                                {log.context}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                )}

                {/* System Info */}
                <Paper withBorder p="md" radius="md">
                    <Title order={3} mb="md">
                        System Information
                    </Title>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                        <div>
                            <Text size="sm" c="dimmed">
                                Total Events
                            </Text>
                            <Text size="lg" fw={500}>
                                {data.totalEvents.toLocaleString()}
                            </Text>
                        </div>
                        <div>
                            <Text size="sm" c="dimmed">
                                Avg Generation Time
                            </Text>
                            <Text size="lg" fw={500}>
                                {data.avgGenerationTime.toFixed(0)}ms
                            </Text>
                        </div>
                        <div>
                            <Text size="sm" c="dimmed">
                                Database Status
                            </Text>
                            <Badge color="green" variant="light">
                                Operational
                            </Badge>
                        </div>
                    </SimpleGrid>
                </Paper>
            </Stack>
        </Container>
    );
}

// Stats Card Component
function StatsCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <Card withBorder padding="lg" radius="md">
            <Group justify="space-between">
                <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                        {title}
                    </Text>
                    <Text fw={700} size="xl">
                        {value}
                    </Text>
                </div>
                <div style={{ color: `var(--mantine-color-${color}-6)` }}>{icon}</div>
            </Group>
        </Card>
    );
}

// Helper function for random colors
function getRandomColor() {
    const colors = ['blue', 'green', 'violet', 'orange', 'teal', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
}

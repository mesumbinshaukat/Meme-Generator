'use client';

import { Container, Title, Text, Button, Stack, Paper, Group } from '@mantine/core';
import { IconSparkles, IconTrendingUp, IconLanguage } from '@tabler/icons-react';
import Link from 'next/link';

export default function HomePage() {
    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                {/* Hero Section */}
                <Stack align="center" gap="md" py={60}>
                    <Title order={1} size={56} ta="center" fw={900}>
                        EvoMeme AI
                    </Title>
                    <Text size="xl" c="dimmed" ta="center" maw={600}>
                        Create hilarious memes with AI and watch them <strong>evolve</strong> through mutations.
                        Endless possibilities, zero cost.
                    </Text>
                    <Group mt="md">
                        <Button
                            component={Link}
                            href="/generate"
                            size="lg"
                            leftSection={<IconSparkles size={20} />}
                        >
                            Start Creating
                        </Button>
                    </Group>
                </Stack>

                {/* Features */}
                <Group grow align="stretch">
                    <Paper p="xl" radius="md" withBorder>
                        <Stack gap="sm">
                            <IconSparkles size={32} />
                            <Title order={3}>AI-Powered</Title>
                            <Text c="dimmed">
                                Advanced AI generates witty captions tailored to your prompts in multiple tones and languages.
                            </Text>
                        </Stack>
                    </Paper>

                    <Paper p="xl" radius="md" withBorder>
                        <Stack gap="sm">
                            <IconTrendingUp size={32} />
                            <Title order={3}>Evolutionary</Title>
                            <Text c="dimmed">
                                Evolve your memes through mutations. Generate variations, change tones, or swap templates.
                            </Text>
                        </Stack>
                    </Paper>

                    <Paper p="xl" radius="md" withBorder>
                        <Stack gap="sm">
                            <IconLanguage size={32} />
                            <Title order={3}>Multi-Language</Title>
                            <Text c="dimmed">
                                Create memes in 50+ languages with automatic detection and translation support.
                            </Text>
                        </Stack>
                    </Paper>
                </Group>

                {/* CTA */}
                <Paper p="xl" radius="md" bg="blue.1" mt="xl">
                    <Stack align="center" gap="md">
                        <Title order={2} ta="center">
                            Ready to Create Viral Memes?
                        </Title>
                        <Text size="lg" c="dimmed" ta="center">
                            100% free. No ads. No limits. Just pure meme evolution.
                        </Text>
                        <Button
                            component={Link}
                            href="/generate"
                            size="lg"
                            variant="filled"
                        >
                            Get Started Now
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}

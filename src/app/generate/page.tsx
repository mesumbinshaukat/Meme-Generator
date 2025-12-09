'use client';

import { useState } from 'react';
import {
    Container,
    Title,
    TextInput,
    Button,
    Stack,
    Paper,
    Image,
    Text,
    Group,
    Select,
    Loader,
    Alert,
    Checkbox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSparkles, IconRefresh } from '@tabler/icons-react';
import axios from 'axios';

interface GeneratedMeme {
    id: string;
    imageUrl: string;
    caption: string;
    templateName: string;
}

interface Mutation {
    id: string;
    imageUrl: string;
    caption: string;
    mutationType: string;
}

export default function GeneratePage() {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState<string>('funny');
    const [generateImage, setGenerateImage] = useState(true);
    const [loading, setLoading] = useState(false);
    const [evolving, setEvolving] = useState(false);
    const [currentMeme, setCurrentMeme] = useState<GeneratedMeme | null>(null);
    const [mutations, setMutations] = useState<Mutation[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            notifications.show({
                title: 'Error',
                message: 'Please enter a prompt',
                color: 'red',
            });
            return;
        }

        setLoading(true);
        setCurrentMeme(null);
        setMutations([]);

        try {
            const response = await axios.post('/api/generate', {
                prompt,
                tone,
                generateImageMode: generateImage,
            });

            setCurrentMeme(response.data.meme);

            notifications.show({
                title: 'Success!',
                message: `Meme generated in ${response.data.generationTime}ms`,
                color: 'green',
            });
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to generate meme',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEvolve = async () => {
        if (!currentMeme) return;

        setEvolving(true);

        try {
            const response = await axios.post('/api/evolve', {
                memeId: currentMeme.id,
                mutationType: 'variation',
            });

            setMutations(response.data.mutations);

            notifications.show({
                title: 'Evolved!',
                message: `Generated ${response.data.mutations.length} mutations`,
                color: 'blue',
            });
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to evolve meme',
                color: 'red',
            });
        } finally {
            setEvolving(false);
        }
    };

    const selectMutation = (mutation: Mutation) => {
        setCurrentMeme({
            id: mutation.id,
            imageUrl: mutation.imageUrl,
            caption: mutation.caption,
            templateName: currentMeme?.templateName || '',
        });
        setMutations([]);
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                <Title order={1}>Generate Meme</Title>

                {/* Input Section */}
                <Paper p="xl" radius="md" withBorder>
                    <Stack gap="md">
                        <TextInput
                            label="What's your meme about?"
                            placeholder="e.g., Monday morning, working from home, debugging code..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            size="lg"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />

                        <Select
                            label="Tone"
                            value={tone}
                            onChange={(value) => setTone(value || 'funny')}
                            data={[
                                { value: 'funny', label: 'Funny' },
                                { value: 'sarcastic', label: 'Sarcastic' },
                                { value: 'wholesome', label: 'Wholesome' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'random', label: 'Random' },
                            ]}
                        />

                        <Checkbox
                            label="Generate meme image"
                            description="Uncheck to get text-only caption with AI presentation ideas"
                            checked={generateImage}
                            onChange={(event) => setGenerateImage(event.currentTarget.checked)}
                        />

                        <Button
                            onClick={handleGenerate}
                            loading={loading}
                            leftSection={<IconSparkles size={20} />}
                            size="lg"
                            fullWidth
                        >
                            Generate Meme
                        </Button>
                    </Stack>
                </Paper>

                {/* Current Meme */}
                {currentMeme && (
                    <Paper p="xl" radius="md" withBorder>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <div>
                                    <Title order={3}>Your Meme</Title>
                                    {currentMeme.templateName && (
                                        <Text size="sm" c="dimmed">
                                            Template: {currentMeme.templateName}
                                        </Text>
                                    )}
                                </div>
                                {currentMeme.imageUrl && (
                                    <Button
                                        onClick={handleEvolve}
                                        loading={evolving}
                                        leftSection={<IconRefresh size={20} />}
                                        variant="light"
                                    >
                                        Evolve
                                    </Button>
                                )}
                            </Group>

                            {currentMeme.imageUrl ? (
                                <>
                                    <Image
                                        src={currentMeme.imageUrl}
                                        alt={currentMeme.caption}
                                        radius="md"
                                        maw={600}
                                        mx="auto"
                                    />
                                    <Text ta="center" size="sm" c="dimmed">
                                        {currentMeme.caption}
                                    </Text>
                                </>
                            ) : (
                                // Text-only mode display
                                <Stack gap="lg">
                                    <Alert title="Caption Generated" color="blue">
                                        <Text size="lg" fw={600}>
                                            "{currentMeme.caption}"
                                        </Text>
                                    </Alert>

                                    {currentMeme.memeIdea && (
                                        <Stack gap="md">
                                            <Title order={4}>AI Meme Presentation Ideas:</Title>

                                            <Paper p="md" withBorder>
                                                <Stack gap="sm">
                                                    <div>
                                                        <Text fw={600} size="sm">Template Suggestion:</Text>
                                                        <Text>{currentMeme.memeIdea.templateSuggestion}</Text>
                                                    </div>

                                                    <div>
                                                        <Text fw={600} size="sm">Visual Description:</Text>
                                                        <Text>{currentMeme.memeIdea.visualDescription}</Text>
                                                    </div>

                                                    <div>
                                                        <Text fw={600} size="sm">Text Placement:</Text>
                                                        <Text>{currentMeme.memeIdea.textPlacement}</Text>
                                                    </div>

                                                    <div>
                                                        <Text fw={600} size="sm">Style Notes:</Text>
                                                        <Text>{currentMeme.memeIdea.styleNotes}</Text>
                                                    </div>
                                                </Stack>
                                            </Paper>
                                        </Stack>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                )}

                {/* Mutations */}
                {mutations.length > 0 && (
                    <Paper p="xl" radius="md" withBorder>
                        <Stack gap="md">
                            <Title order={3}>Mutations</Title>
                            <Text c="dimmed">
                                Select a mutation to continue evolving
                            </Text>

                            <Group grow align="stretch">
                                {mutations.map((mutation) => (
                                    <Paper
                                        key={mutation.id}
                                        p="md"
                                        radius="md"
                                        withBorder
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => selectMutation(mutation)}
                                    >
                                        <Stack gap="sm">
                                            <Image
                                                src={mutation.imageUrl}
                                                alt={mutation.caption}
                                                radius="sm"
                                            />
                                            <Text size="xs" c="dimmed" lineClamp={2}>
                                                {mutation.caption}
                                            </Text>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Group>
                        </Stack>
                    </Paper>
                )}

                {loading && (
                    <Paper p="xl" radius="md" withBorder>
                        <Stack align="center" gap="md">
                            <Loader size="lg" />
                            <Text>Generating your meme...</Text>
                        </Stack>
                    </Paper>
                )}
            </Stack>
        </Container>
    );
}

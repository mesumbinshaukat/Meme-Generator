import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
        };
    },
    usePathname() {
        return '';
    },
}));

// Mock environment variables
process.env.OPENROUTER_API_KEY = 'test-key';
process.env.OPENROUTER_MODEL = 'test-model';
process.env.HUGGING_FACE_ACCESS_TOKEN = 'test-token';
process.env.ADMIN_PASSWORD = 'test-password';

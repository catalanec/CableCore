import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['src/**/*.test.ts'],
        env: {
            NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
            SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
            TELEGRAM_BOT_TOKEN: 'test-telegram-token',
            TELEGRAM_CHAT_ID: 'test-chat-id',
            ADMIN_USER: 'test-admin',
            ADMIN_PASSWORD: 'test-password',
            STRIPE_SECRET_KEY: 'sk_test_dummy',
            STRIPE_WEBHOOK_SECRET: 'whsec_test_dummy',
            RESEND_API_KEY: 're_test_dummy',
            CRON_SECRET: 'test-cron-secret',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary', 'html'],
            include: [
                'src/app/actions/**/*.ts',
                'src/app/api/**/*.ts',
                'src/lib/**/*.ts',
            ],
            exclude: [
                'src/**/*.test.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});

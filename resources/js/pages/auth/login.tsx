import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-bold">
                                Masuk ke akunmu
                            </h1>
                            <p className="text-balance text-sm text-muted-foreground">
                                Masukkan email untuk masuk ke akunmu
                            </p>
                        </div>

                        {status && (
                            <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-center text-sm font-medium text-primary">
                                {status}
                            </div>
                        )}

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="m@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Kata sandi</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Ingat saya</Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>

                        {canRegister && (
                            <p className="text-center text-sm text-muted-foreground">
                                Belum punya akun?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="underline underline-offset-4"
                                >
                                    Daftar
                                </TextLink>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke akunmu',
    description: 'Masukkan email dan kata sandi untuk masuk',
};

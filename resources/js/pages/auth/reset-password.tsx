import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset kata sandi" />

            <div className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm leading-6 text-muted-foreground">
                <p className="font-medium text-foreground">
                    Buat kata sandi baru untuk akun ini.
                </p>
                <p className="mt-1">
                    Gunakan kata sandi yang belum pernah dipakai. Setelah reset
                    selesai, masuk dengan kata sandi baru.
                </p>
            </div>

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="mt-1 block w-full"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                            <p className="text-xs leading-5 text-muted-foreground">
                                Email ini berasal dari tautan reset dan tidak
                                bisa diubah di sini.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Kata sandi</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                autoFocus
                                placeholder="Kata sandi"
                            />
                            <InputError message={errors.password} />
                            <p className="text-xs leading-5 text-muted-foreground">
                                Gunakan minimal 8 karakter dengan kombinasi
                                huruf, angka, atau simbol.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Konfirmasi kata sandi
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                placeholder="Konfirmasi kata sandi"
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            {processing
                                ? 'Mereset kata sandi...'
                                : 'Reset kata sandi'}
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset kata sandi',
    description:
        'Masukkan dan konfirmasi kata sandi baru untuk mengakses kembali akunmu.',
};

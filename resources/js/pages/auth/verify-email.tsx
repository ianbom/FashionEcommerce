// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verifikasi email" />

            {status === 'verification-link-sent' && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 font-medium text-green-700">
                    Email verifikasi terkirim. Periksa kotak masuk dan klik
                    tautan untuk mengaktifkan akunmu.
                </div>
            )}

            <div className="mb-6 space-y-4 text-sm leading-6 text-muted-foreground">
                <p>
                    Kami mengirim tautan verifikasi ke alamat email yang dipakai
                    saat registrasi. Akunmu siap digunakan setelah tautan
                    tersebut dibuka.
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-left">
                    <p className="font-medium text-foreground">
                        Tidak menerima email?
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>Periksa folder spam, promosi, atau junk.</li>
                        <li>
                            Tunggu beberapa menit sebelum meminta tautan baru.
                        </li>
                        <li>
                            Gunakan tombol di bawah untuk mengirim ulang email verifikasi.
                        </li>
                    </ul>
                </div>
            </div>

            <Form {...send.form()} className="space-y-5 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            variant="secondary"
                            className="w-full"
                        >
                            {processing && <Spinner />}
                            {processing
                                ? 'Mengirim email verifikasi...'
                                : 'Kirim ulang email verifikasi'}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Keluar
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi email',
    description:
        'Periksa kotak masuk dan klik tautan verifikasi untuk mengaktifkan akunmu.',
};

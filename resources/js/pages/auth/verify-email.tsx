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
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 font-medium text-green-700">
                    Verification email sent. Please check your inbox and click
                    the link to activate your account.
                </div>
            )}

            <div className="mb-6 space-y-4 text-sm leading-6 text-muted-foreground">
                <p>
                    We sent a verification link to the email address used during
                    registration. Your account will be ready after you open that
                    link.
                </p>
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-left">
                    <p className="font-medium text-foreground">
                        Did not receive the email?
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>Check spam, promotions, or junk folder.</li>
                        <li>
                            Wait a few minutes before requesting a new link.
                        </li>
                        <li>
                            Use the button below to resend verification email.
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
                                ? 'Sending verification email...'
                                : 'Resend verification email'}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Check your inbox and click the verification link to activate your account.',
};

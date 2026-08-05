import EmailAuthForm from '@/components/EmailAuthForm';

export const metadata = {
  title: '注册 · 灵魂解码',
  description: '注册灵魂解码，保存您的报告与成长档案。',
};

export default function RegisterPage() {
  return (
    <div className="gradient-bg min-h-screen">
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <EmailAuthForm mode="register" />
      </main>
    </div>
  );
}

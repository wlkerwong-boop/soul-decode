import EmailAuthForm from '@/components/EmailAuthForm';

export const metadata = {
  title: '登录 · 灵魂解码',
  description: '登录灵魂解码，查看您的个人档案与历史报告。',
};

export default function LoginPage() {
  return (
    <div className="gradient-bg min-h-screen">
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <EmailAuthForm mode="login" />
      </main>
    </div>
  );
}

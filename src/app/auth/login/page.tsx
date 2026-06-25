import PhoneAuthForm from '@/components/PhoneAuthForm';

export const metadata = {
  title: '登录 · 灵魂解码',
  description: '登录灵魂解码，查看你的个人档案与历史报告。',
};

export default function LoginPage() {
  return (
    <div className="gradient-bg min-h-screen">
      <main className="min-h-screen flex items-center justify-center px-4 py-16">
        <PhoneAuthForm mode="login" />
      </main>
    </div>
  );
}

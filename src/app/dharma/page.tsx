import { redirect } from 'next/navigation';

// 法藏页面临时隐藏（含家庭私人信息，爸爸 2026-07-27 指令）
// 原内容保留在 git 历史（此前 SHA: 5771e04e），恢复时回滚本提交即可
export default function DharmaPage() {
  redirect('/');
}

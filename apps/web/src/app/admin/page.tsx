import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Briefcase, Tags, Settings, PenSquare, ExternalLink, Users, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { RecentPosts } from '@/components/admin/RecentPosts';

export const dynamic = 'force-dynamic';

const menuItems = [
  {
    href: '/admin/resume',
    title: '이력서 관리',
    description: '이력서 내용을 수정하고 관리합니다.',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    href: '/admin/portfolio',
    title: '포트폴리오 관리',
    description: '포트폴리오 내용을 수정하고 관리합니다.',
    icon: Briefcase,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    href: '/admin/posts',
    title: '블로그 관리',
    description: '블로그 포스트를 작성하고 관리합니다.',
    icon: PenSquare,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    href: '/admin/tags',
    title: '태그 관리',
    description: '블로그 태그를 생성하고 관리합니다.',
    icon: Tags,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    href: '/admin/users',
    title: '유저 관리',
    description: '가입된 사용자를 확인합니다.',
    icon: Users,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    href: '/admin/images',
    title: '이미지 관리',
    description: '업로드된 이미지를 관리합니다.',
    icon: ImageIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  {
    href: '/admin/settings',
    title: '설정',
    description: '비밀번호 변경 등 계정 설정을 관리합니다.',
    icon: Settings,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
  },
];

export default async function AdminPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/admin/login');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2">
              <Link
                href="/resume"
                target="_blank"
                className="flex items-center gap-1 px-2 py-1 text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                이력서
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/portfolio"
                target="_blank"
                className="flex items-center gap-1 px-2 py-1 text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                포트폴리오
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/blog"
                target="_blank"
                className="flex items-center gap-1 px-2 py-1 text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                블로그
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 hidden md:block" />
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">관리 메뉴</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 block group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${item.bgColor}`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <RecentPosts />
          </div>
        </div>
      </main>
    </div>
  );
}

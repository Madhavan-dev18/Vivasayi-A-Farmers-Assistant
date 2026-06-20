
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  LayoutDashboard,
  ScanLine,
  Sprout,
  UserCheck,
  User,
  Tractor,
  LogOut,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import Chatbot from '../features/chatbot';
import LanguageSwitcher from './language-switcher';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/dashboard', label: t('AppShell.dashboard'), icon: LayoutDashboard },
    { href: '/crop-recommendation', label: t('AppShell.cropRecommendation'), icon: Sprout },
    { href: '/disease-detection', label: t('AppShell.diseaseDetection'), icon: ScanLine },
    { href: '/personalized-space', label: t('AppShell.personalizedSpace'), icon: UserCheck },
    { href: '/farms', label: t('AppShell.farms'), icon: Tractor },
  ];

  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Helper to get the current page's label
  const getCurrentLabel = () => {
    if (pathname === '/login') return t('AppShell.login');
    if (pathname === '/register') return t('AppShell.register');
    if (pathname.includes('/farms')) return t('AppShell.farms');
    if (pathname.includes('/profile')) return t('AppShell.profile');
    const currentItem = navItems.find(item => pathname.startsWith(item.href));
    return currentItem?.label || 'Vivasayi';
  }

  return (
    <SidebarProvider>
      <Sidebar hidden={isAuthPage}>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{
                    children: item.label,
                    className: 'bg-primary text-primary-foreground',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-3 backdrop-blur-sm sm:gap-4 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <SidebarTrigger className={isAuthPage ? "invisible" : "md:hidden"} />
            <h1 className="font-headline text-base font-semibold truncate sm:text-lg">
              {getCurrentLabel()}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {!isAuthPage && (
              <>
                <LanguageSwitcher />
                <Button asChild variant="ghost" size="icon">
                  <Link href="/profile">
                    <User />
                    <span className="sr-only">{t('AppShell.profile')}</span>
                  </Link>
                </Button>
                {user && (
                  <Button variant="outline" size="sm" onClick={signOut} aria-label={t('AppShell.signOut')}>
                    <span className="hidden sm:inline">{t('AppShell.signOut')}</span>
                    <LogOut className="h-4 w-4 sm:hidden" />
                  </Button>
                )}
              </>
            )}
          </div>
        </header>
        <main className="flex-1 bg-background">{children}</main>
        {!isAuthPage && <Chatbot />}
      </SidebarInset>
    </SidebarProvider>
  );
}

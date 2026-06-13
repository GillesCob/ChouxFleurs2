import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIosInstallPrompt } from '@/hooks/useIosInstallPrompt';
import { IosInstallModal } from '@/components/IosInstallModal';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useProjectsQuery } from '@/hooks/useProjectsQuery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/pronostics', label: 'Pronostics', icon: Sparkles },
  { to: '/liste-naissance', label: 'Liste de naissance', icon: Gift },
  { to: '/admin', label: 'Mon compte', icon: User },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const { currentProjectId, setCurrentProjectId } = useProjectStore();
  const { data: projects = [] } = useProjectsQuery();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { show: showInstall, canInstall, dismiss: dismissInstall, close: closeInstall, openManually } = useIosInstallPrompt();

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;
  const isProjectOwner = !!(user && currentProject && currentProject.owner.id === user.id);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const winner = currentProject?.winner ?? null;
  const hasResult = !!currentProject?.birthResult;

  const visibleNavItems = navItems.filter(({ to }) => {
    if (isProjectOwner || !currentProject) return true;
    if (to === '/pronostics' && !currentProject.pronosticsEnabled) return false;
    if (to === '/liste-naissance' && !currentProject.birthListEnabled) return false;
    return true;
  });

  return (
    <div className='flex min-h-screen flex-col'>
      {hasResult && winner && (
        <div className='bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 py-2 text-center text-sm font-medium text-yellow-900'>
          <Trophy className='mr-1.5 inline h-4 w-4' />
          Gagnant : <span className='font-bold'>{winner.authorName}</span> avec{' '}
          <span className='font-bold'>{winner.score} pts</span> — Prénom :{' '}
          <span className='font-bold'>{winner.firstName}</span>
          {winner.scoreDetails && (
            <span className='ml-2 opacity-75'>
              (genre {winner.scoreDetails.gender} · prénom {winner.scoreDetails.firstName} · date{' '}
              {winner.scoreDetails.birthDate} · poids {winner.scoreDetails.weight} · taille{' '}
              {winner.scoreDetails.height})
            </span>
          )}
        </div>
      )}

      <header
        className='sticky top-0 z-50 border-b bg-white/90 backdrop-blur'
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className='container flex h-16 items-center justify-between gap-4'>

          {/* Logo — desktop : texte "ChouxFleurs" / mobile : nom du projet */}
          <Link to='/dashboard' className='flex min-w-0 flex-1 items-center gap-2 md:flex-none'>
            <img src='/Chouxfleur2noir.png' alt='ChouxFleurs' className='h-10 w-10 shrink-0 md:h-20 md:w-20' />
            <span className='hidden text-lg font-semibold md:block'>ChouxFleurs</span>
            <span className='truncate text-base font-semibold md:hidden'>
              {currentProject?.name ?? 'ChouxFleurs'}
            </span>
          </Link>

          {/* Desktop — sélecteur de projet */}
          <div className='hidden md:block'>
            {projects.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='gap-1.5 max-w-[180px] truncate'>
                    <span className='truncate'>{currentProject?.name ?? 'Projet'}</span>
                    <ChevronDown className='h-3.5 w-3.5 shrink-0 opacity-50' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  {projects.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setCurrentProjectId(p.id)}
                      className={cn(p.id === currentProject?.id && 'font-medium')}
                    >
                      {p.name}
                      {p.owner.id === user?.id && (
                        <Badge variant='secondary' className='ml-2 text-xs'>
                          admin
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : currentProject ? (
              <span className='text-sm font-medium text-muted-foreground'>
                {currentProject.name}
                {isProjectOwner && (
                  <Badge variant='secondary' className='ml-2 text-xs'>
                    admin
                  </Badge>
                )}
              </span>
            ) : null}
          </div>

          {/* Desktop — navigation */}
          <nav className='hidden items-center gap-1 md:flex'>
            {visibleNavItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant='ghost'
                  size='sm'
                  className={cn('gap-2', location.pathname === to && 'bg-muted font-medium')}
                >
                  <Icon className='h-4 w-4' />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop — utilisateur + déconnexion */}
          <div className='hidden items-center gap-3 shrink-0 md:flex'>
            <span className='hidden text-sm text-muted-foreground lg:block'>{user?.name}</span>
            <Button variant='outline' size='sm' onClick={handleLogout} className='gap-2'>
              <LogOut className='h-4 w-4' />
              Déconnexion
            </Button>
          </div>

          {/* Mobile — bouton hamburger */}
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 md:hidden'
            onClick={() => setMobileMenuOpen(true)}
            aria-label='Ouvrir le menu'
          >
            <Menu className='h-5 w-5' />
          </Button>
        </div>
      </header>

      {/* Mobile — menu latéral */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        {/* max-w-[85vw] : évite que le drawer dépasse sur petits écrans
            overflow-hidden : le scroll se fait sur le div interne, pas ici
            pr-0 / p-0 : annule le p-6 par défaut de shadcn */}
        <SheetContent side='left' className='flex w-[280px] max-w-[85vw] flex-col overflow-hidden p-0'>
          {/* pr-12 : réserve la place pour le bouton ✕ positionné en absolute right-4 top-4 */}
          <SheetHeader className='shrink-0 border-b px-4 pb-4 pt-4 pr-12 text-left'>
            <SheetTitle className='flex items-center gap-2'>
              <img src='/Chouxfleur2noir.png' alt='ChouxFleurs' className='h-8 w-8 shrink-0' />
              ChouxFleurs
            </SheetTitle>
            <p className='truncate text-sm text-muted-foreground'>{user?.name}</p>
          </SheetHeader>

          {/* min-h-0 : indispensable sur iOS pour que flex-1 + overflow-y-auto fonctionne */}
          <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-6'>
            {/* Sélecteur de projet */}
            {currentProject && (
              <div className='space-y-2'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Projet actif
                </p>
                {projects.length > 1 ? (
                  <div className='space-y-1'>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setCurrentProjectId(p.id); navigate('/dashboard'); closeMenu(); }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                          p.id === currentProject.id
                            ? 'bg-muted font-medium'
                            : 'hover:bg-muted/50',
                        )}
                      >
                        <span className='truncate'>{p.name}</span>
                        {p.owner.id === user?.id && (
                          <Badge variant='secondary' className='ml-2 shrink-0 text-xs'>
                            admin
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className='px-3 text-sm font-medium'>{currentProject.name}</p>
                )}
              </div>
            )}

            <Separator />

            {/* Navigation */}
            <nav className='space-y-1'>
              {visibleNavItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                    location.pathname === to
                      ? 'bg-muted font-medium'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <Icon className='h-4 w-4 shrink-0' />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Déconnexion — épinglée en bas */}
          <div className='border-t px-4 py-4'>
            <Button
              variant='outline'
              className='w-full gap-2'
              onClick={() => { handleLogout(); closeMenu(); }}
            >
              <LogOut className='h-4 w-4' />
              Déconnexion
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className='container flex-1 py-8'>{children}</main>

      <footer className='border-t py-4 text-center text-sm text-muted-foreground'>
        <span>© 2026 ChouxFleurs2</span>
        {canInstall && (
          <>
            <span className='mx-2'>·</span>
            <button
              onClick={openManually}
              className='underline underline-offset-2 hover:text-foreground transition-colors'
            >
              Installer l'app
            </button>
          </>
        )}
      </footer>

      <IosInstallModal
        open={showInstall}
        onClose={closeInstall}
        onDismiss={dismissInstall}
      />
    </div>
  );
}

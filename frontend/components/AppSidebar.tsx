"use client"
import { LayoutDashboard, Receipt, Wallet, LogOut, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';

const navItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Transactions', url: '/transactions', icon: Receipt },
    { title: 'Budget', url: '/budgets', icon: Wallet },
    { title: "Category", url: "/categories", icon: LayoutGrid}  
];

export function AppSidebar() {
    const { state } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const { logout, user } = useAuth();   

    const handleLogout = () => {
        logout()
        router.push('/login');
    };

    return (
        <Sidebar className="border-r border-border">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider px-4 py-3">
                        {state === 'expanded' ? 'Budget Tracker' : 'BT'}
                        
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={item.url}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${pathname === item.url
                                                    ? 'bg-primary text-primary-foreground font-medium'
                                                    : 'hover:bg-accent hover:text-accent-foreground'
                                                }`}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            
                                            {state === 'expanded' && <span>{item.title}</span>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border p-4">
               
                <div className="flex items-center gap-3 justify-between">
                    {user && (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium">{user.username}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">
                                {user.email}
                            </span>
                        </p>
                    )}
                   
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="shrink-0"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

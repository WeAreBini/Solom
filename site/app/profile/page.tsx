/**
 * @ai-context Profile page — fetches real user data from Supabase, server-rendered.
 * Theme toggle is handled by an embedded client component.
 */
import { User, Settings, CreditCard, LogOut } from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/login/actions';
import { redirect } from 'next/navigation';
import { ThemeToggleSection } from './theme-toggle';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const email = user.email ?? 'No email';
  const displayName = user.user_metadata?.full_name
    ?? user.user_metadata?.name
    ?? email.split('@')[0]
    ?? 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-3xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile &amp; Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{initials}</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{displayName}</h2>
            <p className="text-muted-foreground">{email}</p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary">Active Member</Badge>
              {joinedDate && (
                <span className="text-xs text-muted-foreground">
                  Joined {joinedDate}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your billing and subscription plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-muted-foreground">Basic access to all features</p>
            </div>
            <Badge>Active</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled>
            Upgrade Coming Soon
          </Button>
        </CardFooter>
      </Card>

      {/* Preferences & Account Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggleSection />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <LogOut className="h-5 w-5" />
              Account Actions
            </CardTitle>
            <CardDescription>Manage your session.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async () => {
                'use server';
                await logout();
              }}
            >
              <Button variant="destructive" className="w-full press-scale">
                Log Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

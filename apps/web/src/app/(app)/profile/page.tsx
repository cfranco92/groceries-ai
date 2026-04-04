'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { updateProfile } from 'firebase/auth';
import { Moon, LogOut, ChevronRight, User } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/features/page-header';
import { LoadingSkeleton } from '@/components/features/loading-skeleton';

function getInitials(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [nameInitialized, setNameInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize display name from user once loaded
  if (user && !nameInitialized) {
    setDisplayName(user.displayName ?? '');
    setNameInitialized(true);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <PageHeader title="Profile" />
        <LoadingSkeleton variant="profile" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasNameChanged = displayName !== (user.displayName ?? '');

  async function handleSaveName() {
    if (!user || !hasNameChanged) return;

    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      toast({ title: 'Profile updated' });
    } catch {
      toast({
        title: 'Could not update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <PageHeader title="Profile" />

      {/* Avatar and user info */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <Avatar className="h-20 w-20">
          {user.photoURL && (
            <AvatarImage src={user.photoURL} alt={user.displayName ?? 'User avatar'} />
          )}
          <AvatarFallback className="text-2xl">
            {getInitials(user.displayName) || <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        <p className="text-xl font-semibold">{user.displayName ?? 'User'}</p>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      {/* Edit name section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Display Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="display-name" className="sr-only">
              Display Name
            </Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <Button
            className="w-full"
            disabled={!hasNameChanged || saving}
            onClick={handleSaveName}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Household link */}
      <Button variant="outline" className="w-full mb-4 justify-between" asChild>
        <Link href="/household">
          Household Settings
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>

      {/* Dark mode toggle */}
      <div className="flex items-center justify-between rounded-md border px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <Moon className="h-4 w-4" />
          <span className="text-sm font-medium">Dark Mode</span>
        </div>
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          aria-label="Toggle dark mode"
        />
      </div>

      {/* Sign out button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full text-destructive mb-8">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* App version */}
      <p className="text-center text-xs text-muted-foreground">Version 1.0.0</p>
    </div>
  );
}

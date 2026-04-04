'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCreateHousehold, useJoinHousehold } from '@/hooks/use-household';

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createHousehold = useCreateHousehold();
  const joinHousehold = useJoinHousehold();

  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');

  function handleCreate() {
    setCreateError('');
    if (!householdName.trim()) {
      setCreateError('Household name is required');
      return;
    }
    createHousehold.mutate(householdName.trim(), {
      onSuccess: () => {
        toast({
          title: 'Household created',
          description: `"${householdName.trim()}" is ready to go.`,
        });
        router.push('/lists');
      },
      onError: () => {
        setCreateError('Failed to create household. Please try again.');
      },
    });
  }

  function handleJoin() {
    setJoinError('');
    if (!inviteCode.trim()) {
      setJoinError('Invite code is required');
      return;
    }
    joinHousehold.mutate(inviteCode.trim(), {
      onSuccess: () => {
        toast({
          title: 'Joined household',
          description: 'Welcome to the family!',
        });
        router.push('/lists');
      },
      onError: () => {
        setJoinError('Invalid or expired invite code. Please try again.');
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold">Welcome to GroceriesAI</h1>
        <p className="mt-2 text-muted-foreground">
          Set up your household to start shopping
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Household Card */}
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Create a Household</CardTitle>
            <CardDescription>
              Start fresh. You&apos;ll be the admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="household-name">Household name</Label>
              <Input
                id="household-name"
                placeholder="e.g. Casa Franco"
                value={householdName}
                onChange={(e) => {
                  setHouseholdName(e.target.value);
                  if (createError) setCreateError('');
                }}
                aria-describedby={
                  createError ? 'create-error' : undefined
                }
              />
              {createError && (
                <p
                  id="create-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {createError}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={createHousehold.isPending}
            >
              {createHousehold.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Household
            </Button>
          </CardFooter>
        </Card>

        {/* Separator — visible only on mobile between stacked cards */}
        <div className="flex items-center gap-4 md:hidden">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        {/* Join Household Card */}
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Join a Household</CardTitle>
            <CardDescription>
              Enter an invite code from a family member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite code</Label>
              <Input
                id="invite-code"
                placeholder="e.g. ABC123XY"
                className="font-mono uppercase"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  if (joinError) setJoinError('');
                }}
                aria-describedby={joinError ? 'join-error' : undefined}
              />
              {joinError && (
                <p
                  id="join-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {joinError}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleJoin}
              disabled={joinHousehold.isPending}
            >
              {joinHousehold.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Join Household
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

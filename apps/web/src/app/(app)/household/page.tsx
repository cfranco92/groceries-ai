'use client';

import { useState } from 'react';
import {
  Pencil,
  Trash2,
  UserPlus,
  Loader2,
  Copy,
  Share2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/features/page-header';
import { LoadingSkeleton } from '@/components/features/loading-skeleton';
import { ErrorState } from '@/components/features/error-state';
import {
  useHousehold,
  useInviteMember,
  useCancelInvite,
  useRemoveMember,
} from '@/hooks/use-household';
import { UserRole } from '@groceries-ai/shared-types';

// Hardcoded current user as ADMIN for now (until auth integration is complete)
const CURRENT_USER_ID = '1';
const CURRENT_USER_ROLE: UserRole = UserRole.ADMIN;

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function HouseholdPage() {
  const { toast } = useToast();
  const { data: household, isLoading, isError, refetch } = useHousehold();
  const inviteMember = useInviteMember();
  const cancelInvite = useCancelInvite();
  const removeMember = useRemoveMember();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = CURRENT_USER_ROLE === 'ADMIN';

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PageHeader title="Household Settings" />
        <LoadingSkeleton variant="members" count={3} />
      </div>
    );
  }

  if (isError || !household) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <PageHeader title="Household Settings" />
        <ErrorState
          message="Failed to load household data"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  function handleStartEdit() {
    setEditedName(household?.name ?? '');
    setIsEditingName(true);
  }

  function handleSaveName() {
    // TODO: call update household name mutation when backend is ready
    toast({
      title: 'Household renamed',
      description: `Name updated to "${editedName}".`,
    });
    setIsEditingName(false);
  }

  function handleCancelEdit() {
    setIsEditingName(false);
    setEditedName('');
  }

  function handleGenerateInvite() {
    inviteMember.mutate(inviteEmail.trim() || undefined, {
      onSuccess: (data) => {
        setGeneratedCode(data.code);
      },
      onError: () => {
        toast({
          title: 'Failed to generate invite',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({ title: 'Code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the code manually.',
        variant: 'destructive',
      });
    }
  }

  async function handleShareCode() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my household on GroceriesAI',
          text: `Use this invite code to join my household: ${generatedCode}`,
        });
      } catch {
        // User cancelled share or share not supported
      }
    } else {
      await handleCopyCode();
    }
  }

  function handleRemoveMember(userId: string, displayName: string | null) {
    removeMember.mutate(userId, {
      onSuccess: () => {
        toast({
          title: 'Member removed',
          description: `${displayName ?? 'Member'} has been removed from the household.`,
        });
      },
      onError: () => {
        toast({
          title: 'Failed to remove member',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  }

  function handleCancelInvite(inviteId: string) {
    cancelInvite.mutate(inviteId, {
      onSuccess: () => {
        toast({ title: 'Invite cancelled' });
      },
      onError: () => {
        toast({
          title: 'Failed to cancel invite',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  }

  function handleCloseInviteDialog(open: boolean) {
    if (!open) {
      setInviteDialogOpen(false);
      setInviteEmail('');
      setGeneratedCode('');
      setCopied(false);
    } else {
      setInviteDialogOpen(true);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader title="Household Settings" />

      <div className="space-y-6">
        {/* Household Name Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Household Name</CardTitle>
            <CardDescription>
              The name visible to all household members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  aria-label="Household name"
                />
                <Button size="icon" onClick={handleSaveName} aria-label="Save">
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{household.name}</span>
                {isAdmin && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleStartEdit}
                    aria-label="Edit household name"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Section */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">
                Members ({household.members.length})
              </CardTitle>
              <CardDescription>
                People who share this household
              </CardDescription>
            </div>
            {isAdmin && (
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={handleCloseInviteDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite a Member</DialogTitle>
                    <DialogDescription>
                      Generate an invite code to share with a family member.
                      Optionally, enter their email address.
                    </DialogDescription>
                  </DialogHeader>

                  {!generatedCode ? (
                    <>
                      <div className="space-y-2 py-2">
                        <Label htmlFor="invite-email">
                          Email address (optional)
                        </Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="family@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleGenerateInvite}
                          disabled={inviteMember.isPending}
                        >
                          {inviteMember.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Generate Invite Code
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <div className="space-y-4 py-2">
                      <div className="rounded-lg border bg-muted/50 p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Invite code
                        </p>
                        <p className="mt-1 font-mono text-2xl font-bold tracking-wider">
                          {generatedCode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleCopyCode}
                        >
                          {copied ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleShareCode}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {household.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(member.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {member.displayName ?? 'Unknown'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      member.role === 'ADMIN' ? 'default' : 'secondary'
                    }
                  >
                    {member.role}
                  </Badge>
                  {isAdmin && member.id !== CURRENT_USER_ID && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${member.displayName ?? 'member'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove{' '}
                            <span className="font-medium">
                              {member.displayName ?? member.email}
                            </span>{' '}
                            from the household? They will lose access to all
                            shared lists and data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() =>
                              handleRemoveMember(
                                member.id,
                                member.displayName,
                              )
                            }
                          >
                            {removeMember.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invites Section */}
        {household.invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Pending Invites ({household.invites.length})
              </CardTitle>
              <CardDescription>
                Invitations that have not been accepted yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {household.invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {invite.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expires{' '}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{invite.status}</Badge>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Cancel invite for ${invite.email}`}
                          >
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel invitation
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel the invitation
                              for{' '}
                              <span className="font-medium">
                                {invite.email}
                              </span>
                              ? They will no longer be able to join using this
                              invite.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep invite</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleCancelInvite(invite.id)}
                            >
                              Cancel invite
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for this household
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!isAdmin}>
                  Delete Household
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete household</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the household, all shopping
                    lists, and associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

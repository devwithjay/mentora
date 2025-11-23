"use client";

import Image from "next/image";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {Loader2, Pencil} from "lucide-react";
import {useSession} from "next-auth/react";
import {toast} from "sonner";

import {cancelSubscription, getUserById, updateUserProfile} from "@/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

type UserData = {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
};

const ProfilePage = () => {
  const {data: session, update: updateSession} = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    image: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.id) {
        router.push("/sign-in");
        return;
      }

      const response = await getUserById(session.user.id);
      if (response.success && response.data) {
        setUser({
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
        });
        setEditForm({
          name: response.data.name,
          username: response.data.username,
          image: response.data.image || "",
        });
      } else {
        toast.error("Failed to load profile");
        router.push("/");
      }
      setLoading(false);
    };

    fetchUser();
  }, [session, router]);

  const handleEditProfile = async () => {
    if (!user) return;

    setSaving(true);

    const response = await updateUserProfile({
      userId: user.id,
      name: editForm.name,
      username: editForm.username,
      image: editForm.image || undefined,
    });

    if (response.success && response.data) {
      setUser({
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });
      setEditDialogOpen(false);
      toast.success("Profile updated successfully!");

      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: response.data.name,
          username: response.data.username,
          image: response.data.image,
        },
      });
    } else {
      toast.error(response.error?.message || "Failed to update profile");
    }

    setSaving(false);
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    setCancelling(true);

    const response = await cancelSubscription(user.id);

    if (response.success && response.data) {
      setUser({
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      });
      setCancelDialogOpen(false);
      toast.success("Subscription cancelled successfully!");

      await updateSession({
        ...session,
        user: {
          ...session?.user,
          plan: response.data.plan,
        },
      });
    } else {
      toast.error(response.error?.message || "Failed to cancel subscription");
    }

    setCancelling(false);
  };

  const handleManageSubscription = () => {
    if (user?.plan === "Free") {
      router.push("/pricing");
    } else {
      setCancelDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-primary flex h-screen items-center justify-center">
        <Loader2 className="text-brand h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="bg-primary min-h-screen px-8 py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="text-center">
            <h1 className="text-primary text-3xl font-bold sm:text-4xl">
              Your Profile
            </h1>
            <p className="text-secondary mt-2 text-sm">
              Manage your account, subscription, and personal details.
            </p>
          </div>

          <div className="border-primary bg-primary rounded-3xl border p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="border-primary h-24 w-24 overflow-hidden rounded-full border">
                {user.image ? (
                  <Image
                    width={96}
                    height={96}
                    src={user.image}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-secondary text-brand flex h-full w-full items-center justify-center text-3xl font-bold uppercase">
                    {user.name[0]}
                  </div>
                )}
              </div>

              <div className="text-center">
                <h2 className="text-primary text-2xl font-semibold">
                  {user.name}
                </h2>
                <p className="text-secondary text-sm">@{user.username}</p>
              </div>

              <p className="text-primary text-sm">{user.email}</p>

              <Badge
                className={
                  user.plan === "Free"
                    ? "border-primary text-brand bg-brand-secondary"
                    : "bg-brand text-white"
                }
                variant="outline"
              >
                {user.plan} Plan
              </Badge>
            </div>

            <div className="border-primary my-8 border-t"></div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border-primary rounded-xl border p-4">
                <p className="text-secondary text-xs">Account Created</p>
                <p className="text-primary mt-1 text-sm font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="border-primary rounded-xl border p-4">
                <p className="text-secondary text-xs">Last Updated</p>
                <p className="text-primary mt-1 text-sm font-semibold">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => setEditDialogOpen(true)}
                className="btn-primary font-semibold"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                onClick={handleManageSubscription}
                className="btn-secondary font-semibold"
                variant="ghost"
              >
                {user.plan === "Free" ? "Upgrade Plan" : "Manage Subscription"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="border-primary bg-primary sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit Profile</DialogTitle>
            <DialogDescription className="text-secondary">
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-primary">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="input-field border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-primary">
                Username
              </Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={e =>
                  setEditForm({...editForm, username: e.target.value})
                }
                className="input-field border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-primary">
                Profile Image URL
              </Label>
              <Input
                id="image"
                value={editForm.image}
                onChange={e =>
                  setEditForm({...editForm, image: e.target.value})
                }
                placeholder="https://example.com/avatar.jpg"
                className="input-field border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setEditDialogOpen(false)}
              className="btn-secondary"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditProfile}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="border-primary bg-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription className="text-secondary">
              Are you sure you want to cancel your {user.plan} subscription? You
              will be downgraded to the Free plan immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-secondary">
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="btn-primary bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfilePage;

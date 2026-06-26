"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { getUser, updateUserSession } from "@/lib/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import { User } from "@/types";

export default function EditProfilePage() {
  const router = useRouter();
  const user = getUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    socialLink: "",
    community: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        addressLine1: user.addressLine1 || "",
        addressLine2: user.addressLine2 || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        socialLink: user.socialLink || "",
        community: user.community || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put("/users/profile", formData);
      if (response.data.success) {
        // Update user session data
        const updatedUser = response.data.data;
        updateUserSession(updatedUser);
        alert("Profile updated successfully!");
        router.push("/profile");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <Card className="p-6">
            <h1 className="font-heading text-2xl font-bold text-purple-900 mb-6">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500"
                  placeholder="Tell others a bit about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Community (General Area)</label>
                  <Input
                    name="community"
                    value={formData.community}
                    onChange={handleChange}
                    placeholder="e.g. Downtown"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Social Link</label>
                  <Input
                    name="socialLink"
                    value={formData.socialLink}
                    onChange={handleChange}
                    placeholder="LinkedIn, Facebook, etc."
                  />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-200">
                <h3 className="font-medium text-purple-900 mb-3">Private Address Info</h3>
                <p className="text-xs text-stone-500 mb-4">Your exact address is never shown publicly. It is used to calculate distances for tool sharing.</p>
                
                <div className="space-y-4">
                  <Input
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Address Line 1"
                  />
                  <Input
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Address Line 2 (Optional)"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="Zip Code"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/profile")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </div>

            </form>
          </Card>
        </main>
      </>
    </AuthGuard>
  );
}

// components/EditProfileSheet.tsx
import React, { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, X } from "lucide-react";
import {
  Profile,
  FormErrors,
  BLOOD_GROUPS,
  USERNAME_REGEX,
  EMAIL_REGEX,
  MOBILE_REGEX,
} from "@/types/profileTypes";

interface EditProfileSheetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  isSaving: boolean;
  onSubmit: (profile: Profile) => Promise<void>;
}

const EditProfileSheet: React.FC<EditProfileSheetProps> = ({
  isOpen,
  setIsOpen,
  profile,
  setProfile,
  isSaving,
  onSubmit,
}) => {
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Optimized form handling
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfile((prev: Profile) => ({ ...prev, [name]: value }));

      // Clear error when field is edited
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [formErrors, setProfile],
  );

  const handleSelectChange = useCallback(
    (name: keyof Profile, value: string) => {
      setProfile((prev: Profile) => ({ ...prev, [name]: value }));

      // Clear error when field is edited
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [formErrors, setProfile],
  );

  // Validate form
  const validateForm = useCallback(() => {
    const errors: FormErrors = {};

    if (!profile.name.trim()) errors.name = "Name is required";

    if (!profile.username?.trim()) {
      errors.username = "Username is required";
    } else if (!USERNAME_REGEX.test(profile.username)) {
      errors.username =
        "Username must be 3-20 characters (letters, numbers, underscore)";
    }

    if (!profile.email.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(profile.email)) {
      errors.email = "Email is invalid";
    }

    if (!profile.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!MOBILE_REGEX.test(profile.mobile.replace(/[^0-9]/g, ""))) {
      errors.mobile = "Mobile number must have 10 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [profile]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(profile);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-3xl mx-0 my-0 p-0 max-w-full sm:max-w-full overflow-hidden"
      >
        {/* Sheet Header with fixed position */}
        <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-2 border-b">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
          <div className="flex justify-between items-center mb-2">
            <SheetTitle className="text-xl text-blue-600 font-bold">
              Edit Profile
            </SheetTitle>
            <Button
              variant="ghost"
              className="w-8 h-8 p-0 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Sheet content with scrolling */}
        <div className="p-6 overflow-y-auto h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                className={`rounded-xl h-12 ${formErrors.name ? "border-red-400 ring-red-400" : ""}`}
              />
              {formErrors.name && (
                <span className="text-red-500 text-xs">{formErrors.name}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                value={profile.username || ""}
                onChange={handleChange}
                className={`rounded-xl h-12 ${formErrors.username ? "border-red-400 ring-red-400" : ""}`}
              />
              {formErrors.username && (
                <span className="text-red-500 text-xs">
                  {formErrors.username}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email || ""}
                  onChange={handleChange}
                  className={`rounded-xl h-12 ${formErrors.email ? "border-red-400 ring-red-400" : ""}`}
                />
                {formErrors.email && (
                  <span className="text-red-500 text-xs">
                    {formErrors.email}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium">
                  Mobile <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={profile.mobile || ""}
                  onChange={handleChange}
                  className={`rounded-xl h-12 ${formErrors.mobile ? "border-red-400 ring-red-400" : ""}`}
                />
                {formErrors.mobile && (
                  <span className="text-red-500 text-xs">
                    {formErrors.mobile}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood_group" className="text-sm font-medium">
                  Blood Group
                </Label>
                <Select
                  value={profile.blood_group || undefined}
                  onValueChange={(value) =>
                    handleSelectChange("blood_group", value)
                  }
                >
                  <SelectTrigger id="blood_group" className="rounded-xl h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  className="rounded-xl h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Textarea
                id="address"
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                className="min-h-24 rounded-xl"
              />
            </div>
          </form>
        </div>

        {/* Sheet footer with fixed position */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all duration-300"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditProfileSheet;

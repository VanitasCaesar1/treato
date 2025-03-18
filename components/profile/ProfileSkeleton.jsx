import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => (
  <div className="container mx-auto p-6 max-w-3xl">
    <Card className="rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-1/3 mb-2 rounded-full" />
        <Skeleton className="h-4 w-1/4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ProfileSkeleton;

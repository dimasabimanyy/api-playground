import Image from "next/image";
import React, { useState, useEffect } from "react";

function UserAvatar({ user, isDark }) {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      // Fix Google profile image URL by removing size parameter and adding referrer policy bypass
      let avatarUrl = user.user_metadata.avatar_url;

      // If it's a Google profile image, modify the URL for better compatibility
      if (avatarUrl.includes("googleusercontent.com")) {
        // Remove the size parameter (=s96-c) and replace with a larger size
        avatarUrl = avatarUrl.replace(/=s\d+-c$/, "=s128-c");
      }

      setImageSrc(avatarUrl);
      setImageLoaded(true);
    }
  }, [user]);

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  if (imageLoaded && imageSrc) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
        <Image
          src={imageSrc}
          alt="User avatar"
          width={32}
          height={32}
          className="object-cover"
          unoptimized
          onError={() => {
            console.log("Profile image failed to load:", imageSrc);
            setImageLoaded(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-white font-medium text-sm"
      style={{
        backgroundColor: "#171717",
      }}
    >
      {getInitials()}
    </div>
  );
}

export default UserAvatar;
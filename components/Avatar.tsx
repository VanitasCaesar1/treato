import { useState, useEffect } from "react";
import Image from "next/image";

interface ProfileAvatarProps {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

const ProfileAvatar = ({
  src,
  alt,
  size = 64,
  className = "",
}: ProfileAvatarProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src || "");
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize with default placeholder if no src provided
  useEffect(() => {
    if (!src) {
      setError(true);
      setLoading(false);
    } else {
      setImageSrc(src);
      setError(false);
      setLoading(true);
    }
  }, [src]);

  // Generate initials from the alt text (typically user's name)
  const getInitials = () => {
    if (!alt) return "?";
    return alt
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Fallback styling for when image fails to load
  const fallbackStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    color: "#666",
    fontSize: size / 2.5,
    fontWeight: "bold" as "bold",
  };

  if (error) {
    // Render fallback with initials
    return (
      <div style={fallbackStyle} className={className} title={alt}>
        {getInitials()}
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        borderRadius: "50%",
        overflow: "hidden",
      }}
      className={className}
    >
      {loading && (
        <div
          style={{
            ...fallbackStyle,
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        >
          {getInitials()}
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        style={{
          objectFit: "cover",
          borderRadius: "50%",
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          console.error(`Failed to load profile image: ${imageSrc}`);
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
};

export default ProfileAvatar;

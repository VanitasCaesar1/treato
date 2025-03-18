// types/profileTypes.ts

// User profile interface
export interface Profile {
    name: string;
    username: string;
    email: string;
    mobile: string;
    blood_group?: string;
    location?: string;
    address?: string;
    profile_pic?: string;  // Add this line
  }
  
  // Form validation errors interface
  export interface FormErrors {
    [key: string]: string;
  }
  
  // Regular expressions for form validation
  export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
  export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  export const MOBILE_REGEX = /^\d{10}$/;
  
  // Blood group options
  export const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ];
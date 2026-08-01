import { supabase } from "@/lib/supabase";

type SignUpResult = {
  success: boolean;
  message: string;
};

export async function signUpUser(
  fullName: string,
  email: string,
  password: string
): Promise<SignUpResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Account created successfully! Please check your email.",
  };
}
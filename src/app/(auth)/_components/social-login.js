import { Button } from "@/components/ui/button";
import Image from "next/image";
import { googleLoginAction } from "../action";

export default function SocialLogin() {

  return (
    <form action={googleLoginAction} className="space-y-6">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50 cursor-pointer"
        type="submit">
        <Image
          src="/images/google.png"
          alt="Google icon"
          width={20}
          height={20}
        />
        <span className="text-indigo-600">Sign up with Google</span>
      </Button>
      
    </form>
  );
}

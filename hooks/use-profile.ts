import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type ProfileUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type ProfileData = {
  id: number;
  user: ProfileUser;
  role: string;
  active: boolean;
  address: string;
  phone_number: string | null;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("me/");
      const raw = data?.data || data;
      return raw as ProfileData;
    },
    staleTime: 1000 * 60 * 5,
  });
}

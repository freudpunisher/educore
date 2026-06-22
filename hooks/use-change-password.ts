import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

type ChangePasswordData = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await axiosInstance.post("change-password/", data);
      return response.data;
    },
  });
}

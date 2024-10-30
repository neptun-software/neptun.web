export const useUser = () => {
  const updateUser = async (
    user_id: number,
    { email, password }: { email: string; password: string }
  ) => {
    try {
      const emailToUpdate = email.trim().length > 0 ? email.trim() : undefined;
      const passwordToUpdate =
        password.trim().length > 0 ? password.trim() : undefined;

      const data = await $fetch(`/api/users/${user_id}`, {
        method: 'PATCH',
        body: { email: emailToUpdate, password: passwordToUpdate },
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteUser = async (user_id: number) => {
    try {
      const data = await $fetch(`/api/users/${user_id}`, {
        method: 'DELETE',
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    updateUser,
    deleteUser,
  };
};

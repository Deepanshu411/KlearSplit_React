// Interface for the current logged in user
interface User {
  user_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  image_url: string;
}

interface SearchedUser {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
  }

type SelectableUser = SearchedUser & {
  isAdmin?: boolean;
  isCoAdmin?: boolean;
  role?: "admin" | "coadmin" | "member";
};

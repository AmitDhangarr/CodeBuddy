import { supabase } from "../lib/supabaseClient";

const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.log("error while getting", error);
    return null;
  }

  return data.user;
};

export default getUser;
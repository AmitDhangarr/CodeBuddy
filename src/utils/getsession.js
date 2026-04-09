import { supabase } from "../lib/supabaseClient";

const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.log("error while getting", error);
    return null;
  }

  return data.session;
};

export default getSession;
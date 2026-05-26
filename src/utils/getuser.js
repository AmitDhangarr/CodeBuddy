import { cookies } from "next/headers";
import { supabase } from "../lib/supabaseClient";
import { getPayload } from "../../service/handletoken";

const getUser = async () => {
  const cookie = await cookies();
  const token = cookie.get("token");
  const payload = await getPayload(token.value);
  const userEmail = payload.email;
  return { userEmail };
};

export default getUser;

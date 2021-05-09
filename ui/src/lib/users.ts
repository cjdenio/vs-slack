import { Profile } from "../../../src/types";
import communicator from "../conn";
import useSWR from "swr";

export default function useUser(id: string): Profile | null {
  const { data: user } = useSWR<Profile>(id, (user) =>
    communicator.send("users.profile.get", { user })
  );

  console.log(`DATA: ${JSON.stringify(user)}`);

  return user;
}

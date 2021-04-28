import { useEffect, useState } from "react";
import { Profile } from "../../../src/types";
import communicator from "../conn";
import WebviewCommunicator from "../util/communicator";

const userCache: { [id: string]: Profile } = {};

export default function useUsers(ids: string[]) {
  const [users, setUsers] = useState<{ profile: Profile; loading: boolean }[]>(
    new Array(ids.length).fill({ profile: {}, loading: true })
  );

  useEffect(() => {
    Promise.all(
      ids.map(async (user) => {
        if (userCache[user]) {
          console.log("cache");
          return userCache[user];
        }
        return await communicator.send("users.profile.get", { user });
      })
    ).then((fetchedUsers) => {
      setUsers(
        fetchedUsers.map((i: Profile, index) => {
          userCache[ids[index]] = i;
          return { profile: i, loading: false };
        })
      );
    });
  }, []);

  return users;
}

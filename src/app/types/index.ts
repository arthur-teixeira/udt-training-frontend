export type Todo = {
  id: number,
  name: string,
  completed: boolean
};

export type TodoRequest = {
  name: string,
  completed: boolean,
  profile_id?: string
};

export type Profile = {
  id: string,
  name: string,
}

export type Role = {
  id: string,
  name: string,
  profiles: Profile[],
}

export const initialState = {
  input: "",
  imageURL: "",
  urlError: false,
  fileUpload: false,
  route: "signin",
  isSignedIn: false,
  isProfileOpen: false,
  isLoading: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
    bio: "",
  },
};

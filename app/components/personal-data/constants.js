export const FORM_COLORS = {
  primary: "#e9af41",
  textInput: "rgba(96, 128, 60, 1)",
  textLabel: "#e9af41",
  textButton: "#000000",
  background: "transparent",
};

export const FORM_FIELDS = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "",
  },
  {
    id: "dateOfBirth",
    label: "Date of Birth",
    type: "date",
    placeholder: "",
    icon: "calendar",
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    placeholder: "Select Gender",
    icon: "arrow",
    options: [
      { value: "", label: "Select Gender" },
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "hobby",
    label: "Hobby",
    type: "select",
    placeholder: "Select Hobby",
    icon: "arrow",
    options: [
      { value: "", label: "Select Hobby" },
      { value: "reading", label: "Reading" },
      { value: "sports", label: "Sports" },
      { value: "music", label: "Music" },
      { value: "gaming", label: "Gaming" },
      { value: "travel", label: "Travel" },
    ],
  },
];

export const STEP_COUNT = 5;

export const PERSONAL_DATA_ASSETS = {
  titleImage: "/assets/personal-data/personal-data-title.png",
  inputBackground: "/assets/personal-data/input-bg.png",
  profilePlaceholder: "/assets/personal-data/profile-placeholder.png",
  pencilIcon: "/assets/personal-data/pencil-icon.png",
};

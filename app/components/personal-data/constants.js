import { getOptionsArray } from '@/app/api/apiOptions';

export const FORM_COLORS = {
  primary: "#e9af41",
  textInput: "rgba(96, 128, 60, 1)",
  textLabel: "#e9af41",
  textButton: "#000000",
  background: "transparent",
};

export const FORM_FIELDS = [
  {
    id: "full_name",
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
    id: "date_of_birth",
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
      ...getOptionsArray('GENDER')
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
      ...getOptionsArray('HOBBY')
    ],
  },
];

export const STEP_COUNT = 5;

export const PERSONAL_DATA_ASSETS = {
  titleImage: "/assets/personal-data/personal-data-title.png",
  inputBackground: "/assets/personal-data/input-bg.webp",
  profilePlaceholder: "/assets/personal-data/profile-placeholder.webp",
  pencilIcon: "/assets/personal-data/pencil-icon.png",
};

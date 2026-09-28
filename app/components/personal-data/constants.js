import { getOptionsArray, API_OPTIONS } from '@/app/api/apiOptions';

// The member update-profile API stores hobby as free text (no choice
// validation on that field, unlike gender), so the dropdown sends the label
// itself as the value instead of the numeric code.
const HOBBY_TEXT_OPTIONS = Object.values(API_OPTIONS.HOBBY).map((label) => ({
  value: label,
  label,
}));

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
      ...HOBBY_TEXT_OPTIONS
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

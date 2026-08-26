"use client";
import { useRouter } from "next/navigation";
import AnimatedSection from "../components/ui/AnimatedSection";
import ProfileCard from "../components/profile/ProfileCard";
import HistorySection from "../components/profile/HistorySection";
import EditProfileSection from "../components/profile/EditProfileSection";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_IDS } from "../config/themes";
import { lazySkins, skinFor } from "../components/themes/skinRoute";

// One chunk per skin, warmed at module scope — see lazySkins.
const SKINS = lazySkins({
  [THEME_IDS.ACEBET77]: () => import("../components/themes/acebet77/Acebet77ProfilePage"),
  [THEME_IDS.UBETCLUB]: () => import("../components/themes/ubetclub/UbetclubProfilePage"),
  [THEME_IDS.EP369]: () => import("../components/themes/ep369/Ep369ProfilePage"),
  [THEME_IDS.KGAME99]: () => import("../components/themes/kgame99/Kgame99ProfilePage"),
  [THEME_IDS.LV918]: () => import("../components/themes/lv918/Lv918ProfilePage"),
  [THEME_IDS.N1GANG]: () => import("../components/themes/n1gang/N1gangProfilePage"),
});

const hasValue = (v) => v != null && String(v).trim() !== "";

export default function ProfilePage() {
  const router = useRouter();
  const { userData, profilePicture, profileData } = useUser();
  const { themeId } = useTheme();

  const skin = skinFor(SKINS, themeId);
  if (skin) return skin;

  const completion = {
    displayPhoto: hasValue(profilePicture),
    gender:       hasValue(profileData?.gender),
    birthday:     hasValue(profileData?.date_of_birth),
    phone:        hasValue(userData?.phoneNumber),
    email:        hasValue(profileData?.email),
    interest:     hasValue(profileData?.hobby),
  };

  const handleVipDetailsClick = () => {
    // Navigate to VIP details page
    router.push('/vip');
  };

  const handleEditProfileItem = (item) => {
    // Navigate to personal-data page for all edit profile items
    router.push('/personal-data');
  };

  const handleDisplayPhoto = () => handleEditProfileItem("Display Photo");
  const handleGender = () => handleEditProfileItem("Gender");
  const handleBirthday = () => handleEditProfileItem("Birthday");
  const handlePhone = () => handleEditProfileItem("Phone");
  const handleEmail = () => handleEditProfileItem("Email");
  const handleInterest = () => handleEditProfileItem("Interest");

  return (
    <>
      <AnimatedSection
          title=""
          imageSrc="/assets/profile/my-profile.webp"
          imageAlt="my profile"
        />

        <div className="mt-8">
          <ProfileCard
            name={userData.name}
            totalTokens={userData.balance}
            currentLevel={userData.currentLevel}
            nextLevel={userData.nextLevel}
            progress={userData.progress}
            tokensNeeded={userData.tokensNeeded}
            onVipDetailsClick={handleVipDetailsClick}
          />
        </div>

        <HistorySection />

        <div className="mt-6">
          <EditProfileSection
            onDisplayPhoto={handleDisplayPhoto}
            onGender={handleGender}
            onBirthday={handleBirthday}
            onPhone={handlePhone}
            onEmail={handleEmail}
            onInterest={handleInterest}
            completion={completion}
          />
      </div>
    </>
  );
}

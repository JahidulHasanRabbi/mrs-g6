"use client";
import { useRouter } from "next/navigation";
import AnimatedSection from "../components/ui/AnimatedSection";
import ProfileCard from "../components/profile/ProfileCard";
import HistorySection from "../components/profile/HistorySection";
import EditProfileSection from "../components/profile/EditProfileSection";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import Acebet77ProfilePage from "../components/themes/acebet77/Acebet77ProfilePage";
import UbetclubProfilePage from "../components/themes/ubetclub/UbetclubProfilePage";
import Ep369ProfilePage from "../components/themes/ep369/Ep369ProfilePage";
import Kgame99ProfilePage from "../components/themes/kgame99/Kgame99ProfilePage";
import Lv918ProfilePage from "../components/themes/lv918/Lv918ProfilePage";

const hasValue = (v) => v != null && String(v).trim() !== "";

export default function ProfilePage() {
  const router = useRouter();
  const { userData, profilePicture, profileData } = useUser();
  const { isAcebet77, isUbetclub, isEp369, isKgame99, isLv918 } = useTheme();

  if (isAcebet77) return <Acebet77ProfilePage />;
  if (isUbetclub) return <UbetclubProfilePage />;
  if (isEp369) return <Ep369ProfilePage />;
  if (isKgame99) return <Kgame99ProfilePage />;
  if (isLv918) return <Lv918ProfilePage />;

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
          imageSrc="/assets/profile/my-profile.png"
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

"use client";
import { useRouter } from "next/navigation";
import AnimatedSection from "../components/ui/AnimatedSection";
import ProfileCard from "../components/profile/ProfileCard";
import HistorySection from "../components/profile/HistorySection";
import EditProfileSection from "../components/profile/EditProfileSection";
import { useUser } from "../contexts/UserContext";

const hasValue = (v) => v != null && String(v).trim() !== "";

export default function ProfilePage() {
  const router = useRouter();
  const { userData, profilePicture, profileData } = useUser();

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
    router.push('/vip-details');
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

"use client";
import { useRouter } from "next/navigation";
import AnimatedSection from "../components/ui/AnimatedSection";
import ProfileCard from "../components/profile/ProfileCard";
import EditProfileSection from "../components/profile/EditProfileSection";

export default function ProfilePage() {
  const router = useRouter();

  const handleVipDetailsClick = () => {
    console.log("VIP Details clicked");
    // Add navigation to VIP details page
  };

  const handleEditProfileItem = (item) => {
    // Navigate to personal-data page for all edit profile items
    router.push('/personal-data');
    console.log(`${item} clicked - navigating to personal-data`);
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
            name="Jhon Doe"
            totalTokens={100}
            currentLevel="Gold"
            nextLevel="Platinum"
            progress={61.6}
            tokensNeeded={20000}
            onVipDetailsClick={handleVipDetailsClick}
          />
        </div>

        <div className="mt-6">
          <EditProfileSection
            onDisplayPhoto={handleDisplayPhoto}
            onGender={handleGender}
            onBirthday={handleBirthday}
            onPhone={handlePhone}
            onEmail={handleEmail}
            onInterest={handleInterest}
          />
      </div>
    </>
  );
}

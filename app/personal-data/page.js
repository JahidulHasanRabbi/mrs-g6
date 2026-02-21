"use client";
import AnimatedSection from "../components/ui/AnimatedSection";
import PersonalDataForm from "../components/personal-data/PersonalDataForm";

export default function PersonalDataPage() {
  return (
    <>
      <AnimatedSection 
        title="Personal Data" 
        imageSrc="" 
        imageAlt="Personal Data"
        titleSize={36}
        imageHeight={0}
      />
      
      <div className="flex flex-col items-center px-4 mt-8">
        <PersonalDataForm />
      </div>
    </>
  );
}

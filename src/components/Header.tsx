import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="relative p-16 text-center">
      {/* <Link href="/" prefetch={false}> */}
      <Link href="/">
        <h1 className="text-6xl font-black">StoryBook AI 😺</h1>
        <div className="flex justify-center whitespace-nowrap space-x-5 text-3xl lg:text-3xl mt-5">
          <h2>Bringing your stories</h2>
          <div className="relative">
            <div className="absolute bg-purple-500 -left-2 -top-1 -bottom-1 md:-left-3 md:-top-0 md:-bottom-0 -rotate-3 pl-2 pr-2">
              <p className="relative text-white">To life!</p>
            </div>
          </div>
        </div>
      </Link>
    </header>
  );
};

export default Header;

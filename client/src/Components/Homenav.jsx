import React from "react";
import imageObject from "../utils/image";

const Homenav = () => {
  return (
    <>
      {" "}
      <div>
        <nav className="flex items-center justify-between px-6 bg-transparent">
          <div className="flex items-center space-x-4 bg-white p-1 rounded-md cursor-pointer">
            <img
              src={imageObject.Logo}
              alt="Logo"
              className="h-[40px]"
            />
          </div>
        </nav>
      </div>
    </>
  );
};

export default Homenav;

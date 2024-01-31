"use client";

import { TbPlaylist } from "react-icons/tb";

const Library = () => {
    const onClick = () => {
        // Handle upload later
    };

    return (
        <div className="flex flex-col">
            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-5
                    pt-4
                "
            >
                <div
                    className="
                        inline-flex
                        items-center
                        gap-x-2
                    "
                >
                    <TbPlaylist className="text-neutral-400" size={26}/>
                </div>
            </div>
        </div>
    );
}
 
export default Library;
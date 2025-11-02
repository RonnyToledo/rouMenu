"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { LuMessageCircle } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";
import RelativeTime from "@/components/GeneralComponents/DateTime";
import Link from "next/link";
export default function PostCard({ filterIndex }: { filterIndex: number }) {
  const { generalData } = useApp();

  return generalData.top_posts
    .filter((obj, index) => index === filterIndex)
    .map((obj, index) => (
      <div key={index} className="mb-4 p-4 space-y-2  shadow-lg">
        <Link
          href={`/t/${obj.store_sitioweb}`}
          className="flex items-center gap-4 bg-slate-50  "
        >
          <Image
            src={obj.store_logo || logoApp}
            alt={obj.store_name || ""}
            width={100}
            height={100}
            className="rounded-full size-10 bg-center bg-no-repeat aspect-square bg-cover "
          />
          <div className="flex flex-col justify-center">
            <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-1">
              {obj.store_name}
            </p>
            <p className="text-slate-600 text-sm font-normal leading-normal line-clamp-2">
              <RelativeTime datetime={obj.product_created_at || new Date()} />
            </p>
          </div>
        </Link>

        <div className=" ">
          <Link
            href={`/t/${obj.store_sitioweb}/producto/${obj.productId}`}
            className="flex flex-col items-stretch justify-start rounded-lg w-full space-y-2"
          >
            <Image
              src={obj.image || logoApp}
              alt={obj.title || ""}
              width={500}
              height={500}
              className="w-full object-cover aspect-square bg-cover rounded-lg"
            />
            <div className="flex w-full  grow flex-col items-stretch justify-center gap-1 @xl:px-4">
              <p className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">
                {obj.title}
              </p>
              <div className="flex items-end gap-3 justify-between  ">
                <div className="flex flex-col gap-1 w-full">
                  <p className="text-slate-600 text-base font-normal leading-normal">
                    {obj.category_name}
                  </p>
                  <div className="flex justify-evenly items-center my-4">
                    <div className="flex text-slate-600 items-center gap-1 ">
                      <p className=" text-base font-normal leading-normal">
                        {obj.product_visitas}
                      </p>
                      <FaRegEye />
                    </div>
                    <div className="flex text-slate-600 items-center gap-1 ">
                      <p className=" text-base font-normal leading-normal">
                        {obj.cnt_comments}
                      </p>
                      <LuMessageCircle />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    ));
}

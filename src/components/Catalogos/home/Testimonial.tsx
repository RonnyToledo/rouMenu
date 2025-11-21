"use client";
import React, { useContext } from "react";
import TestimonialCarousel from "@/components/ui/testimonial-carousel";
import { MyContext } from "@/context/MyContext";
import { logoUser } from "@/lib/image";

export default function TestimonialCarouselDemo() {
  const { store } = useContext(MyContext);
  return (
    <TestimonialCarousel
      borderType="solid"
      data={(store.comentTienda.data || []).map((review) => ({
        description: review.cmt || "",
        image: review.user.image || logoUser,
        name: review.user.name || "",
        handle: review.star || 0,
      }))}
    />
  );
}

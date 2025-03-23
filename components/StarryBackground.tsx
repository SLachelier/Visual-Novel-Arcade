"use client";

import React, { useEffect, useRef } from "react";

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure this runs only on the client

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Update canvas size on window resize
    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener("resize", handleResize);

    const starCount = 60; // Increased star count
    const stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];
    let shootingStar: { x: number; y: number; length: number; speed: number; opacity: number } | null = null;

    // Initialize stars with random positions and opacity
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 2 + 1, // Random size between 1 and 3
        opacity: Math.random() * 0.5 + 0.5, // Random opacity between 0.5 and 1
        speed: Math.random() * 0.05 + 0.02, // Faster twinkling speed
      });
    }

    function drawStars() {
      if (!ctx) return; // Ensure ctx is not null
      ctx.clearRect(0, 0, W, H); // Clear canvas
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 223, 127, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function twinkleStars() {
      stars.forEach((star) => {
        star.opacity += star.speed * (Math.random() > 0.5 ? 1 : -1);

        // Ensure opacity stays within bounds
        if (star.opacity <= 0) {
          star.opacity = 0; // Reset opacity
          star.x = Math.random() * W; // Randomize position
          star.y = Math.random() * H;
          star.size = Math.random() * 2 + 1; // Randomize size
          star.speed = Math.random() * 0.05 + 0.02; // Randomize speed for faster fading
        } else if (star.opacity > 1) {
          star.opacity = 1;
        }
      });
    }

    function drawShootingStar() {
      if (!ctx || !shootingStar) return;
    
      ctx.beginPath();
      const gradient = ctx.createLinearGradient(
        shootingStar.x,
        shootingStar.y,
        shootingStar.x - shootingStar.length,
        shootingStar.y + shootingStar.length
      );
      // Brighter and lighter color for the shooting star
      gradient.addColorStop(1, `rgba(255, 255, 200, ${shootingStar.opacity})`); // Light yellow
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)"); // Fades to transparent
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(shootingStar.x, shootingStar.y);
      ctx.lineTo(shootingStar.x - shootingStar.length, shootingStar.y + shootingStar.length);
      ctx.stroke();
    }
    
    function updateShootingStar() {
      if (!shootingStar) return;

      shootingStar.x -= shootingStar.speed;
      shootingStar.y += shootingStar.speed;
      shootingStar.opacity -= 0.01;

      // Remove the shooting star if it fades out or moves off-screen
      if (shootingStar.opacity <= 0 || shootingStar.x < 0 || shootingStar.y > H) {
        shootingStar = null;
      }
    }

    function createShootingStar() {
      shootingStar = {
        x: Math.random() * W,
        y: Math.random() * H * 0.5, // Start in the upper half of the screen
        length: Math.random() * 100 + 50, // Random length between 50 and 150
        speed: Math.random() * 5 + 2, // Random speed between 2 and 7
        opacity: 1, // Fully visible at the start
      };
    }

    function animate() {
      drawStars();
      twinkleStars();
      drawShootingStar();
      updateShootingStar();
      requestAnimationFrame(animate); // Ensure continuous animation
    }

    // Create a shooting star every 4 seconds
    setInterval(() => {
      if (!shootingStar) {
        createShootingStar();
      }
    }, 4000);

    animate();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (ctx) {
        ctx.clearRect(0, 0, W, H);
      }
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: -1 }} />;
};

export default StarryBackground;
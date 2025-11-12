// src/utils/animateToCart.js
export const animateImageToCart = (img, targetSelector) => {
  if (!img) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  const imgRect = img.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  // Clone image
  const clonedImg = img.cloneNode(true);
  clonedImg.style.position = "fixed";
  clonedImg.style.left = `${imgRect.left}px`;
  clonedImg.style.top = `${imgRect.top}px`;
  clonedImg.style.width = `${imgRect.width}px`;
  clonedImg.style.height = `${imgRect.height}px`;
  clonedImg.style.transition = "all 0.6s ease-in-out";
  clonedImg.style.zIndex = 9999;
  clonedImg.style.pointerEvents = "none";
  document.body.appendChild(clonedImg);

  // Trigger animation
  requestAnimationFrame(() => {
    clonedImg.style.left = `${targetRect.left + targetRect.width/2 - imgRect.width/4}px`;
    clonedImg.style.top = `${targetRect.top + targetRect.height/2 - imgRect.height/4}px`;
    clonedImg.style.width = `${imgRect.width / 2}px`;
    clonedImg.style.height = `${imgRect.height / 2}px`;
    clonedImg.style.opacity = 0.5;
  });

  // Remove after animation
  setTimeout(() => clonedImg.remove(), 600);
};

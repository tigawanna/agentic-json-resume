import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(
      ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

export const ScrollTo = (id: string, offset = 70) => {
  const el = document.getElementById(id);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  window.scrollTo({
    top: rect.top + scrollTop - offset,
    behavior: "smooth",
  });
};

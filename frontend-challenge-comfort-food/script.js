const body = document.body;
const header = document.querySelector("[data-header]");
const navigation = document.querySelector("[data-navigation]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const moodButtons = [...document.querySelectorAll("[data-mood]")];
const newsletterForm = document.querySelector("[data-newsletter-form]");
const newsletterStatus = document.querySelector("[data-newsletter-status]");

const recommendations = {
  gentle: {
    name: "Ginger Sea Bass Soup",
    image: "assets/ginger-sea-bass.webp",
    alt: "A bowl of ginger sea bass soup",
    description:
      "A clear fish broth with fresh ginger, scallion, and a clean finish. Light enough for a tired day and warm enough to settle into.",
    character: "Clean and bright",
    moment: "Quiet afternoons",
    time: "45 minutes"
  },
  warming: {
    name: "Ginger Duck Soup",
    image: "assets/ginger-duck.webp",
    alt: "A steaming earthenware pot of ginger duck soup",
    description:
      "Duck, old ginger, sesame oil, and rice wine create a bold, aromatic broth made for evenings when the air turns cold.",
    character: "Bold and aromatic",
    moment: "Cold evenings",
    time: "3 hours"
  },
  nourishing: {
    name: "Fo-Ti Herbal Chicken Soup",
    image: "assets/he-shou-wu-chicken.webp",
    alt: "A dark herbal chicken soup in a black clay pot",
    description:
      "Chicken, fo-ti root, red dates, and goji berries simmer into an earthy broth with quiet depth.",
    character: "Earthy and herbal",
    moment: "Slow weekends",
    time: "4 hours"
  },
  hearty: {
    name: "Peanut Pig Trotter Soup",
    image: "assets/peanut-pig-trotter.webp",
    alt: "A bowl of peanut and pig trotter soup",
    description:
      "Pork trotter and peanuts simmer until the broth turns silky and deeply savory—the bowl for a truly serious appetite.",
    character: "Rich and silky",
    moment: "Hungry nights",
    time: "5 hours"
  }
};

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

function closeNavigation() {
  navigation?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = navigation?.classList.toggle("is-open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
});

navigation?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeNavigation();
  }
});

themeToggle?.addEventListener("click", () => {
  const isEvening = body.classList.toggle("evening");

  themeToggle.setAttribute("aria-pressed", String(isEvening));
  themeToggle.setAttribute(
    "aria-label",
    isEvening ? "Switch to daylight theme" : "Switch to evening theme"
  );

  const icon = themeToggle.querySelector("span:first-child");
  const label = themeToggle.querySelector("span:last-child");

  if (icon) icon.textContent = isEvening ? "☀" : "☾";
  if (label) label.textContent = isEvening ? "Daylight" : "Evening";
});

function renderRecommendation(mood) {
  const recommendation = recommendations[mood];
  if (!recommendation) return;

  const image = document.querySelector("[data-result-image]");
  const name = document.querySelector("[data-result-name]");
  const description = document.querySelector("[data-result-description]");
  const character = document.querySelector("[data-result-character]");
  const moment = document.querySelector("[data-result-moment]");
  const time = document.querySelector("[data-result-time]");

  if (image instanceof HTMLImageElement) {
    image.src = recommendation.image;
    image.alt = recommendation.alt;
  }

  if (name) name.textContent = recommendation.name;
  if (description) description.textContent = recommendation.description;
  if (character) character.textContent = recommendation.character;
  if (moment) moment.textContent = recommendation.moment;
  if (time) time.textContent = recommendation.time;
}

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moodButtons.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    renderRecommendation(button.dataset.mood);
  });
});

newsletterForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const emailInput = newsletterForm.elements.namedItem("email");
  if (!(emailInput instanceof HTMLInputElement)) return;

  if (!emailInput.checkValidity()) {
    newsletterStatus.textContent = "Please enter a valid email address.";
    emailInput.focus();
    return;
  }

  newsletterStatus.textContent =
    "Welcome to the table. Your first soup note is on its way.";
  newsletterForm.reset();
});

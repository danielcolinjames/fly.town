function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRestaurantId(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents
}

module.exports = { delay, generateRestaurantId };

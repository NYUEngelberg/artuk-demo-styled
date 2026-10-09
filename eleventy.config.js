export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets");
  eleventyConfig.addWatchTarget("twine");

  // Rebuild the generated data when the Twine export changes.
  eleventyConfig.on("eleventy.before", async () => {
    const { execFileSync } = await import("node:child_process");
    execFileSync(process.execPath, ["scripts/import-twine.js"], { stdio: "inherit" });
  });

  eleventyConfig.addFilter("page", (toolkit, slug) => toolkit.bySlug[slug]);
  eleventyConfig.addFilter("inGroup", (pages, group) =>
    pages.filter((p) => p.group === group),
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}

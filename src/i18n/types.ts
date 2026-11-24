export interface UIStrings {
  nav: {
    home: string;
    blog: string;
    notes: string;
    projects: string;
    about: string;
    tags: string;
    search: string;
  };
  content: {
    typePost: string;
    typeNote: string;
    typeProject: string;
  };
  og: {
    imageAlt: string;
  };
  related: {
    title: string;
  };
  project: {
    status: {
      active: string;
      maintained: string;
      archived: string;
    };
    stack: string;
    links: string;
    relatedPosts: string;
    source: string;
    docs: string;
    website: string;
  };
  post: {
    updatedAt: string;
    /** `{{minutes}}` is replaced with the rounded-up reading time. */
    readingTime: string;
    draft: string;
    /** No-JS and no-clipboard label of the copy-link control. */
    permalink: string;
    copyLink: string;
    linkCopied: string;
    alsoOn: string;
    tagLabel: string;
    backToTop: string;
    tableOfContents: string;
    /** Back link label once a previous page is known; "Home" (nav.home) before. */
    goBack: string;
    editPage: string;
    previousPost: string;
    nextPost: string;
    copyCode: string;
    copied: string;
    copyFailed: string;
    /** Code-block button text after a failed copy (the code is selected). */
    copyCodeFailed: string;
    /** Dev-only notice above the body of a draft. */
    draftNotice: string;
    /** Block label of the inline table of contents. */
    contentsLabel: string;
  };
  pagination: {
    prev: string;
    next: string;
    page: string;
    /** `{{current}}` and `{{last}}` are page numbers. */
    status: string;
  };
  home: {
    writing: string;
    /** Link from the home writing list to /blog/, shown when it lists posts. */
    allPosts: string;
    /** Link from the home writing list to /notes/, shown when it lists notes. */
    allNotes: string;
    projects: string;
    allProjects: string;
    specialties: string;
  };
  about: {
    contactCta: string;
  };
  contact: {
    /** Title of /contact/ when there is no contact.md. */
    title: string;
    /** Heading of the profile list. */
    methods: string;
  };
  footer: {
    contact: string;
    source: string;
    /** Text before the linked theme name, e.g. "powered by". */
    poweredBy: string;
    /** Accessible name of the 88x31 badge list. */
    elsewhere: string;
  };
  pages: {
    tagTitle: string;

    tagsTitle: string;
    /** Accessible name of a tag's entry count; `{{count}}` is the number. */
    tagCount: string;

    postsTitle: string;
    notesTitle: string;
    projectsTitle: string;
    searchTitle: string;
  };
  search: {
    /** Plain text: Pagefind renders its `error_search` translation as text. */
    errorLoad: string;
    /**
     * `{{sections}}` becomes links to the blog, notes and projects, those
     * with published content only, as an "and" list in the page locale.
     */
    noscript: string;
    blog: string;
    notes: string;
    projects: string;
    /** Shown instead of the search input while nothing is published. */
    empty: string;
    /**
     * Under a search without results. `{{sections}}` becomes links to the
     * tags, blog, notes and projects that have content, as an "or" list.
     */
    noResults: string;
    tags: string;
  };
  a11y: {
    skipToContent: string;
    mainNav: string;
    footerNav: string;
    toggleTheme: string;
    goToPreviousPage: string;
    goToNextPage: string;
    /** `{{heading}}` is replaced with the heading text. */
    headingLink: string;
    scrollableTable: string;
    copySuccess: string;
    copyFailure: string;
    linkCopySuccess: string;
    linkCopyFailure: string;
    /** Accessible name of a zoomable article image without alt text. */
    zoomImage: string;
    /** Same, for an image with alt text; `{{alt}}` is the alt text. */
    zoomImageAlt: string;
    /** Accessible name of the image lightbox without alt text. */
    imagePreview: string;
    /** Same, for an image with alt text; `{{alt}}` is the alt text. */
    imagePreviewAlt: string;
    closeImagePreview: string;
    /** Accessible name of the preview panel form. */
    themePreview: string;
  };
  notFound: {
    title: string;
    message: string;
    /** Sentence above the list of suggested pages. */
    body: string;
  };
}

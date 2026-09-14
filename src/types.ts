interface Configuration {
  baseUrl: string;
  token: string;
  default_tags?: string;
  useBrowserMetadata?: boolean;
  runSinglefile?: boolean;
  closeAddBookmarkWindowOnSave?: boolean;
  closeAddBookmarkWindowOnSaveMs?: number;
  shareSelected?: boolean;
  unreadSelected?: boolean;
}

interface SaveBookmarkOptions {
  disable_html_snapshot?: boolean;
}

interface ServerBookmark {
  id: number;
  url: string;
  title: string;
  description: string;
  notes: string;
  tag_names: string[];
  unread: boolean;
  shared: boolean;

  web_archive_snapshot_url: string;
  is_archived: boolean;
  date_added: string;
  date_modified: string;
  website_title: null | string;
}

interface Bookmark extends Pick<
  ServerBookmark,
  'url' | 'title' | 'description' | 'notes' | 'tag_names' | 'unread' | 'shared'
> {}

interface ServerMetadata {
  // Check this
  auto_tags: string[];

  bookmark: ServerBookmark;

  metadata: {
    description: string;
    preview_image: string;
    title: string;
    url: string;
  };
}

interface Profile {
  theme: string;
  bookmark_date_display: string;
  bookmark_link_target: string;
  web_archive_integration: string;
  tag_search: string;
  enable_sharing: boolean;
  enable_public_sharing: boolean;
  enable_favicons: boolean;
  display_url: boolean;
  permanent_notes: boolean;
  search_preferences: object;
  version: string;
}

interface TabInfo {
  id: string | number;
  url: string;
  title: string;
}

interface BrowserMetadata {
  title: string;
  description: string;
}

interface SearchOptions {
  limit: number;
}

export type {
  Bookmark,
  ServerBookmark,
  BrowserMetadata,
  Configuration,
  Profile,
  SaveBookmarkOptions,
  SearchOptions,
  ServerMetadata,
  TabInfo,
};

interface Configuration {
  baseUrl: string;
  closeAddBookmarkWindowOnSave?: boolean;
  closeAddBookmarkWindowOnSaveMs?: number;
  default_tags?: string;
  runSinglefile?: boolean;
  shareSelected?: boolean;
  token: string;
  unreadSelected?: boolean;
  useBrowserMetadata?: boolean;
}

interface SaveBookmarkOptions {
  disable_html_snapshot?: boolean;
}

interface Tag {
  date_added: string;
  id: number;
  name: string;
}

interface ServerBookmark {
  date_added: string;
  date_modified: string;
  description: string;
  id: number;
  is_archived: boolean;
  notes: string;
  shared: boolean;
  tag_names: string[];
  title: string;
  unread: boolean;
  url: string;
  web_archive_snapshot_url: string;
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
  bookmark_date_display: string;
  bookmark_link_target: string;
  display_url: boolean;
  enable_favicons: boolean;
  enable_public_sharing: boolean;
  enable_sharing: boolean;
  permanent_notes: boolean;
  search_preferences: object;
  tag_search: string;
  theme: string;
  version: string;
  web_archive_integration: string;
}

interface TabInfo {
  id: string | number;
  title: string;
  url: string;
}

interface BrowserMetadata {
  description: string;
  title: string;
}

interface SearchOptions {
  limit: number;
}

export type {
  Bookmark,
  BrowserMetadata,
  Configuration,
  Profile,
  SaveBookmarkOptions,
  SearchOptions,
  ServerBookmark,
  ServerMetadata,
  TabInfo,
  Tag,
};

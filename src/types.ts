import { JsonDB } from "./lib/json-db/json-db";

export type JsonDbData = {
    projects: Project;
    tabs: Tab;
};

type TagID = number;

type Project = {
    id: number;
    createdAt: string;
    updatedAt: string;
    activeTabId?: number;
};

type Tab = {
    id: number;
    createdAt: string;
    updatedAt: string;
    config?: TabConfig;
    filtering?: Filtering;
    sorting?: Sorting;
    pagination?: Pagination;
    selectedFilePaths?: string[];
};

type TabConfig = {
    fileHeight?: number;
};

type FileType = 'image' | 'video';
type MediaType = 'static' | 'animated';
type Filtering = {
    fileType?: FileType | null;
    mediaType?: MediaType | null;
    untagged?: boolean;
    tagsIds?: TagID[];
    withoutTagsIds?: TagID[];
};

type SortingField = 'path' | 'mtime' | 'size';
type Sorting = {
    field?: SortingField;
    asc?: boolean;
};

type Pagination = {
    perPage?: number;
    currentPage?: number;
};

export type JsonDBInstance = JsonDB<JsonDbData>;
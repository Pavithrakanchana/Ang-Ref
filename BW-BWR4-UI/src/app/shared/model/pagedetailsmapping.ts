
  export interface PageConfig {
      id: string;
      name: string;
      number: string;
  }

  export interface PageDetailsConfig {
    pageConfig: PageConfig[];
}

export interface PageDetailsMapping {
    PageDetailsConfig: PageDetailsConfig;
}




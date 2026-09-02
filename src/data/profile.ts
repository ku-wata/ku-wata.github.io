export interface Link {
  label: string;
  url: string;
}

export interface Profile {
  name: {
    ja: string;
    en: string;
  };
  title: string;
  affiliation: {
    ja: string;
    en: string;
  };
  laboratory: {
    name: string;
    url: string;
  };
  bio: string;
  avatar: string;
  links: Link[];
}

export const profile: Profile = {
  name: {
    ja: "桑田 若菜",
    en: "Wakana Kuwata",
  },
  title: "博士後期課程2年 (Ph.D. Student)",
  affiliation: {
    ja: "兵庫県立大学 大学院情報科学研究科",
    en: "Graduate School of Information Science, University of Hyogo",
  },
  laboratory: {
    name: "大島裕明研究室 (Ohshima Lab)",
    url: "https://ohshimalab.github.io/",
  },
  bio: "桑田若菜です。",
  avatar: "/profile.jpg",
  links: [
    { label: "ORCID", url: "https://orcid.org/0009-0009-4612-4467" },
    { label: "researchmap", url: "https://researchmap.jp/wakanakuwata" },
    { label: "GitHub", url: "https://github.com/ku-wata" },
  ],
};


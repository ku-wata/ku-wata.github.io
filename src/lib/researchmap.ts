import rawData from "../data/researchmap.json";

export interface ResearchExperience {
  id?: string;
  from: string;
  to: string;
  affiliation: string;
  section?: string;
  job: string;
}

export interface Education {
  id?: string;
  from: string;
  to: string;
  institution: string;
  department?: string;
  course?: string;
}

export interface Paper {
  id?: string;
  title: string;
  authors: string[];
  publicationName: string;
  publicationDate: string;
  volume?: string;
  number?: string;
  startingPage?: string;
  endingPage?: string;
  refereed: boolean;
  doi?: string;
  url?: string;
}

export interface Misc {
  id?: string;
  title: string;
  authors: string[];
  publicationName: string;
  publicationDate: string;
  url?: string;
}

export interface Society {
  id?: string;
  name: string;
  from: string;
  to: string;
}

export interface ResearchmapData {
  name: {
    ja: string;
    en: string;
  };
  affiliation: {
    ja: string;
    en: string;
    sectionJa?: string;
    sectionEn?: string;
    jobJa?: string;
  };
  degree?: string;
  orcid?: string;
  jglobalId?: string;
  researchExperience: ResearchExperience[];
  education: Education[];
  papers: Paper[];
  misc: Misc[];
  societies: Society[];
}

// 日付の表示用フォーマット関数 (例: "2025-04" -> "2025年4月", "9999" -> "現在")
export function formatDateRange(from: string, to: string): string {
  const formatSingle = (d: string) => {
    if (!d || d === "9999") return "現在";
    const parts = d.split("-");
    if (parts.length >= 2) {
      return `${parts[0]}年${parseInt(parts[1], 10)}月`;
    }
    return `${parts[0]}年`;
  };

  const fromStr = formatSingle(from);
  const toStr = formatSingle(to);

  if (fromStr === toStr) return fromStr;
  return `${fromStr} - ${toStr}`;
}

export function formatPublicationDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}年${parseInt(parts[1], 10)}月`;
  }
  return `${parts[0]}年`;
}

// 著者名が本人（桑田若菜 / Wakana Kuwata）かどうか判定
export function isSelfAuthor(authorName: string): boolean {
  const normalized = authorName.replace(/\s+/g, "").toLowerCase();
  return (
    normalized.includes("桑田若菜") ||
    normalized.includes("wakanakuwata") ||
    normalized.includes("kuwatawakana")
  );
}

// rawData から整形データを構築
export function getResearchmapData(): ResearchmapData {
  const data = rawData as any;

  // 基本情報
  const nameJa = `${data.family_name?.ja || ""} ${data.given_name?.ja || ""}`.trim();
  const nameEn = `${data.given_name?.en || ""} ${data.family_name?.en || ""}`.trim();

  const mainAffiliation = data.affiliations?.[0] || {};
  const degree = data.degrees?.[0]?.degree?.ja;
  const orcid = data.identifiers?.orc_id?.[0];
  const jglobalId = data.identifiers?.j_global_id?.[0];

  const graph = data["@graph"] || [];

  // 各セクションの抽出
  let researchExperience: ResearchExperience[] = [];
  let education: Education[] = [];
  let papers: Paper[] = [];
  let misc: Misc[] = [];
  let societies: Society[] = [];

  for (const block of graph) {
    const type = block["@type"];
    const items = block.items || [];

    if (type === "research_experience") {
      researchExperience = items.map((item: any) => ({
        id: item["rm:id"],
        from: item.from_date || "",
        to: item.to_date || "",
        affiliation: item.affiliation?.ja || item.affiliation?.en || "",
        section: item.section?.ja || item.section?.en,
        job: item.job?.ja || item.job?.en || "",
      }));
    } else if (type === "education") {
      education = items.map((item: any) => ({
        id: item["rm:id"],
        from: item.from_date || "",
        to: item.to_date || "",
        institution: item.affiliation?.ja || item.affiliation?.en || "",
        department: item.department?.ja || item.department?.en,
        course: item.course?.ja || item.course?.en,
      }));
    } else if (type === "published_papers") {
      papers = items.map((item: any) => {
        const title = item.paper_title?.ja || item.paper_title?.en || "";
        const authorsList = item.authors?.ja || item.authors?.en || [];
        const authors = authorsList.map((a: any) => a.name);
        const pubName = item.publication_name?.ja || item.publication_name?.en || "";
        const doi = item.identifiers?.doi?.[0];
        const seeAlsoUrl = item.see_also?.[0]?.["@id"];

        return {
          id: item["rm:id"],
          title,
          authors,
          publicationName: pubName,
          publicationDate: item.publication_date || "",
          volume: item.volume,
          number: item.number,
          startingPage: item.starting_page,
          endingPage: item.ending_page,
          refereed: Boolean(item.referee),
          doi: doi ? (doi.startsWith("http") ? doi : `https://doi.org/${doi}`) : undefined,
          url: seeAlsoUrl || (doi ? `https://doi.org/${doi}` : undefined),
        };
      });
    } else if (type === "misc") {
      misc = items.map((item: any) => {
        const title = item.paper_title?.ja || item.paper_title?.en || "";
        const authorsList = item.authors?.ja || item.authors?.en || [];
        const authors = authorsList.map((a: any) => a.name);
        const pubName = item.publication_name?.ja || item.publication_name?.en || "";
        const seeAlsoUrl = item.see_also?.[0]?.["@id"];

        return {
          id: item["rm:id"],
          title,
          authors,
          publicationName: pubName,
          publicationDate: item.publication_date || "",
          url: seeAlsoUrl,
        };
      });
    } else if (type === "association_memberships") {
      societies = items.map((item: any) => ({
        id: item["rm:id"],
        name: item.academic_society_name?.ja || item.academic_society_name?.en || "",
        from: item.from_date || "",
        to: item.to_date || "",
      }));
    }
  }

  // 日付の降順（新しい順）でソート
  papers.sort((a, b) => (b.publicationDate || "").localeCompare(a.publicationDate || ""));
  misc.sort((a, b) => (b.publicationDate || "").localeCompare(a.publicationDate || ""));
  education.sort((a, b) => (b.from || "").localeCompare(a.from || ""));
  researchExperience.sort((a, b) => (b.from || "").localeCompare(a.from || ""));
  societies.sort((a, b) => (b.from || "").localeCompare(a.from || ""));

  return {
    name: {
      ja: nameJa,
      en: nameEn,
    },
    affiliation: {
      ja: mainAffiliation.affiliation?.ja || "",
      en: mainAffiliation.affiliation?.en || "",
      sectionJa: mainAffiliation.section?.ja,
      sectionEn: mainAffiliation.section?.en,
      jobJa: mainAffiliation.job?.ja,
    },
    degree,
    orcid,
    jglobalId,
    researchExperience,
    education,
    papers,
    misc,
    societies,
  };
}


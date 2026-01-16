"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Experience } from "@/types/resume";

interface TableOfContentsProps {
  experience: Experience[];
}

interface TocSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  children?: TocSection[];
}

export function TableOfContents({ experience }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["experience"])
  );

  // 목차 데이터 생성
  const tocItems = useMemo<TocSection[]>(() => {
    const sections: TocSection[] = [
      { id: "profile", title: "프로필", level: 1 },
      { id: "skills", title: "기술 스택", level: 1 },
      {
        id: "experience",
        title: "경력",
        level: 1,
        children: experience.flatMap((exp) => [
          {
            id: `company-${exp.company.replace(/[^a-zA-Z0-9가-힣]/g, "-").toLowerCase()}`,
            title: exp.company,
            level: 2 as const,
            children: exp.projects.map((project) => ({
              id: `project-${project.name.replace(/[^a-zA-Z0-9가-힣]/g, "-").toLowerCase()}`,
              title: project.name,
              level: 3 as const,
            })),
          },
        ]),
      },
      { id: "education", title: "학력", level: 1 },
      { id: "certifications", title: "자격증", level: 1 },
      { id: "awards", title: "수상 및 활동", level: 1 },
    ];
    return sections;
  }, [experience]);

  // 모든 섹션 ID 추출
  const allIds = useMemo(() => {
    const ids: string[] = [];
    const extractIds = (items: TocSection[]) => {
      items.forEach((item) => {
        ids.push(item.id);
        if (item.children) extractIds(item.children);
      });
    };
    extractIds(tocItems);
    return ids;
  }, [tocItems]);

  // 현재 보이는 섹션 감지
  const updateActiveSection = useCallback(() => {
    const scrollPosition = window.scrollY + 150;

    for (let i = allIds.length - 1; i >= 0; i--) {
      const element = document.getElementById(allIds[i]);
      if (element && element.offsetTop <= scrollPosition) {
        setActiveId(allIds[i]);
        break;
      }
    }
  }, [allIds]);

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 위치에 따라 TOC 표시/숨김
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 200);

      updateActiveSection();
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateActiveSection]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isActive = (id: string) => activeId === id;
  const isParentOfActive = (section: TocSection): boolean => {
    if (section.children) {
      return section.children.some(
        (child) => child.id === activeId || isParentOfActive(child)
      );
    }
    return false;
  };

  const renderTocItem = (item: TocSection, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const active = isActive(item.id);
    const parentOfActive = isParentOfActive(item);

    return (
      <li key={item.id} className="relative">
        <div className="flex items-center">
          {hasChildren && (
            <button
              onClick={() => toggleSection(item.id)}
              className="mr-1 flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-3 w-3" />
              </motion.span>
            </button>
          )}
          <motion.button
            onClick={() => scrollToSection(item.id)}
            className={`relative flex-1 cursor-pointer text-left text-[13px] transition-all duration-200 ${
              active
                ? "font-semibold text-primary"
                : parentOfActive
                  ? "font-medium text-foreground hover:text-primary"
                  : "text-muted-foreground hover:text-primary"
            }`}
            style={{ paddingLeft: hasChildren ? 0 : depth > 0 ? "4px" : "20px" }}
            whileHover={{ x: 2 }}
          >
            {active && (
              <motion.span
                layoutId="tocIndicator"
                className="absolute -left-3 top-1/2 z-10 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary"
              />
            )}
            <span className="line-clamp-1">
              {item.title.length > 25
                ? item.title.slice(0, 25) + "..."
                : item.title}
            </span>
          </motion.button>
        </div>

        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 mt-1 flex flex-col gap-1 overflow-hidden border-l border-primary/20 pl-2"
              >
                {item.children!.map((child) => renderTocItem(child, depth + 1))}
              </motion.ul>
            )}
          </AnimatePresence>
        )}
      </li>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed top-1/2 z-50 hidden max-h-[80vh] w-52 -translate-y-1/2 overflow-y-auto rounded-xl border border-primary/20 bg-background/95 p-4 shadow-xl backdrop-blur-md xl:block"
          style={{ left: "calc(50% - 448px - 220px - 24px)" }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            목차
          </h3>

          <ul className="flex flex-col gap-1.5">
            {tocItems.map((item) => renderTocItem(item))}
          </ul>

          {/* 진행률 표시 */}
          <div className="mt-4 border-t border-primary/10 pt-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>진행률</span>
              <span>
                {Math.round(
                  ((allIds.indexOf(activeId) + 1) / allIds.length) * 100
                )}
                %
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-primary/10">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${((allIds.indexOf(activeId) + 1) / allIds.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

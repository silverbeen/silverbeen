"use client";

import { useState, useCallback, RefObject } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface UseResumePdfOptions {
  filename?: string;
  margin?: number;
}

interface UseResumePdfReturn {
  isGenerating: boolean;
  progress: number;
  generatePdf: (containerRef: RefObject<HTMLElement | null>) => Promise<void>;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export function useResumePdf(
  options: UseResumePdfOptions = {}
): UseResumePdfReturn {
  const { filename = "이력서_강은빈.pdf", margin = 10 } = options;

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePdf = useCallback(
    async (containerRef: RefObject<HTMLElement | null>) => {
      if (!containerRef.current || isGenerating) return;

      setIsGenerating(true);
      setProgress(0);

      try {
        const container = containerRef.current;

        setProgress(10);
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: container.scrollWidth,
          height: container.scrollHeight,
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
          onclone: (_clonedDoc, element) => {
            element.style.position = "static";
            element.style.left = "0";
            element.style.top = "0";
            element.style.transform = "none";
            element.style.opacity = "1";

            element.querySelectorAll("*").forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.transform = "none";
              htmlEl.style.opacity = "1";
              htmlEl.style.animation = "none";
              htmlEl.style.transition = "none";
              // 텍스트 정렬 문제 해결
              htmlEl.style.verticalAlign = "baseline";
              htmlEl.style.boxSizing = "border-box";
            });
          },
        });

        setProgress(50);

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const contentWidth = A4_WIDTH_MM - margin * 2;
        const contentHeight = A4_HEIGHT_MM - margin * 2;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // 캔버스 너비를 PDF 컨텐츠 너비에 맞추기 위한 비율
        const ratio = contentWidth / canvasWidth;

        // 한 페이지에 들어갈 수 있는 캔버스 높이 (픽셀 단위)
        const pageHeightPx = contentHeight / ratio;

        // 섹션 경계 수집 (프로젝트 카드 등)
        const sections = container.querySelectorAll("[data-pdf-section]");
        const breakPoints: { top: number; bottom: number }[] = [];

        const containerRect = container.getBoundingClientRect();
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const top = (rect.top - containerRect.top) * 2; // scale: 2
          const bottom = (rect.bottom - containerRect.top) * 2;
          breakPoints.push({ top, bottom });
        });

        setProgress(60);

        // 페이지별로 잘라서 PDF에 추가
        let currentY = 0;
        let pageNum = 0;

        while (currentY < canvasHeight) {
          // 이 페이지에 들어갈 수 있는 높이 계산
          let pageEndY = currentY + pageHeightPx;

          // 섹션이 페이지 경계에서 잘리는지 확인
          for (const bp of breakPoints) {
            // 섹션이 페이지 경계를 걸치는 경우
            if (bp.top < pageEndY && bp.bottom > pageEndY && bp.top > currentY) {
              // 섹션 시작점이 현재 페이지 안에 있고, 끝점이 다음 페이지로 넘어가는 경우
              // 섹션이 너무 커서 한 페이지에 안 들어가면 그냥 자름
              const sectionHeight = bp.bottom - bp.top;
              if (sectionHeight < pageHeightPx * 0.9) {
                // 섹션 전체를 다음 페이지로 넘김
                if (bp.top > currentY + 100) {
                  // 최소 100px은 있어야 함
                  pageEndY = bp.top;
                }
              }
              break;
            }
          }

          // 마지막 페이지 처리
          if (pageEndY > canvasHeight) {
            pageEndY = canvasHeight;
          }

          // 페이지 캔버스 생성
          const pageCanvas = document.createElement("canvas");
          const ctx = pageCanvas.getContext("2d");
          if (!ctx) break;

          const sourceY = Math.floor(currentY);
          const sourceHeight = Math.floor(pageEndY - currentY);

          pageCanvas.width = canvasWidth;
          pageCanvas.height = sourceHeight;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvasWidth,
            sourceHeight,
            0,
            0,
            canvasWidth,
            sourceHeight
          );

          // PDF에 추가
          if (pageNum > 0) {
            pdf.addPage();
          }

          const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
          // 실제 캡처한 높이를 기준으로 PDF 이미지 높이 계산
          const imgHeightMM = sourceHeight * ratio;

          // 이미지를 페이지 상단(margin)부터 시작
          pdf.addImage(imgData, "JPEG", margin, margin, contentWidth, imgHeightMM);

          currentY = pageEndY;
          pageNum++;

          setProgress(60 + Math.floor((currentY / canvasHeight) * 35));
        }

        setProgress(95);
        pdf.save(filename);
        setProgress(100);
      } catch (error) {
        console.error("PDF 생성 중 오류:", error);
        throw error;
      } finally {
        setIsGenerating(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [filename, margin, isGenerating]
  );

  return {
    isGenerating,
    progress,
    generatePdf,
  };
}

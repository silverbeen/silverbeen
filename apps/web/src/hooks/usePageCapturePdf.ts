"use client";

import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface UsePageCapturePdfOptions {
  filename?: string;
  margin?: number;
  selector?: string;
}

interface UsePageCapturePdfReturn {
  isGenerating: boolean;
  progress: number;
  capturePdf: () => Promise<void>;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export function usePageCapturePdf(
  options: UsePageCapturePdfOptions = {}
): UsePageCapturePdfReturn {
  const {
    filename = "이력서_강은빈.pdf",
    margin = 10,
    selector = "#resume-content",
  } = options;

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const capturePdf = useCallback(async () => {
    if (isGenerating) return;

    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // 폰트 로딩 대기
      await document.fonts.ready;
      setProgress(10);

      // 요소를 클론하고 모든 스타일을 인라인으로 적용
      const cloneWithInlineStyles = (original: HTMLElement): HTMLElement => {
        const clone = original.cloneNode(true) as HTMLElement;

        const processNode = (origNode: HTMLElement, cloneNode: HTMLElement) => {
          const computed = getComputedStyle(origNode);

          // 모든 계산된 스타일을 인라인으로 적용
          const importantStyles = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
            "fontSize",
            "fontWeight",
            "fontFamily",
            "lineHeight",
            "padding",
            "margin",
            "display",
            "flexDirection",
            "alignItems",
            "justifyContent",
            "gap",
            "width",
            "height",
            "maxWidth",
            "borderRadius",
            "borderWidth",
            "borderStyle",
            "boxShadow",
            "textAlign",
            "position",
            "top",
            "left",
            "right",
            "bottom",
            "overflow",
            "opacity",
            "flexWrap",
            "flexShrink",
            "flexGrow",
          ];

          importantStyles.forEach((prop) => {
            let value = computed.getPropertyValue(prop);
            // oklab/lab 색상 변환
            if (value.includes("oklab") || value.includes("lab(")) {
              if (prop.includes("background")) {
                value = "#ffffff";
              } else if (prop === "color") {
                value = "#111827";
              } else {
                value = "#e5e7eb";
              }
            }
            cloneNode.style.setProperty(prop, value);
          });

          // background-image 처리
          const bgImage = computed.backgroundImage;
          if (bgImage && bgImage !== "none") {
            if (bgImage.includes("oklab") || bgImage.includes("lab(")) {
              cloneNode.style.backgroundImage = "none";
            } else {
              cloneNode.style.backgroundImage = bgImage;
            }
          }

          // 애니메이션 제거
          cloneNode.style.animation = "none";
          cloneNode.style.transition = "none";
          cloneNode.style.transform = "none";
        };

        // 루트 처리
        processNode(original, clone);

        // 자식 요소들 처리
        const origChildren = original.querySelectorAll("*");
        const cloneChildren = clone.querySelectorAll("*");

        origChildren.forEach((origChild, index) => {
          if (origChild instanceof HTMLElement && cloneChildren[index] instanceof HTMLElement) {
            processNode(origChild, cloneChildren[index] as HTMLElement);
          }
        });

        return clone;
      };

      // 스타일이 적용된 클론 생성
      const styledClone = cloneWithInlineStyles(element);

      // 임시 컨테이너에 클론 추가
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-10000px";
      tempContainer.style.top = "0";
      tempContainer.style.backgroundColor = "#ffffff";
      tempContainer.appendChild(styledClone);
      document.body.appendChild(tempContainer);

      // 클론에서 캡처
      const canvas = await html2canvas(styledClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: styledClone.scrollWidth,
        height: styledClone.scrollHeight,
      });

      // 임시 컨테이너 제거
      document.body.removeChild(tempContainer);

      setProgress(60);

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

      setProgress(70);

      // 페이지별로 잘라서 PDF에 추가
      let currentY = 0;
      let pageNum = 0;

      while (currentY < canvasHeight) {
        const pageEndY = Math.min(currentY + pageHeightPx, canvasHeight);

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

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
        const imgHeightMM = sourceHeight * ratio;

        pdf.addImage(imgData, "JPEG", margin, margin, contentWidth, imgHeightMM);

        currentY = pageEndY;
        pageNum++;

        setProgress(70 + Math.floor((currentY / canvasHeight) * 25));
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
  }, [filename, margin, selector, isGenerating]);

  return {
    isGenerating,
    progress,
    capturePdf,
  };
}

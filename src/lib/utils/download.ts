/**
 * 다운로드 유틸리티
 * PDF, Word 파일 생성 및 다운로드
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { AnalyzeResumeResponse } from '@/lib/ai/types';

interface DownloadResumeAnalysisParams {
  title: string;
  analysis: AnalyzeResumeResponse;
  rawText?: string;
}

/**
 * HTML 요소를 PDF로 변환하는 헬퍼 함수
 */
async function htmlToPdf(htmlContent: string, fileName: string) {
  // 임시 컨테이너 생성
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    padding: 40px;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #1e293b;
  `;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;

    // 이미지가 한 페이지를 넘는 경우 여러 페이지로 분할
    const pageHeight = pdfHeight * (imgWidth / pdfWidth);
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', imgX, position * ratio, imgWidth * ratio * (pdfWidth / imgWidth / ratio), imgHeight * ratio * (pdfWidth / imgWidth / ratio));
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position * ratio * (pdfWidth / imgWidth / ratio), imgWidth * ratio * (pdfWidth / imgWidth / ratio), imgHeight * ratio * (pdfWidth / imgWidth / ratio));
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 이력서 분석 결과를 PDF로 다운로드
 */
export async function downloadResumeAnalysisAsPDF({
  title,
  analysis,
  rawText,
}: DownloadResumeAnalysisParams) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  };

  const htmlContent = `
    <div style="max-width: 700px;">
      <h1 style="font-size: 24px; margin-bottom: 8px; color: #1e293b;">이력서 분석 결과</h1>
      <h2 style="font-size: 18px; margin-bottom: 24px; color: #64748b; font-weight: normal;">${title}</h2>

      <div style="display: flex; gap: 20px; margin-bottom: 24px;">
        <div style="flex: 1; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
          <div style="font-size: 13px; color: #166534; margin-bottom: 4px;">전체 완성도</div>
          <div style="font-size: 32px; font-weight: bold; color: ${getScoreColor(analysis.overallScore)};">
            ${analysis.overallScore}<span style="font-size: 16px; color: #64748b;">/100</span>
          </div>
        </div>
        ${analysis.atsScore !== undefined ? `
        <div style="flex: 1; padding: 20px; background: #fef3c7; border-radius: 12px; border: 1px solid #fde68a;">
          <div style="font-size: 13px; color: #92400e; margin-bottom: 4px;">ATS 최적화</div>
          <div style="font-size: 32px; font-weight: bold; color: ${getScoreColor(analysis.atsScore)};">
            ${analysis.atsScore}<span style="font-size: 16px; color: #64748b;">/100</span>
          </div>
        </div>
        ` : ''}
      </div>

      <h3 style="font-size: 16px; margin-bottom: 12px; color: #1e293b;">📊 섹션별 분석</h3>
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        ${analysis.sections.map(section => `
          <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
              <span style="font-weight: bold; color: ${getScoreColor(section.score)}; width: 40px;">${section.score}</span>
              <span style="font-weight: 600; color: #1e293b;">${section.name}</span>
            </div>
            <div style="font-size: 13px; color: #64748b; margin-left: 52px;">${section.feedback}</div>
          </div>
        `).join('')}
      </div>

      <h3 style="font-size: 16px; margin-bottom: 12px; color: #1e293b;">🔑 키워드 분석</h3>
      <div style="display: flex; gap: 16px; margin-bottom: 24px;">
        <div style="flex: 1; padding: 16px; background: #f0fdf4; border-radius: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #166534; margin-bottom: 8px;">✓ 발견된 키워드</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${analysis.keywords.found.map(k => `<span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px;">${k}</span>`).join('')}
          </div>
        </div>
        <div style="flex: 1; padding: 16px; background: #fffbeb; border-radius: 12px;">
          <div style="font-size: 13px; font-weight: 600; color: #92400e; margin-bottom: 8px;">+ 추가 권장</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${analysis.keywords.missing.map(k => `<span style="background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 20px; font-size: 12px;">${k}</span>`).join('')}
          </div>
        </div>
      </div>

      <h3 style="font-size: 16px; margin-bottom: 12px; color: #1e293b;">💡 개선 제안</h3>
      <div style="background: #eef2ff; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <ul style="margin: 0; padding-left: 20px;">
          ${analysis.suggestions.map(s => `<li style="margin-bottom: 8px; color: #3730a3;">${s}</li>`).join('')}
        </ul>
      </div>

      ${rawText ? `
      <h3 style="font-size: 16px; margin-bottom: 12px; color: #1e293b;">📄 이력서 원문</h3>
      <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; font-size: 12px; white-space: pre-wrap; max-height: 400px; overflow: hidden;">
        ${rawText.substring(0, 2000)}${rawText.length > 2000 ? '...' : ''}
      </div>
      ` : ''}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
        AI Career Assistant에서 생성됨 • ${new Date().toLocaleDateString('ko-KR')}
      </div>
    </div>
  `;

  const fileName = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_분석결과.pdf`;
  await htmlToPdf(htmlContent, fileName);
}

/**
 * 이력서 분석 결과를 Word로 다운로드
 */
export async function downloadResumeAnalysisAsWord({
  title,
  analysis,
  rawText,
}: DownloadResumeAnalysisParams) {
  const children: Paragraph[] = [];

  // 제목
  children.push(
    new Paragraph({
      text: 'Resume Analysis Report',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );

  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  // 전체 점수
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Overall Score: ', bold: true }),
        new TextRun({ text: `${analysis.overallScore}/100` }),
      ],
    })
  );

  if (analysis.atsScore !== undefined) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'ATS Score: ', bold: true }),
          new TextRun({ text: `${analysis.atsScore}/100` }),
        ],
      })
    );
  }

  // 섹션별 분석
  children.push(
    new Paragraph({
      text: 'Section Analysis',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  for (const section of analysis.sections) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${section.name}: `, bold: true }),
          new TextRun({ text: `${section.score}/100` }),
        ],
        spacing: { before: 200 },
      })
    );
    children.push(
      new Paragraph({
        text: section.feedback,
        spacing: { after: 100 },
      })
    );
  }

  // 키워드
  children.push(
    new Paragraph({
      text: 'Keywords',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Found: ', bold: true }),
        new TextRun({ text: analysis.keywords.found.join(', ') }),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Missing: ', bold: true }),
        new TextRun({ text: analysis.keywords.missing.join(', ') }),
      ],
      spacing: { before: 100 },
    })
  );

  // 개선 제안
  children.push(
    new Paragraph({
      text: 'Suggestions',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  for (const suggestion of analysis.suggestions) {
    children.push(
      new Paragraph({
        text: `• ${suggestion}`,
        spacing: { before: 50 },
      })
    );
  }

  // 원본 텍스트 (선택적)
  if (rawText) {
    children.push(
      new Paragraph({
        text: 'Original Resume Text',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 200 },
      })
    );

    children.push(
      new Paragraph({
        text: rawText,
        spacing: { before: 100 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_analysis.docx`;
  saveAs(blob, fileName);
}

interface DownloadCoverLetterParams {
  title: string;
  content: string;
  companyName?: string;
  jobPosition?: string;
}

/**
 * 자소서를 PDF로 다운로드
 */
export async function downloadCoverLetterAsPDF({
  title,
  content,
  companyName,
  jobPosition,
}: DownloadCoverLetterParams) {
  // HTML 이스케이프 처리
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  };

  const htmlContent = `
    <div style="max-width: 700px;">
      <h1 style="font-size: 22px; margin-bottom: 16px; color: #1e293b; text-align: center;">${escapeHtml(title)}</h1>

      ${companyName || jobPosition ? `
      <div style="margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #0d9488;">
        ${companyName ? `<div style="font-size: 14px; margin-bottom: 4px;"><strong>지원 회사:</strong> ${escapeHtml(companyName)}</div>` : ''}
        ${jobPosition ? `<div style="font-size: 14px;"><strong>지원 직무:</strong> ${escapeHtml(jobPosition)}</div>` : ''}
      </div>
      ` : ''}

      <div style="font-size: 14px; line-height: 1.8; color: #374151; text-align: justify;">
        ${escapeHtml(content)}
      </div>

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
        AI Career Assistant에서 생성됨 • ${new Date().toLocaleDateString('ko-KR')}
      </div>
    </div>
  `;

  const fileName = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_자소서.pdf`;
  await htmlToPdf(htmlContent, fileName);
}

/**
 * 자소서를 Word로 다운로드
 */
export async function downloadCoverLetterAsWord({
  title,
  content,
  companyName,
  jobPosition,
}: DownloadCoverLetterParams) {
  const children: Paragraph[] = [];

  // 제목
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  // 회사/직무 정보
  if (companyName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Company: ', bold: true }),
          new TextRun({ text: companyName }),
        ],
        spacing: { before: 200 },
      })
    );
  }

  if (jobPosition) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Position: ', bold: true }),
          new TextRun({ text: jobPosition }),
        ],
        spacing: { before: 100 },
      })
    );
  }

  // 본문
  const paragraphs = content.split('\n\n');
  for (const para of paragraphs) {
    children.push(
      new Paragraph({
        text: para.trim(),
        spacing: { before: 200, after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.docx`;
  saveAs(blob, fileName);
}

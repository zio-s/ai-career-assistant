/**
 * 파일 파싱 API
 * PDF, Word 파일에서 텍스트 추출
 */

import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { extractText } from 'unpdf';

export const runtime = 'nodejs';

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: '파일이 없습니다' }, { status: 400 });
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB 이하여야 합니다' },
        { status: 400 }
      );
    }

    // 파일 타입에 따라 처리
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    let text = '';

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF 파싱
      text = await parsePDF(file);
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx')
    ) {
      // Word 파싱
      text = await parseWord(file);
    } else {
      return NextResponse.json(
        { success: false, error: 'PDF 또는 Word 파일만 지원됩니다' },
        { status: 400 }
      );
    }

    // 텍스트 정리
    text = cleanText(text);

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: '파일에서 충분한 텍스트를 추출할 수 없습니다' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        text,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    console.error('File parsing error:', error);
    return NextResponse.json(
      { success: false, error: '파일 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

async function parsePDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // unpdf로 PDF 텍스트 추출 (서버리스 환경에 최적화)
    const { text } = await extractText(uint8Array);

    // text는 페이지별 배열이므로 합침
    return text.join('\n');
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('PDF 파일을 읽을 수 없습니다');
  }
}

async function parseWord(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('Word parsing error:', error);
    throw new Error('Word 파일을 읽을 수 없습니다');
  }
}

function cleanText(text: string): string {
  return (
    text
      // 연속된 공백 정리
      .replace(/\s+/g, ' ')
      // 연속된 줄바꿈 정리
      .replace(/\n{3,}/g, '\n\n')
      // 앞뒤 공백 제거
      .trim()
  );
}
